import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"

export type JobSeekerProfilePayload = Record<string, unknown> | null

/**
 * GET `/api/user` shape differs by environment: flat user, `{ user: {…} }`,
 * or JSON:API-style `{ attributes: {…} }`. Merge so profile fields resolve
 * the same as on local.
 */
function flattenJobSeekerProfilePayload(
  inner: Record<string, unknown>
): Record<string, unknown> {
  const attrs = inner.attributes
  const withAttrs =
    attrs && typeof attrs === "object" && !Array.isArray(attrs)
      ? { ...inner, ...(attrs as Record<string, unknown>) }
      : { ...inner }
  const u = withAttrs.user
  if (u && typeof u === "object" && !Array.isArray(u)) {
    return { ...(u as Record<string, unknown>), ...withAttrs }
  }
  return withAttrs
}

export function useJobSeekerProfile() {
  const { request, patchForm } = useApi()
  const [profile, setProfile] = useState<JobSeekerProfilePayload>(null)
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
            ? flattenJobSeekerProfilePayload(inner as Record<string, unknown>)
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

  const saveProfile = useCallback(
    async (form: FormData) => {
      try {
        await patchForm("/api/profile", form)
        toast.success("Profile updated")
        await refetch()
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not update profile"
        toast.error(message)
        throw err
      }
    },
    [patchForm, refetch]
  )

  return { profile, loading, refetch, saveProfile }
}
