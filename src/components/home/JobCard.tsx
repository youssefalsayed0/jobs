import { Building2Icon, MapPinIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ApprovedDisabilitiesBadges } from "@/components/job-postings/ApprovedDisabilitiesBadges"
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
  /** Job posting `approved_disability` — shown on cards when present. */
  approvedDisabilities?: string[]
  /** Raw or ISO datetime from API; shown as relative “Posted … ago” when parseable. */
  createdAt?: string
}

type JobCardProps = {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const skillsText = job.skills.filter(Boolean).join(", ")
  const showTags = job.tags.length > 0
  const disabilityTags = job.approvedDisabilities?.filter(Boolean) ?? []

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-3xl border-border/70 bg-card/95 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="space-y-3">
          <h3 className="font-heading text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
            {job.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt=""
                className="size-12 shrink-0 rounded-2xl border border-border/60 bg-background object-contain p-1 sm:size-14"
              />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-14">
                <Building2Icon className="size-6 sm:size-7" />
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

        {disabilityTags.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Welcoming
            </p>
            <ApprovedDisabilitiesBadges
              items={disabilityTags}
              maxVisible={4}
            />
          </div>
        ) : null}

        {skillsText ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Skills:</span>{" "}
            {skillsText}
          </p>
        ) : null}

        {job.createdAt ? (
          (() => {
            const relative = formatTimeAgo(job.createdAt)
            const absolute =
              formatJobDateTimeLong(job.createdAt) ?? job.createdAt.trim()
            if (!relative && !absolute) return null
            return (
              <div className="space-y-1 border-t border-border/50 pt-3">
                <p className="text-xs font-medium leading-snug text-foreground/90">
                  Posted {relative ?? absolute}
                </p>
                {relative && absolute ? (
                  <p className="text-[0.6875rem] leading-snug text-muted-foreground">
                    {absolute}
                  </p>
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
