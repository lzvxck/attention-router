"use client";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
	return (
		<button
			className="button"
			onClick={() => authClient.signOut()}
			type="button"
		>
			Sign out
		</button>
	);
}
