import { z } from "zod"

import {
  approvedDisabilityTokensFromFormString,
  MAX_APPROVED_DISABILITY_TAGS,
} from "@/lib/job-approved-disability"
import {
  jobSkillsFromFormString,
  MAX_JOB_POSTING_SKILLS_TAGS,
} from "@/lib/job-posting-skills"
import { jobSkillsToFormString } from "@/lib/job-posting-skills"
import type { CompanyJobPosting } from "@/types/company-jobs"

export const jobPostingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  qualification: z.string().min(1, "Qualifications are required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["remote", "hybrid", "onsite"]),
  category: z.string().optional(),
  skills: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (jobSkillsFromFormString(val).length > MAX_JOB_POSTING_SKILLS_TAGS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `You can add at most ${MAX_JOB_POSTING_SKILLS_TAGS} skills.`,
        })
      }
    }),
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
  category: "",
  skills: "",
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
    category: job.category ?? "",
    skills: jobSkillsToFormString(job.skills),
    approved_disability: tags.join(", "),
  }
}
