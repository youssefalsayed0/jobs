import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
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
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useCompanyUserProfile } from "@/hooks/company/useCompanyUserProfile"
import {
  companyProfileSchema,
  type CompanyProfileFormValues,
} from "@/lib/validations/company-profile"
import { cn } from "@/lib/utils"
import {
  Building2Icon,
  RefreshCcwIcon,
  RotateCcwIcon,
  SparklesIcon,
  UploadIcon,
} from "lucide-react"

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-500", label: "201–500" },
  { value: "500+", label: "500+" },
] as const

function readOptionalString(
  profile: Record<string, unknown> | null,
  key: string
): string {
  if (!profile) return ""
  const v = profile[key]
  if (v === null || v === undefined) return ""
  return typeof v === "string" ? v : ""
}

function readEmail(profile: Record<string, unknown> | null): string {
  if (!profile) return ""
  const v = profile.email
  return typeof v === "string" ? v : ""
}

function defaultsFromProfile(
  profile: Record<string, unknown> | null
): CompanyProfileFormValues {
  return {
    company_name: readOptionalString(profile, "company_name"),
    email: readEmail(profile),
    industry: readOptionalString(profile, "industry"),
    company_size: readOptionalString(profile, "company_size"),
    disability_support_policy: readOptionalString(
      profile,
      "disability_support_policy"
    ),
    phone: readOptionalString(profile, "phone"),
    street: readOptionalString(profile, "street"),
    city: readOptionalString(profile, "city"),
    clear_profile_photo: false,
  }
}

function initialsFromCompany(name: string): string {
  const t = name.trim()
  if (!t) return "?"
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function FormSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <Skeleton className="h-72 w-full rounded-3xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  )
}

