"use client";

import {
	ChevronLeft,
	ChevronRight,
	CircleDot,
	FolderGit2,
	LayoutDashboard,
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
	const [expanded, setExpanded] = useState(true);
	const labelClass = expanded ? "" : "hidden";
	return (
		<aside
			className={`sticky top-0 flex min-h-screen flex-col gap-6 bg-black px-3 py-6 transition-[width] duration-200 ${expanded ? "md:w-60" : "md:w-[72px]"} max-md:w-full max-md:min-h-0 max-md:flex-row max-md:items-center max-md:border-b max-md:border-edge max-md:py-2`}
		>
			<div
				className={`flex items-center justify-between gap-2 ${expanded ? "" : "md:flex-col"} max-md:flex-1 max-md:flex-row`}
			>
				<a
					className="flex items-center gap-2 px-2 text-lg font-bold no-underline"
					href="/"
					aria-label="PR Attention Router home"
				>
					<span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-xl font-black text-black">
						↗
					</span>
					<span className={labelClass}>PR Attention Router</span>
				</a>
				<button
					aria-expanded={expanded}
					aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
					className="hidden size-8 items-center justify-center rounded-full border border-edge text-muted transition hover:border-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:inline-flex"
					onClick={() => setExpanded((current) => !current)}
					type="button"
				>
					{expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
				</button>
			</div>
			<nav
				className="flex flex-col gap-1 max-md:flex-row"
				aria-label="Workspace navigation"
			>
				<a
					aria-label="Overview"
					className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-muted no-underline transition hover:bg-surface-2 hover:text-ink focus-visible:bg-surface-2 focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
					href="/"
				>
					<LayoutDashboard aria-hidden="true" size={18} />
					<span className={labelClass}>Overview</span>
				</a>
				<a
					aria-label="Repositories"
					className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-muted no-underline transition hover:bg-surface-2 hover:text-ink focus-visible:bg-surface-2 focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
					href="/app"
				>
					<FolderGit2 aria-hidden="true" size={18} />
					<span className={labelClass}>Repositories</span>
				</a>
			</nav>
			<div className="mt-auto hidden items-center gap-3 border-t border-edge px-2 pt-4 text-xs text-muted md:flex">
				<CircleDot
					aria-hidden="true"
					className="shrink-0 text-primary"
					size={14}
				/>
				<span className={labelClass}>Webhook monitoring active</span>
			</div>
		</aside>
	);
}
