function required(name: string) {
	const value = process.env[name];
	if (!value) throw new Error(`Missing ${name}`);
	return value;
}
export const env = {
	github: () => ({
		appId: required("GITHUB_APP_ID"),
		privateKey: required("GITHUB_PRIVATE_KEY").replace(/\\n/g, "\n"),
		webhookSecret: required("GITHUB_WEBHOOK_SECRET"),
	}),
	auth: () => ({
		baseUrl: required("BETTER_AUTH_URL"),
		secret: required("SESSION_SECRET"),
		githubClientId: required("GITHUB_OAUTH_CLIENT_ID"),
		githubClientSecret: required("GITHUB_OAUTH_CLIENT_SECRET"),
		demoRepoOwner: required("DEMO_REPO_OWNER"),
		demoRepoName: required("DEMO_REPO_NAME"),
	}),
	groq: () => ({
		apiKey: required("GROQ_API_KEY"),
		model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
	}),
	databaseUrl: () => required("DATABASE_URL"),
};
