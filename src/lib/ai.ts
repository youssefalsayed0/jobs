import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { APICallError, generateText, streamText } from "ai"
import type { ModelMessage } from "ai"

import type { ChatMessage } from "@/types/chat"

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

const google = createGoogleGenerativeAI({
  apiKey: typeof apiKey === "string" ? apiKey : "",
  dangerouslyAllowBrowser: true,
})

export function getCvModel() {
  return google("gemini-2.5-flash")
}

export const CV_ASSISTANT_SYSTEM = `You are an expert CV coach and recruiter for Opportix.
- Ask one clear question at a time. Keep replies short (2–4 sentences max unless drafting CV sections).
- Collect in order when missing: full name, professional title, years of experience, skills, work experience (company, role, dates, bullets), education, certifications, projects, languages, achievements.
- Be warm and professional. No long paragraphs.
- When you have enough detail, say you will now summarize and polish for ATS. Then provide:
  1) A tight professional summary (3–5 lines)
  2) Improved bullet points for each role (action verbs, metrics where possible)
  3) Skills grouped logically for ATS
  4) A clear CV outline (sections) they can paste into a document
Use Markdown headings (##) for sections when you deliver the final package.`

export function assertGeminiApiKey(): void {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error(
      "The CV assistant is not available at the moment. Please try again later."
    )
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Gemini / Google often surface quota as 429 or RESOURCE_EXHAUSTED in the body. */
export function isRateLimitedError(e: unknown): boolean {
  if (APICallError.isInstance(e)) {
    if (e.statusCode === 429) return true
    const body =
      typeof e.responseBody === "string" ? e.responseBody : String(e.responseBody ?? "")
    if (/RESOURCE_EXHAUSTED|too many requests|429/i.test(body)) return true
  }
  if (e instanceof Error) {
    if (/429|Too Many Requests|RESOURCE_EXHAUSTED|rate limit|quota/i.test(e.message))
      return true
  }
  return false
}

/** Shown after retries; UI counts down from this value. */
export const RATE_LIMIT_COUNTDOWN_SECONDS = 60

export function formatRateLimitCountdownMessage(secondsLeft: number): string {
  const n = Math.max(0, Math.ceil(secondsLeft))
  if (n <= 0) return "You can try again now."
  return `Too many requests. Try again in ${n} second${n === 1 ? "" : "s"}.`
}

/** Maps API errors to copy safe for the chat UI (no env / stack noise). */
export function formatAiErrorForUser(e: unknown): string {
  if (e instanceof Error && e.name === "AbortError") return "Stopped."
  if (isRateLimitedError(e)) {
    return formatRateLimitCountdownMessage(RATE_LIMIT_COUNTDOWN_SECONDS)
  }
  if (e instanceof Error) return e.message
  return "Something went wrong"
}

const RATE_LIMIT_MAX_ATTEMPTS = 4

async function withRateLimitRetries<T>(run: () => Promise<T>): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
    try {
      return await run()
    } catch (e) {
      lastError = e
      if (!isRateLimitedError(e) || attempt >= RATE_LIMIT_MAX_ATTEMPTS) throw e
      const backoffMs = 1200 * 2 ** (attempt - 1) + Math.random() * 600
      await sleep(backoffMs)
    }
  }
  throw lastError
}

/**
 * Stateless chat APIs need the full thread each call. Identical long user pastes
 * (e.g. the same CV brief sent again after each assistant reply) waste tokens and
 * context window; keep only the **last** occurrence of each duplicate user blob.
 * Short messages (below threshold) are kept so normal replies like "yes" are not merged.
 */
const DUPLICATE_USER_BLOB_MIN_LEN = 400

function dropEarlierDuplicateUserBlobs(
  messages: ChatMessage[]
): ChatMessage[] {
  const seenLongUserContent = new Set<string>()
  const dropIndex = new Set<number>()
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== "user" || m.content.length < DUPLICATE_USER_BLOB_MIN_LEN) {
      continue
    }
    if (seenLongUserContent.has(m.content)) {
      dropIndex.add(i)
    } else {
      seenLongUserContent.add(m.content)
    }
  }
  return messages.filter((_, i) => !dropIndex.has(i))
}

function transcript(messages: ChatMessage[]): string {
  const pruned = dropEarlierDuplicateUserBlobs(messages)
  return pruned
    .filter((m) => m.content.trim().length > 0)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n")
}

/** One-shot polish pass after the conversation (uses generateText per requirements). */
export async function generatePolishedCvDocument(
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  assertGeminiApiKey()
  const { text } = await withRateLimitRetries(() =>
    generateText({
      model: getCvModel(),
      abortSignal: signal,
      system: `${CV_ASSISTANT_SYSTEM}

You are now in FINALIZE mode. Using ONLY the conversation below, output a single polished CV in Markdown:
- ## Header (name + title)
- ## Professional summary
- ## Core skills (ATS-friendly grouped bullets)
- ## Experience (reverse chronological; strong bullets)
- ## Education
- ## Certifications (if any)
- ## Projects (if any)
- ## Languages
- ## Achievements
Keep formatting scannable. No preamble.`,
      prompt: `Conversation:\n\n${transcript(messages)}`,
    })
  )
  return text
}

export type StreamCvReplyOptions = {
  messages: ChatMessage[]
  abortSignal?: AbortSignal
  onTextDelta: (delta: string) => void
}

export async function streamCvAssistantReply({
  messages,
  abortSignal,
  onTextDelta,
}: StreamCvReplyOptions): Promise<void> {
  assertGeminiApiKey()
  const pruned = dropEarlierDuplicateUserBlobs(messages)
  const modelMessages: ModelMessage[] = pruned.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
    const result = streamText({
      model: getCvModel(),
      system: CV_ASSISTANT_SYSTEM,
      messages: modelMessages,
      abortSignal,
    })

    let receivedAny = false
    try {
      for await (const delta of result.textStream) {
        receivedAny = true
        onTextDelta(delta)
      }
      return
    } catch (e) {
      if (
        !receivedAny &&
        isRateLimitedError(e) &&
        attempt < RATE_LIMIT_MAX_ATTEMPTS
      ) {
        const backoffMs = 1200 * 2 ** (attempt - 1) + Math.random() * 600
        await sleep(backoffMs)
        continue
      }
      throw e
    }
  }
}
