import { afterEach, describe, expect, it } from "vitest";

const originalGroqApiKey = process.env.GROQ_API_KEY;
const originalGroqModel = process.env.GROQ_MODEL;

afterEach(() => {
	if (originalGroqApiKey === undefined) delete process.env.GROQ_API_KEY;
	else process.env.GROQ_API_KEY = originalGroqApiKey;
	if (originalGroqModel === undefined) delete process.env.GROQ_MODEL;
	else process.env.GROQ_MODEL = originalGroqModel;
});

describe("Groq environment", () => {
	it("uses a JSON-schema compatible default model", async () => {
		process.env.GROQ_API_KEY = "test-key";
		delete process.env.GROQ_MODEL;
		const { env } = await import("@/lib/env");
		expect(env.groq().model).toBe("openai/gpt-oss-120b");
	});
});
