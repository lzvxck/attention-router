"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type UserMenuProps = {
	image?: string | null;
	name: string;
};

export function UserMenu({ image, name }: UserMenuProps) {
	const [open, setOpen] = useState(false);
	const initial = name.trim().charAt(0).toUpperCase() || "?";
	return (
		<div className="relative">
			<button
				aria-expanded={open}
				aria-haspopup="menu"
				className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-3 py-1 pl-1 pr-3 text-sm font-bold transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
				onClick={() => setOpen((current) => !current)}
				type="button"
			>
				{image ? (
					<img
						alt=""
						className="size-9 rounded-full object-cover"
						src={image}
					/>
				) : (
					<span className="inline-flex size-9 items-center justify-center rounded-full bg-primary font-bold text-black">
						{initial}
					</span>
				)}
				<span className="max-w-32 truncate max-sm:hidden">{name}</span>
				<ChevronDown aria-hidden="true" size={16} />
			</button>
			{open && (
				<div
					className="absolute right-0 z-10 mt-2 grid min-w-52 overflow-hidden rounded-xl border border-edge bg-surface-1 p-1 shadow-[0_8px_32px_rgb(0_0_0_/_0.6)]"
					role="menu"
				>
					<button
						className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm font-bold transition hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
						onClick={() => authClient.signOut()}
						role="menuitem"
						type="button"
					>
						<LogOut aria-hidden="true" size={16} />
						Sign out
					</button>
				</div>
			)}
		</div>
	);
}
