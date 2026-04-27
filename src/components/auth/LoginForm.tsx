import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ApiError } from "@/lib/api/client"
import { type LoginValues, loginSchema } from "@/lib/validations/auth"
import { cn } from "@/lib/utils"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

type LoginFormProps = {
  className?: string
}

export function LoginForm({ className }: LoginFormProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "all",
    defaultValues: { email: "", password: "" },
  })

  return (
    <form
      id="login-form"
      className={cn("flex flex-col gap-4", className)}
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await login(values)
          toast.success("Signed in successfully")
          navigate("/")
        } catch (err) {
          const message =
            err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Something went wrong"
          form.setError("root", { message })
        }
      })}
    >
      {form.formState.errors.root?.message ? (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive" role="alert">
          {String(form.formState.errors.root.message)}
        </div>
      ) : null}

      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                id="login-form-email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
                className="h-12 rounded-lg border-slate-200 bg-slate-50 text-base placeholder:text-slate-400"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="relative">
                <Input
                  {...field}
                  id="login-form-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                  className="h-12 rounded-lg border-slate-200 bg-slate-50 pr-10 text-base placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end">
        <Link
          to="#"
          className="text-sm font-medium text-blue-600 hover:underline"
          onClick={(e) => e.preventDefault()}
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        form="login-form"
        className="h-12 w-full rounded-lg bg-[#2563eb] text-base font-semibold text-white hover:bg-[#1d4ed8]"
        disabled={form.formState.isSubmitting}
      >
        Login
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-slate-400">or</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-3 rounded-lg border-slate-200 bg-white text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          <GoogleIcon className="size-5" />
          Login with Google
        </Button>
        <Button
          type="button"
          className="h-12 w-full gap-3 rounded-lg border-0 bg-[#3b5998] text-base font-medium text-white hover:bg-[#344e86]"
        >
          <FacebookIcon className="size-5 text-white" />
          Login with Facebook
        </Button>
      </div>

      <Separator className="my-2" />

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-slate-500">Don&apos;t have an account?</p>
        <Button
          asChild
          className="h-12 w-full rounded-lg border-0 bg-[#22c55e] text-base font-semibold text-white hover:bg-[#16a34a]"
        >
          <Link to="/signup">Sign Up Now</Link>
        </Button>
      </div>
    </form>
  )
}
