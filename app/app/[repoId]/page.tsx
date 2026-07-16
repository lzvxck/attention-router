import { ArrowLeft } from "lucide-react";
import { PrTimeline } from "@/components/pr-timeline";
import { auth } from "@/lib/auth";
import { userInstallations } from "@/lib/github";
import {
	dashboardPage,
	reposForAccessibleRepositories,
} from "@/lib/repositories";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function RepositoryPage({
	params,
	searchParams,
}: {
	params: Promise<{ repoId: string }>;
	searchParams: Promise<{ page?: string }>;
}) {
	const repoId = Number((await params).repoId);
	const requestedPage = Number((await searchParams).page ?? 1);
	const page =
		Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	if (!session) redirect("/");
	const token = await auth.api.getAccessToken({
		body: { providerId: "github" },
		headers: requestHeaders,
	});
	if (!token) redirect("/app");
	const repos = await reposForAccessibleRepositories(
		await userInstallations(token.accessToken),
	);
	const repo = repos.find((candidate) => candidate.id === repoId);
	if (!repo) notFound();
	const result = await dashboardPage(repo.id, page);
	return (
		<>
			<header className="grid gap-4 rounded-xl border border-edge bg-linear-to-br from-surface-3 to-canvas p-8">
				<p className="m-0 text-xs font-bold tracking-[0.08em] text-muted">
					{repo.owner}/{repo.name}
				</p>
				<h1 className="m-0 text-balance text-4xl font-bold tracking-[-0.03em]">
					Review attention, calibrated by reality.
				</h1>
				<p className="m-0 leading-relaxed text-muted">
					Decision history and outcome signals for this repository.
				</p>
				<div className="flex flex-wrap items-center gap-3">
					<a
						className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-bold text-muted no-underline transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
						href="/app"
					>
						<ArrowLeft aria-hidden="true" size={16} />
						Change repository
					</a>
				</div>
			</header>
			<PrTimeline
				records={result.records}
				pagination={{
					basePath: `/app/${repo.id}`,
					page,
					pageSize: 20,
					total: result.total,
				}}
			/>
		</>
	);
}
