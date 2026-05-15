/**
 * Parses API strings like `May 12, 2026 at 12:19 AM EEST` (month name, `at`, AM/PM, optional TZ).
 * Time zone suffix is ignored; the instant follows the engine's parse of local calendar date + time.
 */
function parseEnglishMonthDateAtTime(trimmed: string): Date | null {
  const m = trimmed.match(
    /^([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})\s+at\s+(.+)$/i
  )
  if (!m) return null
  const datePart = m[1]
  const rest = m[2].trim()
  const timeOnly = rest.match(
    /^(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM))/i
  )
  if (!timeOnly) return null
  const combined = `${datePart} ${timeOnly[1]}`
  const d = new Date(combined)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Parse API datetime strings (ISO, SQL `YYYY-MM-DD HH:…`, English `Mon D, YYYY at …`, etc.). */
export function parseJobDate(iso: string | undefined): Date | null {
  if (!iso || typeof iso !== "string" || !iso.trim()) return null
  const trimmed = iso.trim()

  const direct = new Date(trimmed)
  if (!Number.isNaN(direct.getTime())) return direct

  // SQL-style without `T` between date and time (only this shape gets a single-space → `T` fix).
  if (/^\d{4}-\d{2}-\d{2} \d/.test(trimmed)) {
    const normalized = trimmed.replace(" ", "T")
    const d = new Date(normalized)
    if (!Number.isNaN(d.getTime())) return d
  }

  const english = parseEnglishMonthDateAtTime(trimmed)
  if (english) return english

  return null
}

/**
 * e.g. "May 12, 2026 at 12:19 AM" — no timezone suffix (GMT+3, EST, etc.).
 */
export function formatJobDateTimeLong(iso: string | undefined): string | null {
  const d = parseJobDate(iso)
  if (!d) return null

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d)

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d)

  return `${datePart} at ${timePart}`
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
