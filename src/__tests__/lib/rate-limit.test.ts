/**
 * Rate Limit Utility Tests
 * 
 * Tests for the rate limiting utility functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getClientIp, checkRateLimit } from '@/lib/rate-limit'

describe('Rate Limit Utility', () => {
    describe('getClientIp', () => {
        it('should extract IP from x-forwarded-for header', () => {
            const request = new Request('http://localhost:3000/api/test', {
                headers: {
                    'x-forwarded-for': '192.168.1.1, 10.0.0.1',
                },
            })

            const ip = getClientIp(request)
            expect(ip).toBe('192.168.1.1')
        })

        it('should extract IP from x-real-ip header when x-forwarded-for is not present', () => {
            const request = new Request('http://localhost:3000/api/test', {
                headers: {
                    'x-real-ip': '192.168.1.2',
                },
            })

            const ip = getClientIp(request)
            expect(ip).toBe('192.168.1.2')
        })

        it('should return "anonymous" when no IP headers are present', () => {
            const request = new Request('http://localhost:3000/api/test')

            const ip = getClientIp(request)
            expect(ip).toBe('anonymous')
        })

        it('should handle whitespace in x-forwarded-for header', () => {
            const request = new Request('http://localhost:3000/api/test', {
                headers: {
                    'x-forwarded-for': '  192.168.1.3  , 10.0.0.1',
                },
            })

            const ip = getClientIp(request)
            expect(ip).toBe('192.168.1.3')
        })
    })

    describe('checkRateLimit', () => {
        it('should return success when rate limiter is null (not configured)', async () => {
            const result = await checkRateLimit(null, '192.168.1.1')

            expect(result.success).toBe(true)
        })
    })
})
