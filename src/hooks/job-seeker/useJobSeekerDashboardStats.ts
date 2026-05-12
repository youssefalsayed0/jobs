import { useCallback, useEffect, useState } from "react"

import { useApi } from "@/hooks/useApi"
import { extractRows } from "@/lib/company-jobs-parse"
import {
	parseApplicationsMeta,
	parseApplicationsList,
} from "@/lib/job-seeker-parse"

export function useJobSeekerDashboardStats() {
	const { get } = useApi()
	const [applicationTotal, setApplicationTotal] = useState<number | null>(
		null
	)
	const [openJobCount, setOpenJobCount] = useState<number | null>(null)
	const [loading, setLoading] = useState(true)

	const refetch = useCallback(async () => {
		setLoading(true)
		try {
			const [appsJson, jobsJson] = await Promise.all([
				get("/api/applications"),
				get("/api/job-postings", { skipAuth: true }),
			])
			const meta = parseApplicationsMeta(appsJson)
			setApplicationTotal(meta.total)
			const listLen = parseApplicationsList(appsJson).length
			if (meta.total === null && listLen > 0) {
				setApplicationTotal(listLen)
			}
			const rows = extractRows(jobsJson)
			setOpenJobCount(rows.length)
		} catch {
			setApplicationTotal(null)
			setOpenJobCount(null)
		} finally {
			setLoading(false)
		}
	}, [get])

	useEffect(() => {
		void refetch()
	}, [refetch])

	return { applicationTotal, openJobCount, loading, refetch }
}
