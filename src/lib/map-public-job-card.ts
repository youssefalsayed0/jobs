import type { Job } from "@/components/home/JobCard"
import type { CompanyJobPosting } from "@/types/company-jobs"

export function mapPostingToJobCard(job: CompanyJobPosting): Job {
  const type = job.type?.trim()
  const category = job.category?.trim()
  const tags: string[] = []
  if (category) tags.push(category)
  if (type) tags.push(type)
  const approved = job.approved_disability?.filter(Boolean) ?? []
  const skills = (job.skills ?? []).filter(Boolean)
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
    tags,
    skills,
    approvedDisabilities: approved.length > 0 ? approved : undefined,
    createdAt:
      typeof job.created_at === "string" && job.created_at.trim() !== ""
        ? job.created_at
        : undefined,
  }
}
