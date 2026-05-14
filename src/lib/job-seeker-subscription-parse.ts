export type SeekerSubscriptionPlan = {
  id: number
  title: string
  description: string
  benefits: string[]
  price: string
  created_at?: string
  updated_at?: string
}

export type SeekerSubscriptionPayment = {
  amount: string
  holder_name: string
  card_last_four: string
  card_expiry: string
  completed_at?: string
}

export type SeekerSubscription = {
  id: number
  user_id: number
  status: string
  price_snapshotted: string
  started_at?: string
  expires_at: string | null
  plan: SeekerSubscriptionPlan
  payment: SeekerSubscriptionPayment | null
}

function parseBenefits(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === "string" && x.trim() !== "")
}

function parsePlan(o: unknown): SeekerSubscriptionPlan | null {
  if (!o || typeof o !== "object" || Array.isArray(o)) return null
  const p = o as Record<string, unknown>
  const id = p.id
  if (typeof id !== "number") return null
  const title = typeof p.title === "string" ? p.title.trim() : ""
  if (!title) return null
  const description =
    typeof p.description === "string" ? p.description.trim() : ""
  const price = typeof p.price === "string" ? p.price.trim() : ""
  return {
    id,
    title,
    description,
    benefits: parseBenefits(p.benefits),
    price: price || "—",
    ...(typeof p.created_at === "string" ? { created_at: p.created_at } : {}),
    ...(typeof p.updated_at === "string" ? { updated_at: p.updated_at } : {}),
  }
}

function parsePayment(o: unknown): SeekerSubscriptionPayment | null {
  if (!o || typeof o !== "object" || Array.isArray(o)) return null
  const p = o as Record<string, unknown>
  const amount = typeof p.amount === "string" ? p.amount.trim() : ""
  const holder_name =
    typeof p.holder_name === "string" ? p.holder_name.trim() : ""
  const card_last_four =
    typeof p.card_last_four === "string" ? p.card_last_four.trim() : ""
  const card_expiry =
    typeof p.card_expiry === "string" ? p.card_expiry.trim() : ""
  if (!amount && !holder_name && !card_last_four) return null
  return {
    amount: amount || "—",
    holder_name: holder_name || "—",
    card_last_four: card_last_four || "—",
    card_expiry: card_expiry || "—",
    ...(typeof p.completed_at === "string"
      ? { completed_at: p.completed_at }
      : {}),
  }
}

/**
 * Parses `subscription` from GET `/api/user` profile payload (`data`).
 */
export function parseSeekerSubscription(
  profile: Record<string, unknown> | null | undefined,
): SeekerSubscription | null {
  if (!profile) return null
  const sub = profile.subscription
  if (!sub || typeof sub !== "object" || Array.isArray(sub)) return null
  const s = sub as Record<string, unknown>
  const id = s.id
  const user_id = s.user_id
  if (typeof id !== "number") return null
  if (typeof user_id !== "number") return null

  const plan = parsePlan(s.plan)
  if (!plan) return null

  const status =
    typeof s.status === "string" && s.status.trim() !== ""
      ? s.status.trim()
      : "—"
  const price_snapshotted =
    typeof s.price_snapshotted === "string"
      ? s.price_snapshotted.trim()
      : "—"

  let expires_at: string | null = null
  if (s.expires_at === null) expires_at = null
  else if (typeof s.expires_at === "string" && s.expires_at.trim() !== "") {
    expires_at = s.expires_at.trim()
  }

  return {
    id,
    user_id,
    status,
    price_snapshotted,
    started_at:
      typeof s.started_at === "string" ? s.started_at.trim() : undefined,
    expires_at,
    plan,
    payment: parsePayment(s.payment),
  }
}
