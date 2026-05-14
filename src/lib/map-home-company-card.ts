import type { Company } from "@/components/home/CompanyCard"
import type { PublicCompany } from "@/lib/public-companies-parse"

export function mapPublicCompanyToFeaturedCard(c: PublicCompany): Company {
  const count =
    typeof c.job_postings_count === "number" ? c.job_postings_count : 0
  const logo = c.profile_photo_url?.trim()
  return {
    id: String(c.id),
    name: c.company_name,
    ...(logo ? { logo } : {}),
    jobsCount: count,
  }
}
