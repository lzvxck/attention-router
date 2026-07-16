import { dashboard } from "@/lib/repositories";
export const dynamic = "force-dynamic";
export default async function Page() {
  let records: Awaited<ReturnType<typeof dashboard>> = []; try { records = await dashboard(); } catch { /* Dashboard remains deployable before DATABASE_URL is configured. */ }
  const reverted = records.filter((record) => record.outcome_type === "reverted").length;
  return <><header><p>PR Attention Router</p><h1>Review attention, calibrated by reality.</h1><p>Every decision is captured beside its eventual outcome.</p></header><section className="calibration"><strong>Calibration over time</strong><span>{records.length ? `${reverted}/${records.length} scored PRs were later reverted` : "No scored pull requests yet"}</span></section><section><h2>PR timeline</h2>{records.length === 0 ? <p className="empty">Waiting for the first signed GitHub webhook.</p> : <ol>{records.map((pr) => <li key={pr.id}><div><b>#{pr.number} {pr.title}</b><small>by {pr.author} · {new Date(pr.scored_at).toLocaleDateString()}</small></div><span className={`tier ${pr.risk_tier}`}>{pr.risk_tier}</span><p>{pr.risk_rationale}</p>{pr.outcome_type && <em>Outcome: {pr.outcome_type}</em>}</li>)}</ol>}</section></>;
}
