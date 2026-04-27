import Cookies from "js-cookie"

export const AUTH_TOKEN_COOKIE = "auth_token"

const TOKEN_MAX_AGE_SEC = 60 * 60 * 24 * 30 // 30 days

export function getAuthToken(): string | undefined {
  return Cookies.get(AUTH_TOKEN_COOKIE)
}

export function setAuthToken(token: string): void {
  Cookies.set(AUTH_TOKEN_COOKIE, token, {
    path: "/",
    sameSite: "lax",
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
    expires: TOKEN_MAX_AGE_SEC / (60 * 60 * 24),
  })
}

export function removeAuthToken(): void {
  Cookies.remove(AUTH_TOKEN_COOKIE, { path: "/" })
}
