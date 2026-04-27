import { Separator } from "../ui/separator";
import { CompanyCard, type Company } from "./CompanyCard";

type CompaniesSectionProps = {
	companies: Company[];
};

export function CompaniesSection({ companies }: CompaniesSectionProps) {
	return (
		<section className="bg-slate-50 px-4 py-12">
			<div className="mx-auto container">
				<h2 className="text-2xl font-bold text-slate-900">Featured Companies</h2>
				<Separator className="mt-2" />
				<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{companies.map((company) => (
						<CompanyCard key={company.id} company={company} />
					))}
				</div>
			</div>
		</section>
	);
}
