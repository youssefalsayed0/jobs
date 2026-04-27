import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2Icon, Check, UserRoundIcon } from "lucide-react";

import { SignupIllustration } from "@/components/auth/AuthLayout";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/auth-context";
import { CompanySignupForm } from "@/components/auth/CompanySignupForm";
import { JobSeekerSignupForm } from "@/components/auth/JobSeekerSignupForm";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SignupPage() {
	const [role, setRole] = useState<"job-seeker" | "company">("job-seeker");
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<div className=" overflow-hidden ">
			<Navbar isLoggedIn={!!user} userName={user?.name as string | undefined} userEmail={user?.email as string | undefined} onLogout={handleLogout} />

			<section className="relative h-[400px]  pt-8">
				
					<SignupIllustration variant={role} />
				
				<div className="container relative  h-[200px] mx-auto flex items-center justify-center">
					<div className="text-center">
						<h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-50">Create Your Account</h1>
						<p className="mt-1 text-xl text-slate-500 dark:text-slate-400">Join our platform and find the right opportunity.</p>
					</div>
				</div>
			</section>

			<div className="mx-auto max-w-2xl px-4 py-8 z-10 relative">
				<Card className="mt-6 overflow-hidden border-0 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<CardContent className="overflow-hidden p-6">
						<div className="mb-6 grid grid-cols-2 gap-4">
							<button
								type="button"
								onClick={() => setRole("job-seeker")}
								className={cn(
									"relative flex flex-col items-center gap-1 rounded-lg border-2 px-4 py-4 text-center transition-all",
									role === "job-seeker" ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-white hover:border-slate-300",
								)}>
								{role === "job-seeker" && (
									<span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-blue-500">
										<Check className="size-3 text-white" />
									</span>
								)}
								<span className="flex size-10 items-center justify-center rounded-full bg-blue-100">
									<UserRoundIcon className="size-5 text-blue-600" />
								</span>
								<span className="mt-1 text-sm font-semibold text-slate-800">Job Seeker</span>
								<span className="text-xs text-slate-500">Find jobs that match your skills</span>
							</button>

							<button
								type="button"
								onClick={() => setRole("company")}
								className={cn(
									"relative flex flex-col items-center gap-1 rounded-lg border-2 px-4 py-4 text-center transition-all",
									role === "company" ? "border-orange-500 bg-orange-50/50" : "border-slate-200 bg-white hover:border-slate-300",
								)}>
								{role === "company" && (
									<span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-orange-500">
										<Check className="size-3 text-white" />
									</span>
								)}
								<span className="flex size-10 items-center justify-center rounded-full bg-orange-100">
									<Building2Icon className="size-5 text-orange-600" />
								</span>
								<span className="mt-1 text-sm font-semibold text-slate-800">Company</span>
								<span className="text-xs text-slate-500">Post jobs and hire talent</span>
							</button>
						</div>

						{role === "job-seeker" ? <JobSeekerSignupForm /> : <CompanySignupForm />}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
