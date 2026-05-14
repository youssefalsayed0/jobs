import { useMemo } from "react"

import { CompaniesSection } from "@/components/home/CompaniesSection"
import { HeroSection } from "@/components/home/HeroSection"
import { JobsSection } from "@/components/home/JobsSection"
import { Spinner } from "@/components/ui/spinner"
import {
  usePublicCompanies,
  type UsePublicCompaniesParams,
} from "@/hooks/job-seeker/usePublicCompanies"
import { usePublicJobPostings } from "@/hooks/job-seeker/usePublicJobPostings"
import { mapPublicCompanyToFeaturedCard } from "@/lib/map-home-company-card"
import { mapPostingToJobCard } from "@/lib/map-public-job-card"

const HOME_FEATURED_COMPANIES_QUERY = {
  perPage: 80,
  maxTotal: 500,
} satisfies UsePublicCompaniesParams

export function HomePage() {
  const { jobs, loading } = usePublicJobPostings()
  const { companies: featuredRows, loading: companiesLoading } =
    usePublicCompanies(HOME_FEATURED_COMPANIES_QUERY)
  const jobCards = useMemo(() => jobs.map(mapPostingToJobCard), [jobs])
  const featuredCompanies = useMemo(
    () => featuredRows.map(mapPublicCompanyToFeaturedCard),
    [featuredRows],
  )
  const firstSlice = jobCards.slice(0, 6)
  const secondSlice = jobCards.slice(6, 12)

  const handleSearch = (query: string, filters: string[]) => {
    console.info("Search", { query, filters })
  }

  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <HeroSection onSearch={handleSearch} />
      {loading ? (
        <div className="flex justify-center bg-card py-20">
          <Spinner className="size-10 text-primary" />
        </div>
      ) : (
        <>
          <JobsSection title="Open positions" jobs={firstSlice} />
          {secondSlice.length > 0 ? (
            <JobsSection title="More opportunities" jobs={secondSlice} />
          ) : null}
        </>
      )}
      {companiesLoading ? (
        <div className="flex justify-center bg-slate-50 py-16">
          <Spinner className="size-10 text-primary" />
        </div>
      ) : featuredCompanies.length > 0 ? (
        <CompaniesSection companies={featuredCompanies} />
      ) : null}
    </div>
  )
}
