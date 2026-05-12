import { Outlet } from "react-router-dom";

import { JobSeekerAppSidebar } from "@/components/job-seeker-dashboard/JobSeekerAppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function JobSeekerDashboardLayout() {
	return (
		<SidebarProvider>
			<JobSeekerAppSidebar />

			<main className=" relative flex w-full min-w-0 flex-1 flex-col bg-gray-100 ">
				<div className=" sticky top-[68.89px]  z-10 bg-white p-3 shadow-sm      ">
					<SidebarTrigger className="bg-white shadow-sm p-2 rounded-lg" />
				</div>
				<div className="p-4 sm:p-6 lg:px-8 lg:py-6">
					<Outlet />
				</div>
			</main>
		</SidebarProvider>
	);
}
