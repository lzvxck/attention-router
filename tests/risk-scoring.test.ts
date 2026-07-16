import { describe, expect, it } from "vitest";
import { scoringPrompt, validateVerdict } from "@/lib/risk-scoring";

describe("risk verdicts", () => {
	it("accepts the required schema", () =>
		expect(
			validateVerdict({
				tier: "quick-glance",
				confidence: 0.8,
				rationale: "small change",
				key_risk_factors: ["tests"],
			}).tier,
		).toBe("quick-glance"));
	it("rejects unsupported tiers", () =>
		expect(() =>
			validateVerdict({
				tier: "safe",
				confidence: 0.8,
				rationale: "x",
				key_risk_factors: [],
			}),
		).toThrow());
	it("includes calibration", () =>
		expect(
			scoringPrompt(
				"Title",
				[{ filename: "lib/a.ts", additions: 1, deletions: 0, patch: "x" }],
				[],
			).includes("lib/*"),
		).toBe(true));
	it("reports files omitted from the scoring context", () =>
		expect(
			scoringPrompt(
				"Title",
				Array.from({ length: 31 }, (_, index) => ({
					filename: `lib/${index}.ts`,
					additions: 1,
					deletions: 0,
				})),
				[],
			),
		).toContain("1 additional files not shown"));
});
