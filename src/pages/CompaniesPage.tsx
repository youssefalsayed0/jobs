import {
  Building2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "lucide-react"
import { useCallback, useEffect, useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicCompanies } from "@/hooks/job-seeker/usePublicCompanies"
import type { PublicCompany } from "@/lib/public-companies-parse"
import { visiblePageRange } from "@/lib/visible-page-range"

function CompaniesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card
          key={i}
          className="overflow-hidden rounded-3xl border-border/60 bg-card/80 shadow-sm"
        >
          <CardContent className="flex gap-4 p-6">
            <Skeleton className="size-20 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-14 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CompanyBrowseCard({ c }: { c: PublicCompany }) {
  const href = `/companies/${encodeURIComponent(String(c.id))}`
  const photo = c.profile_photo_url?.trim() || null
  const overview = c.overview?.trim() || null

  return (
    <Link to={href} className="block h-full">
      <Card className="group h-full overflow-hidden rounded-3xl border-border/70 bg-card/95 shadow-sm transition-all duration-200 hover:border-primary/25 hover:shadow-md">
        <CardContent className="flex h-full gap-4 p-5 sm:p-6">
          <div className="shrink-0">
            {photo ? (
              <img
                src={photo}
                alt=""
                className="size-20 rounded-2xl border border-border/60 bg-background object-cover sm:size-21"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-21">
                <Building2Icon className="size-9" />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h2 className="font-heading text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
              {c.company_name}
            </h2>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {overview ?? "No overview yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function CompaniesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = useMemo(() => {
    const raw = searchParams.get("page")
    const n = Number.parseInt(raw ?? "1", 10)
    return Number.isFinite(n) && n >= 1 ? n : 1
  }, [searchParams])

  const goToPage = useCallback(
    (p: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (p <= 1) next.delete("page")
          else next.set("page", String(p))
          return next
        },
        { replace: p <= 1 }
      )
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
      })
    },
    [setSearchParams]
  )

  const { companies, loading, meta } = usePublicCompanies(page)

  useEffect(() => {
    if (loading || !meta) return
    if (meta.last_page < 1) return
    if (page > meta.last_page) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (meta.last_page <= 1) next.delete("page")
          else next.set("page", String(meta.last_page))
          return next
        },
        { replace: true }
      )
    }
  }, [loading, meta, page, setSearchParams])

  const total = meta?.total ?? 0
  const hasRows = total > 0
  const showingEmpty = !loading && !hasRows
  const lastPage = Math.max(1, meta?.last_page ?? 1)
  const pageItems = visiblePageRange(page, lastPage)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-linear-to-b from-muted/40 via-background to-muted/20">
      <header className="relative border-b border-border/60 bg-card shadow-sm">
        <div
          className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-primary/9 blur-3xl sm:size-96"
          aria-hidden
        />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/80 to-transparent" />

        <div className="container relative mx-auto w-full px-4 py-10 sm:px-8 sm:py-12 lg:py-14">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Directory
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              Companies
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Organizations hiring on Opportix. Open a profile to learn more
              and find their open roles.
            </p>
          </div>
          {!loading && hasRows && meta ? (
            <div className="mt-6 flex w-full max-w-sm flex-col gap-1 rounded-2xl border border-border/60 bg-muted/25 px-5 py-4">
              <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <SparklesIcon className="size-3.5 text-primary" />
                Showing
              </span>
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {meta.from != null && meta.to != null ? (
                  <>
                    {meta.from}
                    <span className="text-muted-foreground">–</span>
                    {meta.to}
                  </>
                ) : (
                  companies.length
                )}
                <span className="ms-1.5 text-base font-semibold text-muted-foreground">
                  of {meta.total}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {lastPage > 1
                  ? `Page ${meta.current_page} of ${lastPage}`
                  : "All companies on one page"}
              </p>
            </div>
          ) : null}
        </div>
      </header>

      <div className="container mx-auto w-full flex-1 px-4 py-8 sm:px-8 sm:py-10 lg:py-12">
        {loading ? (
          <CompaniesGridSkeleton />
        ) : showingEmpty ? (
          <Card className="mx-auto max-w-lg rounded-3xl border-dashed border-border/80 bg-muted/10 py-14 shadow-none">
            <CardContent className="px-6">
              <Empty className="min-h-0 border-0 p-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Building2Icon />
                  </EmptyMedia>
                  <EmptyTitle className="text-lg">No companies yet</EmptyTitle>
                  <EmptyDescription>
                    No employer profiles are listed yet. Check back later or
                    browse open jobs.
                  </EmptyDescription>
                </EmptyHeader>
                <Button asChild variant="outline" className="mt-2 rounded-xl">
                  <Link to="/jobs">Browse jobs</Link>
                </Button>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {companies.map((c) => (
                <CompanyBrowseCard key={String(c.id)} c={c} />
              ))}
            </div>

            {meta && meta.total > 0 && lastPage > 1 ? (
              <div className="mt-10 flex flex-col gap-4 border-t border-border/50 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {meta.from != null && meta.to != null ? (
                    <>
                      Showing{" "}
                      <span className="font-medium text-foreground">
                        {meta.from}–{meta.to}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-foreground">
                        {meta.total}
                      </span>
                    </>
                  ) : null}
                </p>
                <nav
                  className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end"
                  aria-label="Pagination"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0 rounded-lg"
                    disabled={loading || page <= 1}
                    onClick={() => goToPage(page - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  {pageItems.map((item, idx) =>
                    item === "ellipsis" ? (
                      <span
                        key={`e-${idx}`}
                        className="px-1.5 text-sm text-muted-foreground"
                        aria-hidden
                      >
                        …
                      </span>
                    ) : (
                      <Button
                        key={item}
                        type="button"
                        variant={item === page ? "default" : "outline"}
                        size="sm"
                        className="min-w-9 rounded-lg px-2.5 font-medium tabular-nums"
                        disabled={loading}
                        onClick={() => goToPage(item)}
                        aria-label={`Page ${item}`}
                        aria-current={item === page ? "page" : undefined}
                      >
                        {item}
                      </Button>
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0 rounded-lg"
                    disabled={loading || page >= lastPage}
                    onClick={() => goToPage(page + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRightIcon className="size-4" />
                  </Button>
                </nav>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
