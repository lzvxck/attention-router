"use client";

import { authClient } from "@/lib/auth-client";

export function SignInButton() {
	return (
		<button
			className="button primary"
			onClick={() =>
				authClient.signIn.social({ provider: "github", callbackURL: "/app" })
			}
			type="button"
		>
			Sign in with GitHub
		</button>
	);
}
