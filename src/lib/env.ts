/**
 * Set in `.env`:
 * `REACT_APP_API_URL=https://your-api.example.com`
 * Paths in the app use `/api/...`; do not include `/api` in the base if your server
 * serves from the host root (e.g. base `https://api.example.com` + `/api/login`).
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.REACT_APP_API_URL
  if (!raw || typeof raw !== "string") {
    throw new Error(
      "REACT_APP_API_URL is missing. Add it to your .env file (see src/lib/env.ts)."
    )
  }
  return raw.replace(/\/+$/, "")
}
