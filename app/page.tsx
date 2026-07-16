import { PrTimeline } from "@/components/pr-timeline";
import { SignInButton } from "@/components/sign-in-button";
import { UserMenu } from "@/components/user-menu";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { dashboard, demoRepoId } from "@/lib/repositories";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Page() {
	const session = await auth.api.getSession({ headers: await headers() });
	let records: Awaited<ReturnType<typeof dashboard>> = [];
	try {
		const config = env.auth();
		const repoId = await demoRepoId(config.demoRepoOwner, config.demoRepoName);
		if (repoId) records = await dashboard(repoId);
	} catch {
		/* Permit deployment before demo and OAuth values are configured. */
	}
	return (
		<>
			<nav
				className="flex min-h-12 items-center justify-between"
				aria-label="Primary navigation"
			>
				<span className="text-sm font-bold text-muted">Public demo</span>
				{session ? (
					<UserMenu image={session.user.image} name={session.user.name} />
				) : (
					<SignInButton />
				)}
			</nav>
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
			<PrTimeline records={records} />
		</>
	);
}
