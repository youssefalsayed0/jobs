/** Compact page list with ellipses for large page counts (pagination UIs). */
export function visiblePageRange(
  current: number,
  last: number
): (number | "ellipsis")[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1)
  }
  const set = new Set([1, last, current, current - 1, current + 1])
  const sorted = [...set]
    .filter((p) => p >= 1 && p <= last)
    .sort((a, b) => a - b)
  const out: (number | "ellipsis")[] = []
  let prev = 0
  for (const p of sorted) {
    if (prev > 0 && p - prev > 1) out.push("ellipsis")
    out.push(p)
    prev = p
  }
  return out
}
