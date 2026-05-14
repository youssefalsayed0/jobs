import type { Job } from "@/components/home/JobCard"
import type { CompanyJobPosting } from "@/types/company-jobs"

export function mapPostingToJobCard(job: CompanyJobPosting): Job {
  const type = job.type?.trim()
  const approved = job.approved_disability?.filter(Boolean) ?? []
  const logoRaw = job.company_profile_photo_url
  const companyLogo =
    typeof logoRaw === "string" && logoRaw.trim() !== ""
      ? logoRaw.trim()
      : undefined
  return {
    id: String(job.id),
    title: job.title?.trim() || "Open role",
    company: job.company_name?.trim() || "Hiring company",
    companyLogo,
    location: job.location?.trim() || "—",
    tags: type ? [type] : [],
    skills: [],
    approvedDisabilities: approved.length > 0 ? approved : undefined,
    createdAt:
      typeof job.created_at === "string" && job.created_at.trim() !== ""
        ? job.created_at
        : undefined,
  }
}
