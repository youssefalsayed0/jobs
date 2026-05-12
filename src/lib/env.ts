/**
 * Set in `.env`: `REACT_APP_API_URL=https://your-api.example.com`
 * Do not include `/api` in the base if your API lives at the host root under `/api/...`.
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
