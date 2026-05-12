import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useJobApplicationsForJob } from "@/hooks/company/useJobApplicationsForJob"

import { ApplicationsDataTable } from "./ApplicationsDataTable"

type JobPostingApplicationsSectionProps = {
  jobId: string
  jobTitle?: string
}

export function JobPostingApplicationsSection({
  jobId,
  jobTitle,
}: JobPostingApplicationsSectionProps) {
  const { rows, loading, updatingId, updateStatus } = useJobApplicationsForJob(
    jobId,
    true
  )

  const rowsWithTitle = rows.map((r) => ({
    ...r,
    job_title: r.job_title?.trim() || jobTitle?.trim(),
  }))

  return (
    <Card
      id="applications"
      className="overflow-hidden scroll-mt-24 rounded-2xl border-border/70 shadow-sm"
    >
      <CardHeader className="border-b border-border/60 bg-muted/20 px-6 py-5 sm:px-8 sm:py-6">
        <CardTitle className="text-lg sm:text-xl">Applications</CardTitle>
        <CardDescription>
          Candidates who applied to this role. Update status from the table;
          changes sync with your API.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 sm:pt-6">
        <ApplicationsDataTable
          rows={rowsWithTitle}
          loading={loading}
          showJobColumns={false}
          isRowUpdating={(r) => updatingId === r.id}
          onStatusChange={(r, status) => {
            void updateStatus(r.id, status)
          }}
        />
      </CardContent>
    </Card>
  )
}
