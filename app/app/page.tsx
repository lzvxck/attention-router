import { FolderGit2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { userInstallations } from "@/lib/github";
import { reposForAccessibleRepositories } from "@/lib/repositories";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppPage() {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	if (!session) redirect("/");
	const token = await auth.api.getAccessToken({
		body: { providerId: "github" },
		headers: requestHeaders,
	});
	const repos = token
		? await reposForAccessibleRepositories(
				await userInstallations(token.accessToken),
			)
		: [];
	if (repos.length === 1) redirect(`/app/${repos[0].id}`);
	return (
		<section className="grid gap-8 pt-8">
			<div>
				<p className="m-0 text-xs font-bold tracking-[0.08em] text-muted">
					YOUR REPOSITORIES
				</p>
				<h1 className="mb-2 mt-3 text-4xl font-bold tracking-[-0.03em]">
					Choose a repository
				</h1>
				<p className="m-0 max-w-2xl leading-relaxed text-muted">
					Signed in as {session.user.name}. Each dashboard is private to your
					GitHub installation access.
				</p>
			</div>
			{repos.length ? (
				<ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-0">
					{repos.map((repo) => (
						<li key={repo.id}>
							<a
								className="grid min-h-34 gap-2 rounded-xl border border-transparent bg-surface-2 p-4 no-underline transition hover:border-primary hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink"
								href={`/app/${repo.id}`}
							>
								<FolderGit2
									aria-hidden="true"
									className="text-primary"
									size={24}
								/>
								<strong>
									{repo.owner}/{repo.name}
								</strong>
								<small className="text-muted">
									Review history and calibrated outcomes
								</small>
							</a>
						</li>
					))}
				</ul>
			) : (
				<p className="m-0 rounded-xl bg-surface-1 p-6 leading-relaxed text-muted">
					Installed repositories appear after their first pull request webhook
					is received. Open a PR to see it work.
				</p>
			)}
		</section>
	);
}
