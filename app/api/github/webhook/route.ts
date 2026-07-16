import { Webhooks } from "@octokit/webhooks";
import { env } from "@/lib/env";
import {
	installationClient,
	postCheck,
	pullRequestContext,
} from "@/lib/github";
import {
	markReverted,
	riskStats,
	saveVerdict,
	updatePullRequestHeadSha,
	upsertRepo,
} from "@/lib/repositories";
import { scorePullRequest } from "@/lib/risk-scoring";
import { revertedCommit } from "@/lib/revert-calibration";

export const runtime = "nodejs";
export async function POST(request: Request) {
	const signature = request.headers.get("x-hub-signature-256");
	const event = request.headers.get("x-github-event");
	const body = await request.text();
	if (!signature || event !== "pull_request")
		return new Response("Unsupported event", { status: 400 });
	const hooks = new Webhooks({ secret: env.github().webhookSecret });
	if (!(await hooks.verify(body, signature)))
		return new Response("Invalid signature", { status: 401 });
	const payload = JSON.parse(body) as {
		action: string;
		installation?: { id: number };
		repository: { owner: { login: string }; name: string };
		pull_request: {
			number: number;
			title: string;
			body: string | null;
			merged: boolean;
			merge_commit_sha: string | null;
			user: { login: string };
			head: { sha: string };
		};
	};
	const { pull_request: pr, repository } = payload;
	if (!payload.installation)
		return new Response("Missing installation", { status: 400 });
	const repoId = await upsertRepo(
		repository.owner.login,
		repository.name,
		payload.installation.id,
	);
	if (payload.action === "closed" && pr.merged) {
		if (pr.merge_commit_sha)
			await updatePullRequestHeadSha(repoId, pr.number, pr.merge_commit_sha);
		const sha = revertedCommit(pr.title, pr.body);
		if (sha) await markReverted(repoId, sha, pr.number);
		return Response.json({ ok: true });
	}
	if (!(["opened", "synchronize"] as string[]).includes(payload.action))
		return Response.json({ ok: true });
	const client = await installationClient(payload.installation.id);
	const context = await pullRequestContext(
		client,
		repository.owner.login,
		repository.name,
		pr.number,
	);
	const verdict = await scorePullRequest(
		pr.title,
		context.files,
		await riskStats(repoId, context.files),
	);
	await saveVerdict(
		repoId,
		{
			number: pr.number,
			title: pr.title,
			author: pr.user.login,
			headSha: pr.head.sha,
			files: context.files,
		},
		verdict,
	);
	await postCheck(
		client,
		repository.owner.login,
		repository.name,
		pr.head.sha,
		verdict,
	);
	return Response.json({ ok: true });
}
