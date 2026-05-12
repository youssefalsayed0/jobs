import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useJobSeekerProfile } from "@/hooks/job-seeker/useJobSeekerProfile"
import { cn } from "@/lib/utils"
import {
  BriefcaseIcon,
  FileTextIcon,
  LayoutListIcon,
  MapPinIcon,
  RotateCcwIcon,
  ScrollTextIcon,
  SparklesIcon,
  UploadIcon,
  UserRoundIcon,
  XIcon,
} from "lucide-react"

/** Laravel validates `skills` as an array; max 50 items. */
const MAX_PROFILE_SKILLS = 50

function parseSkillsTokens(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function joinSkillsTokens(tokens: string[]): string {
  return tokens.join(", ")
}

function capSkillsTokens(tokens: string[]): string[] {
  return tokens.slice(0, MAX_PROFILE_SKILLS)
}

/** Multipart: repeated `skills[]` so Laravel receives an array of strings. */
function appendSkillsToFormData(fd: FormData, skillsRaw: string | undefined) {
  const names = capSkillsTokens(parseSkillsTokens(skillsRaw))
  for (const name of names) {
    fd.append("skills[]", name)
  }
}

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  gender: z.string().optional(),
  city: z.string().optional(),
  skills: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (parseSkillsTokens(val).length > MAX_PROFILE_SKILLS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `You can add at most ${MAX_PROFILE_SKILLS} skills.`,
        })
      }
    }),
  certificates: z.string().optional(),
  educations: z.string().optional(),
  experiences: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

function skillsStringFromProfile(
  profile: Record<string, unknown> | null
): string {
  if (!profile) return ""
  const v = profile.skills
  if (Array.isArray(v)) {
    const rows = v
      .filter((item): item is Record<string, unknown> =>
        item !== null && typeof item === "object")
      .map((item) => ({
        order:
          typeof item.sort_order === "number" ? item.sort_order : 0,
        name: typeof item.name === "string" ? item.name.trim() : "",
      }))
      .filter((x) => x.name.length > 0)
      .sort((a, b) => a.order - b.order)
    return joinSkillsTokens(capSkillsTokens(rows.map((r) => r.name)))
  }
  if (typeof v === "string") {
    return joinSkillsTokens(capSkillsTokens(parseSkillsTokens(v.trim())))
  }
  return ""
}

type SkillsTagsInputProps = {
  id: string
  value: string
  onChange: (next: string) => void
  onBlur: () => void
  disabled?: boolean
  invalid?: boolean
  placeholder?: string
}

function SkillsTagsInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  placeholder = "Type a skill, press Enter or comma…",
}: SkillsTagsInputProps) {
  const [draft, setDraft] = useState("")
  const tokens = parseSkillsTokens(value)
  const tokenKey = tokens.join("\0")

  useEffect(() => {
    setDraft("")
  }, [tokenKey])

  const setTokens = useCallback(
    (next: string[]) => {
      const capped = capSkillsTokens(next)
      if (next.length > capped.length) {
        toast.warning(`Skills are limited to ${MAX_PROFILE_SKILLS} items.`)
      }
      onChange(joinSkillsTokens(capped))
    },
    [onChange]
  )

  const commitDraft = useCallback(() => {
    const raw = draft.trim()
    if (!raw) return
    const parts = raw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const merged = [...tokens]
    for (const p of parts) {
      if (!merged.some((t) => t.toLowerCase() === p.toLowerCase())) {
        merged.push(p)
      }
    }
    setTokens(merged)
    setDraft("")
  }, [draft, setTokens, tokens])

  const removeAt = useCallback(
    (idx: number) => {
      setTokens(tokens.filter((_, i) => i !== idx))
    },
    [setTokens, tokens]
  )

  return (
    <div
      className={cn(
        "flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-xl border bg-background px-2 py-1.5 shadow-sm transition-[color,box-shadow]",
        "focus-within:border-ring/60 focus-within:ring-[3px] focus-within:ring-ring/50",
        invalid ? "border-destructive" : "border-border/80",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      {tokens.map((name, idx) => (
        <Badge
          key={`${name}-${idx}`}
          variant="secondary"
          asChild
          className="h-7 max-w-full gap-0.5 rounded-md border border-border/50 bg-muted/80 py-0 pr-0.5 pl-2 text-xs font-medium shadow-none"
        >
          <span className="inline-flex items-center gap-0.5">
            <span className="truncate">{name}</span>
            <button
              type="button"
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
              aria-label={`Remove ${name}`}
              disabled={disabled}
              onClick={() => removeAt(idx)}
            >
              <XIcon className="size-3.5" />
            </button>
          </span>
        </Badge>
      ))}
      <Input
        id={id}
        className="h-8 min-w-[10ch] flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 md:min-w-[14ch]"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (tokens.length >= MAX_PROFILE_SKILLS) {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              toast.warning(
                `You can add at most ${MAX_PROFILE_SKILLS} skills. Remove one to add another.`
              )
            }
            return
          }
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            commitDraft()
            return
          }
          if (
            e.key === "Backspace" &&
            draft === "" &&
            tokens.length > 0
          ) {
            e.preventDefault()
            removeAt(tokens.length - 1)
          }
        }}
        onBlur={() => {
          commitDraft()
          onBlur()
        }}
        disabled={disabled}
        placeholder={
          tokens.length >= MAX_PROFILE_SKILLS
            ? `Max ${MAX_PROFILE_SKILLS} — remove a tag to add more`
            : tokens.length === 0
              ? placeholder
              : "Add more…"
        }
      />
    </div>
  )
}

