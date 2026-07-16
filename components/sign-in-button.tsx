"use client";

import { GitPullRequest } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function SignInButton() {
	return (
		<button
			className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-black transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
			onClick={() =>
				authClient.signIn.social({ provider: "github", callbackURL: "/app" })
			}
			type="button"
		>
			<GitPullRequest aria-hidden="true" size={18} />
			Sign in with GitHub
		</button>
	);
}
