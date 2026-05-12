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
  const jobId = row.job_posting_id
  const jobHref =
    jobId !== undefined && jobId !== ""
      ? `/jobs/${encodeURIComponent(String(jobId))}`
      : null

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
            <p className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <Building2Icon
                className="size-4 shrink-0 text-primary/75"
                aria-hidden
              />
              <span className="truncate font-medium text-foreground/85">
                {company}
              </span>
            </p>
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
              <Skeleton className="h-4 w-4/5 max-w-48" />
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
