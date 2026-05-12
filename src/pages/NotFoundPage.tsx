import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col bg-linear-to-b from-muted/40 via-background to-background">
      <section className="flex flex-1 items-center bg-card px-4 py-12">
        <div className="mx-auto max-w-lg py-8 text-center lg:py-16">
          <p className="mb-2 font-heading text-7xl font-extrabold tracking-tight text-primary lg:text-8xl">
            404
          </p>
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Page not found
          </h1>
          <p className="mb-6 text-lg font-light text-muted-foreground">
            We could not find that URL. Head back home to keep exploring
            Opportix.
          </p>
          <Button asChild variant="default" size="lg" className="rounded-lg">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
