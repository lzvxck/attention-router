import type { ChangedFile, RiskStat } from "./types";

export function revertedCommit(title: string, body: string | null) {
  return /^Revert ".+"$/.test(title) ? body?.match(/This reverts commit ([0-9a-f]{7,40})\./i)?.[1] ?? null : null;
}
export function pathPattern(path: string) { const parts = path.split("/"); return parts.length > 1 ? `${parts[0]}/*` : path; }
export function calibration(files: ChangedFile[], stats: RiskStat[]) {
  const map = new Map(stats.map((stat) => [stat.path_pattern, stat]));
  return [...new Set(files.map((file) => pathPattern(file.filename)))].map((pattern) => {
    const stat = map.get(pattern); const rate = stat && stat.total_prs ? stat.reverted_prs / stat.total_prs : 0;
    return { pattern, rate, samples: stat?.total_prs ?? 0 };
  });
}
