import { capSkillsTokens, parseSkillsTokens } from "@/lib/skills-tags"

/** Max skill tags on job create/update payloads. */
export const MAX_JOB_POSTING_SKILLS_TAGS = 30

export function parseJobSkillsFromApi(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const item of raw) {
    if (typeof item === "string") {
      const t = item.trim()
      if (t) out.push(t)
      continue
    }
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const o = item as Record<string, unknown>
      const n = o.name ?? o.skill ?? o.title
      if (typeof n === "string" && n.trim()) out.push(n.trim())
    }
  }
  return out
}

export function jobSkillsFromFormString(raw: string | undefined): string[] {
  return capSkillsTokens(parseSkillsTokens(raw)).slice(0, MAX_JOB_POSTING_SKILLS_TAGS)
}

export function jobSkillsToFormString(skills: string[] | undefined): string {
  return (skills ?? []).filter(Boolean).join(", ")
}

export function readJobCategoryFromApi(
  raw: unknown
): string | null | undefined {
  if (raw === null) return null
  if (typeof raw === "string") {
    const t = raw.trim()
    return t.length > 0 ? t : null
  }
  return undefined
}
