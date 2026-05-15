import { Accessibility, ArrowLeftIcon, BriefcaseIcon, Building2Icon, ClipboardListIcon, GraduationCapIcon, MapPinIcon, SparklesIcon, TagsIcon } from "lucide-react";
import { type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApprovedDisabilitiesBadges } from "@/components/job-postings/ApprovedDisabilitiesBadges";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { useJobApplicationSubmit } from "@/hooks/job-seeker/useJobApplicationSubmit";
import { usePublicJobDetail } from "@/hooks/job-seeker/usePublicJobDetail";
import { formatJobDateTimeLong, formatTimeAgo } from "@/lib/format-job-dates";
import { cn } from "@/lib/utils";

function formatWorkType(t: string | undefined): string | null {
	if (!t?.trim()) return null;
	return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function JobDetailSkeleton() {
	return (
		<div className="flex min-h-0 flex-1 flex-col gap-8 bg-linear-to-b from-muted/40 via-background to-muted/20 py-8 lg:py-12">
			<div className="container mx-auto w-full px-4 sm:px-8">
				<Skeleton className="h-56 w-full rounded-3xl sm:h-64" />
			</div>
			<div className="container mx-auto grid w-full gap-6 px-4 sm:px-8">
				<Skeleton className="h-48 rounded-3xl sm:h-56" />
				<Skeleton className="h-44 rounded-3xl sm:h-48" />
			</div>
		</div>
	);
}

function PostedMeta({ created_at, updated_at }: { created_at?: string; updated_at?: string }) {
	const createdTrim = created_at?.trim();
	const updatedTrim = updated_at?.trim();
	const createdAbs = formatJobDateTimeLong(created_at) ?? (createdTrim || undefined);
	const createdRel = formatTimeAgo(created_at);
	const updatedAbs = formatJobDateTimeLong(updated_at) ?? (updatedTrim || undefined);
	const updatedRel = formatTimeAgo(updated_at);
	const sameStamp = createdTrim && updatedTrim && createdTrim === updatedTrim;
	const hasPosted = createdRel || createdAbs;
	const hasUpdated = !sameStamp && (updatedRel || updatedAbs);
	if (!hasPosted && !hasUpdated) {
		return null;
	}
	return (
		<div className="flex flex-wrap gap-4 border-t border-border/50 pt-5 sm:gap-8">
			{hasPosted ? (
				<div className="min-w-0 space-y-1">
					<p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Posted</p>
					{createdRel ? <p className="text-sm font-semibold text-foreground/95">{createdRel}</p> : createdAbs ? <p className="text-sm font-medium text-foreground/95">{createdAbs}</p> : null}
					{createdRel && createdAbs ? <p className="text-xs leading-relaxed text-muted-foreground">{createdAbs}</p> : null}
				</div>
			) : null}
			{hasUpdated ? (
				<div className="min-w-0 space-y-1">
					<p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Updated</p>
					{updatedRel ? <p className="text-sm font-semibold text-foreground/95">{updatedRel}</p> : updatedAbs ? <p className="text-sm font-medium text-foreground/95">{updatedAbs}</p> : null}
					{updatedRel && updatedAbs ? <p className="text-xs leading-relaxed text-muted-foreground">{updatedAbs}</p> : null}
				</div>
			) : null}
		</div>
	);
}

function ProseBlock({ children }: { children: ReactNode }) {
	return (
		<div
			className={cn(
				"prose prose-sm max-w-none text-pretty text-muted-foreground dark:prose-invert",
				"prose-p:leading-relaxed prose-p:mb-4 last:prose-p:mb-0",
				"whitespace-pre-wrap text-[0.9375rem] leading-relaxed sm:text-base",
			)}>
			{children}
		</div>
	);
}

export function PublicJobDetailPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { job, loading } = usePublicJobDetail(jobId);
	const { submit, submitting } = useJobApplicationSubmit();

	const role = typeof user?.role === "string" ? user.role.toLowerCase() : "";
	const isSeeker = role === "job_seeker";
	const isCompany = role === "company";

	const handleApply = async () => {
		if (!user || !isSeeker) {
			void navigate("/login", {
				state: { from: { pathname: `/jobs/${jobId}` } },
			});
			return;
		}
		const id = jobId?.trim();
		if (!id) return;
		try {
			await submit(id);
		} catch {
			/* toast in hook */
		}
	};

	if (loading) {
		return <JobDetailSkeleton />;
	}

	if (!job) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center bg-linear-to-b from-muted/40 to-background px-4 py-20">
				<Card className="w-full max-w-md border-dashed border-border/80 bg-card/90 p-8 text-center shadow-sm">
					<CardHeader className="space-y-2 pb-2">
						<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
							<BriefcaseIcon className="size-7 text-muted-foreground" />
						</div>
						<CardTitle className="text-xl">Job not found</CardTitle>
						<CardDescription>This listing may have been removed or the link is incorrect.</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild className="w-full rounded-xl" variant="default">
							<Link to="/jobs">Browse all jobs</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const workType = formatWorkType(job.type);
	const category = job.category?.trim() || null;
	const jobSkills = (job.skills ?? []).filter(Boolean);
	const location = job.location?.trim();
	const company = job.company_name?.trim();
	const companyLogo =
		typeof job.company_profile_photo_url === "string" &&
		job.company_profile_photo_url.trim() !== ""
			? job.company_profile_photo_url.trim()
			: null;

	return (
		<div className="flex min-h-0 flex-1 flex-col bg-linear-to-b from-muted/40 via-background to-muted/20">
			<header className="relative border-b border-border/60 bg-card shadow-sm">
				<div className="pointer-events-none absolute -right-24 -top-32 size-72 rounded-full bg-primary/9 blur-3xl sm:size-96" aria-hidden />
				<div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/80 to-transparent" />

				<div className="container relative mx-auto w-full px-4 py-8 sm:px-8 sm:py-10 lg:py-12">
					<Button variant="ghost" size="sm" className="mb-6 -ms-1 gap-2 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground" asChild>
						<Link to="/jobs">
							<ArrowLeftIcon className="size-4 shrink-0" />
							All listings
						</Link>
					</Button>

					<div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
						<div className="min-w-0 flex-1 space-y-5">
							<div className="space-y-3">
								<h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
									{job.title ?? "Open role"}
								</h1>
								{company ? (
									<p className="flex items-center gap-3 text-lg text-muted-foreground sm:text-xl">
										{companyLogo ? (
											<img
												src={companyLogo}
												alt=""
												className="size-14 shrink-0 rounded-2xl border border-border/60 bg-background object-contain p-1 sm:size-16"
											/>
										) : (
											<span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-16">
												<Building2Icon className="size-7 sm:size-8" />
											</span>
										)}
										<span className="font-semibold text-foreground/90">{company}</span>
									</p>
								) : null}
							</div>

							<div className="flex flex-wrap items-center gap-2">
								{category ? (
									<Badge variant="secondary" className="rounded-lg px-2.5 py-0.5 text-xs font-medium">
										{category}
									</Badge>
								) : null}
								{workType ? (
									<Badge variant="secondary" className="rounded-lg px-2.5 py-0.5 text-xs font-medium capitalize">
										{workType}
									</Badge>
								) : null}
								{location ? (
									<Badge variant="outline" className="gap-1.5 rounded-lg border-border/80 px-2.5 py-0.5 text-xs font-normal">
										<MapPinIcon className="size-3.5 shrink-0" />
										{location}
									</Badge>
								) : null}
							</div>

							{job.approved_disability && job.approved_disability.length > 0 ? (
								<div className="flex flex-col gap-2 pt-1">
									<p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Welcoming applications from</p>
									<ApprovedDisabilitiesBadges items={job.approved_disability} />
								</div>
							) : null}

							<PostedMeta created_at={job.created_at} updated_at={job.updated_at} />
						</div>

						<div className="flex w-full shrink-0 flex-col gap-4 sm:flex-row sm:items-center lg:w-72 lg:flex-col lg:items-stretch">
							{user && isCompany ? (
								<Alert className="rounded-2xl border-amber-500/25 bg-amber-500/6">
									<BriefcaseIcon className="size-4 text-amber-700 dark:text-amber-400" />
									<AlertTitle className="text-amber-950 dark:text-amber-100">Employer account</AlertTitle>
									<AlertDescription className="text-amber-950/80 dark:text-amber-50/85">
										Job applications are for job seeker accounts. Post and manage roles from your company dashboard.
									</AlertDescription>
								</Alert>
							) : (
								<>
									<Button
										type="button"
										size="lg"
										className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl font-semibold shadow-md sm:h-12"
										disabled={submitting}
										onClick={() => {
											void handleApply();
										}}
									>
										{submitting ? (
											<>
												<Spinner className="size-4" />
												Submitting…
											</>
										) : user && isSeeker ? (
											"Apply for this role"
										) : (
											"Sign in to apply"
										)}
									</Button>
									{user && !isSeeker ? (
										<Alert className="rounded-2xl border-amber-500/25 bg-amber-500/6">
											<BriefcaseIcon className="size-4 text-amber-700 dark:text-amber-400" />
											<AlertTitle className="text-amber-950 dark:text-amber-100">Employer account</AlertTitle>
											<AlertDescription className="text-amber-950/80 dark:text-amber-50/85">
												Job applications are for job seeker accounts. Post and manage roles from your company dashboard.
											</AlertDescription>
										</Alert>
									) : (
										<p className="text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
											{user && isSeeker
												? "Your application is sent using your signed-in job seeker account."
												: "Create an account or sign in as a job seeker to submit your application."}
										</p>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</header>

			<div className="container mx-auto w-full flex-1 space-y-6 px-4 py-8 sm:space-y-8 sm:px-8 sm:py-10 lg:py-12">
				{jobSkills.length > 0 ? (
					<Card className="overflow-hidden rounded-3xl border-border/70 bg-card/95 shadow-sm">
						<CardHeader className="border-b border-border/50 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
							<div className="flex items-start gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<TagsIcon className="size-5" />
								</div>
								<div className="min-w-0 space-y-1">
									<CardTitle className="text-lg sm:text-xl">Skills</CardTitle>
									<CardDescription>Skills associated with this role.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="px-6 py-7 sm:px-8 sm:py-8">
							<ApprovedDisabilitiesBadges items={jobSkills} />
						</CardContent>
					</Card>
				) : null}
				{job.approved_disability && job.approved_disability.length > 0 ? (
					<Card className="overflow-hidden rounded-3xl border-border/70 bg-card/95 shadow-sm">
						<CardHeader className="border-b border-border/50 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
							<div className="flex items-start gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<Accessibility className="size-5" />
								</div>
								<div className="min-w-0 space-y-1">
									<CardTitle className="text-lg sm:text-xl">Disabilities we welcome</CardTitle>
									<CardDescription>This employer listed the following as explicitly supported or welcomed for this role.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="px-6 py-7 sm:px-8 sm:py-8">
							<ApprovedDisabilitiesBadges items={job.approved_disability} />
						</CardContent>
					</Card>
				) : null}

				{job.description ? (
					<Card className="overflow-hidden rounded-3xl border-border/70 bg-card/95 shadow-sm">
						<CardHeader className="border-b border-border/50 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
							<div className="flex items-start gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<SparklesIcon className="size-5" />
								</div>
								<div className="min-w-0 space-y-1">
									<CardTitle className="text-lg sm:text-xl">About the role</CardTitle>
									<CardDescription>What you will do and how the team works.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="px-6 py-7 sm:px-8 sm:py-8">
							<ProseBlock>{job.description}</ProseBlock>
						</CardContent>
					</Card>
				) : null}

				{job.requirements ? (
					<Card className="overflow-hidden rounded-3xl border-border/70 bg-card/95 shadow-sm">
						<CardHeader className="border-b border-border/50 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
							<div className="flex items-start gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<ClipboardListIcon className="size-5" />
								</div>
								<div className="min-w-0 space-y-1">
									<CardTitle className="text-lg sm:text-xl">Requirements</CardTitle>
									<CardDescription>Skills and experience the team is looking for.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="px-6 py-7 sm:px-8 sm:py-8">
							<ProseBlock>{job.requirements}</ProseBlock>
						</CardContent>
					</Card>
				) : null}

				{job.qualification ? (
					<Card className="overflow-hidden rounded-3xl border-border/70 bg-card/95 shadow-sm">
						<CardHeader className="border-b border-border/50 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
							<div className="flex items-start gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<GraduationCapIcon className="size-5" />
								</div>
								<div className="min-w-0 space-y-1">
									<CardTitle className="text-lg sm:text-xl">Qualifications</CardTitle>
									<CardDescription>Education and credentials that strengthen your application.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="px-6 py-7 sm:px-8 sm:py-8">
							<ProseBlock>{job.qualification}</ProseBlock>
						</CardContent>
					</Card>
				) : null}

				{!job.description && !job.requirements && !job.qualification ? (
					<Card className="rounded-3xl border-dashed border-border/80 bg-muted/15 py-12 text-center shadow-none">
						<CardContent className="text-sm text-muted-foreground">No extended description has been provided for this listing yet.</CardContent>
					</Card>
				) : null}
			</div>

		</div>
	);
}