function readText(
  p: Record<string, unknown> | null,
  ...keys: string[]
): string {
  if (!p) return ""
  for (const k of keys) {
    const v = p[k]
    if (typeof v === "string" && v.trim() !== "") return v
    if (Array.isArray(v) && v.length > 0)
      return v.map((x) => (typeof x === "string" ? x : String(x))).join(", ")
  }
  return ""
}

function defaultsFromProfile(
  profile: Record<string, unknown> | null
): ProfileForm {
  if (!profile) {
    return {
      full_name: "",
      phone: "",
      gender: "",
      city: "",
      skills: "",
      certificates: "",
      educations: "",
      experiences: "",
    }
  }
  const first = readText(profile, "first_name")
  const last = readText(profile, "last_name")
  const combined = [first, last].filter(Boolean).join(" ").trim()
  return {
    full_name: readText(profile, "full_name", "name") || combined,
    phone: readText(profile, "phone", "mobile"),
    gender: readText(profile, "gender"),
    city: readText(profile, "city", "location"),
    skills: skillsStringFromProfile(profile),
    certificates: readText(profile, "certificates", "certificate"),
    educations: readText(profile, "educations", "education"),
    experiences: readText(profile, "experiences", "experience"),
  }
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function ProfilePageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <Skeleton className="h-56 w-full rounded-3xl" />
      <Skeleton className="h-72 w-full rounded-3xl" />
      <Skeleton className="h-48 w-full rounded-3xl" />
    </div>
  )
}

