import { BriefcaseIcon, ChevronUpIcon, HomeIcon, LayoutDashboardIcon, LogOutIcon, UserIcon, UsersIcon } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";

const companyNav = [
	{
		to: "/company/dashboard",
		label: "Dashboard",
		icon: LayoutDashboardIcon,
	},
	{ to: "/company/profile", label: "Profile", icon: UserIcon },
	{ to: "/company/jobs", label: "Jobs", icon: BriefcaseIcon },
	{ to: "/company/applicants", label: "Applicants", icon: UsersIcon },
] as const;

function navItemActive(pathname: string, to: string) {
	if (pathname === to) return true;
	if (to === "/company/dashboard") return false;
	return pathname.startsWith(`${to}/`);
}

function accountInitial(name: string, email: string): string {
	const n = name.trim();
	if (n.length > 0) return n.charAt(0).toUpperCase();
	const e = email.trim();
	if (e.length > 0) return e.charAt(0).toUpperCase();
	return "C";
}

export function CompanyAppSidebar() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const { isMobile, setOpenMobile } = useSidebar();

	const closeMobile = () => {
		if (isMobile) setOpenMobile(false);
	};

	const displayName = (typeof user?.name === "string" && user.name.trim() !== "" ? user.name : null) ?? "Company account";
	const displayEmail = (typeof user?.email === "string" && user.email.trim() !== "" ? user.email : null) ?? "";

	const signOut = () => {
		closeMobile();
		logout();
		void navigate("/login");
	};

	return (
		<Sidebar variant="inset" collapsible="icon" className="bg-white">
			<SidebarContent className="bg-white md:mt-15 ">
				<SidebarGroup>
					<SidebarGroupLabel>Workspace</SidebarGroupLabel>
					<SidebarGroupContent className="gap-5">
						<SidebarMenu>
							{companyNav.map(({ to, label, icon: Icon }) => (
								<SidebarMenuItem key={to} className="mb-3">
									<SidebarMenuButton asChild isActive={navItemActive(pathname, to)} tooltip={label} className="py-6 px-3 duration-300 ease-out transition-colors motion-reduce:transition-none">
										<NavLink to={to} end={to === "/company/dashboard"} onClick={closeMobile}>
											<Icon className="me-2" />
											<span>{label}</span>
										</NavLink>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border/60 bg-white">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton size="lg" tooltip={displayName} className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
									<Avatar className="size-8 rounded-lg">
										<AvatarFallback className="rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">{accountInitial(displayName, displayEmail)}</AvatarFallback>
									</Avatar>
									<div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">{displayName}</span>
										{displayEmail ? (
											<span className="truncate text-xs text-sidebar-foreground/70">{displayEmail}</span>
										) : (
											<span className="truncate text-xs text-sidebar-foreground/50">Signed in</span>
										)}
									</div>
									<ChevronUpIcon className="ml-auto size-4 shrink-0" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="min-w-56 rounded-xl" side="top" align="start" sideOffset={8}>
								<DropdownMenuLabel className="p-0 font-normal">
									<div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
										<Avatar className="size-8 rounded-lg">
											<AvatarFallback className="rounded-lg bg-muted text-xs font-semibold">{accountInitial(displayName, displayEmail)}</AvatarFallback>
										</Avatar>
										<div className="grid min-w-0 flex-1 leading-tight">
											<span className="truncate font-medium">{displayName}</span>
											{displayEmail ? <span className="truncate text-xs text-muted-foreground">{displayEmail}</span> : null}
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem asChild className="rounded-lg">
										<Link to="/company/profile" onClick={closeMobile}>
											<UserIcon className="size-4" />
											Profile
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild className="rounded-lg">
										<Link to="/" onClick={closeMobile}>
											<HomeIcon className="size-4" />
											Job board
										</Link>
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem variant="destructive" className="rounded-lg" onClick={() => signOut()}>
									<LogOutIcon className="size-4" />
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
