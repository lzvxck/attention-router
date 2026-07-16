import { describe, expect, it } from "vitest";
import { calibration, pathPattern, revertedCommit } from "@/lib/revert-calibration";
describe("native GitHub reverts", () => { it("recognizes the documented convention", () => expect(revertedCommit('Revert "add counter"', "This reverts commit a1b2c3d4.")).toBe("a1b2c3d4")); it("rejects malformed reverts", () => expect(revertedCommit("revert", "This reverts commit a1b2c3d4.")).toBeNull()); });
describe("calibration", () => { it("groups paths and calculates rates", () => { expect(pathPattern("app/page.tsx")).toBe("app/*"); expect(calibration([{ filename: "app/page.tsx", additions: 1, deletions: 0 }], [{ path_pattern: "app/*", total_prs: 4, reverted_prs: 1 }])).toEqual([{ pattern: "app/*", rate: .25, samples: 4 }]); }); });
