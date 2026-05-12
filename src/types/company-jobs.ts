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
  name?: string
  email?: string
  phone?: string
  linkedin?: string
}
