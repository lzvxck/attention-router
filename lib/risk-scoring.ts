import OpenAI from "openai";
import { env } from "./env";
import { riskTiers, type ChangedFile, type RiskStat, type RiskVerdict } from "./types";
import { calibration } from "./revert-calibration";

export function validateVerdict(value: unknown): RiskVerdict {
  if (!value || typeof value !== "object") throw new Error("Model returned no verdict");
  const verdict = value as Record<string, unknown>;
  if (!riskTiers.includes(verdict.tier as RiskVerdict["tier"]) || typeof verdict.confidence !== "number" || verdict.confidence < 0 || verdict.confidence > 1 || typeof verdict.rationale !== "string" || !Array.isArray(verdict.key_risk_factors) || !verdict.key_risk_factors.every((x) => typeof x === "string")) throw new Error("Model returned invalid verdict");
  return verdict as RiskVerdict;
}
export function scoringPrompt(title: string, files: ChangedFile[], stats: RiskStat[]) {
  const selected = files.slice(0, 30).map(({ filename, additions, deletions, patch }) => ({ filename, additions, deletions, patch: patch?.slice(0, 2000) }));
  return `Score this pull request for reviewer attention. Return JSON with tier (auto-mergeable, quick-glance, or deep-review), confidence (0..1), rationale, and key_risk_factors. Repository calibration: ${JSON.stringify(calibration(files, stats))}. PR: ${title}. Changed files: ${JSON.stringify(selected)}.`;
}
export async function scorePullRequest(title: string, files: ChangedFile[], stats: RiskStat[]) {
  const config = env.groq();
  const client = new OpenAI({ apiKey: config.apiKey, baseURL: "https://api.groq.com/openai/v1" });
  const completion = await client.chat.completions.create({ model: config.model, messages: [{ role: "user", content: scoringPrompt(title, files, stats) }], response_format: { type: "json_schema", json_schema: { name: "risk_verdict", strict: true, schema: { type: "object", additionalProperties: false, required: ["tier", "confidence", "rationale", "key_risk_factors"], properties: { tier: { type: "string", enum: riskTiers }, confidence: { type: "number", minimum: 0, maximum: 1 }, rationale: { type: "string" }, key_risk_factors: { type: "array", items: { type: "string" } } } } } }, temperature: 0 });
  return validateVerdict(JSON.parse(completion.choices[0]?.message.content ?? ""));
}
