import type { ComponentType } from "react";
import {
	AlertCircleIcon,
	ArrowLeftIcon,
	AwardIcon,
	BriefcaseIcon,
	ExternalLinkIcon,
	FileTextIcon,
	GraduationCapIcon,
	MailIcon,
	MapPinIcon,
	PhoneIcon,
	SparklesIcon,
	UserRoundIcon,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanyApplicantUserDetail } from "@/hooks/company/useCompanyApplicantUserDetail";
import { cn } from "@/lib/utils";
import type { CompanyApplicantUserDetail } from "@/hooks/company/useCompanyApplicantUserDetail";

function initialsFromUser(name: string | undefined): string {
	const t = name?.trim() ?? "";
	if (!t) return "?";
	const parts = t.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
	return t.slice(0, 2).toUpperCase();
}

function ContactRow({ icon: Icon, label, value, href }: { icon: ComponentType<{ className?: string }>; label: string; value: string | null | undefined; href?: string }) {
	const v = value?.trim();
	const display = v && v.length > 0 ? v : "—";
	const content =
		href && v ? (
			<a className="text-sm font-medium text-primary underline-offset-2 hover:underline" href={href}>
				{display}
			</a>
		) : (
			<span className="text-sm font-medium text-foreground">{display}</span>
		);

	return (
		<div className="flex gap-3 rounded-2xl border border-border/60 bg-muted/25 px-4 py-3 transition-colors hover:bg-muted/40">
			<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background/80 text-primary shadow-sm ring-1 ring-border/50">
				<Icon className="size-4" />
			</div>
			<div className="min-w-0 flex-1 space-y-0.5">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
				<div className="wrap-break-word">{content}</div>
			</div>
		</div>
	);
}

