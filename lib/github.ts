import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { env } from "./env";
import type { ChangedFile, RiskVerdict } from "./types";

export type AccessibleRepository = {
	owner: string;
	name: string;
};
export async function installationClient(installationId: number) {
	const config = env.github();
	const auth = createAppAuth({
		appId: config.appId,
		privateKey: config.privateKey,
		installationId,
	});
	return new Octokit({ authStrategy: () => auth });
}
export async function pullRequestContext(
	client: Octokit,
	owner: string,
	repo: string,
	number: number,
): Promise<{ files: ChangedFile[] }> {
	const files = await client.pulls.listFiles({
		owner,
		repo,
		pull_number: number,
		per_page: 100,
	});
	return {
		files: files.data.map((f) => ({
			filename: f.filename,
			additions: f.additions,
			deletions: f.deletions,
			patch: f.patch,
		})),
	};
}
export async function postCheck(
	client: Octokit,
	owner: string,
	repo: string,
	headSha: string,
	verdict: RiskVerdict,
) {
	return client.checks.create({
		owner,
		repo,
		name: "PR Attention Router",
		head_sha: headSha,
		status: "completed",
		conclusion: verdict.tier === "deep-review" ? "action_required" : "neutral",
		output: {
			title: verdict.tier,
			summary: verdict.rationale,
			text: verdict.key_risk_factors.join("\n"),
		},
	});
}

export async function userInstallations(
	userAccessToken: string,
): Promise<AccessibleRepository[]> {
	const client = new Octokit({ auth: userAccessToken });
	const installations = await client.request("GET /user/installations", {
		per_page: 100,
	});
	const repositories = await Promise.all(
		installations.data.installations.map(async (installation) => {
			const response = await client.request(
				"GET /user/installations/{installation_id}/repositories",
				{ installation_id: installation.id, per_page: 100 },
			);
			return response.data.repositories.map((repository) => ({
				owner: repository.owner.login,
				name: repository.name,
			}));
		}),
	);
	return repositories.flat();
}
