import { Outlet } from "react-router-dom";
import { CompanyAppSidebar } from "@/components/company-dashboard/CompanyAppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export function CompanyDashboardLayout() {
	return (
		<SidebarProvider>
			<CompanyAppSidebar />
			<main className="flex w-full min-w-0 flex-1 flex-col bg-gray-100 p-4 sm:p-6 lg:px-8 lg:py-6">
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
