import {
  ArrowLeftIcon,
  Building2Icon,
  BriefcaseIcon,
  ExternalLinkIcon,
  MapPinIcon,
  Share2Icon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicCompanyDetail } from "@/hooks/job-seeker/usePublicCompanyDetail"
import { cn } from "@/lib/utils"

function initials(name: string): string {
  const t = name.trim()
  if (!t) return "?"
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return t.slice(0, 2).toUpperCase()
}

function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-12 sm:px-6 lg:px-8">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-48 w-full rounded-3xl" />
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3.5 sm:px-5 sm:py-4",
        className
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/50">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 font-heading text-sm font-semibold text-foreground sm:text-base">
          {value}
        </p>
      </div>
    </div>
  )
}

export function CompanyPublicDetailPage() {
  const { companyId } = useParams<{ companyId: string }>()
  const { company, loading } = usePublicCompanyDetail(companyId)

  if (!companyId?.trim()) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md rounded-3xl border-dashed border-border/80 bg-card/90 p-8 text-center shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg">Missing company</CardTitle>
            <CardDescription>This URL does not include a company id.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/companies">Back to directory</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-linear-to-b from-muted/30 via-background to-muted/20 pt-6">
        <DetailSkeleton />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md rounded-3xl border-border/80 bg-card/95 p-8 text-center shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Building2Icon className="size-8 text-muted-foreground" />
          </div>
          <CardHeader className="space-y-2 pb-4 pt-6">
            <CardTitle className="font-heading text-xl">Company not found</CardTitle>
            <CardDescription className="text-pretty">
              This profile may have been removed or the link is incorrect.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full rounded-xl font-semibold" variant="default">
              <Link to="/companies">Browse companies</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const photo = company.profile_photo_url?.trim() || null
  const locationLine = [company.city?.trim(), company.street?.trim()]
    .filter(Boolean)
    .join(", ")
  const socials = [
    { label: "Facebook", href: company.facebook_url },
    { label: "X", href: company.x_url },
    { label: "LinkedIn", href: company.linkedin_url },
    { label: "Instagram", href: company.instagram_url },
  ].filter((s) => typeof s.href === "string" && s.href.trim() !== "")

  const jobCount = company.job_postings_count
  const industryLabel = company.industry?.trim() || "—"
  const sizeLabel = company.company_size?.trim() || "—"
  const jobsLabel =
    typeof jobCount === "number"
      ? `${jobCount} open role${jobCount === 1 ? "" : "s"}`
      : "—"

  const hasBodyContent =
    Boolean(company.overview?.trim()) ||
    Boolean(company.disability_support_policy?.trim())

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-linear-to-b from-muted/35 via-background to-muted/25">
      <section className="px-4 pb-6 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl border border-border/80",
              "bg-linear-to-br from-card via-card to-primary/[0.06] px-7 py-8 shadow-sm sm:px-10 sm:py-10"
            )}
          >
            <div
              className="pointer-events-none absolute -right-16 top-0 size-64 rounded-full bg-primary/8 blur-3xl"
              aria-hidden
            />
            <Button
              asChild
              variant="ghost"
              className="relative mb-6 -ml-2 h-auto justify-start gap-2 rounded-xl px-2 py-1.5 text-muted-foreground hover:bg-background/60 hover:text-foreground"
            >
              <Link to="/companies">
                <ArrowLeftIcon className="size-4 shrink-0" />
                All companies
              </Link>
            </Button>
            <p className="relative text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Employer profile
            </p>
            <h1 className="relative mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {company.company_name}
            </h1>
            <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Public company page on Opportix. Explore their focus, team size, and how
              they describe hiring and support.
            </p>
          </div>

          <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/95 shadow-sm ring-1 ring-black/3">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
                <div className="relative mx-auto shrink-0 lg:mx-0">
                  <div className="absolute -inset-2 rounded-[2rem] bg-linear-to-br from-primary/20 via-transparent to-secondary/15 blur-md" />
                  <Avatar className="relative size-32 rounded-[1.75rem] border-2 border-background shadow-lg ring-2 ring-border/50 sm:size-36">
                    {photo ? (
                      <AvatarImage src={photo} alt="" className="object-cover" />
                    ) : null}
                    <AvatarFallback className="rounded-[1.65rem] bg-muted text-3xl font-semibold text-muted-foreground">
                      {initials(company.company_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="min-w-0 flex-1 space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {company.industry?.trim() ? (
                      <Badge variant="secondary" className="rounded-lg px-3 py-1 capitalize">
                        {company.industry.trim()}
                      </Badge>
                    ) : null}
                    {company.company_size?.trim() ? (
                      <Badge variant="outline" className="rounded-lg border-border/70 px-3 py-1">
                        {company.company_size.trim()} people
                      </Badge>
                    ) : null}
                    {typeof jobCount === "number" ? (
                      <Badge
                        variant="outline"
                        className="rounded-lg border-emerald-200/80 bg-emerald-50/80 px-3 py-1 tabular-nums text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100"
                      >
                        <BriefcaseIcon className="me-1 size-3.5" />
                        {jobCount} role{jobCount === 1 ? "" : "s"}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatTile icon={BriefcaseIcon} label="Open roles" value={jobsLabel} />
                    <StatTile icon={SparklesIcon} label="Industry" value={industryLabel} />
                    <StatTile icon={UsersIcon} label="Company size" value={sizeLabel} />
                  </div>

                  {locationLine ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/15 px-4 py-3.5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm ring-1 ring-border/50">
                        <MapPinIcon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Location
                        </p>
                        <p className="mt-0.5 text-sm font-medium leading-relaxed text-foreground">
                          {locationLine}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {socials.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Share2Icon className="size-3.5 text-primary" />
                        Connect
                      </div>
                      <ul className="flex flex-wrap gap-2">
                        {socials.map((s) => (
                          <li key={s.label}>
                            <a
                              href={s.href!.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "inline-flex items-center gap-2 rounded-xl border border-border/70",
                                "bg-background px-3.5 py-2 text-sm font-medium text-foreground",
                                "shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                              )}
                            >
                              {s.label}
                              <ExternalLinkIcon className="size-3.5 shrink-0 opacity-60" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {!hasBodyContent ? (
            <Card className="rounded-3xl border-dashed border-border/70 bg-muted/10 py-12 text-center shadow-none">
              <CardContent className="px-6">
                <SparklesIcon className="mx-auto size-10 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  This employer hasn&apos;t added an overview or public support statement yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {company.overview?.trim() ? (
                <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/95 shadow-sm ring-1 ring-black/3">
                  <CardHeader className="border-b border-border/50 bg-muted/10 px-6 py-6 sm:px-8">
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Building2Icon className="size-5" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="font-heading text-xl sm:text-2xl">
                          Overview
                        </CardTitle>
                        <CardDescription className="text-pretty text-base">
                          How this organization describes itself to candidates.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 py-7 text-pretty text-base leading-relaxed text-foreground sm:px-8 sm:py-8">
                    {company.overview.trim()}
                  </CardContent>
                </Card>
              ) : null}

              {company.disability_support_policy?.trim() ? (
                <Card className="overflow-hidden rounded-3xl border-amber-200/70 bg-amber-50/35 shadow-sm ring-1 ring-amber-100/80 dark:border-amber-900/40 dark:bg-amber-950/20 dark:ring-amber-900/30">
                  <CardHeader className="border-b border-amber-200/50 bg-amber-50/50 px-6 py-6 sm:px-8 dark:border-amber-900/30 dark:bg-amber-950/30">
                    <CardTitle className="font-heading text-xl text-amber-950 dark:text-amber-100">
                      Accessibility &amp; support
                    </CardTitle>
                    <CardDescription className="text-pretty text-amber-950/80 dark:text-amber-50/80">
                      Disability-related support this employer shares publicly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 py-7 text-pretty text-base leading-relaxed text-amber-950/95 sm:px-8 sm:py-8 dark:text-amber-50/95">
                    {company.disability_support_policy.trim()}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
