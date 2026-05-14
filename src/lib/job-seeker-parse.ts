import { extractRows, stripCompanyNameUpdatedSuffix } from "@/lib/company-jobs-parse"
import type {
  ApplicationApplicantSnippet,
  ApplicationJobSnippet,
  JobSeekerApplicationRow,
} from "@/types/job-seeker-application"

function parseJobSnippet(o: Record<string, unknown>): ApplicationJobSnippet {
  let companyId: number | string | undefined
  let profilePhoto: string | undefined

  const nested = o.company
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const c = nested as Record<string, unknown>
    if (typeof c.id === "number" || typeof c.id === "string") {
      companyId = c.id
    }
    const pu = c.profile_photo_url
    if (typeof pu === "string" && pu.trim() !== "") {
      profilePhoto = pu.trim()
    }
  }

  const flatCid = o.company_id
  if (
    companyId === undefined &&
    (typeof flatCid === "number" || typeof flatCid === "string")
  ) {
    companyId = flatCid
  }

  const flatPhoto = o.company_profile_photo_url
  if (
    !profilePhoto &&
    typeof flatPhoto === "string" &&
    flatPhoto.trim() !== ""
  ) {
    profilePhoto = flatPhoto.trim()
  }

  return {
    title: typeof o.title === "string" ? o.title : undefined,
    company_name: stripCompanyNameUpdatedSuffix(
      typeof o.company_name === "string" ? o.company_name : undefined
    ),
    ...(companyId !== undefined ? { company_id: companyId } : {}),
    ...(profilePhoto !== undefined
      ? { company_profile_photo_url: profilePhoto }
      : {}),
    description:
      typeof o.description === "string" ? o.description : undefined,
    requirements:
      typeof o.requirements === "string" ? o.requirements : undefined,
    qualification:
      typeof o.qualification === "string" ? o.qualification : undefined,
    location: typeof o.location === "string" ? o.location : undefined,
    type: typeof o.type === "string" ? o.type : undefined,
  }
}

function parseApplicantSnippet(
  o: Record<string, unknown>
): ApplicationApplicantSnippet {
  return {
    name: typeof o.name === "string" ? o.name : undefined,
    email: typeof o.email === "string" ? o.email : undefined,
    phone: typeof o.phone === "string" ? o.phone : undefined,
    linkedin:
      typeof o.linkedin === "string"
        ? o.linkedin
        : o.linkedin === null
          ? null
          : undefined,
    cv_filename:
      typeof o.cv_filename === "string" ? o.cv_filename : undefined,
  }
}

export function parseApplicationRow(
  row: unknown
): JobSeekerApplicationRow | null {
  if (!row || typeof row !== "object") return null
  const r = row as Record<string, unknown>
  const id = r.id
  if (typeof id !== "number" && typeof id !== "string") return null

  const jobRaw = r.job
  const job =
    jobRaw && typeof jobRaw === "object" && !Array.isArray(jobRaw)
      ? parseJobSnippet(jobRaw as Record<string, unknown>)
      : null

  const applicantRaw = r.applicant
  const applicant =
    applicantRaw &&
    typeof applicantRaw === "object" &&
    !Array.isArray(applicantRaw)
      ? parseApplicantSnippet(applicantRaw as Record<string, unknown>)
      : null

  const jpid = r.job_posting_id
  return {
    id,
    job_posting_id:
      typeof jpid === "number" || typeof jpid === "string" ? jpid : undefined,
    status: typeof r.status === "string" ? r.status : undefined,
    submitted_at:
      typeof r.submitted_at === "string" ? r.submitted_at : undefined,
    job,
    applicant,
  }
}

export function parseApplicationsList(
  json: unknown
): JobSeekerApplicationRow[] {
  return extractRows(json)
    .map(parseApplicationRow)
    .filter((x): x is JobSeekerApplicationRow => x !== null)
}

export function parseApplicationsMeta(json: unknown): {
  total: number | null
  currentPage: number | null
  lastPage: number | null
} {
  let total: number | null = null
  let currentPage: number | null = null
  let lastPage: number | null = null
  if (!json || typeof json !== "object") {
    return { total, currentPage, lastPage }
  }
  const o = json as Record<string, unknown>
  const inner = o.data
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    const p = inner as Record<string, unknown>
    if (typeof p.total === "number") total = p.total
    if (typeof p.current_page === "number") currentPage = p.current_page
    if (typeof p.last_page === "number") lastPage = p.last_page
  }
  return { total, currentPage, lastPage }
}
