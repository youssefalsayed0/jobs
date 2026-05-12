import { BriefcaseIcon, ScrollTextIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { useJobSeekerDashboardStats } from "@/hooks/job-seeker/useJobSeekerDashboardStats"

export function JobSeekerDashboardHome() {
	const { applicationTotal, openJobCount, loading } =
		useJobSeekerDashboardStats()

	const applicationsDisplay =
		loading ? "—" : (applicationTotal ?? "—")
	const jobsDisplay = loading ? "—" : (openJobCount ?? "—")

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
					Your search in one place. Use the sidebar for profile, applications,
					and browsing open roles.
				</p>
			</section>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<Card className="rounded-3xl border-border/80 bg-card/80 p-1 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
						<CardTitle className="text-base font-medium">
							My applications
						</CardTitle>
						<ScrollTextIcon className="size-5 text-muted-foreground" />
					</CardHeader>
					<CardContent className="px-6 pb-6">
						<p className="font-heading text-4xl font-semibold tabular-nums text-foreground">
							{applicationsDisplay}
						</p>
						<CardDescription className="mt-3 text-pretty leading-relaxed">
							Submissions you have sent to employers
						</CardDescription>
						<Button variant="link" className="mt-2 h-auto px-0" asChild>
							<Link to="/seeker/applications">View applications</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="rounded-3xl border-border/80 bg-card/80 p-1 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
						<CardTitle className="text-base font-medium">Open listings</CardTitle>
						<BriefcaseIcon className="size-5 text-muted-foreground" />
					</CardHeader>
					<CardContent className="px-6 pb-6">
						<p className="font-heading text-4xl font-semibold tabular-nums text-foreground">
							{jobsDisplay}
						</p>
						<CardDescription className="mt-3 text-pretty leading-relaxed">
							Roles currently on the public job board
						</CardDescription>
						<Button variant="link" className="mt-2 h-auto px-0" asChild>
							<Link to="/jobs">Browse jobs</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="rounded-3xl border-border/80 bg-card/80 p-1 shadow-sm sm:col-span-2 lg:col-span-1">
					<CardHeader className="space-y-1.5 px-6 pt-6">
						<CardTitle className="text-base font-medium">Shortcuts</CardTitle>
						<CardDescription>Jump to a workspace area</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-3 px-6 pb-6">
						<Button
							variant="outline"
							className="justify-start rounded-xl"
							asChild
						>
							<Link to="/seeker/profile">Edit profile</Link>
						</Button>
						<Button
							variant="outline"
							className="justify-start rounded-xl"
							asChild
						>
							<Link to="/seeker/applications">Application history</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
