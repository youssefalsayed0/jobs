import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import { extractRows, parseJobPosting } from "@/lib/company-jobs-parse"
import type { CompanyJobPosting } from "@/types/company-jobs"

export function useCompanyJobPostingsList() {
  const { get, del } = useApi()
  const [jobs, setJobs] = useState<CompanyJobPosting[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const json = await get("/api/company/job-postings")
      const rows = extractRows(json)
        .map(parseJobPosting)
        .filter((j): j is CompanyJobPosting => j !== null)
      setJobs(rows)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load job postings"
      toast.error(message)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const deleteJob = useCallback(
    async (id: string | number) => {
      await del(`/api/company/job-postings/${id}`)
      await refetch()
    },
    [del, refetch]
  )

  return { jobs, loading, refetch, deleteJob }
}
