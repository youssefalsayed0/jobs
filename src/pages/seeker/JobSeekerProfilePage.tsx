import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RequiredMark } from "@/components/ui/required-mark";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkillsTagsInput } from "@/components/job-seeker/SkillsTagsInput";
import { useAuth } from "@/contexts/auth-context";
import { DeleteAccountSection } from "@/components/profile/DeleteAccountSection";
import { useJobSeekerProfile } from "@/hooks/job-seeker/useJobSeekerProfile";
import { JOB_SEEKER_DISABILITY_CUSTOM, JOB_SEEKER_DISABILITY_OPTIONS } from "@/lib/disability-types";
import { capSkillsTokens, joinSkillsTokens, MAX_SKILLS_TAGS, parseSkillsTokens } from "@/lib/skills-tags";
import { cn } from "@/lib/utils";
import { BriefcaseIcon, FileTextIcon, LayoutListIcon, MapPinIcon, PlusIcon, RotateCcwIcon, ScrollTextIcon, SparklesIcon, Trash2Icon, UploadIcon, UserRoundIcon } from "lucide-react";

/** Multipart: repeated `skills[]` so Laravel receives an array of strings. */
function appendSkillsToFormData(fd: FormData, skillsRaw: string | undefined) {
	const names = capSkillsTokens(parseSkillsTokens(skillsRaw));
	for (const name of names) {
		fd.append("skills[]", name);
	}
}

const idFieldSchema = z.union([z.number(), z.string()]).optional();

const certificateRowSchema = z.object({
	id: idFieldSchema,
	name: z.string().optional(),
	issuer: z.string().optional(),
	issued_at: z.string().optional(),
	credential_url: z.string().optional(),
});

const educationRowSchema = z.object({
	id: idFieldSchema,
	institution: z.string().optional(),
	degree: z.string().optional(),
	field_of_study: z.string().optional(),
	starts_at: z.string().optional(),
	ends_at: z.string().optional(),
	details: z.string().optional(),
});

const experienceRowSchema = z.object({
	id: idFieldSchema,
	company_name: z.string().optional(),
	title: z.string().optional(),
	starts_at: z.string().optional(),
	ends_at: z.string().optional(),
	description: z.string().optional(),
});

const profileSchema = z
	.object({
		full_name: z.string().min(1, "Name is required"),
		email: z.string().min(1, "Email is required").email("Enter a valid email address"),
		phone: z.string().refine((s) => s.trim().length >= 1, {
			message: "Phone number is required",
		}),
		gender: z
			.string()
			.optional()
			.superRefine((val, ctx) => {
				const v = val?.trim() ?? "";
				if (v === "") return;
				if (v !== "male" && v !== "female") {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Select male or female.",
					});
				}
			}),
		city: z.string().optional(),
		disabilityType: z.string().optional(),
		disabilityCustom: z.string().optional(),
		skills: z
			.string()
			.optional()
			.superRefine((val, ctx) => {
				if (parseSkillsTokens(val).length > MAX_SKILLS_TAGS) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `You can add at most ${MAX_SKILLS_TAGS} skills.`,
					});
				}
			}),
		certificates: z.array(certificateRowSchema),
		educations: z.array(educationRowSchema),
		experiences: z.array(experienceRowSchema),
	})
	.superRefine((d, ctx) => {
		if (d.disabilityType === JOB_SEEKER_DISABILITY_CUSTOM) {
			const c = d.disabilityCustom?.trim() ?? "";
			if (c.length < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Enter your disability type.",
					path: ["disabilityCustom"],
				});
			}
		}
	});

type ProfileForm = z.infer<typeof profileSchema>;
type CertificateFormRow = z.infer<typeof certificateRowSchema>;
type EducationFormRow = z.infer<typeof educationRowSchema>;
type ExperienceFormRow = z.infer<typeof experienceRowSchema>;

function emptyCertificateRow(): CertificateFormRow {
	return { name: "", issuer: "", issued_at: "", credential_url: "" };
}

function emptyEducationRow(): EducationFormRow {
	return {
		institution: "",
		degree: "",
		field_of_study: "",
		starts_at: "",
		ends_at: "",
		details: "",
	};
}

function emptyExperienceRow(): ExperienceFormRow {
	return {
		company_name: "",
		title: "",
		starts_at: "",
		ends_at: "",
		description: "",
	};
}

function asOptionalId(v: unknown): number | string | undefined {
	if (typeof v === "number" && Number.isFinite(v)) return v;
	if (typeof v === "string" && v.trim() !== "") return v;
	return undefined;
}

function mapCertificateRow(item: unknown): CertificateFormRow {
	if (!item || typeof item !== "object") return emptyCertificateRow();
	const o = item as Record<string, unknown>;
	return {
		id: asOptionalId(o.id),
		name: typeof o.name === "string" ? o.name : "",
		issuer: typeof o.issuer === "string" ? o.issuer : "",
		issued_at: typeof o.issued_at === "string" ? o.issued_at : "",
		credential_url: typeof o.credential_url === "string" ? o.credential_url : "",
	};
}

