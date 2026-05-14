import { useCallback, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"

export function useJobApplicationSubmit() {
  const { post } = useApi()
  const [submitting, setSubmitting] = useState(false)

  const submit = useCallback(
    async (jobId: string) => {
      setSubmitting(true)
      try {
        await post(
          `/api/job-postings/${encodeURIComponent(jobId)}/applications`,
          undefined
        )
        toast.success("Application submitted")
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not submit application"
        toast.error(message)
        throw err
      } finally {
        setSubmitting(false)
      }
    },
    [post]
  )

  return { submit, submitting }
}
