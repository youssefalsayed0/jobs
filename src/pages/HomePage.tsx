import { useNavigate } from "react-router-dom"

import { useAuth } from "@/contexts/auth-context"
import { CompaniesSection } from "@/components/home/CompaniesSection"
import { HeroSection } from "@/components/home/HeroSection"
import { JobsSection } from "@/components/home/JobsSection"
import { Navbar } from "@/components/layout/Navbar"
import type { Job } from "@/components/home/JobCard"
import type { Company } from "@/components/home/CompanyCard"

const recommendedJobs: Job[] = [
  {
    id: "1",
    title: "Remote Web Developer",
    company: "TechSolutions",
    location: "Remote",
    tags: ["Accessible"],
    skills: ["JavaScript", "Java", "HTML"],
  },
  {
    id: "2",
    title: "HR Specialist",
    company: "Inclusive Corp",
    location: "Hybrid",
    tags: ["Accessible", "JDXL", "AVC"],
    skills: ["JavaScript", "S"],
  },
  {
    id: "3",
    title: "Graphic Designer",
    company: "Creative Media",
    location: "Remote",
    tags: ["Accessible"],
    skills: ["Photoshop", "Illustrator"],
  },
]

const featuredCompanies: Company[] = [
  { id: "1", name: "TechSolutions", jobsCount: 47 },
  { id: "2", name: "Inclusive Corp", jobsCount: 23 },
  { id: "3", name: "Creative Media", jobsCount: 12 },
]

export function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSearch = (query: string, filters: string[]) => {
    console.info("Search", { query, filters })
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-svh bg-slate-50">
      <Navbar 
        isLoggedIn={!!user}
        userName={user?.name as string}
        userEmail={user?.email as string}
        onLogout={handleLogout}
      />
 
      <HeroSection onSearch={handleSearch} />
      <JobsSection title="Recommended Jobs" jobs={recommendedJobs} />
      <JobsSection title="More Opportunities" jobs={recommendedJobs} />
      <CompaniesSection companies={featuredCompanies} />
    </div>
  )
}
