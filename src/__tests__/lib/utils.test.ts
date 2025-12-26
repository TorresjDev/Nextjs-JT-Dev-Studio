/**
 * Utils Tests
 * 
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils', () => {
    describe('cn (className merge)', () => {
        it('should merge class names correctly', () => {
            const result = cn('text-red-500', 'bg-blue-500')

            expect(result).toBe('text-red-500 bg-blue-500')
        })

        it('should handle conditional classes', () => {
            const isActive = true
            const result = cn('base-class', isActive && 'active-class')

            expect(result).toBe('base-class active-class')
        })

        it('should handle false conditionals', () => {
            const isActive = false
            const result = cn('base-class', isActive && 'active-class')

            expect(result).toBe('base-class')
        })

        it('should merge conflicting Tailwind classes (last wins)', () => {
            const result = cn('text-red-500', 'text-blue-500')

            expect(result).toBe('text-blue-500')
        })

        it('should handle array of classes', () => {
            const result = cn(['class-1', 'class-2'])

            expect(result).toBe('class-1 class-2')
        })

        it('should handle undefined and null', () => {
            const result = cn('base', undefined, null, 'end')

            expect(result).toBe('base end')
        })

        it('should handle empty input', () => {
            const result = cn()

            expect(result).toBe('')
        })

        it('should merge responsive variants correctly', () => {
            const result = cn('p-2', 'md:p-4', 'lg:p-6')

            expect(result).toBe('p-2 md:p-4 lg:p-6')
        })
    })
})
