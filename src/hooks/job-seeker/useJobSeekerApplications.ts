import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import {
  parseApplicationsList,
  parseApplicationsMeta,
} from "@/lib/job-seeker-parse"
import type { JobSeekerApplicationRow } from "@/types/job-seeker-application"

export function useJobSeekerApplications() {
  const { get } = useApi()
  const [applications, setApplications] = useState<JobSeekerApplicationRow[]>(
    []
  )
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const json = await get("/api/applications")
      setApplications(parseApplicationsList(json))
      const meta = parseApplicationsMeta(json)
      setTotal(meta.total)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load applications"
      toast.error(message)
      setApplications([])
      setTotal(null)
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { applications, total, loading, refetch }
}
