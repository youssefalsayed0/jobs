import { Image as ImageIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Card, CardContent } from "@/components/ui/card"

export type Company = {
  id: string
  name: string
  logo?: string
  jobsCount: number
}

type CompanyCardProps = {
  company: Company
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link to={`/companies/${company.id}`}>
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm transition hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="size-14 rounded-lg object-contain"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-lg bg-slate-100">
              <ImageIcon className="size-7 text-slate-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{company.name}</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              {company.jobsCount}+ jobs
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
