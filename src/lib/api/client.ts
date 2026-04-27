import { getApiBaseUrl } from "@/lib/env"

export function apiUrl(path: string): string {
  const base = getApiBaseUrl()
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

function isPlainObjectBody(value: unknown): value is Record<string, unknown> {
  return (
    value != null &&
    typeof value === "object" &&
    !(value instanceof FormData) &&
    !(value instanceof Blob) &&
    !(value instanceof URLSearchParams) &&
    !(value instanceof ArrayBuffer)
  )
}

export async function apiRequest(
  path: string,
  init: RequestInit = {},
  options: { token?: string | null; skipAuth?: boolean } = {}
): Promise<unknown> {
  const url = apiUrl(path)
  const headers = new Headers(init.headers)

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  let body: BodyInit | null | undefined = init.body as BodyInit | undefined

  if (isPlainObjectBody(init.body)) {
    headers.set("Content-Type", "application/json")
    body = JSON.stringify(init.body)
  }

  const token = options.token
  if (token && !options.skipAuth) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...init,
    headers,
    body: body ?? null,
  })

  const text = await response.text()
  let parsed: unknown = null
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown
    } catch {
      parsed = text
    }
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    if (parsed && typeof parsed === "object" && "message" in parsed) {
      const m = (parsed as { message: unknown }).message
      if (typeof m === "string") message = m
    }
    throw new ApiError(message, response.status, parsed)
  }

  return parsed
}
