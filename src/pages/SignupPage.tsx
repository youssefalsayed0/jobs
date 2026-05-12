import { useState } from "react"
import { Building2Icon, Check, UserRoundIcon } from "lucide-react"

import { SignupIllustration } from "@/components/auth/AuthLayout"
import { CompanySignupForm } from "@/components/auth/CompanySignupForm"
import { JobSeekerSignupForm } from "@/components/auth/JobSeekerSignupForm"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function SignupPage() {
  const [role, setRole] = useState<"job-seeker" | "company">("job-seeker")

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <section className="relative h-[400px] pt-8">
        <SignupIllustration variant={role} />

        <div className="container relative mx-auto flex h-[200px] items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Create Your Account
            </h1>
            <p className="mt-1 text-xl text-muted-foreground">
              Join our platform and find the right opportunity.
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        <Card className="mt-6 overflow-hidden border border-border bg-card shadow-sm">
          <CardContent className="overflow-hidden p-6">
            <div className="mb-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("job-seeker")}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-lg border-2 px-4 py-4 text-center transition-all",
                  role === "job-seeker"
                    ? "border-primary bg-primary/8"
                    : "border-border bg-card hover:border-muted-foreground/30"
                )}
              >
                {role === "job-seeker" && (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3 text-white" />
                  </span>
                )}
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/15">
                  <UserRoundIcon className="size-5 text-primary" />
                </span>
                <span className="mt-1 text-sm font-semibold text-foreground">
                  Job Seeker
                </span>
                <span className="text-xs text-muted-foreground">
                  Find jobs that match your skills
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("company")}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-lg border-2 px-4 py-4 text-center transition-all",
                  role === "company"
                    ? "border-secondary bg-secondary/12"
                    : "border-border bg-card hover:border-muted-foreground/30"
                )}
              >
                {role === "company" && (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Check className="size-3 text-white" />
                  </span>
                )}
                <span className="flex size-10 items-center justify-center rounded-full bg-secondary/25">
                  <Building2Icon className="size-5 text-secondary-foreground" />
                </span>
                <span className="mt-1 text-sm font-semibold text-foreground">
                  Company
                </span>
                <span className="text-xs text-muted-foreground">
                  Post jobs and hire talent
                </span>
              </button>
            </div>

            {role === "job-seeker" ? (
              <JobSeekerSignupForm />
            ) : (
              <CompanySignupForm />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
