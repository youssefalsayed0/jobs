import {
  extractRows,
  stripCompanyNameUpdatedSuffix,
} from "@/lib/company-jobs-parse"

export type PublicCompany = {
  id: number | string
  company_name: string
  industry?: string
  company_size?: string
  disability_support_policy?: string | null
  overview?: string | null
  facebook_url?: string | null
  x_url?: string | null
  linkedin_url?: string | null
  instagram_url?: string | null
  profile_photo_url?: string | null
  city?: string | null
  street?: string | null
  job_postings_count?: number
}

function nullableString(v: unknown): string | null | undefined {
  if (v === null) return null
  if (v === undefined) return undefined
  if (typeof v !== "string") return undefined
  const t = v.trim()
  return t.length > 0 ? t : null
}

export function parsePublicCompany(row: unknown): PublicCompany | null {
  if (!row || typeof row !== "object") return null
  const o = row as Record<string, unknown>
  const id = o.id
  if (typeof id !== "number" && typeof id !== "string") return null

  const rawName =
    typeof o.company_name === "string" ? o.company_name.trim() : ""
  const company_name =
    stripCompanyNameUpdatedSuffix(rawName || undefined) ||
    (rawName.length > 0 ? rawName : null) ||
    "Company"

  const industry = nullableString(o.industry)
  const company_size = nullableString(o.company_size)
  const disability_support_policy = nullableString(o.disability_support_policy)
  const overview = nullableString(o.overview)

  const count = o.job_postings_count

  return {
    id,
    company_name,
    ...(industry ? { industry } : {}),
    ...(company_size ? { company_size } : {}),
    ...(disability_support_policy !== undefined
      ? { disability_support_policy }
      : {}),
    ...(overview !== undefined ? { overview } : {}),
    facebook_url: nullableString(o.facebook_url),
    x_url: nullableString(o.x_url),
    linkedin_url: nullableString(o.linkedin_url),
    instagram_url: nullableString(o.instagram_url),
    profile_photo_url: nullableString(o.profile_photo_url),
    city: nullableString(o.city),
    street: nullableString(o.street),
    ...(typeof count === "number" ? { job_postings_count: count } : {}),
  }
}

export function parsePublicCompaniesList(json: unknown): PublicCompany[] {
  return extractRows(json)
    .map(parsePublicCompany)
    .filter((x): x is PublicCompany => x !== null)
}

/** Single resource: `{ data: { id, ... } }` */
export function parsePublicCompanyDetail(json: unknown): PublicCompany | null {
  if (!json || typeof json !== "object") return null
  const o = json as Record<string, unknown>
  const top = o.data
  if (top && typeof top === "object" && !Array.isArray(top)) {
    const d = top as Record<string, unknown>
    if (Array.isArray(d.data) && typeof d.current_page === "number") {
      return null
    }
    return parsePublicCompany(top)
  }
  return parsePublicCompany(json)
}
