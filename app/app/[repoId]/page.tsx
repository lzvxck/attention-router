import { PrTimeline } from "@/components/pr-timeline";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
import { userInstallations } from "@/lib/github";
import { dashboard, reposForAccessibleRepositories } from "@/lib/repositories";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function RepositoryPage({
	params,
}: {
	params: Promise<{ repoId: string }>;
}) {
	const repoId = Number((await params).repoId);
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
	return (
		<>
			<header className="hero compact">
				<p className="eyebrow">
					{repo.owner}/{repo.name}
				</p>
				<h1>Review attention, calibrated by reality.</h1>
				<nav>
					<a href="/app">Change repository</a>
					<SignOutButton />
				</nav>
			</header>
			<PrTimeline records={await dashboard(repo.id)} />
		</>
	);
}
