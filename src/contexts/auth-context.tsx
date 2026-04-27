import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { apiRequest } from "@/lib/api/client"
import { getAuthToken, removeAuthToken, setAuthToken } from "@/lib/auth-token"

type AuthUser = Record<string, unknown> | null

function normalizeUser(data: unknown): AuthUser {
  if (!data || typeof data !== "object" || data === null) return null
  const row = data as Record<string, unknown>
  const nameParts = [row.first_name, row.last_name]
    .filter((x) => typeof x === "string" && x.length > 0)
    .join(" ")
    .trim()
  const companyName =
    typeof row.company_name === "string" && row.company_name.trim() !== ""
      ? row.company_name
      : undefined
  const roleStr =
    typeof row.role === "string" ? row.role.toLowerCase() : ""
  const isCompany = roleStr === "company"
  const name =
    (isCompany && companyName) ||
    (typeof row.name === "string" && row.name.trim() !== "" && row.name) ||
    (nameParts.length > 0 ? nameParts : undefined) ||
    (typeof row.email === "string" ? row.email : "")
  return { ...row, name }
}

type RegisterBody = {
  email: string
  password: string
  password_confirmation: string
  role: string
  full_name?: string
  phone?: string
  skills?: string[]
  company_name?: string
  industry?: string
  company_size?: string
}

type AuthContextValue = {
  user: AuthUser
  token: string | null
  isInitializing: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (body: RegisterBody) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const applyAuthPayload = useCallback((payload: Record<string, unknown>) => {
    const t = payload.token
    const rawData = payload.data
    if (typeof t !== "string" || !rawData || typeof rawData !== "object") {
      throw new Error("Invalid authentication response")
    }
    setAuthToken(t)
    setToken(t)
    setUser(normalizeUser(rawData))
  }, [])

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const json = await apiRequest(
        "/api/login",
        { method: "POST", body: credentials } as unknown as RequestInit,
        { skipAuth: true }
      )
      if (!json || typeof json !== "object") {
        throw new Error("Invalid login response")
      }
      applyAuthPayload(json as Record<string, unknown>)
    },
    [applyAuthPayload]
  )

  const register = useCallback(
    async (body: RegisterBody) => {
      const json = await apiRequest(
        "/api/register",
        { method: "POST", body } as unknown as RequestInit,
        { skipAuth: true }
      )
      if (!json || typeof json !== "object") return
      const payload = json as Record<string, unknown>
      if (
        typeof payload.token === "string" &&
        payload.data &&
        typeof payload.data === "object"
      ) {
        applyAuthPayload(payload)
      }
    },
    [applyAuthPayload]
  )

  const logout = useCallback(() => {
    removeAuthToken()
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const t = token ?? getAuthToken()
    if (!t) return
    const json = await apiRequest("/api/user", { method: "GET" }, { token: t })
    if (!json || typeof json !== "object") return
    const payload = json as Record<string, unknown>
    const rawData = payload.data
    if (rawData && typeof rawData === "object") {
      setUser(normalizeUser(rawData))
    }
  }, [token])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const t = getAuthToken()
      if (!t) {
        if (!cancelled) setIsInitializing(false)
        return
      }
      if (!cancelled) setToken(t)
      try {
        const json = await apiRequest("/api/user", { method: "GET" }, { token: t })
        if (cancelled) return
        if (json && typeof json === "object") {
          const payload = json as Record<string, unknown>
          const rawData = payload.data
          if (rawData && typeof rawData === "object") {
            setUser(normalizeUser(rawData))
          }
        }
      } catch {
      
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setIsInitializing(false)
      }
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isInitializing,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isInitializing, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
