import { Link, useNavigate } from "react-router-dom"

import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/Navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function NotFoundPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex min-h-svh flex-col bg-linear-to-b from-muted/40 via-background to-background">
      <Navbar
        isLoggedIn={!!user}
        userName={user?.name as string | undefined}
        userEmail={user?.email as string | undefined}
        onLogout={handleLogout}
      />

      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-lg border-0 shadow-xl ring-1 ring-border/60">
          <CardHeader className="border-border border-b pb-4">
            <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
              This page doesn't exist
            </CardTitle>
            <CardDescription>
              The link may be broken or the page was removed. Check the URL or
              return to the homepage.
            </CardDescription>
            <CardAction>
              <Badge variant="secondary" className="tabular-nums">
                404
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2 border-t bg-muted/30 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate(-1)}
            >
              Go back
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/">Back to home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
