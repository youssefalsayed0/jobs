import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"
import {
  extractJobPostingsPaginationMeta,
  type JobPostingsPaginationMeta,
} from "@/lib/company-jobs-parse"
import {
  parsePublicCompaniesList,
  type PublicCompany,
} from "@/lib/public-companies-parse"

function defaultMetaFromRowCount(rowCount: number): JobPostingsPaginationMeta {
  return {
    current_page: 1,
    last_page: 1,
    per_page: rowCount,
    total: rowCount,
    from: rowCount > 0 ? 1 : null,
    to: rowCount > 0 ? rowCount : null,
  }
}

export type UsePublicCompaniesParams = {
  page?: number
  /** Passed as `per_page` when the API supports it. */
  perPage?: number
  /**
   * When set, loads companies from page 1 onward until this many are collected or
   * pagination ends (avoids huge single responses if the backend caps `per_page`).
   */
  maxTotal?: number
}

const MAX_AGGREGATE_PAGES = 40

function buildCompaniesQuery(page: number, perPage?: number) {
  const qs = new URLSearchParams({ page: String(Math.max(1, page)) })
  if (typeof perPage === "number" && perPage > 0) {
    qs.set("per_page", String(perPage))
  }
  return qs.toString()
}

export function usePublicCompanies(pageOrParams: number | UsePublicCompaniesParams = 1) {
  const { get } = useApi()
  const [companies, setCompanies] = useState<PublicCompany[]>([])
  const [meta, setMeta] = useState<JobPostingsPaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const isObj = typeof pageOrParams === "object" && pageOrParams !== null
      const page = isObj ? Math.max(1, pageOrParams.page ?? 1) : Math.max(1, pageOrParams)
      const perPage = isObj ? pageOrParams.perPage : undefined
      const maxTotal =
        isObj && typeof pageOrParams.maxTotal === "number"
          ? Math.max(1, pageOrParams.maxTotal)
          : undefined

      if (maxTotal) {
        const acc: PublicCompany[] = []
        let lastParsed: JobPostingsPaginationMeta | null = null
        let p = 1
        while (acc.length < maxTotal && p <= MAX_AGGREGATE_PAGES) {
          const qs = buildCompaniesQuery(p, perPage)
          const json = await get(`/api/companies?${qs}`, { skipAuth: true })
          const rows = parsePublicCompaniesList(json)
          acc.push(...rows)
          lastParsed =
            extractJobPostingsPaginationMeta(json) ??
            defaultMetaFromRowCount(acc.length)
          const lastPage = lastParsed.last_page ?? 1
          if (p >= lastPage || rows.length === 0) break
          p += 1
        }
        setCompanies(acc.slice(0, maxTotal))
        setMeta(lastParsed)
      } else {
        const qs = buildCompaniesQuery(page, perPage)
        const json = await get(`/api/companies?${qs}`, {
          skipAuth: true,
        })
        const rows = parsePublicCompaniesList(json)
        setCompanies(rows)
        const parsed = extractJobPostingsPaginationMeta(json)
        setMeta(parsed ?? defaultMetaFromRowCount(rows.length))
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load companies"
      toast.error(message)
      setCompanies([])
      setMeta(defaultMetaFromRowCount(0))
    } finally {
      setLoading(false)
    }
  }, [get, pageOrParams])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refetch()
    }, 0)
    return () => window.clearTimeout(id)
  }, [refetch])

  return { companies, loading, refetch, meta }
}
