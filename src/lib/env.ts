/**
 * Environment Variables Validation
 *
 * Uses Zod for runtime validation of environment variables.
 * This ensures the app fails fast with clear error messages
 * if required env vars are missing or malformed.
 */

import { z } from "zod";

/**
 * Server-side environment variables schema
 * These are only available on the server
 */
const serverEnvSchema = z.object({
	// Supabase (required)
	NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),

	// Stripe (optional - for payments)
	STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
	STRIPE_PRICE_ID: z.string().startsWith("price_").optional(),

	// Coinbase (optional - for crypto payments)
	COINBASE_API_KEY: z.string().min(1).optional(),

	// Site URL (required for redirects)
	SITE_URL: z.string().url("Invalid site URL").optional(),

	// GitHub/WakaTime (optional)
	NEXT_GITHUB_USERNAME: z.string().optional(),
	WAKATIME_USERNAME: z.string().optional(),

	// Upstash Redis (optional - for rate limiting)
	UPSTASH_REDIS_REST_URL: z.string().url().optional(),
	UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

/**
 * Client-side environment variables schema
 * These are exposed to the browser (NEXT_PUBLIC_ prefix)
 */
const clientEnvSchema = z.object({
	NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
});

/**
 * Validate and export server environment variables
 * Only use this on the server side
 */
export function getServerEnv() {
	const result = serverEnvSchema.safeParse(process.env);

	if (!result.success) {
		console.error("❌ Invalid environment variables:");
		console.error(result.error.flatten().fieldErrors);
		throw new Error("Invalid environment variables");
	}

	return result.data;
}

/**
 * Validate and export client environment variables
 * Safe to use on client side
 */
export function getClientEnv() {
	const result = clientEnvSchema.safeParse({
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	});

	if (!result.success) {
		console.error("❌ Invalid client environment variables:");
		console.error(result.error.flatten().fieldErrors);
		throw new Error("Invalid client environment variables");
	}

	return result.data;
}

/**
 * Type-safe environment variable access
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Legacy env export for backwards compatibility
 * Used by existing code that imports { env } from '@/lib/env'
 */
export const env = {
	NEXT_GITHUB_USERNAME: process.env.NEXT_GITHUB_USERNAME || '',
	WAKATIME_USERNAME: process.env.WAKATIME_USERNAME || '',
} as const;
