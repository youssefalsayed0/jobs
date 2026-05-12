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
import { RefreshCcwIcon } from "lucide-react"

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function CompanyProfilePage() {
  const { data, loading, refetch } = useCompanyUserProfile()

  const entries =
    data && typeof data === "object"
      ? Object.entries(data).filter(
          ([, v]) =>
            v !== null &&
            v !== undefined &&
            (typeof v === "string" ||
              typeof v === "number" ||
              typeof v === "boolean")
        )
      : []

  return (
    <div className="flex w-full min-w-0 flex-col gap-10">
      <section className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-card/60 px-7 py-8 shadow-sm backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-10">
        <div className="w-full min-w-0 space-y-4">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Account
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Profile
          </h1>
     
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={loading}
            onClick={() => void refetch()}
          >
              <RefreshCcwIcon data-icon="inline-start" />Reload
          </Button>
        </div>
      </section>

      <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/80 shadow-sm">
        <CardHeader className="space-y-2 border-b border-border/60 bg-muted/20 px-7 py-6 sm:px-10 sm:py-8">
          <CardTitle className="text-lg sm:text-xl">Account fields</CardTitle>
          <CardDescription className="text-base">
            Read-only view of primitive fields returned by the API.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-7 py-8 sm:px-10 sm:py-10">
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
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
