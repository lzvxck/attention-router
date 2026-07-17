import { describe, expect, it, vi } from "vitest";
import { applyRiskLabel, ensureRiskLabels } from "@/lib/github";

function client(labels: { name: string }[] = []) {
	return {
		issues: {
			addLabels: vi.fn(),
			createLabel: vi.fn(),
			listLabelsOnIssue: vi.fn().mockResolvedValue({ data: labels }),
			removeLabel: vi.fn(),
		},
	};
}

describe("GitHub risk labels", () => {
	it("creates missing labels and ignores existing-label responses", async () => {
		const octokit = client();
		octokit.issues.createLabel.mockRejectedValue({ status: 422 });
		await expect(
			ensureRiskLabels(octokit as never, "acme", "demo"),
		).resolves.toBeUndefined();
		expect(octokit.issues.createLabel).toHaveBeenCalledTimes(3);
	});
	it("replaces stale risk labels before applying the current tier", async () => {
		const octokit = client([
			{ name: "risk:deep-review" },
			{ name: "needs-triage" },
		]);
		await applyRiskLabel(octokit as never, "acme", "demo", 2, "quick-glance");
		expect(octokit.issues.removeLabel).toHaveBeenCalledWith({
			owner: "acme",
			repo: "demo",
			issue_number: 2,
			name: "risk:deep-review",
		});
		expect(octokit.issues.addLabels).toHaveBeenCalledWith({
			owner: "acme",
			repo: "demo",
			issue_number: 2,
			labels: ["risk:quick-glance"],
		});
	});
});
