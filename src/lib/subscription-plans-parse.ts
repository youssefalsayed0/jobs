export type SubscriptionPlan = {
  id: number
  title: string
  description: string
  benefits: string[]
  price: string
  created_at?: string
  updated_at?: string
}

export type SubscriptionPlansPagination = {
  total: number
  per_page: number
  current_page: number
  last_page: number
}

function parseBenefits(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === "string" && x.trim() !== "")
}

function parsePlan(row: unknown): SubscriptionPlan | null {
  if (!row || typeof row !== "object") return null
  const o = row as Record<string, unknown>
  const id = o.id
  if (typeof id !== "number") return null
  const title = typeof o.title === "string" ? o.title.trim() : ""
  const description = typeof o.description === "string" ? o.description.trim() : ""
  const price = typeof o.price === "string" ? o.price.trim() : ""
  if (!title) return null
  return {
    id,
    title,
    description,
    benefits: parseBenefits(o.benefits),
    price: price || "0",
    ...(typeof o.created_at === "string" ? { created_at: o.created_at } : {}),
    ...(typeof o.updated_at === "string" ? { updated_at: o.updated_at } : {}),
  }
}

export function parseSubscriptionPlansResponse(json: unknown): {
  items: SubscriptionPlan[]
  pagination: SubscriptionPlansPagination | null
} {
  if (!json || typeof json !== "object") return { items: [], pagination: null }
  const root = json as Record<string, unknown>
  const data = root.data
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { items: [], pagination: null }
  }
  const d = data as Record<string, unknown>
  const itemsRaw = d.items
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map(parsePlan).filter((x): x is SubscriptionPlan => x !== null)
    : []

  const p = d.pagination
  let pagination: SubscriptionPlansPagination | null = null
  if (p && typeof p === "object" && !Array.isArray(p)) {
    const pg = p as Record<string, unknown>
    pagination = {
      total: typeof pg.total === "number" ? pg.total : items.length,
      per_page: typeof pg.per_page === "number" ? pg.per_page : items.length,
      current_page:
        typeof pg.current_page === "number" ? pg.current_page : 1,
      last_page: typeof pg.last_page === "number" ? pg.last_page : 1,
    }
  }

  return { items, pagination }
}
