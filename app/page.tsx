import { PrTimeline } from "@/components/pr-timeline";
import { env } from "@/lib/env";
import { dashboardPage, demoRepoId } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const requestedPage = Number((await searchParams).page ?? 1);
	const page =
		Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
	let repository: { name: string; owner: string } | undefined;
	let result: Awaited<ReturnType<typeof dashboardPage>> = {
		records: [],
		total: 0,
	};
	try {
		const config = env.auth();
		repository = { name: config.demoRepoName, owner: config.demoRepoOwner };
		const repoId = await demoRepoId(config.demoRepoOwner, config.demoRepoName);
		if (repoId) result = await dashboardPage(repoId, page);
	} catch {
		/* Permit deployment before demo and OAuth values are configured. */
	}
	return (
		<>
			<header className="grid min-h-55 max-w-none gap-3 rounded-xl border border-edge bg-linear-to-br from-primary/15 to-surface-1 p-8 sm:p-12">
				<p className="m-0 text-xs font-bold tracking-[0.08em] text-muted">
					REVIEW INTELLIGENCE
				</p>
				<h1 className="m-0 max-w-4xl text-balance text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
					Review attention, calibrated by reality.
				</h1>
				<p className="m-0 max-w-2xl leading-relaxed text-muted">
					Route human focus where it matters, using the real outcome history of
					every repository.
				</p>
				<div className="mt-2 flex flex-wrap gap-6 text-sm text-muted">
					<span>
						<strong className="block text-base text-ink">3</strong> risk tiers
					</span>
					<span>
						<strong className="block text-base text-ink">Live</strong> revert
						signals
					</span>
				</div>
			</header>
			<PrTimeline
				records={result.records}
				pagination={{ basePath: "/", page, pageSize: 20, total: result.total }}
				repository={repository}
			/>
		</>
	);
}
