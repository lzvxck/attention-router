"use client";

import {
	AlertTriangle,
	CheckCircle2,
	Clock3,
	ExternalLink,
	FileCode2,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
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
type Repository = { name: string; owner: string };

export function PrTimeline({
	records,
	pagination,
	repository,
}: {
	records: DashboardPr[];
	pagination?: Pagination;
	repository?: Repository;
}) {
	const [selected, setSelected] = useState<DashboardPr | null>(null);
	useEffect(() => {
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setSelected(null);
		};
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, []);
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
	const pullRequestUrl = selected
		? `https://github.com/${repository?.owner}/${repository?.name}/pull/${selected.number}`
		: undefined;
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
								<li key={pr.id}>
									<button
										aria-label={`Open assessment for pull request ${pr.number}`}
										className="grid w-full cursor-pointer grid-cols-[24px_minmax(0,1fr)] gap-x-3 rounded-lg px-2 py-2 text-left transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
										onClick={() => setSelected(pr)}
										type="button"
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
									</button>
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
			{selected && (
				<div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
					<button
						aria-label="Close assessment"
						className="absolute inset-0 cursor-default"
						onClick={() => setSelected(null)}
						type="button"
					/>
					<section
						aria-modal="true"
						className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-edge bg-surface-1 p-6 shadow-[0_8px_32px_rgb(0_0_0_/_0.6)]"
						role="dialog"
					>
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="m-0 text-xs font-bold tracking-[0.08em] text-muted">
									PR ASSESSMENT
								</p>
								<h2 className="mt-2 text-2xl font-bold">
									#{selected.number} {selected.title}
								</h2>
								{repository && (
									<a
										className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary"
										href={pullRequestUrl}
										rel="noreferrer"
										target="_blank"
									>
										Open pull request on GitHub
										<ExternalLink aria-hidden="true" size={15} />
									</a>
								)}
							</div>
							<button
								aria-label="Close assessment"
								className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink"
								onClick={() => setSelected(null)}
								type="button"
							>
								<X size={20} />
							</button>
						</div>
						<div className="mt-5 grid gap-4 sm:grid-cols-2">
							<div className="rounded-lg bg-surface-2 p-4">
								<span className="text-xs font-bold tracking-[0.08em] text-muted">
									RISK
								</span>
								<p className="mb-0 mt-2 font-bold">{selected.risk_tier}</p>
								<p className="mb-0 mt-1 text-sm text-muted">
									{Math.round(selected.risk_confidence * 100)}% confidence
								</p>
							</div>
							<div className="rounded-lg bg-surface-2 p-4">
								<span className="text-xs font-bold tracking-[0.08em] text-muted">
									OUTCOME
								</span>
								<p className="mb-0 mt-2 font-bold">
									{selected.outcome_type ?? "Awaiting outcome"}
								</p>
								<p className="mb-0 mt-1 text-sm text-muted">
									Scored {new Date(selected.scored_at).toLocaleDateString()}
								</p>
							</div>
						</div>
						<div className="mt-5">
							<h3 className="text-sm font-bold">Assessment rationale</h3>
							<p className="leading-relaxed text-muted">
								{selected.risk_rationale}
							</p>
						</div>
						<div className="mt-5">
							<div className="flex items-center gap-2">
								<FileCode2 className="text-primary" size={18} />
								<h3 className="text-sm font-bold">
									Changed files ({selected.files_changed.length})
								</h3>
							</div>
							<ul className="mt-3 grid max-h-52 list-none gap-2 overflow-y-auto p-0">
								{selected.files_changed.map((file) => (
									<li
										className="rounded-lg bg-surface-2 px-3 py-2 text-sm"
										key={file.filename}
									>
										<span className="block truncate font-bold">
											{file.filename}
										</span>
										<span className="text-muted">
											+{file.additions} −{file.deletions}
										</span>
									</li>
								))}
							</ul>
						</div>
					</section>
				</div>
			)}
		</>
	);
}
