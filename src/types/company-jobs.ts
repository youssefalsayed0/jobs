export type JobWorkType = "remote" | "hybrid" | "onsite"

export type CompanyJobPosting = {
  id: number | string
  user_id?: number | string
  title?: string
  company_name?: string
  description?: string
  requirements?: string
  qualification?: string
  location?: string
  type?: string
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
}

export type JobApplicationRow = {
  id: number | string
  status?: string
  submitted_at?: string
  job_title?: string
  name?: string
  email?: string
  phone?: string
  linkedin?: string | null
  cv?: string | null
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
