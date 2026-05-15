import { parseApprovedDisabilityFromApi } from "@/lib/job-approved-disability"
import {
  parseJobSkillsFromApi,
  readJobCategoryFromApi,
} from "@/lib/job-posting-skills"
import type {
  CompanyJobPosting,
  JobApplicationRow,
} from "@/types/company-jobs"

/** Laravel-style paginator envelope under top-level `data`. */
export type JobPostingsPaginationMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export function extractJobPostingsPaginationMeta(
  json: unknown
): JobPostingsPaginationMeta | null {
  if (!json || typeof json !== "object") return null
  const o = json as Record<string, unknown>
  const inner = o.data
  if (!inner || typeof inner !== "object" || Array.isArray(inner)) return null
  const d = inner as Record<string, unknown>
  if (typeof d.current_page !== "number" || typeof d.last_page !== "number") {
    return null
  }
  return {
    current_page: d.current_page,
    last_page: d.last_page,
    per_page: typeof d.per_page === "number" ? d.per_page : 15,
    total: typeof d.total === "number" ? d.total : 0,
    from: typeof d.from === "number" ? d.from : null,
    to: typeof d.to === "number" ? d.to : null,
  }
}

export function extractRows(json: unknown): unknown[] {
  if (Array.isArray(json)) return json
  if (json && typeof json === "object") {
    const o = json as Record<string, unknown>
    if (Array.isArray(o.data)) return o.data
    const inner = o.data
    if (inner && typeof inner === "object") {
      const d = inner as Record<string, unknown>
      if (Array.isArray(d.data)) return d.data
    }
  }
  return []
}

export function parseJobResponse(json: unknown): CompanyJobPosting | null {
  if (!json || typeof json !== "object") return null
  const o = json as Record<string, unknown>
  if (o.data && typeof o.data === "object" && !Array.isArray(o.data)) {
    return parseJobPosting(o.data)
  }
  return parseJobPosting(json)
}

/** Removes trailing ` (updated)` some APIs append next to the employer name. */
export function stripCompanyNameUpdatedSuffix(
  name: string | undefined
): string | undefined {
  if (typeof name !== "string") return undefined
  const t = name.trim().replace(/\s*\(updated\)\s*$/i, "").trim()
  return t.length > 0 ? t : undefined
}

export function parseJobPosting(row: unknown): CompanyJobPosting | null {
  if (!row || typeof row !== "object") return null
  const o = row as Record<string, unknown>
  const id = o.id
  if (typeof id !== "number" && typeof id !== "string") return null
  const userId = o.user_id
  return {
    id,
    user_id:
      typeof userId === "number" || typeof userId === "string"
        ? userId
        : undefined,
    title: typeof o.title === "string" ? o.title : undefined,
    company_name: stripCompanyNameUpdatedSuffix(
      typeof o.company_name === "string" ? o.company_name : undefined
    ),
    company_profile_photo_url: (() => {
      const u = o.company_profile_photo_url
      if (typeof u === "string" && u.trim() !== "") return u.trim()
      if (u === null) return null
      return undefined
    })(),
    description: typeof o.description === "string" ? o.description : undefined,
    requirements:
      typeof o.requirements === "string" ? o.requirements : undefined,
    qualification:
      typeof o.qualification === "string" ? o.qualification : undefined,
    location: typeof o.location === "string" ? o.location : undefined,
    type: typeof o.type === "string" ? o.type : undefined,
    category: readJobCategoryFromApi(o.category),
    skills: parseJobSkillsFromApi(o.skills),
    approved_disability: parseApprovedDisabilityFromApi(o.approved_disability),
    created_at:
      typeof o.created_at === "string" ? o.created_at : undefined,
    updated_at:
      typeof o.updated_at === "string" ? o.updated_at : undefined,
    applications_count:
      typeof o.applications_count === "number"
        ? o.applications_count
        : undefined,
  }
}

export function parseJobApplications(json: unknown): JobApplicationRow[] {
  return extractApplicationRows(json)
    .map(parseApplication)
    .filter((x): x is JobApplicationRow => x !== null)
}

/** Job posting / listing nested on an application (company applications index). */
function getNestedJobRecord(
  o: Record<string, unknown>
): Record<string, unknown> | null {
  const candidates = [
    o.job_posting,
    o.jobPosting,
    o.job,
    o.listing,
    o.job_listing,
  ]
  for (const v of candidates) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return v as Record<string, unknown>
    }
  }
  return null
}

/**
 * Resolves job id + title for aggregate applicant rows (e.g. GET /api/company/applications).
 */
