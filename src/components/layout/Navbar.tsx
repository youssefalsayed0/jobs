import { Link, NavLink } from "react-router-dom"
import { BriefcaseIcon, MenuIcon } from "lucide-react"

import { UserNavMenu } from "@/components/layout/UserNavMenu"
import { Button } from "@/components/ui/button"
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navLinks = [
	{ to: "/jobs", label: "Jobs" },
	{ to: "/companies", label: "Companies" },
	{ to: "/plans", label: "Plans" },
	{ to: "/about", label: "About" },
] as const

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
	cn("text-muted-foreground transition hover:text-foreground", isActive && "font-semibold text-foreground")

type NavbarProps = {
	isLoggedIn?: boolean
	userAvatar?: string
	userName?: string
	userEmail?: string
	onLogout?: () => void
}

export function Navbar({ isLoggedIn = false, userAvatar, userName, userEmail, onLogout }: NavbarProps) {
	return (
		<header className="sticky top-0 z-50 border-b border-border bg-card/95 px-4 py-3.5 backdrop-blur">
			<div className="mx-auto flex container items-center justify-between gap-4">
				<Link to="/" className="flex items-center gap-2">
					<div className="relative flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/85 shadow-sm">
						<BriefcaseIcon className="size-5 text-primary-foreground" />
						<div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-secondary shadow-sm">
							<div className="size-2 rounded-full bg-secondary-foreground/90" />
						</div>
					</div>
					<span className="text-2xl font-bold tracking-tight text-foreground">Opportix</span>
				</Link>

				<nav className="hidden items-center gap-7 text-sm font-medium md:flex">
					{navLinks.map((item) => (
						<NavLink key={item.to} to={item.to} className={navLinkClassName}>
							{item.label}
						</NavLink>
					))}
				</nav>

				<div className="flex items-center gap-2 md:gap-3">
				
					{isLoggedIn ? (
						<UserNavMenu userName={userName} userEmail={userEmail} userAvatar={userAvatar} onLogout={onLogout} />
					) : (
						<Button asChild size="sm" variant="default" className="rounded-lg font-medium">
							<Link to="/login">Login</Link>
						</Button>
					)}
						<Sheet>
						<SheetTrigger asChild>
							<Button type="button" variant="outline" size="icon" className="shrink-0 md:hidden" aria-label="Open menu">
								<MenuIcon />
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-sm">
							<SheetHeader className="text-left">
								<SheetTitle>Menu</SheetTitle>
								<SheetDescription className="sr-only">Main site navigation</SheetDescription>
							</SheetHeader>
							<nav className="flex flex-col gap-1 px-4 pb-4">
								{navLinks.map((item) => (
									<SheetClose key={item.to} asChild>
										<NavLink
											to={item.to}
											className={({ isActive }) =>
												cn(
													"rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground",
													isActive && "bg-accent font-semibold text-foreground",
												)
											}>
											{item.label}
										</NavLink>
									</SheetClose>
								))}
							</nav>
						</SheetContent>
					</Sheet>

				</div>
			</div>
		</header>
	)
}