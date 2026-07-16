import { db } from "./db";
import { pathPattern } from "./revert-calibration";
import type {
	ChangedFile,
	DashboardPage,
	DashboardPr,
	DashboardRepo,
	RiskStat,
	RiskVerdict,
} from "./types";

export async function upsertRepo(
	owner: string,
	name: string,
	installationId: number,
) {
	const rows =
		await db()`INSERT INTO repos (owner,name,installation_id) VALUES (${owner},${name},${installationId}) ON CONFLICT (owner,name) DO UPDATE SET installation_id=EXCLUDED.installation_id RETURNING id`;
	return rows[0].id as number;
}
export async function updatePullRequestHeadSha(
	repoId: number,
	number: number,
	headSha: string,
) {
	await db()`UPDATE pull_requests SET head_sha=${headSha} WHERE repo_id=${repoId} AND number=${number}`;
}
export async function riskStats(
	repoId: number,
	files: ChangedFile[],
): Promise<RiskStat[]> {
	const patterns = [
		...new Set(files.map((file) => pathPattern(file.filename))),
	];
	return (await db()`SELECT path_pattern,total_prs,reverted_prs FROM file_risk_stats WHERE repo_id=${repoId} AND path_pattern = ANY(${patterns})`) as RiskStat[];
}
export async function saveVerdict(
	repoId: number,
	pr: {
		number: number;
		title: string;
		author: string;
		headSha: string;
		files: ChangedFile[];
	},
	verdict: RiskVerdict,
) {
	const files = JSON.stringify(pr.files);
	await db()`WITH saved AS (INSERT INTO pull_requests (repo_id,number,title,author,head_sha,files_changed,risk_tier,risk_rationale,risk_confidence,scored_at) VALUES (${repoId},${pr.number},${pr.title},${pr.author},${pr.headSha},${files}::jsonb,${verdict.tier},${verdict.rationale},${verdict.confidence},now()) ON CONFLICT (repo_id,number) DO UPDATE SET title=EXCLUDED.title,author=EXCLUDED.author,head_sha=EXCLUDED.head_sha,files_changed=EXCLUDED.files_changed,risk_tier=EXCLUDED.risk_tier,risk_rationale=EXCLUDED.risk_rationale,risk_confidence=EXCLUDED.risk_confidence,scored_at=now() RETURNING xmax = 0 AS inserted), patterns AS (SELECT DISTINCT CASE WHEN position('/' IN item->>'filename') > 0 THEN split_part(item->>'filename','/',1) || '/*' ELSE item->>'filename' END AS path_pattern FROM jsonb_array_elements(${files}::jsonb) item) INSERT INTO file_risk_stats (repo_id,path_pattern,total_prs,reverted_prs,updated_at) SELECT ${repoId},path_pattern,1,0,now() FROM patterns,saved WHERE saved.inserted ON CONFLICT (repo_id,path_pattern) DO UPDATE SET total_prs=file_risk_stats.total_prs+1,updated_at=now()`;
}
export async function markReverted(
	repoId: number,
	sha: string,
	revertedByNumber: number,
) {
	const rows =
		await db()`WITH original AS (SELECT id,files_changed FROM pull_requests WHERE repo_id=${repoId} AND head_sha=${sha}), outcome AS (INSERT INTO outcomes (pr_id,outcome_type,reverted_by_pr_id,detected_at) SELECT id,'reverted',(SELECT id FROM pull_requests WHERE repo_id=${repoId} AND number=${revertedByNumber}),now() FROM original ON CONFLICT (pr_id) DO NOTHING RETURNING pr_id), patterns AS (SELECT DISTINCT CASE WHEN position('/' IN item->>'filename') > 0 THEN split_part(item->>'filename','/',1) || '/*' ELSE item->>'filename' END AS path_pattern FROM original,jsonb_array_elements(original.files_changed) item), stats AS (INSERT INTO file_risk_stats (repo_id,path_pattern,total_prs,reverted_prs,updated_at) SELECT ${repoId},path_pattern,0,1,now() FROM patterns,outcome ON CONFLICT (repo_id,path_pattern) DO UPDATE SET reverted_prs=file_risk_stats.reverted_prs+1,updated_at=now() RETURNING path_pattern) SELECT EXISTS(SELECT 1 FROM original) AS found`;
	return Boolean(rows[0]?.found);
}
export async function dashboardPage(
	repoId: number,
	page: number,
	pageSize = 20,
): Promise<DashboardPage> {
	const offset = (page - 1) * pageSize;
	const rows =
		await db()`SELECT p.id,p.number,p.title,p.author,p.files_changed,p.risk_tier,p.risk_rationale,p.risk_confidence,p.scored_at,o.outcome_type,COUNT(*) OVER() AS total_count FROM pull_requests p LEFT JOIN outcomes o ON o.pr_id=p.id WHERE p.repo_id=${repoId} ORDER BY p.scored_at DESC LIMIT ${pageSize} OFFSET ${offset}`;
	return {
		records: rows as DashboardPr[],
		total: rows[0] ? Number(rows[0].total_count) : 0,
	};
}
export async function demoRepoId(owner: string, name: string) {
	const rows =
		await db()`SELECT id FROM repos WHERE owner=${owner} AND name=${name}`;
	return rows[0] ? Number(rows[0].id) : undefined;
}
export async function reposForAccessibleRepositories(
	repositories: { owner: string; name: string }[],
): Promise<DashboardRepo[]> {
	if (!repositories.length) return [];
	const requested = JSON.stringify(repositories);
	const rows =
		await db()`SELECT repos.id,repos.owner,repos.name FROM repos JOIN jsonb_to_recordset(${requested}::jsonb) AS requested(owner text,name text) ON repos.owner=requested.owner AND repos.name=requested.name ORDER BY repos.owner,repos.name`;
	return rows.map((row) => ({ ...row, id: Number(row.id) })) as DashboardRepo[];
}
