export type JobWorkType = "remote" | "hybrid" | "onsite"

export type CompanyJobPosting = {
  id: number | string
  user_id?: number | string
  title?: string
  company_name?: string
  /** Employer logo URL on public job payloads when present. */
  company_profile_photo_url?: string | null
  description?: string
  requirements?: string
  qualification?: string
  location?: string
  type?: string
  /** Job category label from API; may be null when unset. */
  category?: string | null
  /** Required or preferred skills for this role (API string array). */
  skills?: string[]
  /** Disabilities / conditions this role explicitly welcomes (API array). */
  approved_disability?: string[]
  created_at?: string
  updated_at?: string
  applications_count?: number
}

export type CompanyJobPostingInput = {
  title: string
  description: string
  requirements: string
  qualification: string
  location: string
  type: string
  category: string | null
  skills: string[]
  approved_disability: string[]
}

export type JobApplicationRow = {
  id: number | string
  /** Job seeker user id (for company profile deep-links). */
  user_id?: number | string
  status?: string
  submitted_at?: string
  job_title?: string
  name?: string
  email?: string
  phone?: string
  linkedin?: string | null
  /** Legacy filename or path; prefer `cv_url` when present. */
  cv?: string | null
  /** Full URL to applicant CV (top-level or under `seeker_profile`). */
  cv_url?: string | null
  /** Flattened from `seeker_profile` when the API nests applicant fields. */
  gender?: string
  city?: string
  street?: string
  disability_type?: string
  profile_photo_url?: string
  skills?: string[]
  educations_summary?: string
  experiences_summary?: string
  certificates_summary?: string
}

/** Values accepted by PATCH .../applications/:id `{ status }` on this project API. */
export const COMPANY_APPLICATION_STATUS_VALUES = [
  "pending",
  "reviewing",
  "accepted",
  "rejected",
] as const

export type CompanyApplicationStatusValue =
  (typeof COMPANY_APPLICATION_STATUS_VALUES)[number]

export function normalizeCompanyApplicationStatus(
  status: string | undefined
): CompanyApplicationStatusValue {
  const s = (status ?? "pending").toLowerCase()
  if (
    (COMPANY_APPLICATION_STATUS_VALUES as readonly string[]).includes(s)
  ) {
    return s as CompanyApplicationStatusValue
  }
  return "pending"
}
