import { useMemo } from "react"

import { useAuth } from "@/contexts/auth-context"
import { apiRequest } from "@/lib/api/client"

export function useApi() {
  const { token } = useAuth()

  return useMemo(
    () => ({
      request: (path: string, init?: RequestInit, opts?: { skipAuth?: boolean }) =>
        apiRequest(path, init ?? {}, {
          token,
          skipAuth: opts?.skipAuth,
        }),

      get: (path: string, opts?: { skipAuth?: boolean }) =>
        apiRequest(path, { method: "GET" }, { token, skipAuth: opts?.skipAuth }),

      post: (path: string, body?: unknown, opts?: { skipAuth?: boolean }) =>
        apiRequest(
          path,
          { method: "POST", ...(body !== undefined ? { body } : {}) } as RequestInit,
          { token, skipAuth: opts?.skipAuth }
        ),

      del: (path: string, opts?: { skipAuth?: boolean }) =>
        apiRequest(path, { method: "DELETE" }, { token, skipAuth: opts?.skipAuth }),
    }),
    [token]
  )
}
