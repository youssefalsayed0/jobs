import { useCallback, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"

export type SubscribePayload = {
  subscription_plan_id: number
  holder_name: string
  card_number: string
  expiry: string
  cvv: string
}

export function useSubscriptionSubscribe() {
  const { post } = useApi()
  const [submitting, setSubmitting] = useState(false)

  const subscribe = useCallback(
    async (body: SubscribePayload) => {
      setSubmitting(true)
      try {
        await post("/api/subscriptions", body)
        toast.success("Subscription created successfully")
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not complete subscription"
        toast.error(message)
        throw err
      } finally {
        setSubmitting(false)
      }
    },
    [post],
  )

  return { subscribe, submitting }
}
