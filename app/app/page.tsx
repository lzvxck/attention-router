import { SignOutButton } from "@/components/sign-out-button";
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
		<section className="panel picker">
			<div className="picker-heading">
				<div>
					<p className="eyebrow">Signed in as {session.user.name}</p>
					<h1>Choose a repository</h1>
				</div>
				<SignOutButton />
			</div>
			{repos.length ? (
				<ul className="repo-grid">
					{repos.map((repo) => (
						<li key={repo.id}>
							<a className="repo-card" href={`/app/${repo.id}`}>
								{repo.owner}/{repo.name}
							</a>
						</li>
					))}
				</ul>
			) : (
				<p>
					Installed repositories appear after their first pull request webhook
					is received. Open a PR to see it work.
				</p>
			)}
		</section>
	);
}
