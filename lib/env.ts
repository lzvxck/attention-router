function required(name: string) { const value = process.env[name]; if (!value) throw new Error(`Missing ${name}`); return value; }
export const env = {
  github: () => ({ appId: required("GITHUB_APP_ID"), privateKey: required("GITHUB_PRIVATE_KEY").replace(/\\n/g, "\n"), webhookSecret: required("GITHUB_WEBHOOK_SECRET") }),
  groq: () => ({ apiKey: required("GROQ_API_KEY"), model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile" }),
  databaseUrl: () => required("DATABASE_URL"),
};
