import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RequiredMark } from "@/components/ui/required-mark"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { DeleteAccountSection } from "@/components/profile/DeleteAccountSection"
import { useCompanyUserProfile } from "@/hooks/company/useCompanyUserProfile"
import {
  companyProfileSchema,
  type CompanyProfileFormValues,
} from "@/lib/validations/company-profile"
import { cn } from "@/lib/utils"
import {
  Building2Icon,
  ExternalLinkIcon,
  RefreshCcwIcon,
  RotateCcwIcon,
  Share2Icon,
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

function normalizeScalarString(s: string): string {
  return s
    .replace(/^\uFEFF/, "")
    .replace(/\u200B/g, "")
    .normalize("NFKC")
    .trim()
}

/** Compare size strings across hyphen/en-dash variants and casing (production APIs). */
function normalizeCompanySizeForForm(raw: string): string {
  const t = normalizeScalarString(raw)
  if (!t) return ""
  const collapse = (s: string) => s.replace(/[–—]/g, "-").toLowerCase()
  const tc = collapse(t)
  for (const o of COMPANY_SIZE_OPTIONS) {
    if (collapse(o.value) === tc || collapse(o.label) === tc) return o.value
  }
  return ""
}

function readCompanySizeFromProfile(
  profile: Record<string, unknown> | null
): string {
  if (!profile) return ""
  const raw = profile.company_size ?? profile.companySize
  if (raw === null || raw === undefined) return ""
  const s =
    typeof raw === "string"
      ? normalizeScalarString(raw)
      : typeof raw === "number" && Number.isFinite(raw)
        ? String(raw)
        : ""
  return normalizeCompanySizeForForm(s)
}

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
    company_size: readCompanySizeFromProfile(profile),
    disability_support_policy: readOptionalString(
      profile,
      "disability_support_policy"
    ),
    overview: readOptionalString(profile, "overview"),
    facebook_url: readOptionalString(profile, "facebook_url"),
    x_url: readOptionalString(profile, "x_url"),
    linkedin_url: readOptionalString(profile, "linkedin_url"),
    instagram_url: readOptionalString(profile, "instagram_url"),
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
  const { profile, loading, refetch, saveProfile, deleteAccount } =
    useCompanyUserProfile()
  const [pendingPhoto, setPendingPhoto] = useState(false)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    mode: "all",
    defaultValues: defaultsFromProfile(null),
  })

  const companySizeSyncKey = useMemo(() => {
    const d = defaultsFromProfile(profile)
    const stamp =
      profile && typeof profile.updated_at === "string"
        ? profile.updated_at
        : profile &&
            (typeof profile.id === "number" || typeof profile.id === "string")
          ? String(profile.id)
          : "0"
    return `${stamp}|${d.company_size}`
  }, [profile])

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
    const u =
      user && typeof user === "object" ? (user as Record<string, unknown>) : null
    if (!(next.company_size ?? "").trim() && u) {
      const sz = readCompanySizeFromProfile(u)
      if (sz) next.company_size = sz
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

  const overviewWatch = form.watch("overview")?.trim() ?? ""
  const facebookWatch = form.watch("facebook_url")?.trim() ?? ""
  const xWatch = form.watch("x_url")?.trim() ?? ""
  const linkedinWatch = form.watch("linkedin_url")?.trim() ?? ""
  const instagramWatch = form.watch("instagram_url")?.trim() ?? ""
  const socialPreview = [
    { label: "Facebook", href: facebookWatch },
    { label: "X", href: xWatch },
    { label: "LinkedIn", href: linkedinWatch },
    { label: "Instagram", href: instagramWatch },
  ].filter((s) => s.href.length > 0)

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
              {overviewWatch ? (
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground line-clamp-4">
                  {overviewWatch}
                </p>
              ) : null}
              {socialPreview.length > 0 ? (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {socialPreview.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/80 px-2.5 py-1 text-xs font-medium text-primary shadow-sm hover:bg-muted/50">
                        {s.label}
                        <ExternalLinkIcon className="size-3 opacity-70" />
                      </a>
                    </li>
                  ))}
                </ul>
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
        <Form {...form}>
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
              fd.append("overview", values.overview?.trim() ?? "")
              fd.append("facebook_url", values.facebook_url?.trim() ?? "")
              fd.append("x_url", values.x_url?.trim() ?? "")
              fd.append("linkedin_url", values.linkedin_url?.trim() ?? "")
              fd.append("instagram_url", values.instagram_url?.trim() ?? "")
              fd.append("phone", values.phone.trim())
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
                const fresh = await saveProfile(fd)
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
                if (fresh) {
                  form.reset({
                    ...defaultsFromProfile(fresh),
                    clear_profile_photo: false,
                  })
                }
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
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Company name
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="organization"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Industry
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 rounded-xl border-border/80"
                          placeholder="e.g. Software, Healthcare"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Company size
                        <RequiredMark />
                      </FormLabel>
                      <Select
                        key={`company-size-${companySizeSyncKey}`}
                        onValueChange={field.onChange}
                        value={field.value ? field.value : undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 w-full rounded-xl border-border/80">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMPANY_SIZE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="disability_support_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disability support policy</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          className="min-h-24 resize-y rounded-xl border-border/80"
                          placeholder="Describe accommodations or how candidates can request support…"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional. Shown to candidates when relevant.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-sm">
              <CardHeader className="border-b border-border/60 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Share2Icon className="size-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-lg sm:text-xl">
                      Overview &amp; social
                    </CardTitle>
                    <CardDescription>
                      Short public summary and links to your social profiles.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
                <FormField
                  control={form.control}
                  name="overview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overview</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          className="min-h-32 resize-y rounded-xl border-border/80"
                          placeholder="Tell candidates what your company does and why they should apply…"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional. Shown where your company is featured to job seekers.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="facebook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          className="h-11 rounded-xl border-border/80"
                          placeholder="https://www.facebook.com/your-page"
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="x_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>X (Twitter)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          className="h-11 rounded-xl border-border/80"
                          placeholder="https://x.com/your-company"
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          className="h-11 rounded-xl border-border/80"
                          placeholder="https://www.linkedin.com/company/…"
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagram_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          className="h-11 rounded-xl border-border/80"
                          placeholder="https://www.instagram.com/your-company"
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="email"
                          inputMode="email"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Used for sign-in and notifications. Save to apply.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="street-address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="address-level2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clear_profile_photo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
                      <div className="flex cursor-pointer items-start gap-3">
                        <FormControl>
                          <input
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
                        </FormControl>
                        <div className="min-w-0 space-y-1 leading-snug">
                          <FormLabel className="cursor-pointer font-normal">
                            Company logo
                          </FormLabel>
                          <FormDescription className="mt-0!">
                            Remove current logo on save (does not upload a new
                            file).
                          </FormDescription>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <DeleteAccountSection
              accountLabel="company account"
              onDelete={deleteAccount}
              className="mb-2"
            />

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
        </Form>
      )}
    </div>
  )
}
