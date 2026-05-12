import { Outlet } from "react-router-dom";

import { JobSeekerAppSidebar } from "@/components/job-seeker-dashboard/JobSeekerAppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export function JobSeekerDashboardLayout() {
	return (
		<SidebarProvider>
			<JobSeekerAppSidebar />
			<main className="flex w-full min-w-0 flex-1 flex-col bg-gray-100 p-4 sm:p-6 lg:px-8 lg:py-6">
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
