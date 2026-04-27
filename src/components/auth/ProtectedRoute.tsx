import { Navigate, useLocation } from "react-router-dom"

import { useAuth } from "@/contexts/auth-context"

type ProtectedRouteProps = {
  children: React.ReactNode
  requireAuth?: boolean
}

export function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, isInitializing } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isInitializing) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect unauthenticated users to login when trying to access protected routes
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect authenticated users away from login/signup pages
  if (!requireAuth && user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname
    return <Navigate to={from || "/"} replace />
  }

  return <>{children}</>
}
