import { BriefcaseIcon, Building2Icon } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useJobSeekerApplications } from "@/hooks/job-seeker/useJobSeekerApplications"
import { cn } from "@/lib/utils"
import type { JobSeekerApplicationRow } from "@/types/job-seeker-application"

function statusBadgeVariant(
  status: string | undefined
): "default" | "secondary" | "destructive" | "outline" {
  const s = (status ?? "").toLowerCase()
  if (s === "rejected" || s === "declined") return "destructive"
  if (
    s === "accepted" ||
    s === "approved" ||
    s === "hired" ||
    s === "shortlisted"
  ) {
    return "default"
  }
  return "secondary"
}

function ApplicationCard({ row }: { row: JobSeekerApplicationRow }) {
  const job = row.job
  const title =
    job?.title?.trim() || `Application #${String(row.id)}`
  const company = job?.company_name?.trim() ?? "—"
  const companyId = job?.company_id
  const companyLogo =
    typeof job?.company_profile_photo_url === "string" &&
    job.company_profile_photo_url.trim() !== ""
      ? job.company_profile_photo_url.trim()
      : null
  const companyHref =
    companyId !== undefined && companyId !== ""
      ? `/companies/${encodeURIComponent(String(companyId))}`
      : null
  const jobId = row.job_posting_id
  const jobHref =
    jobId !== undefined && jobId !== ""
      ? `/jobs/${encodeURIComponent(String(jobId))}`
      : null

  const companyNameEl = companyHref ? (
    <Link
      to={companyHref}
      className="truncate font-medium text-foreground/85 underline-offset-4 hover:text-primary hover:underline"
    >
      {company}
    </Link>
  ) : (
    <span className="truncate font-medium text-foreground/85">{company}</span>
  )

  const logoBlock = companyLogo ? (
    <img
      src={companyLogo}
      alt=""
      className="size-11 shrink-0 rounded-xl border border-border/60 bg-background object-contain p-0.5"
    />
  ) : (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Building2Icon className="size-5" aria-hidden />
    </div>
  )

  return (
    <li className="h-full">
      <Card
        className={cn(
          "flex h-full flex-col overflow-hidden border-border/70 shadow-sm transition-[box-shadow,border-color]",
          "hover:border-primary/25 hover:shadow-md"
        )}
      >
        <CardHeader className="space-y-3 pb-2">
          {row.status ? (
            <Badge
              variant={statusBadgeVariant(row.status)}
              className="w-fit capitalize"
            >
              {row.status}
            </Badge>
          ) : null}
          <div className="min-w-0 space-y-2">
            <h2 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
              {title}
            </h2>
            <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
              {companyHref ? (
                <Link
                  to={companyHref}
                  className="shrink-0 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {logoBlock}
                </Link>
              ) : (
                logoBlock
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Company
                </p>
                <p className="flex min-w-0 items-center gap-2">{companyNameEl}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        {row.submitted_at ? (
          <CardContent className="pt-0 pb-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/70">Submitted </span>
              {row.submitted_at}
            </p>
          </CardContent>
        ) : (
          <div className="flex-1" />
        )}
        <CardFooter className="mt-auto border-t border-border/50 bg-muted/10 px-4 py-3 sm:px-5">
          {jobHref ? (
            <Button asChild className="w-full rounded-xl font-semibold">
              <Link to={jobHref}>
                View job
                <BriefcaseIcon
                  className="size-4 opacity-90"
                  data-icon="inline-end"
                />
              </Link>
            </Button>
          ) : (
            <Button type="button" className="w-full rounded-xl" disabled>
              Unavailable
            </Button>
          )}
        </CardFooter>
      </Card>
    </li>
  )
}

function ApplicationsGridSkeleton() {
  return (
    <ul className="grid list-none grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i}>
          <Card className="overflow-hidden border-border/60 p-0">
            <CardHeader className="space-y-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-full" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-11 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-4/5 max-w-48" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-3 w-full" />
            </CardContent>
            <CardFooter className="border-t">
              <Skeleton className="h-10 w-full rounded-xl" />
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  )
}

export function JobSeekerApplicationsPage() {
  const { applications, total, loading } = useJobSeekerApplications()

  const countLabel =
    total !== null
      ? `${total} application${total === 1 ? "" : "s"}`
      : `${applications.length} application${applications.length === 1 ? "" : "s"}`

  return (
    <div className="flex w-full min-w-0 flex-col gap-10">
      <section className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-card/60 px-7 py-8 shadow-sm backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-10">
        <div className="w-full min-w-0 space-y-3">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Applications
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            My applications
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Each card shows the role and company you applied to. Open a job for
            full details.
          </p>
          {!loading ? (
            <p className="text-sm font-medium text-foreground/80">{countLabel}</p>
          ) : null}
        </div>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="shrink-0 rounded-xl"
        >
          <Link to="/jobs">Browse jobs</Link>
        </Button>
      </section>

      {loading ? (
        <ApplicationsGridSkeleton />
      ) : applications.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/20 py-16 text-center shadow-none">
          <CardContent className="space-y-3 px-6">
            <BriefcaseIcon className="mx-auto size-10 text-muted-foreground/60" />
            <p className="text-base font-medium text-foreground">
              No applications yet
            </p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              When you apply from a job page, your applications appear here in
              the grid.
            </p>
            <Button asChild className="mt-4 rounded-xl">
              <Link to="/jobs">Find a role</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((row) => (
            <ApplicationCard key={String(row.id)} row={row} />
          ))}
        </ul>
      )}
    </div>
  )
}
