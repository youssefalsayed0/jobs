/**
 * Normalizes GET `/api/user` `data` envelopes: nested `data`, `attributes`,
 * `user`, so the same fields resolve across local vs production API shapes.
 */
export function flattenApiUserPayload(
  inner: Record<string, unknown>
): Record<string, unknown> {
  let merged: Record<string, unknown> = { ...inner }
  const innerData = inner.data
  if (
    innerData &&
    typeof innerData === "object" &&
    !Array.isArray(innerData)
  ) {
    merged = { ...merged, ...(innerData as Record<string, unknown>) }
  }
  const attrs = merged.attributes
  const withAttrs =
    attrs && typeof attrs === "object" && !Array.isArray(attrs)
      ? { ...merged, ...(attrs as Record<string, unknown>) }
      : merged
  const u = withAttrs.user
  if (u && typeof u === "object" && !Array.isArray(u)) {
    return { ...(u as Record<string, unknown>), ...withAttrs }
  }
  return withAttrs
}
