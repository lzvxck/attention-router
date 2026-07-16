export const riskTiers = ["auto-mergeable", "quick-glance", "deep-review"] as const;
export type RiskTier = (typeof riskTiers)[number];
export type ChangedFile = { filename: string; additions: number; deletions: number; patch?: string };
export type RiskStat = { path_pattern: string; total_prs: number; reverted_prs: number };
export type RiskVerdict = { tier: RiskTier; confidence: number; rationale: string; key_risk_factors: string[] };
export type DashboardPr = { id: number; number: number; title: string; author: string; risk_tier: RiskTier; risk_rationale: string; risk_confidence: number; scored_at: string; outcome_type: string | null };
