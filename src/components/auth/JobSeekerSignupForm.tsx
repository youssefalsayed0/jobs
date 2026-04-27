import { zodResolver } from "@hookform/resolvers/zod"
import { CloudUploadIcon, Eye, EyeOff } from "lucide-react"
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
  type JobSeekerSignupValues,
  jobSeekerSignupSchema,
} from "@/lib/validations/auth"
import { cn } from "@/lib/utils"

const skills = [
  { value: "react", label: "React" },
  { value: "typescript", label: "TypeScript" },
  { value: "node", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "design", label: "UI/UX Design" },
  { value: "data", label: "Data analysis" },
] as const

type JobSeekerSignupFormProps = {
  className?: string
}

export function JobSeekerSignupForm({ className }: JobSeekerSignupFormProps) {
  const navigate = useNavigate()
  const { register: registerUser, logout } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const form = useForm<JobSeekerSignupValues>({
    resolver: zodResolver(jobSeekerSignupSchema),
    mode: "all",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      skillPrimary: "",
      skillSecondary: "",
    },
  })

  return (
    <form
      id="job-seeker-signup-form"
      className={cn("flex flex-col gap-4 overflow-hidden", className)}
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await registerUser({
            email: values.email,
            password: values.password,
            password_confirmation: values.confirmPassword,
            role: "job_seeker",
            full_name: values.fullName,
            phone: values.phone,
            skills: [values.skillPrimary, values.skillSecondary].filter(Boolean),
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
          name="fullName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="job-seeker-signup-form-fullName">Full Name</FieldLabel>
              <Input
                {...field}
                id="job-seeker-signup-form-fullName"
                placeholder="Full Name"
                autoComplete="name"
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
              <FieldLabel htmlFor="job-seeker-signup-form-phone">Phone</FieldLabel>
              <Input
                {...field}
                id="job-seeker-signup-form-phone"
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
                <FieldLabel htmlFor="job-seeker-signup-form-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="job-seeker-signup-form-email"
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
                <FieldLabel htmlFor="job-seeker-signup-form-password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id="job-seeker-signup-form-password"
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
              <FieldLabel htmlFor="job-seeker-signup-form-confirmPassword">Confirm password</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="job-seeker-signup-form-confirmPassword"
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
            name="skillPrimary"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="min-w-0">
                <FieldLabel htmlFor="job-seeker-signup-form-skillPrimary">Skills</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="job-seeker-signup-form-skillPrimary"
                    aria-invalid={fieldState.invalid}
                    className="h-11 w-full min-w-0 rounded-md border-slate-200 bg-slate-50"
                  >
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills.map((s) => (
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
          <Controller
            name="skillSecondary"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="min-w-0">
                <FieldLabel htmlFor="job-seeker-signup-form-skillSecondary">Skills</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="job-seeker-signup-form-skillSecondary"
                    aria-invalid={fieldState.invalid}
                    className="h-11 w-full min-w-0 rounded-md border-slate-200 bg-slate-50"
                  >
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills.map((s) => (
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

        <Controller
          name="cv"
          control={form.control}
          render={({ field: { onChange, onBlur, name, ref }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-sky-50/80 px-4 py-4 transition hover:bg-sky-100/60"
                )}
              >
                <CloudUploadIcon className="size-6 text-sky-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-800">
                    Upload CV <span className="font-normal text-slate-500">(PDF, DOCX)</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Upload your resume in PDF or DOCX format
                  </span>
                </div>
                <Input
                  ref={ref}
                  name={name}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onBlur={onBlur}
                  onChange={(e) => onChange(e.target.files)}
                />
              </label>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        form="job-seeker-signup-form"
        className="mt-2 h-11 w-full rounded-lg bg-[#2563eb] text-base font-semibold text-white hover:bg-[#1d4ed8]"
        disabled={form.formState.isSubmitting}
      >
        Create Account
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