export function CompanyProfilePage() {
  const { user, refreshUser } = useAuth()
  const { profile, loading, refetch, saveProfile } = useCompanyUserProfile()
  const [pendingPhoto, setPendingPhoto] = useState(false)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: defaultsFromProfile(null),
  })

  const applyProfileToForm = useCallback(() => {
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setPendingPhoto(false)
    const el = document.getElementById(
      "company-profile-photo"
    ) as HTMLInputElement | null
    if (el) el.value = ""
    const next = { ...defaultsFromProfile(profile), clear_profile_photo: false }
    if (!next.email.trim() && typeof user?.email === "string") {
      next.email = user.email
    }
    form.reset(next)
  }, [profile, form, user])

  useEffect(() => {
    applyProfileToForm()
  }, [applyProfileToForm])

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    }
  }, [photoPreviewUrl])

  const profilePhotoUrl =
    profile && typeof profile.profile_photo_url === "string"
      ? profile.profile_photo_url
      : undefined
  const displayLogoSrc = photoPreviewUrl ?? profilePhotoUrl

  const companyTitle =
    form.watch("company_name")?.trim() ||
    readOptionalString(profile, "company_name") ||
    "Your company"
  const emailDisplay =
    form.watch("email")?.trim() ||
    readEmail(profile) ||
    (typeof user?.email === "string" ? user.email : "")

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 pb-10">
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm",
          "px-6 py-8 sm:px-10 sm:py-10"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/7 via-transparent to-primary/5"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex shrink-0 flex-col items-center gap-2 sm:items-start">
              <Avatar className="shrink-0 size-40">
                {displayLogoSrc ? (
                  <AvatarImage
                    src={displayLogoSrc}
                    alt=""
                    className=" object-cover"
                  />
                ) : null}
                <AvatarFallback className=" bg-linear-to-br from-primary/15 to-primary/5 text-xl font-semibold text-primary sm:text-2xl">
                  {initialsFromCompany(companyTitle)}
                </AvatarFallback>
              </Avatar>
              <div className="w-full flex justify-center">
                <label
                  htmlFor="company-profile-photo"
                  className="cursor-pointer text-center text-md underline font-medium text-primary underline-offset-2  sm:text-center"
                >
                  Change logo
                  <input
                    id="company-profile-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      setPendingPhoto(!!f)
                      if (f) {
                        form.setValue("clear_profile_photo", false, {
                          shouldDirty: true,
                        })
                      }
                      setPhotoPreviewUrl((prev) => {
                        if (prev) URL.revokeObjectURL(prev)
                        return f ? URL.createObjectURL(f) : null
                      })
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                Company account
              </p>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Company profile
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Update how your organization appears to candidates. Save to sync
                with your account.
              </p>
              {emailDisplay ? (
                <p className="truncate text-sm font-medium text-foreground/90">
                  {emailDisplay}
                </p>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-xl"
            disabled={loading}
            onClick={() => void refetch()}
          >
            <RefreshCcwIcon data-icon="inline-start" className="size-4" />
            Reload
          </Button>
        </div>
      </section>

      {loading ? (
        <FormSkeleton />
      ) : (
        <form
          className="mx-auto flex w-full max-w-7xl flex-col gap-8"
          onSubmit={form.handleSubmit(async (values) => {
            const fd = new FormData()
            fd.append("company_name", values.company_name.trim())
            fd.append("email", values.email.trim())
            fd.append("industry", values.industry.trim())
            fd.append("company_size", values.company_size.trim())
            fd.append(
              "disability_support_policy",
              values.disability_support_policy?.trim() ?? ""
            )
            fd.append("phone", values.phone?.trim() ?? "")
            fd.append("street", values.street?.trim() ?? "")
            fd.append("city", values.city?.trim() ?? "")
            fd.append(
              "clear_profile_photo",
              values.clear_profile_photo ? "1" : "0"
            )

            const photoInput = document.getElementById(
              "company-profile-photo"
            ) as HTMLInputElement | null
            const photoFile = photoInput?.files?.[0]
            if (photoFile) {
              fd.append("profile_photo", photoFile, photoFile.name)
            }

            try {
              await saveProfile(fd)
              try {
                await refreshUser()
              } catch {
                /* non-fatal */
              }
              if (photoInput) photoInput.value = ""
              setPendingPhoto(false)
              setPhotoPreviewUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev)
                return null
              })
            } catch {
              /* toast in hook */
            }
          })}
        >
          <Alert className="rounded-2xl border-primary/20 bg-primary/5">
            <SparklesIcon className="size-4 text-primary" />
            <AlertTitle className="text-foreground">Company details</AlertTitle>
            <AlertDescription>
              Changes are sent to your company profile. A new logo file replaces
              the current one after you save unless you choose to remove it.
            </AlertDescription>
          </Alert>

          <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2Icon className="size-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg sm:text-xl">
                    Organization
                  </CardTitle>
                  <CardDescription>
                    Name, industry, size, and how you support accessibility
                    requests.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
              <FieldGroup className="gap-6">
                <Controller
                  name="company_name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="company-profile-name">
                        Company name
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="company-profile-name"
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="organization"
                          {...field}
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
                <Controller
                  name="industry"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="company-profile-industry">
                        Industry
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="company-profile-industry"
                          className="h-11 rounded-xl border-border/80"
                          placeholder="e.g. Software, Healthcare"
                          {...field}
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
                <Controller
                  name="company_size"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="company-profile-size">
                        Company size
                      </FieldLabel>
                      <FieldContent>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <SelectTrigger
                            id="company-profile-size"
                            aria-invalid={fieldState.invalid}
                            className="h-11 w-full rounded-xl border-border/80"
                          >
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPANY_SIZE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
                <Controller
                  name="disability_support_policy"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="company-profile-policy">
                        Disability support policy
                      </FieldLabel>
                      <FieldContent>
                        <Textarea
                          id="company-profile-policy"
                          rows={4}
                          className="min-h-24 resize-y rounded-xl border-border/80"
                          placeholder="Describe accommodations or how candidates can request support…"
                          {...field}
                        />
                        <FieldDescription>
                          Optional. Shown to candidates when relevant.
                        </FieldDescription>
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
              <CardTitle className="text-lg sm:text-xl">Contact &amp; location</CardTitle>
              <CardDescription>
                Email, phone, and address on your company record.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
              <FieldGroup className="gap-6">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="company-profile-email">Email</FieldLabel>
                      <FieldContent>
                        <Input
                          id="company-profile-email"
                          type="email"
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="email"
                          inputMode="email"
                          {...field}
                        />
                        <FieldDescription>
                          Used for sign-in and notifications. Save to apply.
                        </FieldDescription>
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="company-profile-phone">Phone</FieldLabel>
                      <FieldContent>
                        <Input
                          id="company-profile-phone"
                          type="tel"
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="tel"
                          {...field}
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
                <Controller
                  name="street"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="company-profile-street">Street</FieldLabel>
                      <FieldContent>
                        <Input
                          id="company-profile-street"
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="street-address"
                          {...field}
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
                <Controller
                  name="city"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="company-profile-city">City</FieldLabel>
                      <FieldContent>
                        <Input
                          id="company-profile-city"
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="address-level2"
                          {...field}
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
                <Controller
                  name="clear_profile_photo"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="company-profile-clear-photo">
                        Company logo
                      </FieldLabel>
                      <FieldContent>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
                          <input
                            id="company-profile-clear-photo"
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0 rounded border-input"
                            checked={field.value}
                            onChange={(e) => {
                              const checked = e.target.checked
                              field.onChange(checked)
                              if (checked) {
                                const photoInput = document.getElementById(
                                  "company-profile-photo"
                                ) as HTMLInputElement | null
                                if (photoInput) photoInput.value = ""
                                setPendingPhoto(false)
                                setPhotoPreviewUrl((prev) => {
                                  if (prev) URL.revokeObjectURL(prev)
                                  return null
                                })
                              }
                            }}
                          />
                          <span className="min-w-0 text-sm leading-snug text-muted-foreground">
                            Remove current logo on save (does not upload a new
                            file).
                          </span>
                        </label>
                      </FieldContent>
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <div
            className={cn(
              "sticky bottom-0 z-10 flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-lg backdrop-blur-md",
              "sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
            )}
          >
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-foreground">
                {form.formState.isSubmitting
                  ? "Saving…"
                  : form.formState.isDirty || pendingPhoto
                    ? "You have unsaved changes"
                    : "Profile is up to date"}
              </p>
              <p className="text-xs text-muted-foreground">
                {form.formState.isSubmitting
                  ? ""
                  : form.formState.isDirty || pendingPhoto
                    ? "Save to update your company profile."
                    : "Edit fields or change your logo, then save."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={
                  !profile ||
                  (!form.formState.isDirty && !pendingPhoto) ||
                  form.formState.isSubmitting
                }
                onClick={() => applyProfileToForm()}
              >
                <RotateCcwIcon data-icon="inline-start" className="size-4" />
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={form.formState.isSubmitting}
                onClick={() =>
                  document.getElementById("company-profile-photo")?.click()
                }
              >
                <UploadIcon data-icon="inline-start" className="size-4" />
                Upload logo
              </Button>
              <Button
                type="submit"
                size="lg"
                className="min-w-38 gap-2 rounded-xl font-semibold"
                disabled={
                  form.formState.isSubmitting ||
                  (!form.formState.isDirty && !pendingPhoto)
                }
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Spinner className="size-4" />
                    Saving…
                  </>
                ) : (
                  "Save profile"
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
