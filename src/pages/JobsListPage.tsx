import {
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Link, useSearchParams } from "react-router-dom"

import { JobCard } from "@/components/home/JobCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicJobPostings } from "@/hooks/job-seeker/usePublicJobPostings"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { mapPostingToJobCard } from "@/lib/map-public-job-card"
import { visiblePageRange } from "@/lib/visible-page-range"
import { cn } from "@/lib/utils"

function JobsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card
          key={i}
          className="overflow-hidden rounded-3xl border-border/60 bg-card/80 shadow-sm"
        >
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-4/5 max-w-md" />
            <Skeleton className="h-4 w-3/5 max-w-xs" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function JobsListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchFromUrl = searchParams.get("search") ?? ""
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

  const { jobs, loading, meta } = usePublicJobPostings({
    page,
    search: searchFromUrl.trim(),
  })
  const cards = useMemo(() => jobs.map(mapPostingToJobCard), [jobs])

  const [inputValue, setInputValue] = useState(searchFromUrl)
  useEffect(() => {
    setInputValue(searchFromUrl)
  }, [searchFromUrl])

  const debouncedInput = useDebouncedValue(inputValue.trim(), 450)

  const urlSearchRaw = searchParams.get("search") ?? ""
  useEffect(() => {
    const current = urlSearchRaw.trim()
    if (debouncedInput === current) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (debouncedInput) next.set("search", debouncedInput)
        else next.delete("search")
        next.delete("page")
        return next
      },
      { replace: true }
    )
  }, [debouncedInput, urlSearchRaw, setSearchParams])

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

  const totalListings = meta?.total ?? 0
  const searchActive = searchFromUrl.trim().length > 0
  const showingCatalogEmpty = !loading && totalListings === 0 && !searchActive
  const showingSearchEmpty = !loading && totalListings === 0 && searchActive
  const hasListings = totalListings > 0
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
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="min-w-0 flex-1 space-y-4">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                Open roles
              </p>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                Browse jobs
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Search runs on the server after you pause typing (about half a
                second). Results update below; use pagination for more roles.
              </p>
            </div>

            {!loading && hasListings && meta ? (
              <div className="flex w-full shrink-0 flex-col gap-1 rounded-2xl border border-border/60 bg-muted/25 px-5 py-4 sm:w-auto sm:min-w-[240px]">
                <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <BriefcaseIcon className="size-3.5 text-primary" />
                  {searchActive ? "Search results" : "Showing"}
                </span>
                <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                  {meta.from != null && meta.to != null ? (
                    <>
                      {meta.from}
                      <span className="text-muted-foreground">–</span>
                      {meta.to}
                    </>
                  ) : (
                    cards.length
                  )}
                  <span className="ms-1.5 text-base font-semibold text-muted-foreground">
                    of {meta.total}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {searchActive ? (
                    <>
                      Query: &ldquo;{searchFromUrl.trim()}&rdquo;
                      {lastPage > 1
                        ? ` · Page ${meta.current_page} of ${lastPage}`
                        : null}
                    </>
                  ) : lastPage > 1 ? (
                    `Page ${meta.current_page} of ${lastPage}`
                  ) : (
                    "All listings on one page"
                  )}
                </p>
              </div>
            ) : null}
          </div>

          <div className="relative mt-8 max-w-xl">
            <SearchIcon
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search title, company, location…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={cn(
                "h-11 rounded-xl border-border/80 bg-background/80 pl-10 shadow-sm",
                "placeholder:text-muted-foreground/70"
              )}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto w-full flex-1 px-4 py-8 sm:px-8 sm:py-10 lg:py-12">
        {loading ? (
          <JobsGridSkeleton />
        ) : showingCatalogEmpty ? (
          <Card className="mx-auto max-w-lg rounded-3xl border-dashed border-border/80 bg-muted/10 py-14 shadow-none">
            <CardContent className="px-6">
              <Empty className="min-h-0 border-0 p-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SparklesIcon />
                  </EmptyMedia>
                  <EmptyTitle className="text-lg">
                    No listings yet
                  </EmptyTitle>
                  <EmptyDescription>
                    Employers have not published roles to the public board.
                    Check back soon or explore from the home page.
                  </EmptyDescription>
                </EmptyHeader>
                <Button asChild variant="outline" className="mt-2 rounded-xl">
                  <Link to="/">Back to home</Link>
                </Button>
              </Empty>
            </CardContent>
          </Card>
        ) : showingSearchEmpty ? (
          <Card className="mx-auto max-w-lg rounded-3xl border-border/70 bg-card/95 py-12 shadow-sm">
            <CardContent className="space-y-4 px-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
                <SearchIcon className="size-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  No matches
                </h2>
                <p className="text-sm text-muted-foreground">
                  No jobs matched &ldquo;{searchFromUrl.trim()}&rdquo;. Try a
                  different keyword.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl"
                onClick={() => setInputValue("")}
              >
                Clear search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {meta && meta.total > 0 ? (
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
                      {meta.per_page ? (
                        <span className="text-muted-foreground/80">
                          {" "}
                          ({meta.per_page} per page)
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-foreground">
                        {meta.total}
                      </span>{" "}
                      {meta.total === 1 ? "listing" : "listings"}
                    </>
                  )}
                </p>

                {lastPage > 1 ? (
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
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
