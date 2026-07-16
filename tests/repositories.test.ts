import { beforeEach, describe, expect, it, vi } from "vitest";

const sql = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ db: () => sql }));

import {
	dashboardPage,
	markReverted,
	reposForAccessibleRepositories,
	saveVerdict,
} from "@/lib/repositories";

describe("repository idempotency", () => {
	beforeEach(() => sql.mockReset());
	it("persists a verdict and its initial path counters in one atomic statement", async () => {
		sql.mockResolvedValueOnce([]);
		await saveVerdict(
			1,
			{
				number: 2,
				title: "x",
				author: "a",
				headSha: "sha",
				files: [{ filename: "app/a.ts", additions: 1, deletions: 0 }],
			},
			{
				tier: "quick-glance",
				confidence: 0.5,
				rationale: "x",
				key_risk_factors: [],
			},
		);
		expect(sql).toHaveBeenCalledOnce();
		expect(sql.mock.calls[0][0].join("")).toContain("WITH saved AS");
	});
	it("updates revert counters only when outcome insertion succeeds", async () => {
		sql.mockResolvedValueOnce([{ found: true }]);
		await expect(markReverted(1, "sha", 3)).resolves.toBe(true);
		expect(sql).toHaveBeenCalledOnce();
		expect(sql.mock.calls[0][0].join("")).toContain("outcome AS");
	});
	it("scopes dashboard records to the requested repository", async () => {
		sql.mockResolvedValueOnce([]);
		await dashboardPage(42, 1);
		expect(sql.mock.calls[0][0].join("")).toContain("WHERE p.repo_id=");
		expect(sql.mock.calls[0][1]).toBe(42);
	});
	it("paginates dashboard records in the database", async () => {
		sql.mockResolvedValueOnce([{ id: 1, total_count: "21" }]);
		await expect(dashboardPage(42, 2)).resolves.toMatchObject({ total: 21 });
		const [query, repoId, pageSize, offset] = sql.mock.calls[0];
		expect(query.join("")).toContain("LIMIT");
		expect([repoId, pageSize, offset]).toEqual([42, 20, 20]);
	});
	it("normalizes database repository IDs before route authorization", async () => {
		sql.mockResolvedValueOnce([{ id: "1", owner: "acme", name: "demo" }]);
		await expect(
			reposForAccessibleRepositories([{ owner: "acme", name: "demo" }]),
		).resolves.toEqual([{ id: 1, owner: "acme", name: "demo" }]);
	});
});
