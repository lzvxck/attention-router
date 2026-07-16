import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ upsertRepo: vi.fn(), riskStats: vi.fn(), saveVerdict: vi.fn(), markReverted: vi.fn(), installationClient: vi.fn(), pullRequestContext: vi.fn(), postCheck: vi.fn(), scorePullRequest: vi.fn() }));
vi.mock("@/lib/repositories", () => ({ upsertRepo: mocks.upsertRepo, riskStats: mocks.riskStats, saveVerdict: mocks.saveVerdict, markReverted: mocks.markReverted }));
vi.mock("@/lib/github", () => ({ installationClient: mocks.installationClient, pullRequestContext: mocks.pullRequestContext, postCheck: mocks.postCheck }));
vi.mock("@/lib/risk-scoring", () => ({ scorePullRequest: mocks.scorePullRequest }));
import { POST } from "@/app/api/github/webhook/route";

process.env.GITHUB_WEBHOOK_SECRET = "test-secret"; process.env.GITHUB_APP_ID = "1"; process.env.GITHUB_PRIVATE_KEY = "key";
const payload = (action: string, pr: { number: number; title: string; body: string | null; merged: boolean; user: { login: string }; head: { sha: string } } = { number: 3, title: "Add counter", body: null, merged: false, user: { login: "dev" }, head: { sha: "abc" } }) => ({ action, installation: { id: 9 }, repository: { owner: { login: "acme" }, name: "demo" }, pull_request: pr });
function request(body: object) { const text = JSON.stringify(body); return new Request("http://test/api/github/webhook", { method: "POST", headers: { "x-github-event": "pull_request", "x-hub-signature-256": `sha256=${createHmac("sha256", "test-secret").update(text).digest("hex")}` }, body: text }); }
describe("GitHub pull request webhooks", () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.upsertRepo.mockResolvedValue(1); mocks.riskStats.mockResolvedValue([]); mocks.installationClient.mockResolvedValue({}); mocks.pullRequestContext.mockResolvedValue({ files: [{ filename: "app/page.tsx", additions: 1, deletions: 0 }], diff: "" }); mocks.scorePullRequest.mockResolvedValue({ tier: "quick-glance", confidence: .8, rationale: "small", key_risk_factors: [] }); });
  it("scores a correctly signed opened event and posts a check", async () => { expect((await POST(request(payload("opened")))).status).toBe(200); expect(mocks.saveVerdict).toHaveBeenCalledOnce(); expect(mocks.postCheck).toHaveBeenCalledOnce(); });
  it("calibrates a merged native revert exactly through the revert boundary", async () => { const pr = { number: 4, title: 'Revert "Add counter"', body: "This reverts commit abcdef1.", merged: true, user: { login: "dev" }, head: { sha: "def" } }; expect((await POST(request(payload("closed", pr)))).status).toBe(200); expect(mocks.markReverted).toHaveBeenCalledWith(1, "abcdef1", 4); expect(mocks.scorePullRequest).not.toHaveBeenCalled(); });
});