function mapEducationRow(item: unknown): EducationFormRow {
	if (!item || typeof item !== "object") return emptyEducationRow();
	const o = item as Record<string, unknown>;
	return {
		id: asOptionalId(o.id),
		institution: typeof o.institution === "string" ? o.institution : "",
		degree: typeof o.degree === "string" ? o.degree : "",
		field_of_study: typeof o.field_of_study === "string" ? o.field_of_study : "",
		starts_at: typeof o.starts_at === "string" ? o.starts_at : "",
		ends_at: o.ends_at === null || o.ends_at === undefined ? "" : typeof o.ends_at === "string" ? o.ends_at : "",
		details: o.details === null || o.details === undefined ? "" : typeof o.details === "string" ? o.details : "",
	};
}

function mapExperienceRow(item: unknown): ExperienceFormRow {
	if (!item || typeof item !== "object") return emptyExperienceRow();
	const o = item as Record<string, unknown>;
	return {
		id: asOptionalId(o.id),
		company_name: typeof o.company_name === "string" ? o.company_name : "",
		title: typeof o.title === "string" ? o.title : "",
		starts_at: typeof o.starts_at === "string" ? o.starts_at : "",
		ends_at: o.ends_at === null || o.ends_at === undefined ? "" : typeof o.ends_at === "string" ? o.ends_at : "",
		description: typeof o.description === "string" ? o.description : "",
	};
}

function certificatesFromProfile(profile: Record<string, unknown> | null) {
	const rows = parseRowArray(profile?.certificates, mapCertificateRow);
	return rows as CertificateFormRow[];
}

function educationsFromProfile(profile: Record<string, unknown> | null) {
	const rows = parseRowArray(profile?.educations, mapEducationRow);
	return rows as EducationFormRow[];
}

function experiencesFromProfile(profile: Record<string, unknown> | null) {
	const rows = parseRowArray(profile?.experiences, mapExperienceRow);
	return rows as ExperienceFormRow[];
}

function parseRowArray(v: unknown, map: (item: unknown) => unknown): unknown[] {
	if (!Array.isArray(v)) return [];
	return v.map(map);
}

/** Trim BOM / ZWSP and compatibility-normalize strings from APIs (esp. production). */
function normalizeApiString(s: string): string {
	return s
		.replace(/^\uFEFF/, "")
		.replace(/\u200B/g, "")
		.normalize("NFKC")
		.trim();
}

function rawToDisabilityInputString(raw: unknown): string {
	if (raw === null || raw === undefined) return "";
	if (typeof raw === "string") return normalizeApiString(raw);
	if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
	if (typeof raw === "object" && !Array.isArray(raw)) {
		const o = raw as Record<string, unknown>;
		const n = o.name ?? o.label ?? o.title ?? o.value;
		if (typeof n === "string") return normalizeApiString(n);
		if (typeof n === "number" && Number.isFinite(n)) return String(n);
	}
	return "";
}

function disabilityFormFromProfile(profile: Record<string, unknown> | null): { disabilityType: string; disabilityCustom: string } {
	if (!profile) return { disabilityType: "", disabilityCustom: "" };
	const raw = profile.disability_type ?? profile.disabilityType;
	if (raw === null || raw === undefined) {
		return { disabilityType: "", disabilityCustom: "" };
	}
	const s = rawToDisabilityInputString(raw);
	if (!s) return { disabilityType: "", disabilityCustom: "" };
	const lower = s.toLowerCase();
	const byValueCi = JOB_SEEKER_DISABILITY_OPTIONS.find((o) => o.value.toLowerCase() === lower);
	if (byValueCi) return { disabilityType: byValueCi.value, disabilityCustom: "" };
	const optionValues = new Set(JOB_SEEKER_DISABILITY_OPTIONS.map((o) => o.value));
	if (optionValues.has(s)) return { disabilityType: s, disabilityCustom: "" };
	const byLabel = JOB_SEEKER_DISABILITY_OPTIONS.find((o) => o.label.toLowerCase() === lower);
	if (byLabel) return { disabilityType: byLabel.value, disabilityCustom: "" };
	return {
		disabilityType: JOB_SEEKER_DISABILITY_CUSTOM,
		disabilityCustom: s,
	};
}

function resolvedDisabilityTypeForApi(values: ProfileForm): string {
	if (values.disabilityType === JOB_SEEKER_DISABILITY_CUSTOM) {
		return (values.disabilityCustom ?? "").trim();
	}
	return (values.disabilityType ?? "").trim();
}

function trimOrNull(s: string | undefined): string | null {
	const t = s?.trim();
	return t ? t : null;
}

function rowHasCertificateContent(r: CertificateFormRow): boolean {
	return !!(r.name?.trim() || r.issuer?.trim() || r.issued_at?.trim() || r.credential_url?.trim());
}

function rowHasEducationContent(r: EducationFormRow): boolean {
	return !!(r.institution?.trim() || r.degree?.trim() || r.field_of_study?.trim() || r.starts_at?.trim() || r.ends_at?.trim() || r.details?.trim());
}

function rowHasExperienceContent(r: ExperienceFormRow): boolean {
	return !!(r.company_name?.trim() || r.title?.trim() || r.starts_at?.trim() || r.ends_at?.trim() || r.description?.trim());
}

function certificatesToApiPayload(rows: CertificateFormRow[]) {
	return rows.filter(rowHasCertificateContent).map((r) => {
		const o: Record<string, unknown> = {
			name: trimOrNull(r.name),
			issuer: trimOrNull(r.issuer),
			issued_at: trimOrNull(r.issued_at),
			credential_url: trimOrNull(r.credential_url),
		};
		if (r.id !== undefined && r.id !== "") o.id = r.id;
		return o;
	});
}

