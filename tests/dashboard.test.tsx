import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/repositories", () => ({
	demoRepoId: vi.fn().mockResolvedValue(1),
	dashboardPage: vi.fn().mockResolvedValue({
		records: [
			{
				id: 1,
				number: 2,
				title: "Counter",
				author: "dev",
				risk_tier: "deep-review",
				risk_rationale: "migration",
				risk_confidence: 0.9,
				scored_at: "2026-07-10T00:00:00Z",
				outcome_type: "reverted",
				files_changed: [],
			},
		],
		total: 21,
	}),
}));
vi.mock("@/lib/env", () => ({
	env: {
		auth: () => ({ demoRepoOwner: "acme", demoRepoName: "demo" }),
	},
}));
vi.mock("@/lib/auth", () => ({
	auth: { api: { getSession: vi.fn().mockResolvedValue(null) } },
}));
vi.mock("next/headers", () => ({
	headers: vi.fn().mockResolvedValue(new Headers()),
}));

import Page from "@/app/page";

describe("dashboard", () => {
	it("renders risk, outcome, and a chronological calibration point", async () => {
		const html = renderToStaticMarkup(
			await Page({ searchParams: Promise.resolve({}) }),
		);
		expect(html).toContain("deep-review");
		expect(html).toContain("Outcome: reverted");
		expect(html).toContain("Jul 2026: 100% reverted");
		expect(html).toContain("Page 1 of 2");
	});
});
