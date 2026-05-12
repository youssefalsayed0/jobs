import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import { parseJobResponse } from "@/lib/company-jobs-parse"
import type { CompanyJobPosting } from "@/types/company-jobs"

export function useCompanyJobPostingDetail(jobId: string | undefined) {
  const { get } = useApi()
  const [job, setJob] = useState<CompanyJobPosting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false
      if (!jobId) {
        setJob(null)
        setLoading(false)
        setError(null)
        return
      }

      if (!silent) setLoading(true)
      setError(null)
      try {
        const json = await get(`/api/company/job-postings/${jobId}`)
        const parsed = parseJobResponse(json)
        if (!parsed) {
          setJob(null)
          setError("Job not found.")
          return
        }
        setJob(parsed)
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not load job"
        setError(message)
        toast.error(message)
        setJob(null)
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [get, jobId]
  )

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { job, loading, error, refetch }
}
