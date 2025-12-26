/**
 * Rate Limiting Utility
 * 
 * Uses Upstash Redis for distributed rate limiting.
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
 * 
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Upstash environment variables are configured
const isConfigured =
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN

/**
 * Rate limiter for payment endpoints
 * Allows 5 requests per minute per IP
 */
export const paymentRateLimiter = isConfigured
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, '60 s'),
        analytics: true,
        prefix: 'ratelimit:payment',
    })
    : null

/**
 * Rate limiter for general API endpoints
 * Allows 30 requests per minute per IP
 */
export const apiRateLimiter = isConfigured
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(30, '60 s'),
        analytics: true,
        prefix: 'ratelimit:api',
    })
    : null

/**
 * Helper function to check rate limit
 * Returns { success: true } if rate limit not configured (dev mode)
 */
export async function checkRateLimit(
    limiter: Ratelimit | null,
    identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
    if (!limiter) {
        // Rate limiting not configured, allow request
        return { success: true }
    }

    const result = await limiter.limit(identifier)
    return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
    }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }
    return request.headers.get('x-real-ip') || 'anonymous'
}