function educationsToApiPayload(rows: EducationFormRow[]) {
	return rows.filter(rowHasEducationContent).map((r) => {
		const o: Record<string, unknown> = {
			institution: trimOrNull(r.institution),
			degree: trimOrNull(r.degree),
			field_of_study: trimOrNull(r.field_of_study),
			starts_at: trimOrNull(r.starts_at),
			ends_at: trimOrNull(r.ends_at),
			details: trimOrNull(r.details),
		};
		if (r.id !== undefined && r.id !== "") o.id = r.id;
		return o;
	});
}

function experiencesToApiPayload(rows: ExperienceFormRow[]) {
	return rows.filter(rowHasExperienceContent).map((r) => {
		const o: Record<string, unknown> = {
			company_name: trimOrNull(r.company_name),
			title: trimOrNull(r.title),
			starts_at: trimOrNull(r.starts_at),
			ends_at: trimOrNull(r.ends_at),
			description: trimOrNull(r.description),
		};
		if (r.id !== undefined && r.id !== "") o.id = r.id;
		return o;
	});
}

function skillsStringFromProfile(profile: Record<string, unknown> | null): string {
	if (!profile) return "";
	const v = profile.skills;
	if (Array.isArray(v)) {
		const rows = v
			.filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
			.map((item) => ({
				order: typeof item.sort_order === "number" ? item.sort_order : 0,
				name: typeof item.name === "string" ? item.name.trim() : "",
			}))
			.filter((x) => x.name.length > 0)
			.sort((a, b) => a.order - b.order);
		return joinSkillsTokens(capSkillsTokens(rows.map((r) => r.name)));
	}
	if (typeof v === "string") {
		return joinSkillsTokens(capSkillsTokens(parseSkillsTokens(v.trim())));
	}
	return "";
}

function readText(p: Record<string, unknown> | null, ...keys: string[]): string {
	if (!p) return "";
	for (const k of keys) {
		const v = p[k];
		if (typeof v === "string" && v.trim() !== "") return v;
		if (Array.isArray(v) && v.length > 0) return v.map((x) => (typeof x === "string" ? x : String(x))).join(", ");
	}
	return "";
}

/** Scalar string from API: supports numeric enums / wrapped values in production. */
function readStringCoerced(p: Record<string, unknown> | null, ...keys: string[]): string {
	if (!p) return "";
	for (const k of keys) {
		const v = p[k];
		if (typeof v === "string") {
			const t = normalizeApiString(v);
			if (t !== "") return t;
		}
		if (typeof v === "number" && Number.isFinite(v)) {
			return String(Math.trunc(v));
		}
	}
	return "";
}

/** Map API / legacy values to form: only `male` or `female`, else empty. */
function normalizeGenderForProfileForm(raw: string | undefined): string {
	const t = normalizeApiString(raw ?? "").toLowerCase();
	if (t === "male" || t === "m" || t === "man") return "male";
	if (t === "female" || t === "f" || t === "woman") return "female";
	return "";
}

function defaultsFromProfile(profile: Record<string, unknown> | null): ProfileForm {
	if (!profile) {
		return {
			full_name: "",
			email: "",
			phone: "",
			gender: "",
			city: "",
			disabilityType: "",
			disabilityCustom: "",
			skills: "",
			certificates: [],
			educations: [],
			experiences: [],
		};
	}
	const first = readText(profile, "first_name");
	const last = readText(profile, "last_name");
	const combined = [first, last].filter(Boolean).join(" ").trim();
	const { disabilityType, disabilityCustom } = disabilityFormFromProfile(profile);
	return {
		full_name: readText(profile, "full_name", "name") || combined,
		email: readText(profile, "email"),
		phone: readText(profile, "phone", "mobile"),
		gender: normalizeGenderForProfileForm(readStringCoerced(profile, "gender", "sex")),
		city: readText(profile, "city", "location"),
		disabilityType,
		disabilityCustom,
		skills: skillsStringFromProfile(profile),
		certificates: certificatesFromProfile(profile),
		educations: educationsFromProfile(profile),
		experiences: experiencesFromProfile(profile),
	};
}

function initialsFromName(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ProfilePageSkeleton() {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
			<Skeleton className="h-40 w-full rounded-3xl" />
			<Skeleton className="h-56 w-full rounded-3xl" />
			<Skeleton className="h-72 w-full rounded-3xl" />
			<Skeleton className="h-48 w-full rounded-3xl" />
		</div>
	);
}