export function extractJobMetaFromApplicationPayload(
  o: Record<string, unknown>
): { jobId: string; jobTitle: string } | null {
  const nested = getNestedJobRecord(o)
  const idCandidate =
      o.job_posting_id ?? o.job_id ?? o.job_postingId ?? nested?.id

  if (typeof idCandidate !== "number" && typeof idCandidate !== "string") {
    return null
  }

  const titleFromNested =
    typeof nested?.title === "string" ? nested.title.trim() : ""
  const titleFromRoot =
    typeof o.job_title === "string" ? o.job_title.trim() : ""
  const jobTitle =
    titleFromNested || titleFromRoot || `Job #${String(idCandidate)}`

  return { jobId: String(idCandidate), jobTitle }
}

export type CompanyApplicationAggregateRow = JobApplicationRow & {
  jobId: string
  jobTitle: string
}

/**
 * Parses company-wide applications list; each row includes jobId/jobTitle for the applicants table.
 */
export function parseCompanyApplicationsAggregate(
  json: unknown
): CompanyApplicationAggregateRow[] {
  const out: CompanyApplicationAggregateRow[] = []
  for (const row of extractApplicationRows(json)) {
    if (!row || typeof row !== "object") continue
    const o = row as Record<string, unknown>
    const meta = extractJobMetaFromApplicationPayload(o)
    if (!meta) continue
    const base = parseApplication(row)
    if (!base) continue
    out.push({
      ...base,
      jobId: meta.jobId,
      jobTitle: meta.jobTitle,
      job_title: base.job_title?.trim() ? base.job_title : meta.jobTitle,
    })
  }
  return out
}

function getSeekerProfile(
  rec: Record<string, unknown>
): Record<string, unknown> | null {
  const sp = rec.seeker_profile
  if (sp && typeof sp === "object" && !Array.isArray(sp)) {
    return sp as Record<string, unknown>
  }
  return null
}

function isApplicationPayload(rec: Record<string, unknown>): boolean {
  if (typeof rec.id !== "number" && typeof rec.id !== "string") return false
  const sp = getSeekerProfile(rec)
  if (sp) {
    const hasSeekerIdentity =
      typeof sp.id === "number" ||
      typeof sp.id === "string" ||
      (typeof sp.email === "string" && sp.email.trim() !== "") ||
      (typeof sp.full_name === "string" && sp.full_name.trim() !== "") ||
      (typeof sp.first_name === "string" && sp.first_name.trim() !== "") ||
      (typeof sp.phone === "string" && sp.phone.trim() !== "")
    if (hasSeekerIdentity) return true
  }
  return (
    typeof rec.job_title === "string" ||
    typeof rec.submitted_at === "string" ||
    (typeof rec.status === "string" &&
      (typeof rec.email === "string" || typeof rec.name === "string"))
  )
}

/** Handles list, paginated list, or single `{ data: { … } }` application objects. */
function extractApplicationRows(json: unknown): unknown[] {
  if (!json || typeof json !== "object") return []
  const o = json as Record<string, unknown>
  const top = o.data

  if (Array.isArray(top)) return top

  if (top && typeof top === "object" && !Array.isArray(top)) {
    const d = top as Record<string, unknown>
    if (Array.isArray(d.data)) return d.data
    if (isApplicationPayload(d)) return [d]
  }

  return extractRows(json)
}

function mergeNameFromRootAndSeeker(
  o: Record<string, unknown>,
  sp: Record<string, unknown> | null
): string | undefined {
  if (typeof o.name === "string" && o.name.trim() !== "") return o.name.trim()
  if (!sp) return undefined
  if (typeof sp.full_name === "string" && sp.full_name.trim() !== "") {
    return sp.full_name.trim()
  }
  const f = typeof sp.first_name === "string" ? sp.first_name.trim() : ""
  const l = typeof sp.last_name === "string" ? sp.last_name.trim() : ""
  const combo = `${f} ${l}`.trim()
  return combo.length > 0 ? combo : undefined
}

function mergeStringField(
  root: unknown,
  seekerVal: unknown
): string | undefined {
  if (typeof root === "string" && root.trim() !== "") return root.trim()
  if (typeof seekerVal === "string" && seekerVal.trim() !== "") {
    return seekerVal.trim()
  }
  return undefined
}

function parseSkillNamesFromSeeker(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const n = (item as Record<string, unknown>).name
    if (typeof n === "string" && n.trim() !== "") out.push(n.trim())
  }
  return out
}

function summarizeEducations(raw: unknown): string {
  if (!Array.isArray(raw)) return ""
  const parts: string[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const r = item as Record<string, unknown>
    const school =
      typeof r.school === "string"
        ? r.school.trim()
        : typeof r.institution === "string"
          ? r.institution.trim()
          : ""
    const degree =
      typeof r.degree === "string"
        ? r.degree.trim()
        : typeof r.field === "string"
          ? r.field.trim()
          : ""
    const seg = [degree, school].filter(Boolean).join(" — ")
    if (seg) parts.push(seg)
  }
  return parts.join("; ")
}

