import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { SkillsTagsInput } from "@/components/job-seeker/SkillsTagsInput"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
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
  JOB_SEEKER_DISABILITY_CUSTOM,
  JOB_SEEKER_DISABILITY_OPTIONS,
} from "@/lib/disability-types"
import { capSkillsTokens, parseSkillsTokens } from "@/lib/skills-tags"
import {
  type JobSeekerSignupValues,
  jobSeekerSignupSchema,
} from "@/lib/validations/auth"
import { cn } from "@/lib/utils"

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
      skills: "",
      disabilityType: "",
      disabilityCustom: "",
    },
  })

  const disabilityType = form.watch("disabilityType")

  return (
    <form
      id="job-seeker-signup-form"
      className={cn("flex flex-col gap-4 overflow-hidden", className)}
      onSubmit={form.handleSubmit(async (values) => {
        try {
          const skills = capSkillsTokens(parseSkillsTokens(values.skills))
          const disability_type =
            values.disabilityType === JOB_SEEKER_DISABILITY_CUSTOM
              ? (values.disabilityCustom ?? "").trim()
              : values.disabilityType

          await registerUser({
            email: values.email,
            password: values.password,
            password_confirmation: values.confirmPassword,
            role: "job_seeker",
            full_name: values.fullName,
            phone: values.phone,
            skills,
            disability_type,
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

        <Controller
          name="skills"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="job-seeker-signup-form-skills">Skills</FieldLabel>
              <SkillsTagsInput
                id="job-seeker-signup-form-skills"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={fieldState.invalid}
                placeholder="e.g. PHP — press Enter or comma for each skill"
              />
              <FieldDescription>
                Add one or more skills as tags (same as your profile).
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="disabilityType"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="job-seeker-signup-form-disabilityType">
                Disability type
              </FieldLabel>
              <Select
                onValueChange={(v) => {
                  field.onChange(v)
                  if (v !== JOB_SEEKER_DISABILITY_CUSTOM) {
                    form.setValue("disabilityCustom", "")
                  }
                }}
                value={field.value}
              >
                <SelectTrigger
                  id="job-seeker-signup-form-disabilityType"
                  aria-invalid={fieldState.invalid}
                  className="h-11 w-full rounded-md border-slate-200 bg-slate-50"
                >
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_SEEKER_DISABILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {disabilityType === JOB_SEEKER_DISABILITY_CUSTOM ? (
          <Controller
            name="disabilityCustom"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-seeker-signup-form-disabilityCustom">
                  Describe disability type
                </FieldLabel>
                <Input
                  {...field}
                  id="job-seeker-signup-form-disabilityCustom"
                  placeholder="e.g. Low vision, wheelchair user…"
                  aria-invalid={fieldState.invalid}
                  className="h-11 rounded-md border-slate-200 bg-slate-50 placeholder:text-slate-400"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        ) : null}
      </FieldGroup>

      <Button
        type="submit"
        form="job-seeker-signup-form"
        className="mt-2 h-11 w-full rounded-lg text-base font-semibold"
        variant="default"
        disabled={form.formState.isSubmitting}
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  )
}
