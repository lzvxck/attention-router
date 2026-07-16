import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/repositories", () => ({ dashboard: vi.fn().mockResolvedValue([{ id: 1, number: 2, title: "Counter", author: "dev", risk_tier: "deep-review", risk_rationale: "migration", risk_confidence: .9, scored_at: "2026-07-10T00:00:00Z", outcome_type: "reverted" }]) }));
import Page from "@/app/page";
describe("dashboard", () => { it("renders risk, outcome, and a chronological calibration point", async () => { const html = renderToStaticMarkup(await Page()); expect(html).toContain("deep-review"); expect(html).toContain("Outcome: reverted"); expect(html).toContain("Jul 2026: 100% reverted"); }); });
