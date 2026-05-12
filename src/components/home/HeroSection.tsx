import { SearchIcon, CheckIcon, ClockIcon, Accessibility } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import heroIllustration from "@/assets/hero.jpg"

const quickFilters = [
  { id: "remote", icon: CheckIcon, label: "Remote" },
  { id: "part-time", icon: ClockIcon, label: "Part-Time" },
  { id: "accessible", icon: Accessibility, label: "Accessible Jobs" },
] as const

type HeroSectionProps = {
  onSearch?: (query: string, filters: string[]) => void
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [query, setQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(query, activeFilters)
  }

  return (
    <>
      <section
        className="relative isolate min-h-[min(56vh,480px)] w-full overflow-hidden border-b border-border/60"
        aria-labelledby="home-hero-heading"
      >
        <img
          src={heroIllustration}
          alt=""
          className="absolute inset-0 size-full object-cover"
          decoding="async"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/20"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-linear-to-r from-primary/25 via-primary/5 to-transparent"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border/80 to-transparent" />

        <div className="container relative z-10 mx-auto flex min-h-[min(56vh,480px)] w-full flex-col justify-end px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Opportix
          </p>
          <h1
            id="home-hero-heading"
            className="mt-2 max-w-4xl font-heading text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
          >
            Empowering your career journey
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Find accessible roles that match your skills—browse listings, build
            your profile, and apply with confidence.
          </p>
        </div>
      </section>

      <section className="bg-linear-to-b from-muted/40 via-background to-background px-4 py-12 sm:px-6">
        <div className="container mx-auto w-full">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border/60 bg-card/95 p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by skill or job title…"
                  className="h-12 rounded-xl border-border/80 pl-11 text-base"
                />
              </div>
              <Button
                type="submit"
                variant="default"
                className="h-12 shrink-0 rounded-xl px-8 text-base font-semibold"
              >
                Search
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {quickFilters.map((filter) => {
                const Icon = filter.icon
                const active = activeFilters.includes(filter.id)
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => toggleFilter(filter.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <Icon className="size-4" />
                    {filter.label}
                  </button>
                )
              })}
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
