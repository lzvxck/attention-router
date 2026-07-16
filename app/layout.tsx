import { SignInButton } from "@/components/sign-in-button";
import { UserMenu } from "@/components/user-menu";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import "./globals.css";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await auth.api.getSession({ headers: await headers() });
	return (
		<html lang="en">
			<body>
				<header className="border-b border-edge bg-canvas/95 backdrop-blur">
					<div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-8 lg:px-12">
						<a
							aria-label="PR Attention Router home"
							className="flex items-center gap-2 text-sm font-bold no-underline sm:text-base"
							href="/"
						>
							<span className="inline-flex size-7 items-center justify-center rounded-full bg-primary font-black text-black">
								↗
							</span>
							<span className="max-sm:hidden">PR Attention Router</span>
						</a>
						<nav
							className="flex items-center gap-1"
							aria-label="Workspace navigation"
						>
							<a
								className="rounded-lg px-3 py-2 text-sm font-bold text-muted no-underline transition hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
								href="/"
							>
								Overview
							</a>
							<a
								className="rounded-lg px-3 py-2 text-sm font-bold text-muted no-underline transition hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
								href="/app"
							>
								Repositories
							</a>
						</nav>
						<div className="ml-auto">
							{session ? (
								<UserMenu image={session.user.image} name={session.user.name} />
							) : (
								<SignInButton />
							)}
						</div>
					</div>
				</header>
				<main className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-8 pb-12 sm:px-8 lg:px-12">
					{children}
				</main>
			</body>
		</html>
	);
}
