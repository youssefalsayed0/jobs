import { useCallback } from "react"

import { useApi } from "@/hooks/useApi"
import type { JobPostingFormValues } from "@/lib/validations/company-job"

export function useJobPostingSave() {
  const { post, put } = useApi()

  const save = useCallback(
    async (
      mode: "create" | "edit",
      jobId: string | null,
      values: JobPostingFormValues
    ) => {
      if (mode === "create") {
        await post("/api/company/job-postings", values)
        return
      }
      if (jobId) {
        await put(`/api/company/job-postings/${jobId}`, values)
      }
    },
    [post, put]
  )

  return { save }
}
