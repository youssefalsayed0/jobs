import { LoginForm } from "@/components/auth/LoginForm"
import { Card, CardContent } from "@/components/ui/card"

export function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-linear-to-b from-blue-100 via-blue-50 to-slate-100 px-4 py-10">
      <Card className="w-full max-w-md border-0 bg-white shadow-xl">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome Back!
            </h1>
            <p className="mt-1 text-sm text-slate-500">Login to your account</p>
          </div>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
