import { Link, Navigate, useLocation } from "react-router-dom"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

type ProtectedRouteProps = {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: readonly string[]
}

function roleAllowed(
  user: Record<string, unknown>,
  allowed: readonly string[]
): boolean {
  const r = user.role
  if (typeof r !== "string") return false
  const lower = r.toLowerCase()
  return allowed.some((a) => a.toLowerCase() === lower)
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isInitializing } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isInitializing) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect unauthenticated users to login when trying to access protected routes
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (
    requireAuth &&
    user &&
    allowedRoles?.length &&
    !roleAllowed(user as Record<string, unknown>, allowedRoles)
  ) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 p-6">
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          You do not have access to this page with your current account role.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    )
  }

  // Authenticated users hitting login/signup — always send to home (not `state.from`).
  if (!requireAuth && user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
