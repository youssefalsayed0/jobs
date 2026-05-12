/** Parse API datetime strings (ISO or common SQL shapes). */
export function parseJobDate(iso: string | undefined): Date | null {
  if (!iso || typeof iso !== "string" || !iso.trim()) return null
  const normalized = iso.includes("T") ? iso : iso.replace(" ", "T")
  const d = new Date(normalized)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * e.g. "May 12, 2026 at 12:19 AM EEST" — local timezone, English month names.
 */
export function formatJobDateTimeLong(iso: string | undefined): string | null {
  const d = parseJobDate(iso)
  if (!d) return null

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d)

  const timeTz = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(d)

  const timeTzClean = timeTz.replace(", ", " ")
  return `${datePart} at ${timeTzClean}`
}

/**
 * e.g. "3 hours ago", "2 days ago", "1 month ago" (English, numeric style).
 */
export function formatTimeAgo(iso: string | undefined): string | null {
  const d = parseJobDate(iso)
  if (!d) return null

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" })
  const diffSec = Math.round((Date.now() - d.getTime()) / 1000)

  if (diffSec > -45 && diffSec < 45) return "just now"

  if (diffSec < 0) {
    return formatTimeFromNow(-diffSec, rtf)
  }
  return formatTimeAgoPast(diffSec, rtf)
}

function formatTimeAgoPast(seconds: number, rtf: Intl.RelativeTimeFormat): string {
  const years = Math.floor(seconds / 31536000)
  if (years >= 1) return rtf.format(-years, "year")
  const months = Math.floor(seconds / 2592000)
  if (months >= 1) return rtf.format(-months, "month")
  const weeks = Math.floor(seconds / 604800)
  if (weeks >= 1) return rtf.format(-weeks, "week")
  const days = Math.floor(seconds / 86400)
  if (days >= 1) return rtf.format(-days, "day")
  const hours = Math.floor(seconds / 3600)
  if (hours >= 1) return rtf.format(-hours, "hour")
  const minutes = Math.floor(seconds / 60)
  return rtf.format(-minutes, "minute")
}

function formatTimeFromNow(
  seconds: number,
  rtf: Intl.RelativeTimeFormat
): string {
  const years = Math.floor(seconds / 31536000)
  if (years >= 1) return rtf.format(years, "year")
  const months = Math.floor(seconds / 2592000)
  if (months >= 1) return rtf.format(months, "month")
  const weeks = Math.floor(seconds / 604800)
  if (weeks >= 1) return rtf.format(weeks, "week")
  const days = Math.floor(seconds / 86400)
  if (days >= 1) return rtf.format(days, "day")
  const hours = Math.floor(seconds / 3600)
  if (hours >= 1) return rtf.format(hours, "hour")
  const minutes = Math.floor(seconds / 60)
  return rtf.format(minutes, "minute")
}
