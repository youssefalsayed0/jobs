import { Link } from "react-router-dom"

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
import { useCompanyApplicantsAggregate } from "@/hooks/company/useCompanyApplicantsAggregate"

export function CompanyApplicantsPage() {
  const { rows, loading, refetch } = useCompanyApplicantsAggregate()

  return (
    <div className="flex w-full min-w-0 flex-col gap-10">
      <section className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-card/60 px-7 py-8 shadow-sm backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-10">
        <div className="w-full min-w-0 space-y-4">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Pipeline
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Applicants
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Everyone who has applied across your open roles. Open a job from{" "}
            <Link
              to="/company/jobs"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Jobs
            </Link>{" "}
            to edit listings or change pipeline stages per role.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 rounded-xl"
          disabled={loading}
          onClick={() => void refetch()}
        >
          Refresh
        </Button>
      </section>

      <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/80 shadow-sm">
        <CardHeader className="space-y-2 border-b border-border/60 bg-muted/20 px-7 py-6 sm:px-10 sm:py-8">
          <CardTitle className="text-lg sm:text-xl">All applications</CardTitle>
          <CardDescription className="text-base">
            {loading ? "Loading…" : `${rows.length} application(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-7 py-8 sm:px-10 sm:py-10">
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-[4.5rem] w-full rounded-2xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              No applicants yet. Post a job and wait for candidates to apply.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {rows.map((row) => (
                <li
                  key={`${row.jobId}-${row.id}`}
                  className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/15 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
                >
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="truncate font-medium text-foreground">
                      {row.name || "Applicant"}
                    </span>
                    {row.email ? (
                      <span className="truncate text-sm text-muted-foreground">
                        {row.email}
                      </span>
                    ) : null}
                    <span className="text-xs text-muted-foreground">
                      Role:{" "}
                      <Link
                        to="/company/jobs"
                        className="font-medium text-foreground underline-offset-2 hover:underline"
                      >
                        {row.jobTitle}
                      </Link>
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {row.status ? (
                      <Badge variant="secondary" className="rounded-lg capitalize">
                        {row.status}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-lg">
                        Pending
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
