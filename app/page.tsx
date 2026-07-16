import { dashboard } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function Page() {
	let records: Awaited<ReturnType<typeof dashboard>> = [];
	try {
		records = await dashboard();
	} catch {
		/* Deploy before DATABASE_URL is configured. */
	}
	const buckets = records.reduce<
		Record<string, { total: number; reverted: number }>
	>((result, record) => {
		const month = new Date(record.scored_at).toLocaleDateString("en-US", {
			month: "short",
			year: "numeric",
		});
		const bucket = result[month] ?? { total: 0, reverted: 0 };
		bucket.total++;
		if (record.outcome_type === "reverted") bucket.reverted++;
		result[month] = bucket;
		return result;
	}, {});
	return (
		<>
			<header>
				<p>PR Attention Router</p>
				<h1>Review attention, calibrated by reality.</h1>
				<p>Every decision is captured beside its eventual outcome.</p>
			</header>
			<section className="calibration">
				<strong>Calibration over time</strong>
				{records.length ? (
					<ol>
						{Object.entries(buckets)
							.reverse()
							.map(([month, bucket]) => (
								<li key={month}>
									{month}: {Math.round((bucket.reverted / bucket.total) * 100)}%
									reverted ({bucket.reverted}/{bucket.total})
								</li>
							))}
					</ol>
				) : (
					<span>No scored pull requests yet</span>
				)}
			</section>
			<section>
				<h2>PR timeline</h2>
				{records.length === 0 ? (
					<p className="empty">Waiting for the first signed GitHub webhook.</p>
				) : (
					<ol>
						{records.map((pr) => (
							<li key={pr.id}>
								<div>
									<b>
										#{pr.number} {pr.title}
									</b>
									<small>
										by {pr.author} ·{" "}
										{new Date(pr.scored_at).toLocaleDateString()}
									</small>
								</div>
								<span className={`tier ${pr.risk_tier}`}>{pr.risk_tier}</span>
								<p>{pr.risk_rationale}</p>
								{pr.outcome_type && <em>Outcome: {pr.outcome_type}</em>}
							</li>
						))}
					</ol>
				)}
			</section>
		</>
	);
}
