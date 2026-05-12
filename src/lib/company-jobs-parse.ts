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
    company_name:
      typeof o.company_name === "string" ? o.company_name : undefined,
    description: typeof o.description === "string" ? o.description : undefined,
    requirements:
      typeof o.requirements === "string" ? o.requirements : undefined,
    qualification:
      typeof o.qualification === "string" ? o.qualification : undefined,
    location: typeof o.location === "string" ? o.location : undefined,
    type: typeof o.type === "string" ? o.type : undefined,
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

function isApplicationPayload(rec: Record<string, unknown>): boolean {
  if (typeof rec.id !== "number" && typeof rec.id !== "string") return false
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

function parseApplication(row: unknown): JobApplicationRow | null {
  if (!row || typeof row !== "object") return null
  const o = row as Record<string, unknown>
  const id = o.id
  if (typeof id !== "number" && typeof id !== "string") return null
  const linkedin = o.linkedin
  const cv = o.cv
  return {
    id,
    status: typeof o.status === "string" ? o.status : undefined,
    submitted_at:
      typeof o.submitted_at === "string" ? o.submitted_at : undefined,
    job_title: typeof o.job_title === "string" ? o.job_title : undefined,
    name: typeof o.name === "string" ? o.name : undefined,
    email: typeof o.email === "string" ? o.email : undefined,
    phone: typeof o.phone === "string" ? o.phone : undefined,
    linkedin:
      typeof linkedin === "string"
        ? linkedin
        : linkedin === null
          ? null
          : undefined,
    cv: typeof cv === "string" ? cv : cv === null ? null : undefined,
  }
}