export function JobSeekerProfilePage() {
  const { user } = useAuth()
  const { profile, loading, saveProfile } = useJobSeekerProfile()
  const [pendingCv, setPendingCv] = useState(false)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultsFromProfile(null),
  })

  const applyProfileToForm = useCallback(() => {
    form.reset(defaultsFromProfile(profile))
    const cvEl = document.getElementById(
      "profile-cv"
    ) as HTMLInputElement | null
    if (cvEl) cvEl.value = ""
    setPendingCv(false)
  }, [profile, form])

  useEffect(() => {
    applyProfileToForm()
  }, [applyProfileToForm])

  const displayName =
    form.watch("full_name")?.trim() ||
    (typeof user?.name === "string" ? user.name : "") ||
    "Your profile"
  const accountEmail =
    readText(profile, "email") ||
    (typeof user?.email === "string" ? user.email : "")

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 pb-10">
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm",
          "sm:px-10 sm:py-10"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/7 via-transparent to-primary/5"
          aria-hidden
        />
        <div className="relative flex flex-col gap-8 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="size-16 shrink-0 rounded-2xl border border-border/60 shadow-sm sm:size-20">
              <AvatarFallback className="rounded-2xl bg-linear-to-br from-primary/15 to-primary/5 text-lg font-semibold text-primary sm:text-xl">
                {initialsFromName(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                Candidate profile
              </p>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Profile &amp; resume
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Keep this information current. Employers see a professional
                snapshot when you apply; your CV can be updated anytime.
              </p>
              {accountEmail ? (
                <p className="truncate text-sm font-medium text-foreground/90">
                  {accountEmail}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl border-border/80"
            >
              <Link to="/seeker/applications">
                <ScrollTextIcon data-icon="inline-start" className="size-4" />
                Applications
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link to="/jobs">
                <BriefcaseIcon data-icon="inline-start" className="size-4" />
                Browse jobs
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {loading ? (
        <ProfilePageSkeleton />
      ) : (
        <form
          className="mx-auto flex w-full max-w-4xl flex-col gap-8"
          onSubmit={form.handleSubmit(async (values) => {
            const fd = new FormData()
            fd.append("full_name", values.full_name)
            if (values.phone?.trim()) fd.append("phone", values.phone.trim())
            if (values.gender?.trim()) fd.append("gender", values.gender.trim())
            if (values.city?.trim()) fd.append("city", values.city.trim())
            appendSkillsToFormData(fd, values.skills)
            if (values.certificates?.trim())
              fd.append("certificates", values.certificates.trim())
            if (values.educations?.trim())
              fd.append("educations", values.educations.trim())
            if (values.experiences?.trim())
              fd.append("experiences", values.experiences.trim())

            const input = document.getElementById(
              "profile-cv"
            ) as HTMLInputElement | null
            const file = input?.files?.[0]
            if (file) fd.append("cv_path", file, file.name)

            try {
              await saveProfile(fd)
              if (input) input.value = ""
              setPendingCv(false)
              form.reset(values)
            } catch {
              /* toast in hook */
            }
          })}
        >
          <Alert className="rounded-2xl border-primary/20 bg-primary/5">
            <SparklesIcon className="size-4 text-primary" />
            <AlertTitle className="text-foreground">Saving your profile</AlertTitle>
            <AlertDescription>
              Updates are sent securely to your account. When you attach a new
              CV, it replaces the file used for future applications.
            </AlertDescription>
          </Alert>

          <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserRoundIcon className="size-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg sm:text-xl">About you</CardTitle>
                  <CardDescription>
                    Basics recruiters see first—keep your name and contact
                    accurate.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
              <FieldGroup className="gap-6">
                <Controller
                  name="full_name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
                      <FieldContent>
                        <Input
                          id="profile-name"
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="name"
                          {...field}
                        />
                        <FieldDescription>
                          Use the name you want on applications and emails.
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
                      <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
                      <FieldContent>
                        <Input
                          id="profile-phone"
                          type="tel"
                          className="h-11 rounded-xl border-border/80"
                          autoComplete="tel"
                          {...field}
                        />
                        <FieldDescription>
                          Include country code if you apply internationally.
                        </FieldDescription>
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
                <div className="grid gap-6 sm:grid-cols-2">
                  <Controller
                    name="gender"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="profile-gender">Gender</FieldLabel>
                        <FieldContent>
                          <Input
                            id="profile-gender"
                            className="h-11 rounded-xl border-border/80"
                            placeholder="e.g. prefer not to say"
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
                        <FieldLabel htmlFor="profile-city">City</FieldLabel>
                        <FieldContent>
                          <div className="relative">
                            <MapPinIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="profile-city"
                              className="h-11 rounded-xl border-border/80 pl-10"
                              placeholder="Where you are based"
                              autoComplete="address-level2"
                              {...field}
                            />
                          </div>
                          {fieldState.invalid ? (
                            <FieldError errors={[fieldState.error]} />
                          ) : null}
                        </FieldContent>
                      </Field>
                    )}
                  />
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LayoutListIcon className="size-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg sm:text-xl">
                    Professional profile
                  </CardTitle>
                  <CardDescription>
                    Skills and background help hiring teams understand your fit
                    before they open your CV.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
              <FieldGroup className="gap-6">
                <Controller
                  name="skills"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="profile-skills">Skills</FieldLabel>
                      <FieldContent>
                        <SkillsTagsInput
                          id="profile-skills"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={form.formState.isSubmitting}
                          invalid={fieldState.invalid}
                          placeholder="e.g. React — Enter or comma to add each skill"
                        />
                        <FieldDescription>
                          Up to {MAX_PROFILE_SKILLS} skills. Tags and the server
                          both use a list (not a single comma string).
                        </FieldDescription>
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
                <div className="grid gap-6 lg:grid-cols-2">
                  <Controller
                    name="certificates"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="profile-cert">
                          Certificates
                        </FieldLabel>
                        <FieldContent>
                          <Textarea
                            id="profile-cert"
                            rows={5}
                            className="min-h-32 resize-y rounded-xl border-border/80"
                            placeholder="Certifications, licenses, courses…"
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
                    name="educations"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="profile-edu">Education</FieldLabel>
                        <FieldContent>
                          <Textarea
                            id="profile-edu"
                            rows={5}
                            className="min-h-32 resize-y rounded-xl border-border/80"
                            placeholder="Degrees, institutions, years…"
                            {...field}
                          />
                          {fieldState.invalid ? (
                            <FieldError errors={[fieldState.error]} />
                          ) : null}
                        </FieldContent>
                      </Field>
                    )}
                  />
                </div>
                <Separator className="bg-border/60" />
                <Controller
                  name="experiences"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="profile-exp">Experience</FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <BriefcaseIcon className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />
                          <Textarea
                            id="profile-exp"
                            rows={6}
                            className="min-h-40 resize-y rounded-xl border-border/80 pt-2 pl-10"
                            placeholder="Roles, companies, impact, dates — bullet style works well"
                            {...field}
                          />
                        </div>
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
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileTextIcon className="size-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg sm:text-xl">Resume file</CardTitle>
                  <CardDescription>
                    PDF or Word. You can upload now or later—only a new file is
                    sent when you choose one.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-7 sm:px-8 sm:py-8">
              <Field>
                <FieldLabel htmlFor="profile-cv" className="sr-only">
                  CV upload
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="profile-cv"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf"
                    className="sr-only"
                    onChange={(e) => setPendingCv(!!e.target.files?.length)}
                  />
                  <label
                    htmlFor="profile-cv"
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center transition-colors",
                      "hover:border-primary/35 hover:bg-muted/35",
                      "focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/50"
                    )}
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UploadIcon className="size-6" />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      Drop your CV here or click to browse
                    </span>
                    <span className="max-w-sm text-xs text-muted-foreground">
                      PDF, DOC, or DOCX. Your file is stored securely and linked
                      to your candidate profile.
                    </span>
                  </label>
                </FieldContent>
              </Field>
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
                  ? "Saving your changes…"
                  : form.formState.isDirty || pendingCv
                    ? "You have unsaved changes"
                    : "Profile is up to date"}
              </p>
              <p className="text-xs text-muted-foreground">
                {form.formState.isDirty || pendingCv
                  ? "Save to sync with your account."
                  : "Edit any section above or attach a CV, then save."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={
                  !profile ||
                  (!form.formState.isDirty && !pendingCv) ||
                  form.formState.isSubmitting
                }
                onClick={() => applyProfileToForm()}
              >
                <RotateCcwIcon data-icon="inline-start" className="size-4" />
                Reset
              </Button>
              <Button
                type="submit"
                size="lg"
                className="min-w-38 gap-2 rounded-xl font-semibold"
                disabled={
                  form.formState.isSubmitting ||
                  (!form.formState.isDirty && !pendingCv)
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

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Technical note: profile updates use{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
              PATCH /api/profile
            </code>{" "}
            (multipart). CV files use the{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
              cv_path
            </code>{" "}
            field.
          </p>
        </form>
      )}
    </div>
  )
}
