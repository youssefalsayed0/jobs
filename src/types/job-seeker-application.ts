export type ApplicationJobSnippet = {
  title?: string
  company_name?: string
  /** Employer company id for public profile link `/companies/:id`. */
  company_id?: number | string
  company_profile_photo_url?: string | null
  description?: string
  requirements?: string
  qualification?: string
  location?: string
  type?: string
}

export type ApplicationApplicantSnippet = {
  name?: string
  email?: string
  phone?: string
  linkedin?: string | null
  cv_filename?: string
}

export type JobSeekerApplicationRow = {
  id: number | string
  job_posting_id?: number | string
  status?: string
  submitted_at?: string
  job: ApplicationJobSnippet | null
  applicant: ApplicationApplicantSnippet | null
}
