import type { EnvironmentVariables } from "./types";

// Validate environment variables
const requiredEnvVars = {
	NEXT_GITHUB_USERNAME: process.env.NEXT_GITHUB_USERNAME,
	WAKATIME_USERNAME: process.env.WAKATIME_USERNAME,
} as const;

// Check for missing environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
});

export const env: EnvironmentVariables =
	requiredEnvVars as EnvironmentVariables;
