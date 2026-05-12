import { LoginForm } from "@/components/auth/LoginForm"
import { Card, CardContent } from "@/components/ui/card"

export function LoginPage() {
  return (
    <div className="flex flex-1 flex-col bg-linear-to-b from-primary/12 via-background to-muted/60">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border border-border bg-card shadow-xl">
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome Back!
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Login to your account
              </p>
            </div>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
