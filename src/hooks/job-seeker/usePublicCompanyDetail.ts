import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import {
  parsePublicCompanyDetail,
  type PublicCompany,
} from "@/lib/public-companies-parse"

export function usePublicCompanyDetail(companyId: string | undefined) {
  const { get } = useApi()
  const [company, setCompany] = useState<PublicCompany | null>(null)
  const [loading, setLoading] = useState(!!companyId?.trim())

  const refetch = useCallback(async () => {
    const id = companyId?.trim()
    if (!id) {
      setCompany(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const json = await get(`/api/companies/${encodeURIComponent(id)}`, {
        skipAuth: true,
      })
      setCompany(parsePublicCompanyDetail(json))
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load company"
      toast.error(message)
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }, [get, companyId])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { company, loading, refetch }
}
