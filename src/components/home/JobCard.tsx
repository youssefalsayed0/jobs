import { Building2Icon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type Job = {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  tags: string[]
  skills: string[]
}

type JobCardProps = {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="size-5 rounded object-contain"
              />
            ) : (
              <div className="flex size-5 items-center justify-center rounded bg-slate-100">
                <Building2Icon className="size-3 text-blue-600" />
              </div>
            )}
            <span className="font-medium">{job.company}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-slate-700">{job.location}</span>
          <span className="text-slate-300">|</span>
          {job.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="text-sm text-slate-600">
          <span className="font-medium">Skills:</span>{" "}
          <span className="text-slate-500">{job.skills.join(", ")}</span>
        </div>

        <Button
          asChild
          size="sm"
          className="mt-auto w-full rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700"
        >
          <Link to={`/jobs/${job.id}`}>Apply Now</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
