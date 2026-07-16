import { PrTimeline } from "@/components/pr-timeline";
import { SignInButton } from "@/components/sign-in-button";
import { env } from "@/lib/env";
import { dashboard, demoRepoId } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function Page() {
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
			<header className="hero">
				<p className="eyebrow">PR Attention Router</p>
				<h1>Review attention, calibrated by reality.</h1>
				<p>Every decision is captured beside its eventual outcome.</p>
				<SignInButton />
			</header>
			<PrTimeline records={records} />
		</>
	);
}