export function JobSeekerProfilePage() {
	const { user, refreshUser } = useAuth();
	const { profile, loading, saveProfile, deleteAccount } = useJobSeekerProfile();
	const [pendingCv, setPendingCv] = useState(false);
	const [pendingPhoto, setPendingPhoto] = useState(false);
	const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

	const form = useForm<ProfileForm>({
		resolver: zodResolver(profileSchema),
		defaultValues: defaultsFromProfile(null),
	});

	const disabilityTypeWatch = form.watch("disabilityType");

	const profileSelectSyncKey = useMemo(() => {
		const d = defaultsFromProfile(profile);
		const stamp =
			profile && typeof profile.updated_at === "string"
				? profile.updated_at
				: profile && (typeof profile.id === "number" || typeof profile.id === "string")
					? String(profile.id)
					: "0";
		return `${stamp}|${d.gender}|${d.disabilityType}|${d.disabilityCustom}`;
	}, [profile]);

	const certArray = useFieldArray({ control: form.control, name: "certificates" });
	const eduArray = useFieldArray({ control: form.control, name: "educations" });
	const expArray = useFieldArray({ control: form.control, name: "experiences" });

	const applyProfileToForm = useCallback(() => {
		setPhotoPreviewUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return null;
		});
		setPendingPhoto(false);
		const next = defaultsFromProfile(profile);
		if (!next.email.trim() && typeof user?.email === "string") {
			next.email = user.email;
		}
		const u = user && typeof user === "object" ? (user as Record<string, unknown>) : null;
		if (!(next.gender ?? "").trim() && u) {
			const g = normalizeGenderForProfileForm(readStringCoerced(u, "gender", "sex"));
			if (g) next.gender = g;
		}
		if (!(next.disabilityType ?? "").trim() && !(next.disabilityCustom ?? "").trim() && u) {
			const d = disabilityFormFromProfile(u);
			if (d.disabilityType || d.disabilityCustom) {
				next.disabilityType = d.disabilityType;
				next.disabilityCustom = d.disabilityCustom;
			}
		}
		form.reset(next);
		const cvEl = document.getElementById("profile-cv") as HTMLInputElement | null;
		if (cvEl) cvEl.value = "";
		setPendingCv(false);
		const photoEl = document.getElementById("profile-photo") as HTMLInputElement | null;
		if (photoEl) photoEl.value = "";
	}, [profile, form, user]);

	useEffect(() => {
		applyProfileToForm();
	}, [applyProfileToForm]);

	useEffect(() => {
		return () => {
			if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
		};
	}, [photoPreviewUrl]);

	const profilePhotoUrl = profile && typeof profile.profile_photo_url === "string" ? profile.profile_photo_url : undefined;
	const displayAvatarSrc = photoPreviewUrl ?? profilePhotoUrl;
	const cvUrl = profile && typeof profile.cv_url === "string" ? profile.cv_url : null;
	const cvFileName = (() => {
		if (!profile || typeof profile.cv_path !== "string") return "Resume";
		const last = profile.cv_path.split("/").pop() ?? "resume";
		try {
			return decodeURIComponent(last);
		} catch {
			return last;
		}
	})();

	const displayName = form.watch("full_name")?.trim() || (typeof user?.name === "string" ? user.name : "") || "Your profile";
	const emailDisplay = form.watch("email")?.trim() || readText(profile, "email") || (typeof user?.email === "string" ? user.email : "");

	return (
		<div className="flex w-full min-w-0 flex-col gap-8 pb-10">
			<section className={cn("relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm", "sm:px-10 sm:py-10")}>
				<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/7 via-transparent to-primary/5" aria-hidden />
				<div className="relative flex flex-col gap-8 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
					<div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center">
						<div className="flex shrink-0 flex-col items-center gap-2 sm:items-start">
							<Avatar className="shrink-0 size-40">
								{displayAvatarSrc ? <AvatarImage src={displayAvatarSrc} alt="" className="object-cover" /> : null}
								<AvatarFallback className="bg-linear-to-br from-primary/15 to-primary/5 text-xl font-semibold text-primary sm:text-2xl">{initialsFromName(displayName)}</AvatarFallback>
							</Avatar>
							<div className="w-full flex justify-center">
								<label htmlFor="profile-photo" className="cursor-pointer text-center text-md underline font-medium text-primary underline-offset-2  sm:text-center">
									Change photo
									<input
										id="profile-photo"
										type="file"
										accept="image/jpeg,image/png,image/webp,image/gif"
										className="sr-only"
										onChange={(e) => {
											const f = e.target.files?.[0];
											setPendingPhoto(!!f);
											setPhotoPreviewUrl((prev) => {
												if (prev) URL.revokeObjectURL(prev);
												return f ? URL.createObjectURL(f) : null;
											});
										}}
									/>
								</label>
							</div>
						</div>

						<div className="min-w-0 space-y-2">
							<p className="text-xs font-semibold tracking-widest text-primary uppercase">Candidate profile</p>
							<h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Profile &amp; resume</h1>
							<p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
								Keep this information current. Employers see a professional snapshot when you apply; your CV can be updated anytime.
							</p>
							{emailDisplay ? <p className="truncate text-sm font-medium text-foreground/90">{emailDisplay}</p> : null}
						</div>
					</div>
					<div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
						<Button asChild variant="outline" size="lg" className="rounded-xl border-border/80">
							<Link to="/seeker/applications">
								<ScrollTextIcon data-icon="inline-start" className="size-4" />
								Applications
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="rounded-xl">
							<Link to="/jobs">
								<BriefcaseIcon data-icon="inline-start" className="size-4" />
								Browse jobs
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{loading ? (
				<ProfilePageSkeleton />
			) : (
				<form
					className="mx-auto flex w-full max-w-7xl flex-col gap-8"
					onSubmit={form.handleSubmit(async (values) => {
						const certsPayload = certificatesToApiPayload(values.certificates);
						const edusPayload = educationsToApiPayload(values.educations);
						const expsPayload = experiencesToApiPayload(values.experiences);

						const fd = new FormData();
						fd.append("full_name", values.full_name);
						fd.append("email", values.email.trim());
						fd.append("phone", values.phone.trim());
						if (values.gender === "male" || values.gender === "female") {
							fd.append("gender", values.gender);
						}
						if (values.city?.trim()) fd.append("city", values.city.trim());
						appendSkillsToFormData(fd, values.skills);
						fd.append("certificates", JSON.stringify(certsPayload));
						fd.append("educations", JSON.stringify(edusPayload));
						fd.append("experiences", JSON.stringify(expsPayload));

						const disability = resolvedDisabilityTypeForApi(values);
						if (disability) fd.append("disability_type", disability);

						const cvInput = document.getElementById("profile-cv") as HTMLInputElement | null;
						const cvFile = cvInput?.files?.[0];
						if (cvFile) fd.append("cv", cvFile, cvFile.name);

						const photoInput = document.getElementById("profile-photo") as HTMLInputElement | null;
						const photoFile = photoInput?.files?.[0];
						if (photoFile) {
							fd.append("profile_photo", photoFile, photoFile.name);
						}

						try {
							const fresh = await saveProfile(fd);
							try {
								await refreshUser();
							} catch {
								/* non-fatal: navbar email may lag until reload */
							}
							if (cvInput) cvInput.value = "";
							setPendingCv(false);
							setPhotoPreviewUrl((prev) => {
								if (prev) URL.revokeObjectURL(prev);
								return null;
							});
							setPendingPhoto(false);
							if (photoInput) photoInput.value = "";
							if (fresh) {
								form.reset(defaultsFromProfile(fresh));
							} else {
								form.reset(values);
							}
						} catch {
							/* toast in hook */
						}
					})}>
					<Alert className="rounded-2xl border-primary/20 bg-primary/5">
						<SparklesIcon className="size-4 text-primary" />
						<AlertTitle className="text-foreground">Saving your profile</AlertTitle>
						<AlertDescription>Updates are sent securely to your account. When you attach a new CV, it replaces the file used for future applications.</AlertDescription>
					</Alert>

					<Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-sm">
						<CardHeader className="border-b border-border/60 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
							<div className="flex items-start gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<UserRoundIcon className="size-5" />
								</div>
								<div className="min-w-0 space-y-1">
									<CardTitle className="text-lg sm:text-xl">About you</CardTitle>
									<CardDescription>Basics recruiters see first—keep your name and contact accurate.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
							<FieldGroup className="gap-6">
								<Controller
									name="full_name"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="profile-name">
												Full name
												<RequiredMark />
											</FieldLabel>
											<FieldContent>
												<Input id="profile-name" className="h-11 rounded-xl border-border/80" autoComplete="name" {...field} />
												<FieldDescription>Use the name you want on applications and emails.</FieldDescription>
												{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
											</FieldContent>
										</Field>
									)}
								/>
								<Controller
									name="email"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="profile-email">
												Email
												<RequiredMark />
											</FieldLabel>
											<FieldContent>
												<Input id="profile-email" type="email" className="h-11 rounded-xl border-border/80" autoComplete="email" inputMode="email" {...field} />
												<FieldDescription>Used for sign-in. Save to apply changes.</FieldDescription>
												{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
											</FieldContent>
										</Field>
									)}
								/>
								<Controller
									name="phone"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="profile-phone">
												Phone
												<RequiredMark />
											</FieldLabel>
											<FieldContent>
												<Input id="profile-phone" type="tel" className="h-11 rounded-xl border-border/80" autoComplete="tel" {...field} />
												<FieldDescription>Include country code if you apply internationally.</FieldDescription>
												{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
											</FieldContent>
										</Field>
									)}
								/>
								<div className="grid gap-6 sm:grid-cols-2">
									<Controller
										name="gender"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor="profile-gender">Gender</FieldLabel>
												<FieldContent>
													<Select
														key={`gender-${profileSelectSyncKey}`}
														onValueChange={field.onChange}
														value={field.value || undefined}>
														<SelectTrigger id="profile-gender" aria-invalid={fieldState.invalid} className="h-11 w-full rounded-xl border-border/80">
															<SelectValue placeholder="Select gender" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="male">Male</SelectItem>
															<SelectItem value="female">Female</SelectItem>
														</SelectContent>
													</Select>
													<FieldDescription>Optional. Stored as male or female on your profile.</FieldDescription>
													{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
												</FieldContent>
											</Field>
										)}
									/>
									<Controller
										name="city"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor="profile-city">City</FieldLabel>
												<FieldContent>
													<div className="relative">
														<MapPinIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
														<Input id="profile-city" className="h-11 rounded-xl border-border/80 pl-10" placeholder="Where you are based" autoComplete="address-level2" {...field} />
													</div>
													{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
												</FieldContent>
											</Field>
										)}
									/>
								</div>
								<Controller
									name="disabilityType"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="profile-disability-type">Disability type</FieldLabel>
											<FieldContent>
												<Select
													key={`disability-${profileSelectSyncKey}`}
													onValueChange={(v) => {
														field.onChange(v);
														if (v !== JOB_SEEKER_DISABILITY_CUSTOM) {
															form.setValue("disabilityCustom", "");
														}
													}}
													value={field.value ? field.value : undefined}>
													<SelectTrigger id="profile-disability-type" aria-invalid={fieldState.invalid} className="h-11 w-full rounded-xl border-border/80">
														<SelectValue placeholder="Select an option" />
													</SelectTrigger>
													<SelectContent>
														{JOB_SEEKER_DISABILITY_OPTIONS.map((opt) => (
															<SelectItem key={opt.value} value={opt.value}>
																{opt.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FieldDescription>You can update this anytime; it is stored on your account as text.</FieldDescription>
												{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
											</FieldContent>
										</Field>
									)}
								/>
								{disabilityTypeWatch === JOB_SEEKER_DISABILITY_CUSTOM ? (
									<Controller
										name="disabilityCustom"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor="profile-disability-custom">
													Describe disability type
													<RequiredMark />
												</FieldLabel>
												<FieldContent>
													<Input id="profile-disability-custom" className="h-11 rounded-xl border-border/80" placeholder="e.g. Low vision, wheelchair user…" {...field} />
													{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
												</FieldContent>
											</Field>
										)}
									/>
								) : null}
							</FieldGroup>
						</CardContent>
					</Card>

					<Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-sm">
						<CardHeader className="border-b border-border/60 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
							<div className="flex items-start gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<LayoutListIcon className="size-5" />
								</div>
								<div className="min-w-0 space-y-1">
									<CardTitle className="text-lg sm:text-xl">Professional profile</CardTitle>
									<CardDescription>Use the tabs to edit skills, certificates, education, and experience—hiring teams see this before they open your CV.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="px-6 py-7 sm:px-8 sm:py-8">
							<Tabs defaultValue="skills" className="w-full">
								<TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
									<TabsTrigger value="skills" className="w-full">
										Skills
									</TabsTrigger>
									<TabsTrigger value="certificates" className="w-full">
										Certificates
									</TabsTrigger>
									<TabsTrigger value="education" className="w-full">
										Education
									</TabsTrigger>
									<TabsTrigger value="experience" className="w-full">
										Experience
									</TabsTrigger>
								</TabsList>
								<TabsContent value="skills" className="mt-6">
									<FieldGroup className="gap-6">
										<Controller
											name="skills"
											control={form.control}
											render={({ field, fieldState }) => (
												<Field data-invalid={fieldState.invalid}>
													<FieldLabel htmlFor="profile-skills">Skills</FieldLabel>
													<FieldContent>
														<SkillsTagsInput
															id="profile-skills"
															value={field.value ?? ""}
															onChange={field.onChange}
															onBlur={field.onBlur}
															disabled={form.formState.isSubmitting}
															invalid={fieldState.invalid}
															placeholder="e.g. React — Enter or comma to add each skill"
														/>
														<FieldDescription>Up to {MAX_SKILLS_TAGS} skills. Tags and the server both use a list (not a single comma string).</FieldDescription>
														{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
													</FieldContent>
												</Field>
											)}
										/>
									</FieldGroup>
								</TabsContent>
								<TabsContent value="certificates" className="mt-6">
									<div className="space-y-4">
										<div className="flex flex-wrap items-end justify-between gap-2">
											<div>
												<p className="text-sm font-semibold text-foreground">Certificates</p>
												<FieldDescription>Add each credential with name, issuer, and dates.</FieldDescription>
											</div>
											<Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => certArray.append(emptyCertificateRow())}>
												<PlusIcon className="size-4" data-icon="inline-start" />
												Add certificate
											</Button>
										</div>
										{certArray.fields.length === 0 ? (
											<p className="text-sm text-muted-foreground">No certificates yet. Use &quot;Add certificate&quot; to add one.</p>
										) : (
											<div className="space-y-4">
												{certArray.fields.map((fa, index) => (
													<div key={fa.id} className="space-y-4 rounded-2xl border border-border/70 bg-muted/15 p-4 sm:p-5">
														<div className="flex items-center justify-between gap-2">
															<span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Certificate {index + 1}</span>
															<Button
																type="button"
																variant="ghost"
																size="icon-sm"
																className="shrink-0 text-muted-foreground hover:text-destructive"
																aria-label="Remove certificate"
																onClick={() => certArray.remove(index)}>
																<Trash2Icon className="size-4" />
															</Button>
														</div>
														<div className="grid gap-4 sm:grid-cols-2">
															<Controller
																name={`certificates.${index}.name`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Name</FieldLabel>
																		<FieldContent>
																			<Input className="h-11 rounded-xl border-border/80" placeholder="e.g. AWS Certified Developer" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
															<Controller
																name={`certificates.${index}.issuer`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Issuer</FieldLabel>
																		<FieldContent>
																			<Input className="h-11 rounded-xl border-border/80" placeholder="Issuing organization" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
															<Controller
																name={`certificates.${index}.issued_at`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Issued on</FieldLabel>
																		<FieldContent>
																			<Input type="date" className="h-11 rounded-xl border-border/80" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
															<Controller
																name={`certificates.${index}.credential_url`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Credential URL</FieldLabel>
																		<FieldContent>
																			<Input type="url" className="h-11 rounded-xl border-border/80" placeholder="https://…" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</TabsContent>
								<TabsContent value="education" className="mt-6">
									<div className="space-y-4">
										<div className="flex flex-wrap items-end justify-between gap-2">
											<div>
												<p className="text-sm font-semibold text-foreground">Education</p>
												<FieldDescription>Degrees and programs (institution, field, dates).</FieldDescription>
											</div>
											<Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => eduArray.append(emptyEducationRow())}>
												<PlusIcon className="size-4" data-icon="inline-start" />
												Add education
											</Button>
										</div>
										{eduArray.fields.length === 0 ? (
											<p className="text-sm text-muted-foreground">No education entries yet.</p>
										) : (
											<div className="space-y-4">
												{eduArray.fields.map((fa, index) => (
													<div key={fa.id} className="space-y-4 rounded-2xl border border-border/70 bg-muted/15 p-4 sm:p-5">
														<div className="flex items-center justify-between gap-2">
															<span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Education {index + 1}</span>
															<Button
																type="button"
																variant="ghost"
																size="icon-sm"
																className="shrink-0 text-muted-foreground hover:text-destructive"
																aria-label="Remove education"
																onClick={() => eduArray.remove(index)}>
																<Trash2Icon className="size-4" />
															</Button>
														</div>
														<div className="grid gap-4 sm:grid-cols-2">
															<Controller
																name={`educations.${index}.institution`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid} className="sm:col-span-2">
																		<FieldLabel>Institution</FieldLabel>
																		<FieldContent>
																			<Input className="h-11 rounded-xl border-border/80" placeholder="University or school" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
															<Controller
																name={`educations.${index}.degree`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Degree</FieldLabel>
																		<FieldContent>
																			<Input className="h-11 rounded-xl border-border/80" placeholder="e.g. BSc" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
															<Controller
																name={`educations.${index}.field_of_study`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Field of study</FieldLabel>
																		<FieldContent>
																			<Input className="h-11 rounded-xl border-border/80" placeholder="e.g. Computer Science" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
															<Controller
																name={`educations.${index}.starts_at`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Starts</FieldLabel>
																		<FieldContent>
																			<Input type="date" className="h-11 rounded-xl border-border/80" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
															<Controller
																name={`educations.${index}.ends_at`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Ends</FieldLabel>
																		<FieldContent>
																			<Input type="date" className="h-11 rounded-xl border-border/80" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
														</div>
														<Controller
															name={`educations.${index}.details`}
															control={form.control}
															render={({ field, fieldState }) => (
																<Field data-invalid={fieldState.invalid}>
																	<FieldLabel>Details (optional)</FieldLabel>
																	<FieldContent>
																		<Textarea rows={3} className="min-h-20 resize-y rounded-xl border-border/80" placeholder="Honors, coursework, GPA…" {...field} value={field.value ?? ""} />
																		{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																	</FieldContent>
																</Field>
															)}
														/>
													</div>
												))}
											</div>
										)}
									</div>
								</TabsContent>
								<TabsContent value="experience" className="mt-6">
									<div className="space-y-4">
										<div className="flex flex-wrap items-end justify-between gap-2">
											<div>
												<p className="text-sm font-semibold text-foreground">Experience</p>
												<FieldDescription>Roles and employers (matches your résumé timeline).</FieldDescription>
											</div>
											<Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => expArray.append(emptyExperienceRow())}>
												<PlusIcon className="size-4" data-icon="inline-start" />
												Add role
											</Button>
										</div>
										{expArray.fields.length === 0 ? (
											<p className="text-sm text-muted-foreground">No roles yet. Add your work history.</p>
										) : (
											<div className="space-y-4">
												{expArray.fields.map((fa, index) => (
													<div key={fa.id} className="space-y-4 rounded-2xl border border-border/70 bg-muted/15 p-4 sm:p-5">
														<div className="flex items-center justify-between gap-2">
															<span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
																<BriefcaseIcon className="size-3.5" />
																Role {index + 1}
															</span>
															<Button
																type="button"
																variant="ghost"
																size="icon-sm"
																className="shrink-0 text-muted-foreground hover:text-destructive"
																aria-label="Remove role"
																onClick={() => expArray.remove(index)}>
																<Trash2Icon className="size-4" />
															</Button>
														</div>
														<div className="grid gap-4 sm:grid-cols-2">
															<Controller
																name={`experiences.${index}.company_name`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Company</FieldLabel>
																		<FieldContent>
																			<Input className="h-11 rounded-xl border-border/80" placeholder="Employer name" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
															<Controller
																name={`experiences.${index}.title`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Job title</FieldLabel>
																		<FieldContent>
																			<Input className="h-11 rounded-xl border-border/80" placeholder="Your role" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
															<Controller
																name={`experiences.${index}.starts_at`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Starts</FieldLabel>
																		<FieldContent>
																			<Input type="date" className="h-11 rounded-xl border-border/80" {...field} value={field.value ?? ""} />
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
															<Controller
																name={`experiences.${index}.ends_at`}
																control={form.control}
																render={({ field, fieldState }) => (
																	<Field data-invalid={fieldState.invalid}>
																		<FieldLabel>Ends</FieldLabel>
																		<FieldContent>
																			<Input type="date" className="h-11 rounded-xl border-border/80" {...field} value={field.value ?? ""} />
																			<FieldDescription>Leave empty if this is your current role.</FieldDescription>
																			{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																		</FieldContent>
																	</Field>
																)}
															/>
														</div>
														<Controller
															name={`experiences.${index}.description`}
															control={form.control}
															render={({ field, fieldState }) => (
																<Field data-invalid={fieldState.invalid}>
																	<FieldLabel>Description</FieldLabel>
																	<FieldContent>
																		<Textarea rows={4} className="min-h-24 resize-y rounded-xl border-border/80" placeholder="Responsibilities, stack, impact…" {...field} value={field.value ?? ""} />
																		{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
																	</FieldContent>
																</Field>
															)}
														/>
													</div>
												))}
											</div>
										)}
									</div>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>

					<Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-sm">
						<CardHeader className="border-b border-border/60 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
							<div className="flex items-start gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<FileTextIcon className="size-5" />
								</div>
								<div className="min-w-0 space-y-1">
									<CardTitle className="text-lg sm:text-xl">Resume file</CardTitle>
									<CardDescription>PDF or Word. You can upload now or later—only a new file is sent when you choose one.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="px-6 py-7 sm:px-8 sm:py-8">
							<Field>
								<FieldLabel htmlFor="profile-cv" className="sr-only">
									CV upload
								</FieldLabel>
								<FieldContent>
									<Input id="profile-cv" type="file" accept=".pdf,.doc,.docx,application/pdf" className="sr-only" onChange={(e) => setPendingCv(!!e.target.files?.length)} />
									{cvUrl ? (
										<div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
											<a
												href={cvUrl}
												target="_blank"
												rel="noopener noreferrer"
												className={cn(
													"group flex min-h-44 min-w-0 flex-1 flex-col items-center justify-center gap-5 rounded-2xl border-2 border-border/70 bg-muted/25 px-8 py-10 text-center shadow-sm transition-colors",
													"hover:border-primary/40 hover:bg-muted/40 sm:flex-row sm:text-left",
												)}>
												<div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-red-600/12 text-red-600 shadow-inner ring-1 ring-red-600/15 sm:size-28">
													<FileTextIcon className="size-14 sm:size-16" strokeWidth={1.75} aria-hidden />
												</div>
												<div className="min-w-0 space-y-2">
													<p className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Current CV</p>
													<p className="line-clamp-2 break-all text-sm text-muted-foreground sm:text-base">{cvFileName}</p>
													<p className="text-sm font-medium text-primary underline-offset-4 group-hover:underline">Open in new tab</p>
												</div>
											</a>
											<div className="flex shrink-0 flex-col justify-center gap-3 lg:w-56">
												<Button type="button" variant="default" size="lg" className="h-12 w-full rounded-xl font-semibold shadow-sm" onClick={() => document.getElementById("profile-cv")?.click()}>
													<UploadIcon className="size-4 shrink-0" data-icon="inline-start" />
													Upload new CV
												</Button>
												<p className="text-center text-xs leading-relaxed text-muted-foreground lg:text-left">PDF, DOC, or DOCX. Replaces your file after you save.</p>
											</div>
										</div>
									) : (
										<>
											<label
												htmlFor="profile-cv"
												className={cn(
													"flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center transition-colors",
													"hover:border-primary/35 hover:bg-muted/35",
													"focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/50",
												)}>
												<span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
													<UploadIcon className="size-6" />
												</span>
												<span className="text-sm font-medium text-foreground">Drop your CV here or click to browse</span>
												<span className="max-w-sm text-xs text-muted-foreground">
													PDF, DOC, or DOCX. Sent as <code className="rounded bg-muted px-1 font-mono text-[10px]">cv</code> when you save.
												</span>
											</label>
											<p className="mt-4 text-center text-xs text-muted-foreground sm:text-left">No CV on file yet.</p>
										</>
									)}
								</FieldContent>
							</Field>
						</CardContent>
					</Card>

					<DeleteAccountSection
						accountLabel="job seeker account"
						onDelete={deleteAccount}
						className="mb-2"
					/>

					<div
						className={cn(
							"sticky bottom-0 z-10 flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-lg backdrop-blur-md",
							"sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4",
						)}>
						<div className="min-w-0 space-y-1">
							<p className="text-sm font-medium text-foreground">
								{form.formState.isSubmitting ? "Saving your changes…" : form.formState.isDirty || pendingCv || pendingPhoto ? "You have unsaved changes" : "Profile is up to date"}
							</p>
							<p className="text-xs text-muted-foreground">
								{form.formState.isSubmitting ? "" : form.formState.isDirty || pendingCv || pendingPhoto ? "Save to sync with your account." : "Edit any section above, change photo or CV, then save."}
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2 sm:justify-end">
							<Button
								type="button"
								variant="outline"
								className="rounded-xl"
								disabled={!profile || (!form.formState.isDirty && !pendingCv && !pendingPhoto) || form.formState.isSubmitting}
								onClick={() => applyProfileToForm()}>
								<RotateCcwIcon data-icon="inline-start" className="size-4" />
								Reset
							</Button>
							<Button type="submit" size="lg" className="min-w-38 gap-2 rounded-xl font-semibold" disabled={form.formState.isSubmitting || (!form.formState.isDirty && !pendingCv && !pendingPhoto)}>
								{form.formState.isSubmitting ? (
									<>
										<Spinner className="size-4" />
										Saving…
									</>
								) : (
									"Save profile"
								)}
							</Button>
						</div>
					</div>
				</form>
			)}
		</div>
	);
}
