import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import { parseJobResponse } from "@/lib/company-jobs-parse"
import {
  jobPostingFormDefaults,
  jobPostingToFormValues,
  type JobPostingFormValues,
} from "@/lib/validations/company-job"

export type JobPostingEditorPhase = "idle" | "loading" | "ready"

export function useJobPostingEditor(
  open: boolean,
  mode: "create" | "edit",
  jobId: string | null
) {
  const { get } = useApi()
  const [phase, setPhase] = useState<JobPostingEditorPhase>("idle")
  const [formValues, setFormValues] = useState<JobPostingFormValues>(
    jobPostingFormDefaults
  )

  useEffect(() => {
    if (!open) {
      setPhase("idle")
      return
    }

    let cancelled = false

    if (mode === "create" || !jobId) {
      setPhase("ready")
      setFormValues(jobPostingFormDefaults)
      return
    }

    setPhase("loading")

    void (async () => {
      try {
        const json = await get(`/api/company/job-postings/${jobId}`)
        if (cancelled) return
        const job = parseJobResponse(json)
        if (!job) {
          toast.error("Could not load this job.")
          setFormValues(jobPostingFormDefaults)
          setPhase("ready")
          return
        }
        setFormValues(jobPostingToFormValues(job))
        setPhase("ready")
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load job"
        toast.error(message)
        setFormValues(jobPostingFormDefaults)
        setPhase("ready")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, mode, jobId, get])

  const activePhase: JobPostingEditorPhase = open ? phase : "idle"

  return { editorPhase: activePhase, formValues }
}
