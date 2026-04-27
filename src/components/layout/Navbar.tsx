import { Link, NavLink } from "react-router-dom"
import { BriefcaseIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { to: "/jobs", label: "Jobs" },
  { to: "/companies", label: "Companies" },
  { to: "/about", label: "About" },
] as const

type NavbarProps = {
  isLoggedIn?: boolean
  userAvatar?: string
  userName?: string
  userEmail?: string
  onLogout?: () => void
}

export function Navbar({ isLoggedIn = false, userAvatar, userName, userEmail, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 px-4 py-3.5 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-blue-700 shadow-sm">
            <BriefcaseIcon className="size-5 text-white" />
            <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500">
              <div className="size-2 rounded-full bg-white" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Opportix
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "text-slate-600 transition hover:text-slate-900",
                  isActive && "font-semibold text-slate-900"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="hidden items-center gap-3 md:flex">
                <div className="text-right">
                  {userName && (
                    <p className="text-sm font-medium text-slate-900">
                      {userName}
                    </p>
                  )}
                  {userEmail && (
                    <p className="text-xs text-slate-500">{userEmail}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                Log out
              </Button>
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="User avatar"
                  className="size-10 rounded-full object-cover ring-2 ring-slate-200"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {userName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </>
          ) : (
            <Button asChild size="sm" className="rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
