import { z } from "zod"

import type { CompanyJobPosting } from "@/types/company-jobs"

export const jobPostingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  qualification: z.string().min(1, "Qualifications are required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["remote", "hybrid", "onsite"]),
})

export type JobPostingFormValues = z.infer<typeof jobPostingFormSchema>

export const jobPostingFormDefaults: JobPostingFormValues = {
  title: "",
  description: "",
  requirements: "",
  qualification: "",
  location: "",
  type: "remote",
}

export function jobPostingToFormValues(job: CompanyJobPosting): JobPostingFormValues {
  const t = job.type?.toLowerCase()
  const type =
    t === "hybrid" || t === "onsite" || t === "remote" ? t : "remote"
  return {
    title: job.title ?? "",
    description: job.description ?? "",
    requirements: job.requirements ?? "",
    qualification: job.qualification ?? "",
    location: job.location ?? "",
    type,
  }
}
