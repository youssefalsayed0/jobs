import { Link, NavLink } from "react-router-dom";
import { BriefcaseIcon } from "lucide-react";

import { UserNavMenu } from "@/components/layout/UserNavMenu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
	{ to: "/jobs", label: "Jobs" },
	{ to: "/companies", label: "Companies" },
	{ to: "/plans", label: "Plans" },
	{ to: "/about", label: "About" },
] as const;

type NavbarProps = {
	isLoggedIn?: boolean;
	userAvatar?: string;
	userName?: string;
	userEmail?: string;
	onLogout?: () => void;
};

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
						<NavLink key={item.to} to={item.to} className={({ isActive }) => cn("text-muted-foreground transition hover:text-foreground", isActive && "font-semibold text-foreground")}>
							{item.label}
						</NavLink>
					))}
				</nav>

				<div className="flex items-center gap-3">
					{isLoggedIn ? (
						<UserNavMenu userName={userName} userEmail={userEmail} userAvatar={userAvatar} onLogout={onLogout} />
					) : (
						<Button asChild size="sm" variant="default" className="rounded-lg font-medium">
							<Link to="/login">Login</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
