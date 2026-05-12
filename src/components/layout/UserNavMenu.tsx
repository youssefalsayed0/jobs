import {
  BriefcaseIcon,
  ChevronDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  ScrollText,
  UserIcon,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

type UserNavMenuProps = {
  userName?: string
  userEmail?: string
  userAvatar?: string
  onLogout?: () => void
  className?: string
}

export function UserNavMenu({
  userName,
  userEmail,
  userAvatar,
  onLogout,
  className,
}: UserNavMenuProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const role =
    user && typeof user.role === "string" ? user.role.toLowerCase() : ""
  const isCompany = role === "company"
  const isJobSeeker = role === "job_seeker"

  const displayName =
    userName ||
    (typeof user?.name === "string" ? user.name : undefined) ||
    "Account"
  const displayEmail =
    userEmail ||
    (typeof user?.email === "string" ? user.email : undefined) ||
    ""

  const initial =
    displayName.trim().charAt(0)?.toUpperCase() ||
    displayEmail.trim().charAt(0)?.toUpperCase() ||
    "U"

  const handleLogout = () => {
    setOpen(false)
    if (onLogout) {
      onLogout()
      return
    }
    logout()
    void navigate("/login")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-10 gap-2 rounded-full border-border bg-card pr-2.5 pl-1.5 shadow-sm hover:bg-muted/80",
            className
          )}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Open account menu"
        >
          {userAvatar ? (
            <Avatar className="size-7">
              <AvatarImage src={userAvatar} alt={displayName} />
              <AvatarFallback className="text-xs">{initial}</AvatarFallback>
            </Avatar>
          ) : (
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initial}
            </span>
          )}
          <span className="hidden max-w-[7rem] truncate text-sm font-medium text-foreground sm:inline">
            {displayName}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        <div className="flex flex-col gap-0">
          <PopoverHeader className="border-b border-border px-4 py-3">
            <PopoverTitle className="truncate">{displayName}</PopoverTitle>
            {displayEmail ? (
              <PopoverDescription className="truncate">
                {displayEmail}
              </PopoverDescription>
            ) : null}
          </PopoverHeader>
          {isCompany ? (
            <div className="flex flex-col gap-0.5 p-2">
              <Button
                variant="ghost"
                className="h-10 justify-start gap-2 rounded-lg font-normal"
                asChild
              >
                <Link
                  to="/company/dashboard"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboardIcon data-icon="inline-start" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="h-10 justify-start gap-2 rounded-lg font-normal"
                asChild
              >
                <Link to="/company/profile" onClick={() => setOpen(false)}>
                  <UserIcon data-icon="inline-start" />
                  Profile
                </Link>
              </Button>
            </div>
          ) : null}
          {isJobSeeker ? (
            <div className="flex flex-col gap-0.5 p-2">
              <Button
                variant="ghost"
                className="h-10 justify-start gap-2 rounded-lg font-normal"
                asChild
              >
                <Link
                  to="/seeker/dashboard"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboardIcon data-icon="inline-start" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="h-10 justify-start gap-2 rounded-lg font-normal"
                asChild
              >
                <Link
                  to="/seeker/applications"
                  onClick={() => setOpen(false)}
                >
                  <ScrollText data-icon="inline-start" />
                  Applications
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="h-10 justify-start gap-2 rounded-lg font-normal"
                asChild
              >
                <Link to="/seeker/profile" onClick={() => setOpen(false)}>
                  <UserIcon data-icon="inline-start" />
                  Profile
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="h-10 justify-start gap-2 rounded-lg font-normal"
                asChild
              >
                <Link to="/jobs" onClick={() => setOpen(false)}>
                  <BriefcaseIcon data-icon="inline-start" />
                  Browse jobs
                </Link>
              </Button>
            </div>
          ) : null}
          <Separator />
          <div className="p-2">
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full justify-start gap-2 rounded-lg font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOutIcon data-icon="inline-start" />
              Log out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
