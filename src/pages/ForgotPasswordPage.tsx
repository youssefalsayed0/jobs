import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Link, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import {
  type ForgotPasswordValues,
  forgotPasswordSchema,
} from "@/lib/validations/auth"

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams()
  const emailFromUrl = searchParams.get("email")?.trim() ?? ""
  const { post } = useApi()
  const [resendCooldownSec, setResendCooldownSec] = useState(0)
  const [sentOnce, setSentOnce] = useState(false)
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: emailFromUrl },
    mode: "onSubmit",
  })

  useEffect(() => {
    if (emailFromUrl) {
      form.reset({ email: emailFromUrl })
    }
  }, [emailFromUrl, form])

  useEffect(() => {
    if (resendCooldownSec <= 0) return
    const id = window.setTimeout(() => {
      setResendCooldownSec((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => window.clearTimeout(id)
  }, [resendCooldownSec])

  const isSubmitting = form.formState.isSubmitting
  const isCooldown = resendCooldownSec > 0
  const submitBlocked = isSubmitting || isCooldown

  return (
    <div className="flex flex-1 flex-col bg-linear-to-b from-primary/12 via-background to-muted/60">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border border-border bg-card shadow-xl">
          <CardContent className="p-8">
            <Button variant="ghost" size="sm" className="-ms-2 mb-4" asChild>
              <Link to="/login" className="gap-2 text-muted-foreground">
                <ArrowLeftIcon className="size-4" />
                Back to login
              </Link>
            </Button>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Forgot password
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link and token.
              </p>
            </div>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await post(
                    "/api/forgot-password",
                    { email: values.email.trim() },
                    { skipAuth: true },
                  )
                  toast.success(
                    "If that email is registered, you will receive reset instructions shortly.",
                  )
                  setSentOnce(true)
                  setResendCooldownSec(60)
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
              <FieldGroup>
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
              </FieldGroup>
              <Button
                type="submit"
                className="h-12 w-full rounded-lg text-base font-semibold disabled:opacity-50"
                disabled={submitBlocked}
              >
                {isSubmitting
                  ? "Sending…"
                  : isCooldown
                    ? `Resend in ${resendCooldownSec}s`
                    : sentOnce
                      ? "Resend reset instructions"
                      : "Send reset instructions"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
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
