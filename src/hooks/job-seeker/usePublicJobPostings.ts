import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import {
  extractJobPostingsPaginationMeta,
  extractRows,
  parseJobPosting,
  type JobPostingsPaginationMeta,
} from "@/lib/company-jobs-parse"
import type { CompanyJobPosting } from "@/types/company-jobs"

function defaultMetaFromRowCount(rowCount: number): JobPostingsPaginationMeta {
  return {
    current_page: 1,
    last_page: 1,
    per_page: rowCount,
    total: rowCount,
    from: rowCount > 0 ? 1 : null,
    to: rowCount > 0 ? rowCount : null,
  }
}

export function usePublicJobPostings(page = 1) {
  const { get } = useApi()
  const [jobs, setJobs] = useState<CompanyJobPosting[]>([])
  const [meta, setMeta] = useState<JobPostingsPaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const safePage = Math.max(1, page)
      const qs = new URLSearchParams({ page: String(safePage) })
      const json = await get(`/api/job-postings?${qs.toString()}`, {
        skipAuth: true,
      })
      const rows = extractRows(json)
        .map(parseJobPosting)
        .filter((j): j is CompanyJobPosting => j !== null)
      setJobs(rows)
      const parsed = extractJobPostingsPaginationMeta(json)
      setMeta(parsed ?? defaultMetaFromRowCount(rows.length))
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load jobs"
      toast.error(message)
      setJobs([])
      setMeta(defaultMetaFromRowCount(0))
    } finally {
      setLoading(false)
    }
  }, [get, page])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refetch()
    }, 0)
    return () => window.clearTimeout(id)
  }, [refetch])

  return { jobs, loading, refetch, meta }
}
