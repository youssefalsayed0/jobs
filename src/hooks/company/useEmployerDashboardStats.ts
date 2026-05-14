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
      const [jobsOutcome, applicationsOutcome] = await Promise.allSettled([
        get("/api/company/job-postings"),
        get("/api/company/applications"),
      ])

      if (jobsOutcome.status === "fulfilled") {
        const jobs = extractRows(jobsOutcome.value)
          .map(parseJobPosting)
          .filter((j): j is CompanyJobPosting => j !== null)
        setJobCount(jobs.length)
      } else {
        setJobCount(null)
      }

      if (applicationsOutcome.status === "fulfilled") {
        setApplicantCount(
          parseJobApplications(applicationsOutcome.value).length
        )
      } else {
        setApplicantCount(null)
      }
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { jobCount, applicantCount, loading, refetch }
}
