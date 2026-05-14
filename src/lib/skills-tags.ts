/** Laravel profile/signup: skills as string array; max items per request. */
export const MAX_SKILLS_TAGS = 50

export function parseSkillsTokens(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function joinSkillsTokens(tokens: string[]): string {
  return tokens.join(", ")
}

export function capSkillsTokens(tokens: string[]): string[] {
  return tokens.slice(0, MAX_SKILLS_TAGS)
}
