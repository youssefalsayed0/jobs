import {
  BriefcaseIcon,
  CalendarIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { JobFormSheet } from "@/components/company-job-postings/job-form-sheet"
import { ApprovedDisabilitiesBadges } from "@/components/job-postings/ApprovedDisabilitiesBadges"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { useCompanyJobPostingsList } from "@/hooks/company/useCompanyJobPostingsList"
import { ApiError } from "@/lib/api/client"
import {
  formatJobDateTimeLong,
  formatTimeAgo,
} from "@/lib/format-job-dates"
import { cn } from "@/lib/utils"
import type { CompanyJobPosting } from "@/types/company-jobs"

function formatLabel(value: string | undefined): string {
  if (!value) return ""
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function applicantSummary(job: CompanyJobPosting): string | null {
  const n = job.applications_count
  if (typeof n !== "number" || n < 0) return null
  if (n === 0) return "No applicants yet"
  if (n === 1) return "1 applicant"
  return `${n} applicants`
}

export function CompanyJobsPanel() {
  const { user } = useAuth()
  const { jobs, loading, refetch, deleteJob } = useCompanyJobPostingsList()
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editJobId, setEditJobId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CompanyJobPosting | null>(
    null
  )

  const openCreate = () => {
    setFormMode("create")
    setEditJobId(null)
    setFormOpen(true)
  }

  const openEdit = (job: CompanyJobPosting) => {
    setFormMode("edit")
    setEditJobId(String(job.id))
    setFormOpen(true)
  }

  useEffect(() => {
    const edit = searchParams.get("edit")
    if (!edit) return

    const next = new URLSearchParams(searchParams)
    setFormMode("edit")
    setEditJobId(edit)
    setFormOpen(true)
    next.delete("edit")
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 md:gap-10">
      {/* Page chrome — typical employer job board */}
      <div className="flex flex-col gap-6 rounded-2xl border border-border/70 bg-card px-5 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:py-7">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="rounded-md bg-muted px-2 py-0.5 text-foreground/80">
              Employer
            </span>
            <span aria-hidden className="text-border">
              /
            </span>
            <span>Job postings</span>
          </div>
          <div className="space-y-1.5">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Manage listings
            </h1>
            <p className="w-full max-w-none text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
              Review how roles appear to candidates, track interest, and keep
              descriptions accurate—like a public job board, for your own
              pipeline.
            </p>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:min-w-[12rem]">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 sm:flex-col sm:items-stretch sm:py-3.5">
            <div className="space-y-0.5">
              <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                Live roles
              </p>
              <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">
                {loading ? "—" : jobs.length}
              </p>
            </div>
            <Separator className="hidden sm:block" />
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              <span className="font-medium text-foreground">
                {(user?.name as string) || "Company"}
              </span>
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            className="h-11 w-full rounded-xl font-semibold shadow-sm sm:h-10"
            onClick={openCreate}
          >
            <PlusIcon className="size-4" data-icon="inline-start" />
            Post new job
          </Button>
        </div>
      </div>

      <section aria-label="Your job postings" className="flex flex-col gap-5">
        {loading ? (
          <ul
            className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 xl:grid-cols-3"
            aria-hidden
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                  <Skeleton className="mb-4 h-1.5 w-full rounded-full" />
                  <Skeleton className="h-6 w-4/5 rounded-lg" />
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="mt-4 h-16 w-full rounded-xl" />
                  <Skeleton className="mt-auto h-10 w-full rounded-xl pt-6" />
                </div>
              </li>
            ))}
          </ul>
        ) : jobs.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/10 px-6 py-14 sm:px-10 sm:py-16">
            <EmptyHeader className="max-w-md">
              <EmptyMedia
                variant="icon"
                className="size-14 rounded-2xl border border-primary/15 bg-primary/8 text-primary"
              >
                <BriefcaseIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle className="text-xl font-semibold sm:text-2xl">
                No jobs posted yet
              </EmptyTitle>
              <EmptyDescription className="text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground">
                Candidates cannot apply until a role is live. Add a title,
                location, and description so your posting reads clearly on the
                job board.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                type="button"
                size="lg"
                className="rounded-xl px-8"
                onClick={openCreate}
              >
                <PlusIcon data-icon="inline-start" />
                Create first posting
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-sm font-medium text-foreground">
                {jobs.length} open position{jobs.length === 1 ? "" : "s"}
              </p>
       
            </div>
            <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => {
                const stamp = job.created_at ?? job.updated_at
                const listedAbs = formatJobDateTimeLong(stamp)
                const listedAgo = formatTimeAgo(stamp)
                const applicants = applicantSummary(job)
                return (
                  <li key={String(job.id)} className="h-full">
                    <Card
                      className={cn(
                        "flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-[box-shadow,transform,border-color] duration-200",
                        "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md",
                        "motion-reduce:transform-none motion-reduce:transition-none"
                      )}
                    >
                  
                      <CardHeader className="space-y-3 pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <BriefcaseIcon className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <CardTitle className="line-clamp-2 text-base font-semibold leading-snug tracking-tight sm:text-lg">
                                {job.title ?? "Untitled role"}
                              </CardTitle>
                              {job.company_name ? (
                                <p className="truncate text-xs font-medium text-muted-foreground">
                                  {job.company_name}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label={`More actions for ${job.title ?? "job"}`}
                              >
                                <EllipsisVerticalIcon className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-52 rounded-xl p-1"
                            >
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  className="rounded-lg py-2"
                                  asChild
                                >
                                  <Link
                                    to={`/company/jobs/${encodeURIComponent(String(job.id))}`}
                                  >
                                    <EyeIcon data-icon="inline-start" />
                                    View job
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="rounded-lg py-2"
                                  onClick={() => openEdit(job)}
                                >
                                  <PencilIcon data-icon="inline-start" />
                                  Edit posting
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="rounded-lg py-2"
                                  asChild
                                >
                                  <Link
                                    to={`/company/jobs/${encodeURIComponent(String(job.id))}#applications`}
                                  >
                                    <UsersIcon data-icon="inline-start" />
                                    Applicants
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  variant="destructive"
                                  className="rounded-lg py-2"
                                  onClick={() => setDeleteTarget(job)}
                                >
                                  <Trash2Icon data-icon="inline-start" />
                                  Delete job
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {job.category ? (
                            <Badge
                              variant="outline"
                              className="rounded-full border-border/80 px-2.5 py-0.5 text-xs font-medium"
                            >
                              {job.category}
                            </Badge>
                          ) : null}
                          {job.type ? (
                            <Badge
                              variant="secondary"
                              className="rounded-full border-0 bg-secondary/90 px-2.5 py-0.5 text-xs font-medium capitalize text-secondary-foreground"
                            >
                              {formatLabel(job.type)}
                            </Badge>
                          ) : null}
                          {job.location ? (
                            <span className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground">
                              <MapPinIcon className="size-3.5 shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </span>
                          ) : null}
                        </div>
                        {job.approved_disability &&
                        job.approved_disability.length > 0 ? (
                          <div className="space-y-1">
                            <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                              Welcoming
                            </p>
                            <ApprovedDisabilitiesBadges
                              items={job.approved_disability}
                              maxVisible={5}
                            />
                          </div>
                        ) : null}
                        {job.skills && job.skills.length > 0 ? (
                          <div className="space-y-1">
                            <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                              Skills
                            </p>
                            <ApprovedDisabilitiesBadges
                              items={job.skills}
                              maxVisible={6}
                            />
                          </div>
                        ) : null}
                        {job.description ? (
                          <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                            {job.description}
                          </CardDescription>
                        ) : null}
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-2 pb-2 pt-0">
                        {listedAbs || listedAgo ? (
                          <div className="space-y-0.5 text-xs">
                            {listedAbs ? (
                              <p className="inline-flex items-start gap-1.5 text-foreground/90">
                                <CalendarIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                <span className="leading-snug">{listedAbs}</span>
                              </p>
                            ) : null}
                            {listedAgo ? (
                              <p className="pl-5 text-muted-foreground">
                                {listedAgo}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                        {applicants ? (
                          <p className="text-xs font-medium text-foreground/90">
                            {applicants}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>

      <JobFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        jobId={editJobId}
        onSaved={() => {
          void refetch()
        }}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent className="gap-2 rounded-2xl border-border/70 p-6 sm:max-w-md">
          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="font-heading text-lg sm:text-xl">
              Remove this job?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed sm:text-[0.9375rem]">
              {deleteTarget?.title
                ? `“${deleteTarget.title}” will disappear from the job board and applications will no longer be visible for this role.`
                : "This posting will be removed permanently."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 gap-2 sm:justify-end">
            <AlertDialogCancel className="rounded-xl">
              Keep posting
            </AlertDialogCancel>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={!deleteTarget}
              onClick={() => {
                if (!deleteTarget) return
                void (async () => {
                  try {
                    await deleteJob(deleteTarget.id)
                    toast.success("Job removed from board")
                    setDeleteTarget(null)
                  } catch (err) {
                    const message =
                      err instanceof ApiError
                        ? err.message
                        : err instanceof Error
                          ? err.message
                          : "Delete failed"
                    toast.error(message)
                  }
                })()
              }}
            >
              Remove job
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
