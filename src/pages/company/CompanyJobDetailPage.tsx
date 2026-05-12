import {
  ArrowLeftIcon,
  BriefcaseIcon,
  Building2Icon,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  UsersIcon,
} from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"

import { JobPostingApplicationsSection } from "@/components/company-job-postings/JobPostingApplicationsSection"
import { JobFormSheet } from "@/components/company-job-postings/job-form-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompanyJobPostingDetail } from "@/hooks/company/useCompanyJobPostingDetail"
import {
  formatJobDateTimeLong,
  formatTimeAgo,
} from "@/lib/format-job-dates"

function formatLabel(value: string | undefined): string {
  if (!value) return ""
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function FieldBlock({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  )
}

function JobTimestampBlock({ iso }: { iso?: string }) {
  const abs = formatJobDateTimeLong(iso)
  const rel = formatTimeAgo(iso)
  if (!abs && !rel) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <span className="flex flex-col gap-1">
      {abs ? (
        <span className="inline-flex items-start gap-2">
          <CalendarIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>{abs}</span>
        </span>
      ) : null}
      {rel ? (
        <span className="pl-6 text-xs text-muted-foreground">{rel}</span>
      ) : null}
    </span>
  )
}

export function CompanyJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const { job, loading, error, refetch } = useCompanyJobPostingDetail(jobId)
  const [formOpen, setFormOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-6">
        <Skeleton className="h-9 w-40 rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-muted-foreground/30 bg-muted/20 px-6 py-12 text-center sm:px-10">
        <p className="font-medium text-foreground">
          {error ?? "This job could not be loaded."}
        </p>
        <Button className="mt-6 rounded-xl" variant="outline" asChild>
          <Link to="/company/jobs">Back to jobs</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" className="-ms-2 w-fit rounded-lg" asChild>
            <Link to="/company/jobs">
              <ArrowLeftIcon data-icon="inline-start" className="size-4" />
              All jobs
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full capitalize">
              {job.type ? formatLabel(job.type) : "Role"}
            </Badge>
            {job.company_name ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2Icon className="size-4 shrink-0" />
                {job.company_name}
              </span>
            ) : null}
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {job.title ?? "Job posting"}
          </h1>
          {job.location ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPinIcon className="size-4 shrink-0 text-primary/80" />
              {job.location}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => setFormOpen(true)}
          >
            <PencilIcon data-icon="inline-start" className="size-4" />
            Edit
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" asChild>
            <a href="#applications">
              <UsersIcon data-icon="inline-start" className="size-4" />
              Applicants
            </a>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/25 pb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BriefcaseIcon className="size-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              Job record
            </CardTitle>
          </div>
 
        </CardHeader>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2 xl:grid-cols-3 sm:p-8">
          <FieldBlock label="Job ID">{String(job.id)}</FieldBlock>
          {job.user_id !== undefined ? (
            <FieldBlock label="User ID">{String(job.user_id)}</FieldBlock>
          ) : null}
          <FieldBlock label="Title">{job.title ?? "—"}</FieldBlock>
          <FieldBlock label="Company name">
            {job.company_name ?? "—"}
          </FieldBlock>
          <FieldBlock label="Work type">
            {job.type ? formatLabel(job.type) : "—"}
          </FieldBlock>
          <FieldBlock label="Location">{job.location ?? "—"}</FieldBlock>
          <div className="sm:col-span-2 xl:col-span-3">
            <FieldBlock label="Description">
              {job.description ?? (
                <span className="text-muted-foreground">—</span>
              )}
            </FieldBlock>
          </div>
          <div className="sm:col-span-2 xl:col-span-3">
            <FieldBlock label="Requirements">
              {job.requirements ?? (
                <span className="text-muted-foreground">—</span>
              )}
            </FieldBlock>
          </div>
          <div className="sm:col-span-2 xl:col-span-3">
            <FieldBlock label="Qualifications">
              {job.qualification ?? (
                <span className="text-muted-foreground">—</span>
              )}
            </FieldBlock>
          </div>
          <FieldBlock label="Created at">
            <JobTimestampBlock iso={job.created_at} />
          </FieldBlock>
          <FieldBlock label="Updated at">
            {(() => {
              const u = job.updated_at?.trim()
              const c = job.created_at?.trim()
              if (!u) {
                return <span className="text-muted-foreground">—</span>
              }
              if (c && u === c) {
                return (
                  <span className="text-sm text-muted-foreground">
                    No changes since posting
                  </span>
                )
              }
              return <JobTimestampBlock iso={job.updated_at} />
            })()}
          </FieldBlock>
        </CardContent>
      </Card>

      <JobPostingApplicationsSection
        jobId={String(job.id)}
        jobTitle={job.title ?? "Role"}
      />

      <JobFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="edit"
        jobId={String(job.id)}
        onSaved={() => {
          void refetch({ silent: true })
        }}
      />

    </div>
  )
}
