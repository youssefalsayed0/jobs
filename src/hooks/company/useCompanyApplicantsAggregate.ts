import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import {
  extractRows,
  parseJobApplications,
  parseJobPosting,
} from "@/lib/company-jobs-parse"
import type { CompanyJobPosting, JobApplicationRow } from "@/types/company-jobs"

export type CompanyApplicantAggregateRow = JobApplicationRow & {
  jobId: string
  jobTitle: string
}

export function useCompanyApplicantsAggregate() {
  const { get } = useApi()
  const [rows, setRows] = useState<CompanyApplicantAggregateRow[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const listJson = await get("/api/company/job-postings")
      const jobs = extractRows(listJson)
        .map(parseJobPosting)
        .filter((j): j is CompanyJobPosting => j !== null)

      const chunks = await Promise.all(
        jobs.map(async (job) => {
          const json = await get(
            `/api/company/job-postings/${job.id}/applications`
          )
          const apps = parseJobApplications(json)
          return apps.map((a) => ({
            ...a,
            jobId: String(job.id),
            jobTitle: job.title ?? `Job #${job.id}`,
          }))
        })
      )
      setRows(chunks.flat())
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load applicants"
      toast.error(message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { rows, loading, refetch }
}