function summarizeExperiences(raw: unknown): string {
  if (!Array.isArray(raw)) return ""
  const parts: string[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const r = item as Record<string, unknown>
    const t = typeof r.title === "string" ? r.title.trim() : ""
    const c =
      typeof r.company_name === "string" ? r.company_name.trim() : ""
    const seg = t && c ? `${t} — ${c}` : t || c
    if (seg) parts.push(seg)
  }
  return parts.join("; ")
}

function summarizeCertificates(raw: unknown): string {
  if (!Array.isArray(raw)) return ""
  const parts: string[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const r = item as Record<string, unknown>
    const n = typeof r.name === "string" ? r.name.trim() : ""
    const issuer = typeof r.issuer === "string" ? r.issuer.trim() : ""
    const issued = typeof r.issued_at === "string" ? r.issued_at.trim() : ""
    let seg = n
    if (issuer) seg = seg ? `${seg} (${issuer})` : issuer
    if (issued) seg = seg ? `${seg}, ${issued}` : issued
    if (seg) parts.push(seg)
  }
  return parts.join("; ")
}

function extractCvUrlFromApplicationRow(
  o: Record<string, unknown>
): string | null | undefined {
  const top = o.cv_url
  if (typeof top === "string" && top.trim() !== "") return top.trim()

  const nested = o.seeker_profile
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const p = nested as Record<string, unknown>
    const u = p.cv_url ?? p.cvUrl
    if (typeof u === "string" && u.trim() !== "") return u.trim()
    if (u === null) return null
  }

  if (top === null) return null
  return undefined
}

function parseApplication(row: unknown): JobApplicationRow | null {
  if (!row || typeof row !== "object") return null
  const o = row as Record<string, unknown>
  const id = o.id
  if (typeof id !== "number" && typeof id !== "string") return null
  const sp = getSeekerProfile(o)
  const userIdRoot = o.user_id
  const userIdSeeker = sp?.id
  const user_id =
    typeof userIdRoot === "number" || typeof userIdRoot === "string"
      ? userIdRoot
      : typeof userIdSeeker === "number" || typeof userIdSeeker === "string"
        ? userIdSeeker
        : undefined
  const linkedinRoot = o.linkedin
  const seekerLinkedin = sp?.linkedin
  let linkedin: string | null | undefined
  if (typeof linkedinRoot === "string") {
    linkedin = linkedinRoot.trim() || undefined
  } else if (linkedinRoot === null) {
    linkedin = null
  } else if (typeof seekerLinkedin === "string") {
    linkedin = seekerLinkedin.trim() || undefined
  } else if (seekerLinkedin === null) {
    linkedin = null
  } else {
    linkedin = undefined
  }
  const cv = o.cv
  const cvUrlResolved = extractCvUrlFromApplicationRow(o)
  const name = mergeNameFromRootAndSeeker(o, sp)
  const email = mergeStringField(o.email, sp?.email)
  const phone = mergeStringField(o.phone, sp?.phone)
  const gender = sp ? mergeStringField(undefined, sp.gender) : undefined
  const city = sp ? mergeStringField(undefined, sp.city) : undefined
  const street = sp ? mergeStringField(undefined, sp.street) : undefined
  const disability_type = sp
    ? mergeStringField(undefined, sp.disability_type)
    : undefined
  const profile_photo_url = sp
    ? mergeStringField(undefined, sp.profile_photo_url)
    : undefined
  const skills = sp ? parseSkillNamesFromSeeker(sp.skills) : []
  const educations_summary = sp ? summarizeEducations(sp.educations) : ""
  const experiences_summary = sp ? summarizeExperiences(sp.experiences) : ""
  const certificates_summary = sp
    ? summarizeCertificates(sp.certificates)
    : ""
  return {
    id,
    ...(user_id !== undefined ? { user_id } : {}),
    status: typeof o.status === "string" ? o.status : undefined,
    submitted_at:
      typeof o.submitted_at === "string" ? o.submitted_at : undefined,
    job_title: typeof o.job_title === "string" ? o.job_title : undefined,
    name,
    email,
    phone,
    linkedin,
    cv: typeof cv === "string" ? cv : cv === null ? null : undefined,
    cv_url: cvUrlResolved,
    ...(gender ? { gender } : {}),
    ...(city ? { city } : {}),
    ...(street ? { street } : {}),
    ...(disability_type ? { disability_type } : {}),
    ...(profile_photo_url ? { profile_photo_url } : {}),
    ...(skills.length > 0 ? { skills } : {}),
    ...(educations_summary ? { educations_summary } : {}),
    ...(experiences_summary ? { experiences_summary } : {}),
    ...(certificates_summary ? { certificates_summary } : {}),
  }
}
