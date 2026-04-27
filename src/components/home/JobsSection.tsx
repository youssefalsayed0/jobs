import { Link } from "react-router-dom";

import { JobCard, type Job } from "./JobCard";
import { Separator } from "../ui/separator";

type JobsSectionProps = {
	title: string;
	jobs: Job[];
	viewAllLink?: string;
};

export function JobsSection({ title, jobs, viewAllLink = "/jobs" }: JobsSectionProps) {
	return (
		<section className="bg-white px-4 py-12">
			<div className="mx-auto container">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold text-slate-900">{title}</h2>
					<Link to={viewAllLink} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
						View All Jobs
					</Link>
				</div>
				<Separator className="mt-2" />

				<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{jobs.map((job) => (
						<JobCard key={job.id} job={job} />
					))}
				</div>
			</div>
		</section>
	);
}
