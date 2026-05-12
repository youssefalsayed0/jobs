import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import { parseJobApplications } from "@/lib/company-jobs-parse"
import type { JobApplicationRow } from "@/types/company-jobs"

export function useJobApplicationsForJob(
  jobId: string | null,
  enabled: boolean
) {
  const { get, patch } = useApi()
  const [rows, setRows] = useState<JobApplicationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | number | null>(null)

  useEffect(() => {
    if (!enabled || !jobId) return

    let cancelled = false
    setLoading(true)

    void (async () => {
      try {
        const json = await get(
          `/api/company/job-postings/${jobId}/applications`
        )
        if (cancelled) return
        setRows(parseJobApplications(json))
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load applicants"
        toast.error(message)
        setRows([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, jobId, get])

  const updateStatus = useCallback(
    async (applicationId: string | number, status: string) => {
      if (!jobId) return
      setUpdatingId(applicationId)
      try {
        await patch(
          `/api/company/job-postings/${jobId}/applications/${applicationId}`,
          { status }
        )
        setRows((prev) =>
          prev.map((r) => (r.id === applicationId ? { ...r, status } : r))
        )
        toast.success("Status updated")
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Update failed"
        toast.error(message)
      } finally {
        setUpdatingId(null)
      }
    },
    [jobId, patch]
  )

  return { rows, loading, updatingId, updateStatus }
}
