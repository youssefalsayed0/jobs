import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CompanyDashboardLayout } from "@/layouts/CompanyDashboardLayout";
import { RootLayout } from "@/layouts/RootLayout";
import { AboutPage } from "@/pages/AboutPage";
import { CompaniesPage } from "@/pages/CompaniesPage";
import { CompanyPublicDetailPage } from "@/pages/CompanyPublicDetailPage";
import { CompanyApplicantUserPage } from "@/pages/company/CompanyApplicantUserPage";
import { CompanyApplicantsPage } from "@/pages/company/CompanyApplicantsPage";
import { CompanyDashboardHome } from "@/pages/company/CompanyDashboardHome";
import { CompanyJobDetailPage } from "@/pages/company/CompanyJobDetailPage";
import { CompanyJobsPage } from "@/pages/company/CompanyJobsPage";
import { CompanyProfilePage } from "@/pages/company/CompanyProfilePage";
import { HomePage } from "@/pages/HomePage";
import { JobsListPage } from "@/pages/JobsListPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PublicJobDetailPage } from "@/pages/PublicJobDetailPage";
import { SignupPage } from "@/pages/SignupPage";
import { JobSeekerDashboardLayout } from "@/layouts/JobSeekerDashboardLayout";
import { JobSeekerApplicationsPage } from "@/pages/seeker/JobSeekerApplicationsPage";
import { JobSeekerDashboardHome } from "@/pages/seeker/JobSeekerDashboardHome";
import { JobSeekerProfilePage } from "@/pages/seeker/JobSeekerProfilePage";

function App() {
	return (
		<>
			<Routes>
				<Route path="/" element={<RootLayout />}>
					<Route index element={<HomePage />} />
					<Route path="jobs/:jobId" element={<PublicJobDetailPage />} />
					<Route path="jobs" element={<JobsListPage />} />
					<Route path="companies" element={<CompaniesPage />} />
					<Route path="companies/:companyId" element={<CompanyPublicDetailPage />} />
					<Route path="about" element={<AboutPage />} />
					<Route
						path="seeker"
						element={
							<ProtectedRoute allowedRoles={["job_seeker"]}>
								<JobSeekerDashboardLayout />
							</ProtectedRoute>
						}
					>
						<Route index element={<Navigate to="dashboard" replace />} />
						<Route path="dashboard" element={<JobSeekerDashboardHome />} />
						<Route path="profile" element={<JobSeekerProfilePage />} />
						<Route path="applications" element={<JobSeekerApplicationsPage />} />
					</Route>
					<Route
						path="login"
						element={
							<ProtectedRoute requireAuth={false}>
								<LoginPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="signup"
						element={
							<ProtectedRoute requireAuth={false}>
								<SignupPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="company"
						element={
							<ProtectedRoute allowedRoles={["company"]}>
								<CompanyDashboardLayout />
							</ProtectedRoute>
						}>
						<Route index element={<Navigate to="dashboard" replace />} />
						<Route path="dashboard" element={<CompanyDashboardHome />} />
						<Route path="profile" element={<CompanyProfilePage />} />
						<Route path="jobs/:jobId" element={<CompanyJobDetailPage />} />
						<Route path="jobs" element={<CompanyJobsPage />} />
						<Route path="applicants" element={<CompanyApplicantsPage />} />
						<Route
							path="applicants/users/:userId"
							element={<CompanyApplicantUserPage />}
						/>
					</Route>
					<Route
						path="company/job-postings"
						element={
							<ProtectedRoute allowedRoles={["company"]}>
								<Navigate to="/company/jobs" replace />
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<NotFoundPage />} />
				</Route>
			</Routes>
			{/* <CvChatDock /> */}
		</>
	);
}

export default App;
