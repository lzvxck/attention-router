import type { DashboardPr } from "@/lib/types";

export function PrTimeline({ records }: { records: DashboardPr[] }) {
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
			<section className="panel calibration">
				<h2>Calibration over time</h2>
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
					<p className="empty">No scored pull requests yet.</p>
				)}
			</section>
			<section>
				<h2>PR timeline</h2>
				{records.length ? (
					<ol className="timeline">
						{records.map((pr) => (
							<li className="panel" key={pr.id}>
								<div className="pr-heading">
									<div>
										<strong>
											#{pr.number} {pr.title}
										</strong>
										<small>
											by {pr.author} ·{" "}
											{new Date(pr.scored_at).toLocaleDateString()}
										</small>
									</div>
									<span className={`tier ${pr.risk_tier}`}>{pr.risk_tier}</span>
								</div>
								<p>{pr.risk_rationale}</p>
								{pr.outcome_type && (
									<p className="outcome">Outcome: {pr.outcome_type}</p>
								)}
							</li>
						))}
					</ol>
				) : (
					<p className="empty">Waiting for the first signed GitHub webhook.</p>
				)}
			</section>
		</>
	);
}
