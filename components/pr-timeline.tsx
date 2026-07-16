import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import type { DashboardPr } from "@/lib/types";

const tierStyle = {
	"auto-mergeable": {
		className: "bg-primary/18 text-primary",
		Icon: CheckCircle2,
	},
	"quick-glance": { className: "bg-gold/18 text-gold", Icon: Clock3 },
	"deep-review": { className: "bg-danger/18 text-danger", Icon: AlertTriangle },
} as const;

type Pagination = {
	basePath: string;
	page: number;
	pageSize: number;
	total: number;
};

export function PrTimeline({
	records,
	pagination,
}: {
	records: DashboardPr[];
	pagination?: Pagination;
}) {
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
	const total = pagination?.total ?? records.length;
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
			<section className="mx-auto w-full max-w-4xl">
				<div className="mb-3 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
					<div>
						<p className="m-0 text-xs font-bold tracking-[0.08em] text-muted">
							REVIEW QUEUE
						</p>
						<h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
							PR timeline
						</h2>
					</div>
					<span className="text-sm text-muted">{total} scored</span>
				</div>
				{records.length ? (
					<ol className="m-0 grid list-none gap-0.5 p-0">
						{records.map((pr) => {
							const { Icon, className } = tierStyle[pr.risk_tier];
							return (
								<li
									className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 rounded-lg px-2 py-2 transition hover:bg-surface-2"
									key={pr.id}
								>
									<span className="pt-0.5 text-right text-xs text-muted">
										{String(pr.number).padStart(2, "0")}
									</span>
									<div className="flex min-w-0 items-start justify-between gap-3 max-sm:flex-col">
										<div className="min-w-0">
											<strong className="block overflow-hidden text-ellipsis whitespace-nowrap">
												#{pr.number} {pr.title}
											</strong>
											<small className="block text-muted">
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
									<p
										className="col-start-2 m-0 line-clamp-1 text-sm leading-relaxed text-muted"
										title={pr.risk_rationale}
									>
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
				{pagination && total > pagination.pageSize && (
					<nav
						aria-label="PR timeline pagination"
						className="mt-6 flex items-center justify-between gap-4 border-t border-edge pt-4"
					>
						{pagination.page > 1 ? (
							<a
								className="rounded-lg px-3 py-2 text-sm font-bold text-muted no-underline transition hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
								href={`${pagination.basePath}?page=${pagination.page - 1}`}
							>
								Previous
							</a>
						) : (
							<span className="px-3 py-2 text-sm text-muted/50">Previous</span>
						)}
						<span className="text-sm text-muted">
							Page {pagination.page} of {Math.ceil(total / pagination.pageSize)}
						</span>
						{pagination.page * pagination.pageSize < total ? (
							<a
								className="rounded-lg bg-surface-3 px-3 py-2 text-sm font-bold no-underline transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
								href={`${pagination.basePath}?page=${pagination.page + 1}`}
							>
								Next
							</a>
						) : (
							<span className="px-3 py-2 text-sm text-muted/50">Next</span>
						)}
					</nav>
				)}
			</section>
		</>
	);
}
