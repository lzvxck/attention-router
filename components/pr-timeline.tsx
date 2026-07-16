import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import type { DashboardPr } from "@/lib/types";

const tierStyle = {
	"auto-mergeable": {
		className: "bg-primary/18 text-primary",
		Icon: CheckCircle2,
	},
	"quick-glance": {
		className: "bg-gold/18 text-gold",
		Icon: Clock3,
	},
	"deep-review": {
		className: "bg-danger/18 text-danger",
		Icon: AlertTriangle,
	},
} as const;

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
			<section className="rounded-xl bg-surface-1 p-6 shadow-[0_2px_8px_rgb(0_0_0_/_0.4)]">
				<div className="mb-4 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
					<div>
						<p className="m-0 text-xs font-bold tracking-[0.08em] text-muted">
							OUTCOME SIGNAL
						</p>
						<h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
							Calibration over time
						</h2>
					</div>
					<span className="rounded-full bg-primary/16 px-2.5 py-1.5 text-xs font-bold text-primary">
						Live history
					</span>
				</div>
				{records.length ? (
					<ol className="m-0 flex list-none flex-wrap gap-3 p-0">
						{Object.entries(buckets)
							.reverse()
							.map(([month, bucket]) => (
								<li
									className="rounded-xl bg-surface-2 p-3 text-sm text-muted"
									key={month}
								>
									{month}: {Math.round((bucket.reverted / bucket.total) * 100)}%
									reverted ({bucket.reverted}/{bucket.total})
								</li>
							))}
					</ol>
				) : (
					<p className="m-0 text-muted">No scored pull requests yet.</p>
				)}
			</section>
			<section>
				<div className="mb-4 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
					<div>
						<p className="m-0 text-xs font-bold tracking-[0.08em] text-muted">
							REVIEW QUEUE
						</p>
						<h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
							PR timeline
						</h2>
					</div>
					<span className="text-sm text-muted">{records.length} scored</span>
				</div>
				{records.length ? (
					<ol className="m-0 grid list-none gap-1 p-0">
						{records.map((pr) => {
							const { Icon, className } = tierStyle[pr.risk_tier];
							return (
								<li
									className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 rounded-xl p-3 transition hover:bg-surface-2"
									key={pr.id}
								>
									<span className="pt-1 text-right text-sm text-muted">
										{String(pr.number).padStart(2, "0")}
									</span>
									<div className="flex min-w-0 items-start justify-between gap-4 max-sm:flex-col">
										<div className="min-w-0">
											<strong className="block overflow-hidden text-ellipsis whitespace-nowrap">
												#{pr.number} {pr.title}
											</strong>
											<small className="mt-1 block text-muted">
												by {pr.author} ·{" "}
												{new Date(pr.scored_at).toLocaleDateString()}
											</small>
										</div>
										<span
											className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold whitespace-nowrap ${className}`}
										>
											<Icon aria-hidden="true" size={14} />
											{pr.risk_tier}
										</span>
									</div>
									<p className="col-start-2 my-2 leading-relaxed">
										{pr.risk_rationale}
									</p>
									{pr.outcome_type && (
										<p className="col-start-2 m-0 text-sm text-muted">
											Outcome: {pr.outcome_type}
										</p>
									)}
								</li>
							);
						})}
					</ol>
				) : (
					<p className="m-0 text-muted">
						Waiting for the first signed GitHub webhook.
					</p>
				)}
			</section>
		</>
	);
}
