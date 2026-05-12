import { ApplicationsDataTable } from "@/components/company-job-postings/ApplicationsDataTable"
import { useCompanyApplicantsAggregate } from "@/hooks/company/useCompanyApplicantsAggregate"

export function CompanyApplicantsPage() {
  const { rows, loading, updateStatus, isUpdating } =
    useCompanyApplicantsAggregate()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applicants</h1>
        <p className="text-sm text-muted-foreground">
          All applications across your job postings.
        </p>
      </div>

      <ApplicationsDataTable
        rows={rows}
        loading={loading}
        showJobColumns
        emptyMessage="No applications yet."
        isRowUpdating={(r) =>
          r.jobId != null && isUpdating(r.jobId, r.id)
        }
        onStatusChange={(r, status) => {
          if (r.jobId == null) return
          void updateStatus(r.jobId, r.id, status)
        }}
      />
    </div>
  )
}
