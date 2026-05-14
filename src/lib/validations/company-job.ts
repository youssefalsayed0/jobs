import { z } from "zod"

import {
  approvedDisabilityTokensFromFormString,
  MAX_APPROVED_DISABILITY_TAGS,
} from "@/lib/job-approved-disability"
import type { CompanyJobPosting } from "@/types/company-jobs"

export const jobPostingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  qualification: z.string().min(1, "Qualifications are required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["remote", "hybrid", "onsite"]),
  approved_disability: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      const n = approvedDisabilityTokensFromFormString(val).length
      if (n > MAX_APPROVED_DISABILITY_TAGS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `You can add at most ${MAX_APPROVED_DISABILITY_TAGS} disability entries.`,
        })
      }
    }),
})

export type JobPostingFormValues = z.infer<typeof jobPostingFormSchema>

export const jobPostingFormDefaults: JobPostingFormValues = {
  title: "",
  description: "",
  requirements: "",
  qualification: "",
  location: "",
  type: "remote",
  approved_disability: "",
}

export function jobPostingToFormValues(job: CompanyJobPosting): JobPostingFormValues {
  const t = job.type?.toLowerCase()
  const type =
    t === "hybrid" || t === "onsite" || t === "remote" ? t : "remote"
  const tags = (job.approved_disability ?? []).filter(Boolean)
  return {
    title: job.title ?? "",
    description: job.description ?? "",
    requirements: job.requirements ?? "",
    qualification: job.qualification ?? "",
    location: job.location ?? "",
    type,
    approved_disability: tags.join(", "),
  }
}
