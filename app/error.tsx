"use client";

export default function AppError({
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	return (
		<div className="mx-auto grid max-w-xl gap-4 rounded-xl border border-edge bg-surface-1 p-8 text-center">
			<p className="m-0 text-xs font-bold tracking-[0.08em] text-muted">
				UNAVAILABLE
			</p>
			<h1 className="m-0 text-3xl font-bold">
				Something interrupted the review signal.
			</h1>
			<p className="m-0 leading-relaxed text-muted">
				Try again to reconnect to the latest repository data.
			</p>
			<button
				className="justify-self-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-black transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
				onClick={reset}
				type="button"
			>
				Try again
			</button>
		</div>
	);
}
