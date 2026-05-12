import heroImage from "@/assets/hero.jpg"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EyeIcon, GraduationCapIcon, TargetIcon } from "lucide-react"

export function AboutPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-linear-to-b from-muted/40 via-background to-muted/20">
      <section
        className="relative isolate min-h-[min(56vh,480px)] w-full overflow-hidden border-b border-border/60"
        aria-labelledby="about-hero-heading"
      >
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
          decoding="async"
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

        <div className="container relative mx-auto flex min-h-[min(56vh,480px)] w-full flex-col justify-end px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Graduation project
          </p>
          <h1
            id="about-hero-heading"
            className="mt-2 font-heading text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
          >
            A job portal built as our capstone—by students, for learning
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Opportix is a student graduation project: a full-stack hiring
            experience that brings together employers, job seekers, profiles,
            applications, and dashboards in one coherent product demo.
          </p>
        </div>
      </section>

      <section
        className="container relative mx-auto w-full px-4 py-14 sm:px-8 sm:py-16 lg:py-20"
        aria-labelledby="about-intro-heading"
      >
        <div className="pointer-events-none absolute -left-24 top-20 size-64 rounded-full bg-primary/8 blur-3xl sm:size-80" />
        <div className="relative space-y-6">
          <h2
            id="about-intro-heading"
            className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            About this project
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              Opportix was developed as a{" "}
              <span className="font-medium text-foreground">
                graduation project
              </span>{" "}
              to show how a real-world job marketplace could work end to end:
              public job listings, authenticated flows for companies and
              seekers, profile and CV handling, and structured application
              data—not just mockups, but working screens tied to an API.
            </p>
            <p>
              The goal is both academic and practical: demonstrate solid
              software design, clear UX, and responsible handling of user
              flows, while keeping scope realistic for a student timeline. If
              you are reviewing this work for a course or committee, we hope
              the structure of the app makes the intent easy to follow.
            </p>
          </div>
        </div>
      </section>

      <section
        className="container relative mx-auto w-full px-4 pb-16 sm:px-8 sm:pb-20 lg:pb-24"
        aria-labelledby="mission-vision-heading"
      >
        <h2 id="mission-vision-heading" className="sr-only">
          Mission and vision
        </h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/95 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <TargetIcon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-xl sm:text-2xl">Project mission</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    What we set out to demonstrate
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-7 text-pretty text-sm leading-relaxed text-muted-foreground sm:px-8 sm:py-8 sm:text-base">
              <p>
                To deliver a credible capstone: a hiring portal where listings,
                applications, and role-based dashboards feel intentional—so
                graders and peers can see requirements, architecture, and UI
                working together, not a disconnected set of pages.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/95 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/15 px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <EyeIcon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-xl sm:text-2xl">Project vision</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Where we hope this work leads us
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-7 text-pretty text-sm leading-relaxed text-muted-foreground sm:px-8 sm:py-8 sm:text-base">
              <p>
                That student projects can mirror industry patterns—auth,
                separation of company vs. seeker experiences, and thoughtful
                forms—so we graduate with portfolio pieces that explain not only
                what we built, but why the flows make sense for real users.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 overflow-hidden rounded-3xl border-dashed border-border/80 bg-muted/15 shadow-none sm:mt-10">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-center sm:gap-6 sm:py-12">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <GraduationCapIcon className="size-6" aria-hidden />
            </div>
            <p className="min-w-0 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-left sm:text-base">
              <span className="font-medium text-foreground">Note:</span>{" "}
              Opportix is for coursework and demonstration. Data may be reset,
              and the system should not be relied on for real hiring decisions.
              Feedback from supervisors and visitors helps us document lessons
              learned and next steps we would take with more time.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
