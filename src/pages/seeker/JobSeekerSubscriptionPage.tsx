import { CheckIcon, CreditCardIcon, SparklesIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useJobSeekerProfile } from "@/hooks/job-seeker/useJobSeekerProfile"
import { parseSeekerSubscription } from "@/lib/job-seeker-subscription-parse"
import { cn } from "@/lib/utils"

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase()
  if (s === "active" || s === "paid") {
    return "border-emerald-200/90 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100"
  }
  if (s === "cancelled" || s === "canceled" || s === "expired") {
    return "border-amber-200/90 bg-amber-50 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
  }
  return ""
}

export function JobSeekerSubscriptionPage() {
  const { profile, loading } = useJobSeekerProfile()
  const subscription = parseSeekerSubscription(profile ?? undefined)

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Subscription
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Your membership
          </h1>
          <p className="text-muted-foreground">
            You don&apos;t have an active subscription yet. Browse plans and
            subscribe when you&apos;re ready.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-xl font-semibold">
          <Link to="/plans">
            <SparklesIcon className="size-4" data-icon="inline-start" />
            View plans
          </Link>
        </Button>
      </div>
    )
  }

  const { plan, payment } = subscription

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Subscription
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Your membership
        </h1>
        <p className="text-muted-foreground">
          Details from your account. This is the same data as your profile,
          shown here for quick reference.
        </p>
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/15">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="font-heading text-2xl">{plan.title}</CardTitle>
              <CardDescription className="text-base text-pretty">
                {plan.description}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded-lg px-3 py-1 capitalize",
                statusBadgeClass(subscription.status),
              )}
            >
              {subscription.status}
            </Badge>
          </div>
          <p className="pt-2 font-heading text-2xl font-bold tabular-nums">
            <span className="text-base font-semibold text-muted-foreground">
              $
            </span>
            {subscription.price_snapshotted}
            <span className="text-sm font-medium text-muted-foreground">
              {" "}
              billed (snapshot)
            </span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            {subscription.started_at ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Started
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {subscription.started_at}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Expires
              </p>
              <p className="mt-1 font-medium text-foreground">
                {subscription.expires_at ?? "—"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Plan benefits
            </p>
            <ul className="mt-3 space-y-2">
              {plan.benefits.length > 0 ? (
                plan.benefits.map((b) => (
                  <li key={b} className="flex gap-2 text-foreground/90">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{b}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">No benefits listed.</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {payment ? (
        <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/15">
            <div className="flex items-center gap-2 text-primary">
              <CreditCardIcon className="size-5" />
              <CardTitle className="text-lg">Last payment</CardTitle>
            </div>
            <CardDescription>
              Card details are stored as provided at checkout (last four digits
              only).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Amount
              </p>
              <p className="mt-1 font-medium tabular-nums text-foreground">
                ${payment.amount}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cardholder
              </p>
              <p className="mt-1 font-medium text-foreground">
                {payment.holder_name}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Card
              </p>
              <p className="mt-1 font-medium tabular-nums text-foreground">
                •••• {payment.card_last_four}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Expiry
              </p>
              <p className="mt-1 font-medium tabular-nums text-foreground">
                {payment.card_expiry}
              </p>
            </div>
            {payment.completed_at ? (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Completed
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {payment.completed_at}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Button asChild variant="outline" className="w-fit rounded-xl">
        <Link to="/plans">Browse other plans</Link>
      </Button>
    </div>
  )
}
