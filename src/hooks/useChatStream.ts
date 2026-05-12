import { useCallback, useEffect, useRef, useState } from "react"

import {
  assertGeminiApiKey,
  formatAiErrorForUser,
  formatRateLimitCountdownMessage,
  generatePolishedCvDocument,
  isRateLimitedError,
  RATE_LIMIT_COUNTDOWN_SECONDS,
  streamCvAssistantReply,
} from "@/lib/ai"
import type { ChatMessage } from "@/types/chat"

function createId(): string {
  return crypto.randomUUID()
}

export type ChatStreamStatus = "idle" | "streaming" | "generating" | "error"

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStreamStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null)
  const messagesRef = useRef<ChatMessage[]>([])
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    if (rateLimitUntil === null) return

    const tick = () => {
      const left = Math.max(0, Math.ceil((rateLimitUntil - Date.now()) / 1000))
      if (left <= 0) {
        setRateLimitUntil(null)
        setError(null)
        setStatus((s) => (s === "error" ? "idle" : s))
        return
      }
      setError(formatRateLimitCountdownMessage(left))
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [rateLimitUntil])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || status === "streaming" || status === "generating") return

    try {
      assertGeminiApiKey()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Configuration error")
      setStatus("error")
      return
    }

    setError(null)
    setRateLimitUntil(null)
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
    }
    const assistantId = createId()
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
    }

    const historyForApi: ChatMessage[] = [
      ...messagesRef.current,
      userMessage,
    ]

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setStatus("streaming")

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamCvAssistantReply({
        messages: historyForApi,
        abortSignal: controller.signal,
        onTextDelta: (delta) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + delta }
                : m
            )
          )
        },
      })
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      )
      setStatus("idle")
    } catch (e) {
      const rateLimited = isRateLimitedError(e)
      const msg = rateLimited
        ? formatRateLimitCountdownMessage(RATE_LIMIT_COUNTDOWN_SECONDS)
        : formatAiErrorForUser(e)
      if (rateLimited) {
        setRateLimitUntil(Date.now() + RATE_LIMIT_COUNTDOWN_SECONDS * 1000)
      } else {
        setRateLimitUntil(null)
      }
      setError(msg)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                isStreaming: false,
                content:
                  m.content ||
                  (e instanceof Error && e.name === "AbortError"
                    ? ""
                    : `_Error: ${msg}_`),
              }
            : m
        )
      )
      setStatus(e instanceof Error && e.name === "AbortError" ? "idle" : "error")
    } finally {
      abortRef.current = null
    }
  }, [status])

  const finalizeCv = useCallback(async () => {
    if (status === "streaming" || status === "generating") return
    const snapshot = messagesRef.current.filter(
      (m) => m.role === "user" || m.content.trim().length > 0
    )
    if (snapshot.length === 0) {
      setError("Chat a bit first — there is nothing to finalize yet.")
      setStatus("error")
      return
    }

    try {
      assertGeminiApiKey()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Configuration error")
      setStatus("error")
      return
    }

    setError(null)
    setRateLimitUntil(null)
    setStatus("generating")

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const doc = await generatePolishedCvDocument(snapshot, controller.signal)
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: doc,
        },
      ])
      setStatus("idle")
    } catch (e) {
      const aborted = e instanceof Error && e.name === "AbortError"
      const rateLimited = !aborted && isRateLimitedError(e)
      const msg = aborted
        ? "Stopped."
        : rateLimited
          ? formatRateLimitCountdownMessage(RATE_LIMIT_COUNTDOWN_SECONDS)
          : formatAiErrorForUser(e)
      if (rateLimited) {
        setRateLimitUntil(Date.now() + RATE_LIMIT_COUNTDOWN_SECONDS * 1000)
      } else {
        setRateLimitUntil(null)
      }
      setError(msg)
      setStatus("error")
    } finally {
      abortRef.current = null
    }
  }, [status])

  return {
    messages,
    sendMessage,
    finalizeCv,
    stop,
    status,
    error,
    rateLimitActive: rateLimitUntil !== null,
    clearError: () => {
      setError(null)
      setRateLimitUntil(null)
    },
  }
}
