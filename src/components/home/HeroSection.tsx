import { SearchIcon, CheckIcon, ClockIcon, Accessibility } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import heroIllustration from "@/assets/hero.jpg";

const quickFilters = [
	{ id: "remote", icon: CheckIcon, label: "Remote" },
	{ id: "part-time", icon: ClockIcon, label: "Part-Time" },
	{ id: "accessible", icon: Accessibility, label: "Accessible Jobs" },
] as const;

type HeroSectionProps = {
	onSearch?: (query: string, filters: string[]) => void;
};

export function HeroSection({ onSearch }: HeroSectionProps) {
	const [query, setQuery] = useState("");
	const [activeFilters, setActiveFilters] = useState<string[]>([]);

	const toggleFilter = (id: string) => {
		setActiveFilters((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearch?.(query, activeFilters);
	};

	return (
		<>
			<section className="relative overflow-hidden bg-white px-4  min-h-[400px]">
					<HeroIllustration />
				<div className="mx-auto container flex items-center justify-center min-h-[400px] relative z-10">
					<div className=" w-full h-full  items-center  ">
						<div>
							<h1 className="text-4xl font-bold leading-tight tracking-tight text-blue-800 lg:text-5xl">Empowering Your Career Journey</h1>
							<p className="mt-3 text-xl text-slate-700">Find Accessible Jobs That Match Your Skills</p>
						</div>
					</div>
				</div>
			</section>
			<section className=" px-4 py-12 bg-linear-to-b from-slate-100 via-slate-50 to-white">
				<div className="container mx-auto">
					<form onSubmit={handleSubmit} className="mt-10 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-900/5">
						<div className="flex flex-col gap-3 sm:flex-row">
							<div className="relative flex-1">
								<SearchIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
								<Input
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search by skill or job title..."
									className="h-12 border-slate-200 pl-12 text-base placeholder:text-slate-400"
								/>
							</div>
							<Button type="submit" className="h-12 rounded-lg bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700">
								Search
							</Button>
						</div>

						<div className="mt-4 flex flex-wrap gap-2.5">
							{quickFilters.map((filter) => {
								const Icon = filter.icon;
								const active = activeFilters.includes(filter.id);
								return (
									<button
										key={filter.id}
										type="button"
										onClick={() => toggleFilter(filter.id)}
										className={cn(
											"inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
											active ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50",
										)}>
										<Icon className="size-4" />
										{filter.label}
									</button>
								);
							})}
						</div>
					</form>
				</div>
			</section>
		</>
	);
}

function HeroIllustration() {
	return (
		<div className="absolute right-0 bottom-0 flex items-center justify-end ">
			<img
				src={heroIllustration}
				alt="Inclusive career illustration"
				className=" h-auto w-full md:w-[60%]"
				loading="eager"
				decoding="async"
			/>
		</div>
	);
}
