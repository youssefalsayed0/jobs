import { Link } from "react-router-dom";

import { Separator } from "../ui/separator";
import { CompanyCard, type Company } from "./CompanyCard";

type CompaniesSectionProps = {
	title?: string;
	companies: Company[];
	viewAllLink?: string;
};

export function CompaniesSection({
	title = "Featured Companies",
	companies,
	viewAllLink = "/companies",
}: CompaniesSectionProps) {
	return (
		<section className="bg-slate-50 px-4 py-12">
			<div className="mx-auto container">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold text-slate-900">{title}</h2>
					<Link
						to={viewAllLink}
						className="text-sm font-medium text-primary hover:text-primary/90 hover:underline">
						View All Companies
					</Link>
				</div>
				<Separator className="mt-2" />

				{companies.length === 0 ? (
					<p className="mt-8 text-center text-sm text-muted-foreground">
						No companies to show right now.
					</p>
				) : (
					<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{companies.map((company) => (
							<CompanyCard key={company.id} company={company} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
