import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import {
  type ResetPasswordValues,
  resetPasswordSchema,
} from "@/lib/validations/auth"

type ResetLocationState = { email?: string }

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { post } = useApi()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      token: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onSubmit",
  })

  const {
    formState: { errors },
  } = form

  /** Reset emails from the link are URL-encoded (e.g. %40); searchParams decodes them. */
  const emailQ = searchParams.get("email")?.trim() ?? ""
  const tokenQ = searchParams.get("token")?.trim() ?? ""
  const emailFromState =
    (location.state as ResetLocationState | null)?.email?.trim() ?? ""
  const presetEmail = (emailQ || emailFromState).trim()
  const presetToken = tokenQ
  const emailLocked = presetEmail.length > 0
  const tokenLocked = presetToken.length > 0
  const fromResetLink = emailLocked && tokenLocked

  useEffect(() => {
    form.reset({
      email: presetEmail,
      token: presetToken,
      password: "",
      password_confirmation: "",
    })
  }, [emailQ, tokenQ, emailFromState, form, presetEmail, presetToken])

  return (
    <div className="flex flex-1 flex-col bg-linear-to-b from-primary/12 via-background to-muted/60">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border border-border bg-card shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Reset password
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {fromResetLink
                  ? "Choose a new password for your account."
                  : tokenLocked
                    ? "Your reset token came from the link. Add your email if it’s missing, then choose a new password."
                    : emailLocked
                      ? "Your email is set from the link. Paste the token from your email, then choose a new password."
                      : "Enter the email and token from your reset email, then choose a new password."}
              </p>
            </div>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await post(
                    "/api/reset-password",
                    {
                      email: values.email.trim(),
                      token: values.token.trim(),
                      password: values.password,
                      password_confirmation: values.password_confirmation,
                    },
                    { skipAuth: true },
                  )
                  toast.success("Password updated. You can sign in now.")
                  void navigate("/login", { replace: true })
                } catch (err) {
                  const message =
                    err instanceof ApiError
                      ? err.message
                      : err instanceof Error
                        ? err.message
                        : "Something went wrong"
                  toast.error(message)
                }
              })}
            >
              <FieldGroup className="gap-4">
                {emailLocked ? (
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <input type="hidden" {...field} value={field.value ?? ""} />
                    )}
                  />
                ) : (
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Email"
                          autoComplete="email"
                          className="h-12 rounded-lg border-slate-200 bg-slate-50 text-base"
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                )}
                {emailLocked && errors.email ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                ) : null}

                {tokenLocked ? (
                  <Controller
                    name="token"
                    control={form.control}
                    render={({ field }) => (
                      <input type="hidden" {...field} value={field.value ?? ""} />
                    )}
                  />
                ) : (
                  <Controller
                    name="token"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Reset token from email"
                          autoComplete="one-time-code"
                          className="h-12 rounded-lg border-slate-200 bg-slate-50 font-mono text-sm"
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                )}
                {tokenLocked && errors.token ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.token.message}
                  </p>
                ) : null}

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="New password"
                          autoComplete="new-password"
                          className="h-12 rounded-lg border-slate-200 bg-slate-50 pr-10 text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="size-5" />
                          ) : (
                            <Eye className="size-5" />
                          )}
                        </button>
                      </div>
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </Field>
                  )}
                />
                <Controller
                  name="password_confirmation"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          className="h-12 rounded-lg border-slate-200 bg-slate-50 pr-10 text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="size-5" />
                          ) : (
                            <Eye className="size-5" />
                          )}
                        </button>
                      </div>
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Button
                type="submit"
                className="h-12 w-full rounded-lg text-base font-semibold"
                disabled={form.formState.isSubmitting}
              >
                Update password
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                to="/forgot-password"
                className="font-medium text-primary hover:underline"
              >
                Request a new token
              </Link>
              {" · "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
