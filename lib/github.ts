import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { env } from "./env";
import type { ChangedFile, RiskVerdict } from "./types";

const riskLabels = [
	{
		color: "1DB954",
		description: "PR Attention Router: low risk",
		name: "risk:auto-mergeable",
	},
	{
		color: "F0B232",
		description: "PR Attention Router: needs a quick glance",
		name: "risk:quick-glance",
	},
	{
		color: "F15E6C",
		description: "PR Attention Router: needs deep review",
		name: "risk:deep-review",
	},
] as const;

function isExistingLabelError(error: unknown) {
	return (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		error.status === 422
	);
}

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

export async function ensureRiskLabels(
	client: Octokit,
	owner: string,
	repo: string,
) {
	await Promise.all(
		riskLabels.map(async (label) => {
			try {
				await client.issues.createLabel({ owner, repo, ...label });
			} catch (error) {
				if (!isExistingLabelError(error)) throw error;
			}
		}),
	);
}

export async function applyRiskLabel(
	client: Octokit,
	owner: string,
	repo: string,
	number: number,
	tier: RiskVerdict["tier"],
) {
	const labels = await client.issues.listLabelsOnIssue({
		owner,
		repo,
		issue_number: number,
	});
	await Promise.all(
		labels.data
			.map((label) => label.name)
			.filter((name): name is string => Boolean(name?.startsWith("risk:")))
			.map((name) =>
				client.issues.removeLabel({ owner, repo, issue_number: number, name }),
			),
	);
	await client.issues.addLabels({
		owner,
		repo,
		issue_number: number,
		labels: [`risk:${tier}`],
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
