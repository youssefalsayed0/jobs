import { useMemo } from "react"

import { CompaniesSection } from "@/components/home/CompaniesSection"
import { HeroSection } from "@/components/home/HeroSection"
import { JobsSection } from "@/components/home/JobsSection"
import type { Company } from "@/components/home/CompanyCard"
import { Spinner } from "@/components/ui/spinner"
import { usePublicJobPostings } from "@/hooks/job-seeker/usePublicJobPostings"
import { mapPostingToJobCard } from "@/lib/map-public-job-card"

const featuredCompanies: Company[] = [
  { id: "1", name: "TechSolutions", jobsCount: 47 },
  { id: "2", name: "Inclusive Corp", jobsCount: 23 },
  { id: "3", name: "Creative Media", jobsCount: 12 },
]

export function HomePage() {
  const { jobs, loading } = usePublicJobPostings()
  const jobCards = useMemo(() => jobs.map(mapPostingToJobCard), [jobs])
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
      <CompaniesSection companies={featuredCompanies} />
    </div>
  )
}
