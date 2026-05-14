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

export type UsePublicJobPostingsParams = {
  page?: number
  search?: string
}

function normalizeJobPostingsRequest(
  pageOrParams: number | UsePublicJobPostingsParams = 1,
): { page: number; search: string } {
  if (typeof pageOrParams === "number") {
    return { page: Math.max(1, pageOrParams), search: "" }
  }
  return {
    page: Math.max(1, pageOrParams.page ?? 1),
    search: (pageOrParams.search ?? "").trim(),
  }
}

export function usePublicJobPostings(
  pageOrParams: number | UsePublicJobPostingsParams = 1,
) {
  const { get } = useApi()
  const [jobs, setJobs] = useState<CompanyJobPosting[]>([])
  const [meta, setMeta] = useState<JobPostingsPaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)

  const { page, search } = normalizeJobPostingsRequest(pageOrParams)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const safePage = Math.max(1, page)
      const qs = new URLSearchParams({ page: String(safePage) })
      if (search) {
        qs.set("search", search)
      }
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
  }, [get, page, search])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refetch()
    }, 0)
    return () => window.clearTimeout(id)
  }, [refetch])

  return { jobs, loading, refetch, meta }
}
