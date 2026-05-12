import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"

export type CompanyProfilePayload = Record<string, unknown> | null

export function useCompanyUserProfile() {
  const { request } = useApi()
  const [profile, setProfile] = useState<CompanyProfilePayload>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const json = (await request("/api/user", { method: "GET" })) as unknown
      if (json && typeof json === "object") {
        const o = json as Record<string, unknown>
        const inner = o.data
        setProfile(
          inner && typeof inner === "object"
            ? (inner as Record<string, unknown>)
            : o
        )
      } else {
        setProfile(null)
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load profile"
      toast.error(message)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { profile, loading, refetch }
}
