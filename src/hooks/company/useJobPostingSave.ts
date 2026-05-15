import { useCallback } from "react"

import { useApi } from "@/hooks/useApi"
import { approvedDisabilityTokensFromFormString } from "@/lib/job-approved-disability"
import { jobSkillsFromFormString } from "@/lib/job-posting-skills"
import type { CompanyJobPostingInput } from "@/types/company-jobs"
import type { JobPostingFormValues } from "@/lib/validations/company-job"

function toApiPayload(values: JobPostingFormValues): CompanyJobPostingInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    requirements: values.requirements.trim(),
    qualification: values.qualification.trim(),
    location: values.location.trim(),
    type: values.type,
    category: values.category?.trim() ? values.category.trim() : null,
    skills: jobSkillsFromFormString(values.skills),
    approved_disability: approvedDisabilityTokensFromFormString(
      values.approved_disability
    ),
  }
}

export function useJobPostingSave() {
  const { post, put } = useApi()

  const save = useCallback(
    async (
      mode: "create" | "edit",
      jobId: string | null,
      values: JobPostingFormValues
    ) => {
      const body = toApiPayload(values)
      if (mode === "create") {
        await post("/api/company/job-postings", body)
        return
      }
      if (jobId) {
        await put(`/api/company/job-postings/${jobId}`, body)
      }
    },
    [post, put]
  )

  return { save }
}
