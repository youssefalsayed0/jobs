import { Building2Icon, MapPinIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  formatJobDateTimeLong,
  formatTimeAgo,
} from "@/lib/format-job-dates"

export type Job = {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  tags: string[]
  skills: string[]
  /** ISO or API datetime for "posted" display */
  createdAt?: string
}

type JobCardProps = {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const skillsText = job.skills.filter(Boolean).join(", ")
  const showTags = job.tags.length > 0

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-3xl border-border/70 bg-card/95 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="space-y-3">
          <h3 className="font-heading text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
            {job.title}
          </h3>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt=""
                className="size-9 shrink-0 rounded-xl border border-border/60 bg-background object-contain p-0.5"
              />
            ) : (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2Icon className="size-4" />
              </div>
            )}
            <span className="font-medium text-foreground">{job.company}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
            <MapPinIcon className="size-3.5 shrink-0 text-muted-foreground" />
            {job.location}
          </span>
          {showTags ? (
            <>
              <span className="hidden text-muted-foreground/40 sm:inline">
                ·
              </span>
              {job.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-lg px-2 py-0.5 text-xs font-medium capitalize"
                >
                  {tag}
                </Badge>
              ))}
            </>
          ) : null}
        </div>

        {skillsText ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Skills:</span>{" "}
            {skillsText}
          </p>
        ) : null}

        {job.createdAt ? (
          (() => {
            const absolute = formatJobDateTimeLong(job.createdAt)
            const relative = formatTimeAgo(job.createdAt)
            if (!absolute && !relative) return null
            return (
              <div className="space-y-1 border-t border-border/50 pt-3">
                {absolute ? (
                  <p className="text-xs leading-snug text-foreground/90">
                    {absolute}
                  </p>
                ) : null}
                {relative ? (
                  <p className="text-xs text-muted-foreground">{relative}</p>
                ) : null}
              </div>
            )
          })()
        ) : null}

        <Button
          asChild
          variant="default"
          size="lg"
          className="mt-auto w-full rounded-xl font-semibold shadow-sm"
        >
          <Link to={`/jobs/${job.id}`}>View job</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
