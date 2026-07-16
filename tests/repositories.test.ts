import { beforeEach, describe, expect, it, vi } from "vitest";
const sql = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ db: () => sql }));
import { markReverted, saveVerdict } from "@/lib/repositories";
describe("repository idempotency", () => {
  beforeEach(() => sql.mockReset());
  it("persists a verdict and its initial path counters in one atomic statement", async () => { sql.mockResolvedValueOnce([]); await saveVerdict(1, { number: 2, title: "x", author: "a", headSha: "sha", files: [{ filename: "app/a.ts", additions: 1, deletions: 0 }] }, { tier: "quick-glance", confidence: .5, rationale: "x", key_risk_factors: [] }); expect(sql).toHaveBeenCalledOnce(); expect(sql.mock.calls[0][0].join("")).toContain("WITH saved AS"); });
  it("updates revert counters only when outcome insertion succeeds", async () => { sql.mockResolvedValueOnce([{ found: true }]); await expect(markReverted(1, "sha", 3)).resolves.toBe(true); expect(sql).toHaveBeenCalledOnce(); expect(sql.mock.calls[0][0].join("")).toContain("outcome AS"); });
});
