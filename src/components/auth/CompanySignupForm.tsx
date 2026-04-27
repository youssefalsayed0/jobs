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
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api/client"
import {
  type CompanySignupValues,
  companySignupSchema,
} from "@/lib/validations/auth"
import { cn } from "@/lib/utils"

const industries = [
  { value: "tech", label: "Technology" },
  { value: "health", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "retail", label: "Retail" },
  { value: "edu", label: "Education" },
] as const

const sizes = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-500", label: "201–500" },
  { value: "500+", label: "500+" },
] as const

type CompanySignupFormProps = {
  className?: string
}

export function CompanySignupForm({ className }: CompanySignupFormProps) {
  const navigate = useNavigate()
  const { register: registerUser, logout } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const form = useForm<CompanySignupValues>({
    resolver: zodResolver(companySignupSchema),
    mode: "all",
    defaultValues: {
      companyName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      industry: "",
      companySize: "",
    },
  })

  return (
    <form
      id="company-signup-form"
      className={cn("flex flex-col gap-4", className)}
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await registerUser({
            email: values.email,
            password: values.password,
            password_confirmation: values.confirmPassword,
            role: "company",
            company_name: values.companyName,
            industry: values.industry,
            company_size: values.companySize,
          })
          logout()
          toast.success("Account created. Sign in to continue.")
          navigate("/login")
        } catch (err) {
          const message =
            err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Something went wrong"
          form.setError("root", { message })
          toast.error(message)
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
          name="companyName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="company-signup-form-companyName">Company Name</FieldLabel>
              <Input
                {...field}
                id="company-signup-form-companyName"
                placeholder="Company Name"
                autoComplete="organization"
                aria-invalid={fieldState.invalid}
                className="h-11 rounded-md border-slate-200 bg-slate-50 placeholder:text-slate-400"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="company-signup-form-phone">Phone</FieldLabel>
              <Input
                {...field}
                id="company-signup-form-phone"
                type="tel"
                placeholder="Phone"
                autoComplete="tel"
                aria-invalid={fieldState.invalid}
                className="h-11 rounded-md border-slate-200 bg-slate-50 placeholder:text-slate-400"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="min-w-0">
                <FieldLabel htmlFor="company-signup-form-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="company-signup-form-email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                  className="h-11 rounded-md border-slate-200 bg-slate-50 placeholder:text-slate-400"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="min-w-0">
                <FieldLabel htmlFor="company-signup-form-password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id="company-signup-form-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    className="h-11 rounded-md border-slate-200 bg-slate-50 pr-10 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="company-signup-form-confirmPassword">Confirm password</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="company-signup-form-confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                  className="h-11 rounded-md border-slate-200 bg-slate-50 pr-10 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="industry"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="min-w-0">
                <FieldLabel htmlFor="company-signup-form-industry">Industry</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="company-signup-form-industry"
                    aria-invalid={fieldState.invalid}
                    className="h-11 w-full min-w-0 rounded-md border-slate-200 bg-slate-50"
                  >
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="companySize"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="min-w-0">
                <FieldLabel htmlFor="company-signup-form-companySize">Company Size</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="company-signup-form-companySize"
                    aria-invalid={fieldState.invalid}
                    className="h-11 w-full min-w-0 rounded-md border-slate-200 bg-slate-50"
                  >
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <Button
        type="submit"
        form="company-signup-form"
        className="mt-2 h-11 w-full rounded-lg bg-[#ef4444] text-base font-semibold text-white hover:bg-[#dc2626]"
        disabled={form.formState.isSubmitting}
      >
        Create Company Account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  )
}
