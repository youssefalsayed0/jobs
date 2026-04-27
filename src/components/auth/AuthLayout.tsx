import { BriefcaseIcon, Accessibility, ImageIcon } from "lucide-react"
import { Link, NavLink } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const nav = [
  { to: "/jobs", label: "Jobs" },
  { to: "/companies", label: "Companies" },
  { to: "/about", label: "About" },
] as const

type AuthHeaderProps = {
  className?: string
}

export function AuthHeader({ className }: AuthHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800/80 dark:bg-slate-950",
        className
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <BriefcaseIcon className="size-4" />
          </span>
          <span className="inline-flex size-6 items-center justify-center rounded text-slate-400" aria-hidden>
            <Accessibility className="size-4" />
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400",
                  isActive && "text-blue-600 dark:text-blue-400"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <Link to="/login">Login</Link>
        </Button>
      </div>
    </header>
  )
}

type SignupIllustrationProps = {
  variant: "job-seeker" | "company"
  imageSrc?: string
}

export function SignupIllustration({ variant, imageSrc }: SignupIllustrationProps) {
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-sky-50">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={variant === "job-seeker" ? "Job seeker illustration" : "Company illustration"}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-slate-400">
          <ImageIcon className="size-10" />
          <span className="text-sm">Illustration placeholder</span>
        </div>
      )}
    </div>
  )
}
