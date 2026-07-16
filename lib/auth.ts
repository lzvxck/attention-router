import { betterAuth } from "better-auth";
import { randomUUID } from "node:crypto";

const config = {
	baseUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
	secret: process.env.SESSION_SECRET ?? `${randomUUID()}${randomUUID()}`,
	githubClientId: process.env.GITHUB_OAUTH_CLIENT_ID ?? "oauth-not-configured",
	githubClientSecret:
		process.env.GITHUB_OAUTH_CLIENT_SECRET ?? "oauth-not-configured",
};

export const auth = betterAuth({
	baseURL: config.baseUrl,
	secret: config.secret,
	trustedOrigins: [config.baseUrl],
	socialProviders: {
		github: {
			clientId: config.githubClientId,
			clientSecret: config.githubClientSecret,
			scope: ["read:user", "user:email"],
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 8,
			strategy: "jwe",
			refreshCache: true,
		},
	},
	account: {
		storeStateStrategy: "cookie",
		storeAccountCookie: true,
	},
});
