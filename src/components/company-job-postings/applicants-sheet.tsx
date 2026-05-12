import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useJobApplicationsForJob } from "@/hooks/company/useJobApplicationsForJob"

const STATUS_OPTIONS = [
  "pending",
  "reviewing",
  "shortlisted",
  "interview",
  "offer",
  "hired",
  "rejected",
  "accepted",
] as const

function selectStatusValue(
  status: string | undefined
): (typeof STATUS_OPTIONS)[number] {
  const s = (status ?? "pending").toLowerCase()
  if ((STATUS_OPTIONS as readonly string[]).includes(s)) {
    return s as (typeof STATUS_OPTIONS)[number]
  }
  return "pending"
}

function applicantInitials(name: string | undefined): string {
  const n = name?.trim()
  if (!n) return "?"
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase()
  }
  return n.slice(0, 2).toUpperCase()
}

type ApplicantsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string | null
  jobTitle: string
}

export function ApplicantsSheet({
  open,
  onOpenChange,
  jobId,
  jobTitle,
}: ApplicantsSheetProps) {
  const { rows, loading, updatingId, updateStatus } = useJobApplicationsForJob(
    jobId,
    open
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border/80 bg-muted/30 px-6 py-7 sm:px-10 sm:py-8">
          <SheetTitle className="font-heading text-xl">Applicants</SheetTitle>
          <SheetDescription className="text-pretty text-sm leading-relaxed">
            {jobTitle
              ? `Pipeline for “${jobTitle}”. Pick a stage and it syncs with your API.`
              : "Review candidates and update their pipeline stage."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-9rem)] px-6 py-7 sm:px-10 sm:py-9">
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <Skeleton className="size-11 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-3">
                    <Skeleton className="h-4 w-2/5 rounded-md" />
                    <Skeleton className="h-3 w-4/5 rounded-md" />
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/20 px-6 py-12 text-center">
              <p className="text-sm font-medium text-foreground">
                No applications yet
              </p>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                When candidates submit through the job seeker flow, they will show
                up here with contact details and a movable pipeline status.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {rows.map((row) => {
                const selectValue = selectStatusValue(row.status)
                const showRawStatus =
                  row.status &&
                  row.status.toLowerCase() !== selectValue.toLowerCase()

                return (
                  <li key={String(row.id)}>
                    <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/20 hover:bg-muted/10">
                      <Avatar className="size-11">
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                          {applicantInitials(row.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <p className="truncate font-medium text-foreground">
                            {row.name || "Applicant"}
                          </p>
                          {row.email ? (
                            <p className="truncate text-sm text-muted-foreground">
                              {row.email}
                            </p>
                          ) : null}
                          {row.phone ? (
                            <p className="text-sm text-muted-foreground">
                              {row.phone}
                            </p>
                          ) : null}
                          {showRawStatus ? (
                            <p className="text-xs text-muted-foreground">
                              Current status from API:{" "}
                              <span className="font-medium text-foreground">
                                {row.status}
                              </span>
                              {" "}
                              — choose a pipeline stage below to align it.
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Pipeline stage
                          </p>
                          <Select
                            value={selectValue}
                            onValueChange={(v) => {
                              void updateStatus(row.id, v)
                            }}
                            disabled={updatingId === row.id}
                          >
                            <SelectTrigger className="w-full max-w-none rounded-lg">
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {STATUS_OPTIONS.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
