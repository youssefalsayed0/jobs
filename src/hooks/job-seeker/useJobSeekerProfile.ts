import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import { flattenApiUserPayload } from "@/lib/flatten-user-api-payload"

export type JobSeekerProfilePayload = Record<string, unknown> | null

export function useJobSeekerProfile() {
  const { request, patchForm, del } = useApi()
  const [profile, setProfile] = useState<JobSeekerProfilePayload>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(
    async (opts?: { background?: boolean }): Promise<JobSeekerProfilePayload> => {
      const background = opts?.background === true
      if (!background) setLoading(true)
      let next: JobSeekerProfilePayload = null
      try {
        const json = (await request("/api/user", { method: "GET" })) as unknown
        if (json && typeof json === "object") {
          const o = json as Record<string, unknown>
          const inner = o.data
          next =
            inner && typeof inner === "object"
              ? flattenApiUserPayload(inner as Record<string, unknown>)
              : (o as JobSeekerProfilePayload)
          setProfile(next)
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
        next = null
      } finally {
        if (!background) setLoading(false)
      }
      return next
    },
    [request]
  )

  useEffect(() => {
    void refetch()
  }, [refetch])

  const saveProfile = useCallback(
    async (form: FormData): Promise<JobSeekerProfilePayload> => {
      try {
        await patchForm("/api/profile", form)
        toast.success("Profile updated")
        /** Background refetch keeps the form mounted so Radix Selects stay in sync with RHF. */
        return await refetch({ background: true })
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

  const deleteAccount = useCallback(
    async (password: string) => {
      await del("/api/profile", { password })
      setProfile(null)
    },
    [del]
  )

  return { profile, loading, refetch, saveProfile, deleteAccount }
}
