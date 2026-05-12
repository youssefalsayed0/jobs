import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import { parseJobResponse } from "@/lib/company-jobs-parse"
import type { CompanyJobPosting } from "@/types/company-jobs"

export function usePublicJobDetail(jobId: string | undefined) {
  const { get } = useApi()
  const [job, setJob] = useState<CompanyJobPosting | null>(null)
  const [loading, setLoading] = useState(!!jobId)

  const refetch = useCallback(async () => {
    if (!jobId) {
      setJob(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const json = await get(
        `/api/job-postings/${encodeURIComponent(jobId)}`,
        { skipAuth: true }
      )
      setJob(parseJobResponse(json))
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load job"
      toast.error(message)
      setJob(null)
    } finally {
      setLoading(false)
    }
  }, [get, jobId])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { job, loading, refetch }
}
