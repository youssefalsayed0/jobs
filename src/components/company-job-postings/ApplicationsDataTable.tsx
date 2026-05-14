import { ExternalLinkIcon, FileTextIcon, UserRoundIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { JobApplicationRow } from "@/types/company-jobs";
import { COMPANY_APPLICATION_STATUS_VALUES, normalizeCompanyApplicationStatus } from "@/types/company-jobs";

export type ApplicationsTableRow = JobApplicationRow & {
	jobId?: string;
	jobTitle?: string;
};

function displayJobTitle(row: ApplicationsTableRow): string {
	return row.job_title?.trim() || row.jobTitle?.trim() || "—";
}

function applicantLabelForDialog(row: ApplicationsTableRow): string {
	const email = row.email?.trim();
	if (email) return email;
	const phone = row.phone?.trim();
	if (phone) return phone;
	return "Applicant";
}

function statusLabel(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

type ApplicationsDataTableProps = {
	rows: ApplicationsTableRow[];
	loading: boolean;
	/** Show Job ID + Job title columns (all-jobs applicants view). */
	showJobColumns: boolean;
	emptyMessage?: string;
	isRowUpdating: (row: ApplicationsTableRow) => boolean;
	onStatusChange: (row: ApplicationsTableRow, status: string) => void;
	className?: string;
};

export function ApplicationsDataTable({ rows, loading, showJobColumns, emptyMessage = "No applications for this listing yet.", isRowUpdating, onStatusChange, className }: ApplicationsDataTableProps) {
	const [pendingStatus, setPendingStatus] = useState<{
		row: ApplicationsTableRow;
		nextStatus: string;
	} | null>(null);

	if (loading) {
		return (
			<div className={cn("space-y-2", className)}>
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-10 w-full rounded-md" />
				))}
			</div>
		);
	}

	if (rows.length === 0) {
		return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
	}

	const pendingRow = pendingStatus?.row ?? null;
	const pendingNext = pendingStatus?.nextStatus ?? "";
	const pendingFrom = pendingRow ? statusLabel(normalizeCompanyApplicationStatus(pendingRow.status)) : "";
	const pendingTo = pendingNext ? statusLabel(pendingNext) : "";
	const confirmDisabled = pendingRow != null && isRowUpdating(pendingRow);

	return (
		<>
			<div className={cn("relative w-full overflow-x-auto rounded-xl border border-border/70 bg-white", className)}>
				<table className="w-full min-w-[980px] border-collapse text-left text-sm">
					<thead>
						<tr className="border-b border-border/60 bg-muted/40">
							{showJobColumns ? (
								<>
									<th className="whitespace-nowrap px-3 py-3 font-medium text-muted-foreground sm:px-4">Job ID</th>
									<th className="min-w-[8rem] whitespace-nowrap px-3 py-3 font-medium text-muted-foreground sm:px-4">Job Title</th>
								</>
							) : null}
							<th className="whitespace-nowrap px-3 py-3 font-medium text-muted-foreground sm:px-4">Index</th>
							<th className="min-w-[8.5rem] whitespace-nowrap px-3 py-3 font-medium text-muted-foreground sm:px-4">Status</th>
							<th className="min-w-[10rem] whitespace-nowrap px-3 py-3 font-medium text-muted-foreground sm:px-4">Submitted</th>
							{!showJobColumns ? <th className="min-w-[8rem] whitespace-nowrap px-3 py-3 font-medium text-muted-foreground sm:px-4">Job title</th> : null}
							<th className="min-w-[7rem] whitespace-nowrap px-3 py-3 font-medium text-muted-foreground sm:px-4">Phone</th>
							<th className="min-w-[10rem] whitespace-nowrap px-3 py-3 font-medium text-muted-foreground sm:px-4">Email</th>
							<th className="min-w-[6rem] whitespace-nowrap px-3 py-3 font-medium text-muted-foreground sm:px-4">Gender</th>
							<th className="min-w-[8rem] whitespace-nowrap px-3 py-3 font-medium text-muted-foreground sm:px-4">CV</th>
							<th className="min-w-[7.5rem] whitespace-nowrap px-3 py-3 font-medium text-muted-foreground sm:px-4">Profile</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => {
							const selectValue = normalizeCompanyApplicationStatus(row.status);
							const email = row.email?.trim();
							const phone = row.phone?.trim();
							const gender = row.gender?.trim();
							const cvUrl = typeof row.cv_url === "string" && row.cv_url.trim() !== "" ? row.cv_url.trim() : null;
							const cv = row.cv != null && String(row.cv).trim() !== "" ? String(row.cv).trim() : null;
							const userId =
								row.user_id != null && String(row.user_id).trim() !== ""
									? String(row.user_id).trim()
									: null;

							return (
								<tr key={showJobColumns && row.jobId ? `${row.jobId}-${row.id}` : String(row.id)} className="border-b border-border/40 last:border-b-0 even:bg-muted/10">
									{showJobColumns ? (
										<>
											<td className="px-3 py-2.5 font-mono text-xs text-foreground sm:px-4">{row.jobId ?? "—"}</td>
											<td className="wrap-break-word px-3 py-2.5 text-foreground sm:px-4">{row.jobTitle?.trim() || "—"}</td>
										</>
									) : null}
									<td className="px-3 py-2.5 font-mono text-xs text-foreground sm:px-4">{String(row.id)}</td>
									<td className="px-3 py-2.5 sm:px-4">
										<Select
											value={selectValue}
											onValueChange={(v) => {
												if (v === selectValue) return;
												setPendingStatus({ row, nextStatus: v });
											}}
											disabled={isRowUpdating(row)}>
											<SelectTrigger className="h-9 w-full min-w-[7.5rem] rounded-lg text-xs">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													{COMPANY_APPLICATION_STATUS_VALUES.map((s) => (
														<SelectItem key={s} value={s}>
															{statusLabel(s)}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
									</td>
									<td className="wrap-break-word px-3 py-2.5 text-muted-foreground sm:px-4">{row.submitted_at?.trim() || "—"}</td>
									{!showJobColumns ? <td className="wrap-break-word px-3 py-2.5 text-foreground sm:px-4">{displayJobTitle(row)}</td> : null}
									<td className="wrap-break-word px-3 py-2.5 sm:px-4">
										{phone ? (
											<a className="text-primary underline-offset-2 hover:underline" href={`tel:${phone.replace(/\s/g, "")}`}>
												{phone}
											</a>
										) : (
											"—"
										)}
									</td>
									<td className="wrap-break-word px-3 py-2.5 sm:px-4">
										{email ? (
											<a className="text-primary underline-offset-2 hover:underline" href={`mailto:${email}`}>
												{email}
											</a>
										) : (
											"—"
										)}
									</td>
									<td className="wrap-break-word px-3 py-2.5 capitalize text-foreground sm:px-4">{gender || "—"}</td>
									<td className="wrap-break-word px-3 py-2.5 sm:px-4">
										{cvUrl ? (
											<a className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline" href={cvUrl} target="_blank" rel="noopener noreferrer">
												<FileTextIcon className="size-3.5 shrink-0" />
												<span>Open CV</span>
												<ExternalLinkIcon className="size-3 shrink-0 opacity-70" />
											</a>
										) : cv ? (
											<span className="font-mono text-xs text-foreground">{cv}</span>
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</td>
									<td className="px-3 py-2.5 sm:px-4">
										{userId ? (
											<Link
												className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline"
												to={`/company/applicants/users/${encodeURIComponent(userId)}`}>
												<UserRoundIcon className="size-3.5 shrink-0" />
												View
											</Link>
										) : (
											<span className="text-muted-foreground" title="Applicant user id not in API response">
												—
											</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<AlertDialog
				open={pendingStatus != null}
				onOpenChange={(open) => {
					if (!open) setPendingStatus(null);
				}}>
				<AlertDialogContent className="gap-2 rounded-2xl border-border/70 p-6 sm:max-w-md">
					<AlertDialogHeader className="space-y-2 text-left">
						<AlertDialogTitle className="font-heading text-lg sm:text-xl">Update application status?</AlertDialogTitle>
						<AlertDialogDescription className="text-left text-sm leading-relaxed sm:text-[0.9375rem]">
							{pendingRow ? (
								<>
									<span className="font-medium text-foreground">{applicantLabelForDialog(pendingRow)}</span>
									{` (application #${String(pendingRow.id)}) will be set to `}
									<span className="font-medium text-foreground">{pendingTo}</span>
									{pendingFrom ? (
										<>
											{`, from `}
											<span className="font-medium text-foreground">{pendingFrom}</span>.
										</>
									) : (
										"."
									)}
								</>
							) : null}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-2 gap-2 sm:justify-end">
						<AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="rounded-xl"
							disabled={confirmDisabled}
							onClick={() => {
								if (!pendingStatus) return;
								onStatusChange(pendingStatus.row, pendingStatus.nextStatus);
								setPendingStatus(null);
							}}>
							Update status
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
