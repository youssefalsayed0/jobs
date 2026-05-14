import { Link } from "react-router-dom"
import { BriefcaseIcon, UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEmployerDashboardStats } from "@/hooks/company/useEmployerDashboardStats"

export function CompanyDashboardHome() {
  const { jobCount, applicantCount, loading } = useEmployerDashboardStats()

  return (
    <div className="flex w-full min-w-0 flex-col gap-10">
      <section className="rounded-3xl border border-border/80 bg-card/60 px-7 py-8 shadow-sm backdrop-blur-sm sm:px-10 sm:py-10">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Overview
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-4 w-full max-w-none text-base leading-relaxed text-muted-foreground">
          Hiring activity at a glance. Use the sidebar for profile, jobs,
          applicants, and team.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl border-border/80 bg-card/80 p-1 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-base font-medium">Open roles</CardTitle>
            <BriefcaseIcon className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="font-heading text-4xl font-semibold tabular-nums text-foreground">
              {loading ? "—" : (jobCount ?? "—")}
            </p>
            <CardDescription className="mt-3 text-pretty leading-relaxed">
              Active job postings
            </CardDescription>
            <Button variant="link" className="mt-2 h-auto px-0" asChild>
              <Link to="/company/jobs">Manage jobs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/80 bg-card/80 p-1 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-base font-medium">Applicants</CardTitle>
            <UsersIcon className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="font-heading text-4xl font-semibold tabular-nums text-foreground">
              {loading ? "—" : (applicantCount ?? "—")}
            </p>
            <CardDescription className="mt-3 text-pretty leading-relaxed">
              Total applications across all roles
            </CardDescription>
            <Button variant="link" className="mt-2 h-auto px-0" asChild>
              <Link to="/company/applicants">View pipeline</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/80 bg-card/80 p-1 shadow-sm sm:col-span-2 lg:col-span-1">
          <CardHeader className="space-y-1.5 px-6 pt-6">
            <CardTitle className="text-base font-medium">Shortcuts</CardTitle>
            <CardDescription>Jump to a workspace area</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-6 pb-6">
            <Button variant="outline" className="justify-start rounded-xl" asChild>
              <Link to="/company/profile">Company profile</Link>
            </Button>
     
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
