import { useCallback, useEffect, useState } from "react"

import { useApi } from "@/hooks/useApi"
import {
  extractRows,
  parseJobApplications,
  parseJobPosting,
} from "@/lib/company-jobs-parse"
import type { CompanyJobPosting } from "@/types/company-jobs"

export function useEmployerDashboardStats() {
  const { get } = useApi()
  const [jobCount, setJobCount] = useState<number | null>(null)
  const [applicantCount, setApplicantCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const listJson = await get("/api/company/job-postings")
      const jobs = extractRows(listJson)
        .map(parseJobPosting)
        .filter((j): j is CompanyJobPosting => j !== null)
      setJobCount(jobs.length)

      const counts = await Promise.all(
        jobs.map(async (job) => {
          const json = await get(
            `/api/company/job-postings/${job.id}/applications`
          )
          return parseJobApplications(json).length
        })
      )
      setApplicantCount(counts.reduce((a, b) => a + b, 0))
    } catch {
      setJobCount(null)
      setApplicantCount(null)
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { jobCount, applicantCount, loading, refetch }
}
