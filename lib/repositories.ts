import { db } from "./db";
import { pathPattern } from "./revert-calibration";
import type { ChangedFile, DashboardPr, RiskStat, RiskVerdict } from "./types";

export async function upsertRepo(owner: string, name: string, installationId: number) {
  const rows = await db()`INSERT INTO repos (owner,name,installation_id) VALUES (${owner},${name},${installationId}) ON CONFLICT (owner,name) DO UPDATE SET installation_id=EXCLUDED.installation_id RETURNING id`;
  return rows[0].id as number;
}
export async function riskStats(repoId: number, files: ChangedFile[]): Promise<RiskStat[]> { const patterns = [...new Set(files.map((file) => pathPattern(file.filename)))]; return await db()`SELECT path_pattern,total_prs,reverted_prs FROM file_risk_stats WHERE repo_id=${repoId} AND path_pattern = ANY(${patterns})` as RiskStat[]; }
export async function saveVerdict(repoId: number, pr: { number: number; title: string; author: string; headSha: string; files: ChangedFile[] }, verdict: RiskVerdict) { const sql = db(); const existing = await sql`SELECT id FROM pull_requests WHERE repo_id=${repoId} AND number=${pr.number}`; await sql`INSERT INTO pull_requests (repo_id,number,title,author,head_sha,files_changed,risk_tier,risk_rationale,risk_confidence,scored_at) VALUES (${repoId},${pr.number},${pr.title},${pr.author},${pr.headSha},${JSON.stringify(pr.files)},${verdict.tier},${verdict.rationale},${verdict.confidence},now()) ON CONFLICT (repo_id,number) DO UPDATE SET title=EXCLUDED.title,author=EXCLUDED.author,head_sha=EXCLUDED.head_sha,files_changed=EXCLUDED.files_changed,risk_tier=EXCLUDED.risk_tier,risk_rationale=EXCLUDED.risk_rationale,risk_confidence=EXCLUDED.risk_confidence,scored_at=now()`; if (!existing[0]) for (const file of pr.files) { const pattern = pathPattern(file.filename); await sql`INSERT INTO file_risk_stats (repo_id,path_pattern,total_prs,reverted_prs,updated_at) VALUES (${repoId},${pattern},1,0,now()) ON CONFLICT (repo_id,path_pattern) DO UPDATE SET total_prs=file_risk_stats.total_prs+1,updated_at=now()`; } }
export async function markReverted(repoId: number, sha: string, revertedByNumber: number) {
  const sql = db(); const rows = await sql`SELECT id,files_changed FROM pull_requests WHERE repo_id=${repoId} AND head_sha=${sha}`; if (!rows[0]) return false;
  const pr = rows[0] as { id: number; files_changed: ChangedFile[] }; const inserted = await sql`INSERT INTO outcomes (pr_id,outcome_type,reverted_by_pr_id,detected_at) VALUES (${pr.id},'reverted',(SELECT id FROM pull_requests WHERE repo_id=${repoId} AND number=${revertedByNumber}),now()) ON CONFLICT (pr_id) DO NOTHING RETURNING pr_id`; if (!inserted[0]) return true;
  for (const file of pr.files_changed) { const pattern = pathPattern(file.filename); await sql`INSERT INTO file_risk_stats (repo_id,path_pattern,total_prs,reverted_prs,updated_at) VALUES (${repoId},${pattern},1,1,now()) ON CONFLICT (repo_id,path_pattern) DO UPDATE SET reverted_prs=file_risk_stats.reverted_prs+1,updated_at=now()`; }
  return true;
}
export async function dashboard(): Promise<DashboardPr[]> { return await db()`SELECT p.id,p.number,p.title,p.author,p.risk_tier,p.risk_rationale,p.risk_confidence,p.scored_at,o.outcome_type FROM pull_requests p LEFT JOIN outcomes o ON o.pr_id=p.id ORDER BY p.scored_at DESC LIMIT 100` as DashboardPr[]; }
