import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompanyUserProfile } from "@/hooks/company/useCompanyUserProfile"
import { cn } from "@/lib/utils"
import { Building2Icon, RefreshCcwIcon } from "lucide-react"

const HIDDEN_PROFILE_KEYS = new Set([
  "password",
  "password_confirmation",
  "remember_token",
  "token",
])

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function readEmail(profile: Record<string, unknown> | null): string {
  if (!profile) return ""
  const v = profile.email
  return typeof v === "string" ? v : ""
}

export function CompanyProfilePage() {
  const { profile, loading, refetch } = useCompanyUserProfile()

  const entries =
    profile && typeof profile === "object"
      ? (Object.entries(profile).filter(
          ([key, v]) =>
            !HIDDEN_PROFILE_KEYS.has(key) &&
            v !== null &&
            v !== undefined &&
            (typeof v === "string" ||
              typeof v === "number" ||
              typeof v === "boolean")
        ) as [string, string | number | boolean][])
      : []

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 pb-10">
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm",
          "px-6 py-8 sm:px-10 sm:py-10"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/7 via-transparent to-primary/5"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-primary/10 text-primary sm:size-16">
              <Building2Icon className="size-7 sm:size-8" />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                Company account
              </p>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Company profile
              </h1>
         
              {readEmail(profile) ? (
                <p className="truncate text-sm font-medium text-foreground/90">
                  {readEmail(profile)}
                </p>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-xl"
            disabled={loading}
            onClick={() => void refetch()}
          >
            <RefreshCcwIcon data-icon="inline-start" className="size-4" />
            Reload
          </Button>
        </div>
      </section>

      <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
          <CardTitle className="text-lg sm:text-xl">Account fields</CardTitle>
          <CardDescription>
            Scalar values from your profile payload (strings, numbers, and
            booleans).
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-7 sm:px-8 sm:py-8">
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              No scalar fields to display.
            </p>
          ) : (
            <dl className="grid gap-5 sm:grid-cols-2">
              {entries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-muted/20 px-5 py-4 sm:px-6 sm:py-5"
                >
                  <dt className="text-xs font-medium text-muted-foreground">
                    {formatKey(key)}
                  </dt>
                  <dd className="break-all text-sm font-medium text-foreground">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
