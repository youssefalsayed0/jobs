import { useMemo } from "react"

import { useAuth } from "@/contexts/auth-context"
import { apiRequest } from "@/lib/api/client"

// apiRequest() always sets ngrok-skip-browser-warning so tunnel interstitials
// don’t block browser traffic (login, this hook, and all other API calls).

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

      del: (
        path: string,
        body?: unknown,
        opts?: { skipAuth?: boolean }
      ) =>
        apiRequest(
          path,
          {
            method: "DELETE",
            ...(body !== undefined ? { body } : {}),
          } as RequestInit,
          { token, skipAuth: opts?.skipAuth }
        ),

      put: (path: string, body?: unknown, opts?: { skipAuth?: boolean }) =>
        apiRequest(
          path,
          { method: "PUT", ...(body !== undefined ? { body } : {}) } as RequestInit,
          { token, skipAuth: opts?.skipAuth }
        ),

      patch: (path: string, body?: unknown, opts?: { skipAuth?: boolean }) =>
        apiRequest(
          path,
          { method: "PATCH", ...(body !== undefined ? { body } : {}) } as RequestInit,
          { token, skipAuth: opts?.skipAuth }
        ),

      postForm: (path: string, form: FormData, opts?: { skipAuth?: boolean }) =>
        apiRequest(path, { method: "POST", body: form }, { token, skipAuth: opts?.skipAuth }),

      patchForm: (path: string, form: FormData, opts?: { skipAuth?: boolean }) =>
        apiRequest(path, { method: "PATCH", body: form }, { token, skipAuth: opts?.skipAuth }),
    }),
    [token]
  )
}
