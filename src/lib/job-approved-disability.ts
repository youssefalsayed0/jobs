import { parseSkillsTokens } from "@/lib/skills-tags"

/** Max tags sent on `approved_disability` for job postings. */
export const MAX_APPROVED_DISABILITY_TAGS = 10

/**
 * Preset labels employers can click to add; candidates may also use custom tags
 * (any text) up to the max.
 */
export const APPROVED_DISABILITY_SUGGESTIONS: readonly string[] = [
  "Mobility impairment",
  "Vision impairment",
  "Hearing impairment",
  "Cognitive or learning disability",
  "Mental health condition",
  "Chronic illness or pain",
  "Neurodivergent",
  "Speech or communication disability",
  "Deaf or hard of hearing",
  "Autism",
] as const

export function parseApprovedDisabilityFromApi(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((x): x is string => typeof x === "string" && x.trim() !== "")
    .map((s) => s.trim())
}

export function capApprovedDisabilityTags(tokens: string[]): string[] {
  return tokens.slice(0, MAX_APPROVED_DISABILITY_TAGS)
}

export function approvedDisabilityTokensFromFormString(raw: string | undefined) {
  return capApprovedDisabilityTags(parseSkillsTokens(raw))
}
