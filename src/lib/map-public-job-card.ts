import type { Job } from "@/components/home/JobCard"
import type { CompanyJobPosting } from "@/types/company-jobs"

export function mapPostingToJobCard(job: CompanyJobPosting): Job {
  const type = job.type?.trim()
  return {
    id: String(job.id),
    title: job.title?.trim() || "Open role",
    company: job.company_name?.trim() || "Hiring company",
    location: job.location?.trim() || "—",
    tags: type ? [type] : [],
    skills: [],
    createdAt:
      typeof job.created_at === "string" && job.created_at.trim() !== ""
        ? job.created_at
        : undefined,
  }
}
