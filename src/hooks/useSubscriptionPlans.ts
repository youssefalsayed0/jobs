import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import {
  parseSubscriptionPlansResponse,
  type SubscriptionPlan,
  type SubscriptionPlansPagination,
} from "@/lib/subscription-plans-parse"

export function useSubscriptionPlans(page = 1) {
  const { get } = useApi()
  const [items, setItems] = useState<SubscriptionPlan[]>([])
  const [pagination, setPagination] =
    useState<SubscriptionPlansPagination | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const safePage = Math.max(1, page)
      const qs = new URLSearchParams({ page: String(safePage) })
      const json = await get(`/api/subscription-plans?${qs.toString()}`, {
        skipAuth: true,
      })
      const parsed = parseSubscriptionPlansResponse(json)
      setItems(parsed.items)
      setPagination(parsed.pagination)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load subscription plans"
      toast.error(message)
      setItems([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [get, page])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refetch()
    }, 0)
    return () => window.clearTimeout(id)
  }, [refetch])

  return { items, pagination, loading, refetch }
}
