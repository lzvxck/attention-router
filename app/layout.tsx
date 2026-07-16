import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export default function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body>
				<div className="grid min-h-screen grid-cols-[auto_minmax(0,1fr)] max-md:block">
					<Sidebar />
					<main className="grid min-w-0 gap-8 px-4 py-3 pb-12 sm:px-8 lg:px-12">
						{children}
					</main>
				</div>
			</body>
		</html>
	);
}
