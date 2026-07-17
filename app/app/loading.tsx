export default function Loading() {
	return (
		<div className="grid gap-4 pt-8">
			<div className="h-10 w-72 animate-pulse rounded-lg bg-surface-2" />
			<div className="h-24 animate-pulse rounded-xl bg-surface-1" />
		</div>
	);
}