function TimelineItem({
	icon: Icon,
	title,
	subtitle,
	meta,
	body,
	tone = "primary",
}: {
	icon: ComponentType<{ className?: string }>;
	title: string;
	subtitle?: string | null;
	meta?: string | null;
	body?: string | null;
	tone?: "primary" | "amber";
}) {
	const ring = tone === "amber" ? "text-amber-600/90 ring-amber-200/80 bg-amber-50/90" : "text-primary ring-primary/15 bg-primary/8";

	return (
		<div className="relative pl-8 pb-4 last:pb-0">
			<span className={cn("absolute left-0 top-1 flex size-6 items-center justify-center rounded-full ring-1", ring)}>
				<Icon className="size-3.5" />
			</span>
			<div className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm">
				<p className="font-heading text-base font-semibold leading-snug text-foreground">{title}</p>
				{subtitle?.trim() ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
				{meta?.trim() ? <p className="mt-2 inline-flex rounded-lg bg-muted/50 px-2 py-0.5 font-mono text-xs text-muted-foreground">{meta}</p> : null}
				{body?.trim() ? <p className="mt-3 text-sm leading-relaxed text-foreground/90">{body}</p> : null}
			</div>
		</div>
	);
}

function PageLoading() {
	return (
		<div className="mx-auto w-full max-w-6xl space-y-8">
			<Skeleton className="h-36 w-full rounded-3xl" />
			<div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
				<div className="space-y-4">
					<Skeleton className="h-72 w-full rounded-3xl" />
					<Skeleton className="h-64 w-full rounded-3xl" />
				</div>
				<Skeleton className="min-h-112 w-full rounded-3xl" />
			</div>
		</div>
	);
}

function formatDateRange(start: string | null | undefined, end: string | null | undefined) {
	const s = start?.trim();
	const e = end?.trim();
	if (!s && !e) return null;
	if (s && e) return `${s} → ${e}`;
	return s || e || null;
}

function ApplicantBody({ user, displayName }: { user: CompanyApplicantUserDetail; displayName: string }) {
	const photo = user.profile_photo_url?.trim() || null;
	const cvUrl = user.cv_url?.trim() || null;
	const skills = [...(user.skills ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
	const educations = user.educations ?? [];
	const experiences = user.experiences ?? [];
	const certificates = user.certificates ?? [];

	const locationLine = [user.city, user.street].filter((x) => x?.trim()).join(", ");

	return (
		<div className="mx-auto w-full max-w-full space-y-8 pb-10">
			<section className="rounded-3xl border border-border/80 bg-linear-to-br from-card via-card to-primary/[0.07] px-7 py-8 shadow-sm sm:px-10 sm:py-10">
				<Button asChild variant="ghost" className="mb-6 -ml-2 h-auto justify-start gap-2 rounded-xl px-2 py-1.5 text-muted-foreground hover:bg-background/60 hover:text-foreground">
					<Link to="/company/applicants">
						<ArrowLeftIcon className="size-4 shrink-0" />
						Back to applicants
					</Link>
				</Button>
				<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Applicant</p>
				<h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Profile</h1>
				<p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">Review this candidate&apos;s details and history. Use the contact actions to reach out or open their CV.</p>
			</section>

			{user.disability_type?.trim() ? (
				<Alert className="rounded-2xl border-amber-200/80 bg-amber-50/60 text-amber-950">
					<AlertCircleIcon className="text-amber-700" />
					<AlertTitle className="font-heading text-amber-950">Disclosure</AlertTitle>
					<AlertDescription className="text-amber-950/90">{user.disability_type.trim()}</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-6 lg:grid-cols-[minmax(0,20.5rem)_1fr] xl:grid-cols-[minmax(0,22rem)_1fr]">
				<div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
					<Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-sm ring-1 ring-black/3">
						<CardHeader className="space-y-4 border-b border-border/60 bg-muted/15 pb-6">
							<div className="relative mx-auto w-fit">
								<div className="absolute -inset-1 rounded-[2rem] bg-linear-to-br from-primary/25 via-transparent to-secondary/20 blur-sm" />
								<Avatar className="relative size-28 rounded-[1.75rem] border-2 border-background shadow-md ring-2 ring-border/60 sm:size-32">
									{photo ? <AvatarImage src={photo} alt="" className="object-cover" /> : null}
									<AvatarFallback className="rounded-[1.65rem] bg-muted text-2xl font-semibold text-muted-foreground">{initialsFromUser(displayName)}</AvatarFallback>
								</Avatar>
							</div>
							<div className="space-y-2 text-center">
								<CardTitle className="font-heading text-xl leading-tight sm:text-2xl">{displayName}</CardTitle>
								<div className="flex flex-wrap items-center justify-center gap-2">
									{user.status ? (
										<Badge variant="outline" className={cn("rounded-lg capitalize", user.status.toLowerCase() === "active" && "border-emerald-200/90 bg-emerald-50 text-emerald-900")}>
											{user.status}
										</Badge>
									) : null}
								</div>
								{user.created_at ? <p className="text-center text-xs text-muted-foreground">Joined {user.created_at}</p> : null}
							</div>
							{cvUrl ? (
								<Button asChild className="w-full rounded-2xl shadow-sm" size="lg">
									<a href={cvUrl} target="_blank" rel="noopener noreferrer">
										<FileTextIcon className="size-4" />
										Open CV
										<ExternalLinkIcon className="size-3.5 opacity-80" />
									</a>
								</Button>
							) : (
								<p className="text-center text-xs text-muted-foreground">No CV on file</p>
							)}
						</CardHeader>
						<CardContent className="space-y-4 p-6">
							<div className="space-y-2">
								<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</p>
								<div className="flex flex-wrap gap-2">
									{user.email?.trim() ? (
										<Button asChild variant="outline" size="sm" className="rounded-xl">
											<a href={`mailto:${user.email.trim()}`}>
												<MailIcon className="size-3.5" />
												Email
											</a>
										</Button>
									) : null}
									{user.phone?.trim() ? (
										<Button asChild variant="outline" size="sm" className="rounded-xl">
											<a href={`tel:${user.phone.replace(/\s/g, "")}`}>
												<PhoneIcon className="size-3.5" />
												Call
											</a>
										</Button>
									) : null}
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-3xl border-border/80 bg-card/90 shadow-sm ring-1 ring-black/3">
						<CardHeader className="pb-4">
							<div className="flex items-center gap-2">
								<UserRoundIcon className="size-4 text-primary" />
								<CardTitle className="font-heading text-base">Contact</CardTitle>
							</div>
							<CardDescription>How to reach this applicant</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<ContactRow icon={MailIcon} label="Email" value={user.email} href={user.email?.trim() ? `mailto:${user.email.trim()}` : undefined} />
							<ContactRow icon={PhoneIcon} label="Phone" value={user.phone} href={user.phone?.trim() ? `tel:${user.phone.replace(/\s/g, "")}` : undefined} />
							<ContactRow icon={UserRoundIcon} label="Gender" value={user.gender} />
							<ContactRow icon={MapPinIcon} label="Location" value={locationLine || null} />
						</CardContent>
					</Card>
				</div>

				<div className="min-w-0 space-y-6">
					<Card className="rounded-3xl border-border/80 bg-card/90 shadow-sm ring-1 ring-black/3">
						<CardHeader className="pb-3">
							<div className="flex items-center gap-2">
								<SparklesIcon className="size-4 text-primary" />
								<CardTitle className="font-heading text-lg">Skills</CardTitle>
							</div>
							<CardDescription>Tags from their profile</CardDescription>
						</CardHeader>
						<CardContent>
							{skills.some((s) => s.name?.trim()) ? (
								<div className="flex flex-wrap gap-2 rounded-2xl border border-border/50 bg-muted/20 p-4">
									{skills.map((s) =>
										s.name?.trim() ? (
											<Badge key={s.id ?? s.name} variant="secondary" className="rounded-lg px-3 py-1 text-sm font-normal">
												{s.name.trim()}
											</Badge>
										) : null,
									)}
								</div>
							) : (
								<p className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">No skills listed yet.</p>
							)}
						</CardContent>
					</Card>

					<Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-sm ring-1 ring-black/3">
						<Tabs defaultValue="history" className="gap-0">
							<CardHeader className="flex flex-col gap-4 space-y-0 border-b border-border/60 bg-muted/10 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<CardTitle className="font-heading text-lg">Background</CardTitle>
									<CardDescription className="mt-1">Education, work history, and certificates</CardDescription>
								</div>
								<TabsList className="h-9 w-full shrink-0 rounded-xl sm:w-auto">
									<TabsTrigger value="history" className="rounded-lg text-xs sm:text-sm">
										Experience
									</TabsTrigger>
									<TabsTrigger value="certificates" className="rounded-lg text-xs sm:text-sm">
										Certificates
									</TabsTrigger>
								</TabsList>
							</CardHeader>
							<TabsContent value="history" className="mt-0 outline-none">
								<CardContent className="space-y-10 p-6 sm:p-8">
									<section>
										<div className="mb-5 flex items-center gap-2">
											<BriefcaseIcon className="size-4 text-primary" />
											<h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">Experience</h2>
										</div>
										{experiences.length > 0 ? (
											<div className="relative space-y-2 border-l border-border/70 pl-1">
												{experiences.map((x) => (
													<TimelineItem
														key={x.id ?? `${x.company_name}-${x.title}`}
														icon={BriefcaseIcon}
														title={[x.title?.trim(), x.company_name?.trim()].filter(Boolean).join(" · ") || "Role"}
														meta={formatDateRange(x.starts_at, x.ends_at)}
														body={x.description}
													/>
												))}
											</div>
										) : (
											<p className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-4 py-6 text-sm text-muted-foreground">No work history added.</p>
										)}
									</section>

									<Separator />

									<section>
										<div className="mb-5 flex items-center gap-2">
											<GraduationCapIcon className="size-4 text-primary" />
											<h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">Education</h2>
										</div>
										{educations.length > 0 ? (
											<div className="relative space-y-2 border-l border-border/70 pl-1">
												{educations.map((e) => (
													<TimelineItem
														key={e.id ?? `${e.institution}-${e.degree}`}
														icon={GraduationCapIcon}
														tone="amber"
														title={[e.degree, e.field_of_study].filter(Boolean).join(" · ") || e.institution?.trim() || "Education"}
														subtitle={e.institution?.trim() || undefined}
														meta={formatDateRange(e.starts_at, e.ends_at)}
														body={e.details}
													/>
												))}
											</div>
										) : (
											<p className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-4 py-6 text-sm text-muted-foreground">No education entries yet.</p>
										)}
									</section>
								</CardContent>
							</TabsContent>
							<TabsContent value="certificates" className="mt-0 outline-none">
								<CardContent className="p-6 sm:p-8">
									<div className="mb-5 flex items-center gap-2">
										<AwardIcon className="size-4 text-primary" />
										<h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">Certificates</h2>
									</div>
									{certificates.length > 0 ? (
										<ul className="space-y-3">
											{certificates.map((c) => (
												<li key={c.id ?? `${c.name}-${c.issuer}`} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between">
													<div className="flex gap-3 min-w-0">
														<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm ring-1 ring-border/50">
															<AwardIcon className="size-5" />
														</div>
														<div className="min-w-0">
															<p className="font-heading font-semibold text-foreground">{c.name?.trim() || "Certificate"}</p>
															<p className="text-sm text-muted-foreground">{[c.issuer, c.issued_at].filter(Boolean).join(" · ") || "—"}</p>
														</div>
													</div>
													{c.credential_url?.trim() ? (
														<Button asChild variant="outline" size="sm" className="shrink-0 rounded-xl">
															<a href={c.credential_url.trim()} target="_blank" rel="noopener noreferrer">
																Verify
																<ExternalLinkIcon className="size-3.5" />
															</a>
														</Button>
													) : null}
												</li>
											))}
										</ul>
									) : (
										<p className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">No certificates on file.</p>
									)}
								</CardContent>
							</TabsContent>
						</Tabs>
					</Card>
				</div>
			</div>
		</div>
	);
}

export function CompanyApplicantUserPage() {
	const { userId } = useParams<{ userId: string }>();
	const { user, loading } = useCompanyApplicantUserDetail(userId);

	if (!userId?.trim()) {
		return (
			<div className="mx-auto max-w-lg space-y-6 rounded-3xl border border-border/80 bg-card/80 p-8 shadow-sm">
				<div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
					<AlertCircleIcon className="size-6 text-muted-foreground" />
				</div>
				<div className="space-y-2">
					<h1 className="font-heading text-xl font-semibold">Missing applicant</h1>
					<p className="text-sm text-muted-foreground">This URL does not include a valid applicant id.</p>
				</div>
				<Button asChild variant="outline" className="rounded-xl">
					<Link to="/company/applicants">Back to applicants</Link>
				</Button>
			</div>
		);
	}

	const displayName = user?.full_name?.trim() || [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() || "Applicant";

	return (
		<>
			{loading ? (
				<PageLoading />
			) : !user ? (
				<div className="mx-auto max-w-lg space-y-6 rounded-3xl border border-border/80 bg-card/80 p-8 shadow-sm">
					<div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
						<AlertCircleIcon className="size-6 text-destructive" />
					</div>
					<div className="space-y-2">
						<h1 className="font-heading text-xl font-semibold">Profile unavailable</h1>
						<p className="text-sm leading-relaxed text-muted-foreground">This applicant could not be loaded. They may have been removed or you may not have access.</p>
					</div>
					<Button asChild variant="outline" className="rounded-xl">
						<Link to="/company/applicants">Back to applicants</Link>
					</Button>
				</div>
			) : (
				<ApplicantBody user={user} displayName={displayName} />
			)}
		</>
	);
}
