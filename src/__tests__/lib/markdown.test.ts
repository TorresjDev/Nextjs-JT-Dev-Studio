/**
 * Markdown Utility Tests
 * 
 * Tests for markdown processing functions
 */

import { describe, it, expect } from 'vitest'
import { calculateReadingTime, extractMetadata } from '@/lib/markdown'

describe('Markdown Utility', () => {
  describe('calculateReadingTime', () => {
    it('should calculate reading time for short content', () => {
      const content = 'Hello world. This is a short text.'
      const time = calculateReadingTime(content)
      
      // Short content should be 1 minute minimum
      expect(time).toBe(1)
    })

    it('should calculate reading time for longer content', () => {
      // 400 words should take 2 minutes at 200 wpm
      const words = Array(400).fill('word').join(' ')
      const time = calculateReadingTime(words)
      
      expect(time).toBe(2)
    })

    it('should handle empty content', () => {
      const time = calculateReadingTime('')
      
      expect(time).toBe(1)
    })

    it('should round up reading time', () => {
      // 250 words should round up to 2 minutes
      const words = Array(250).fill('word').join(' ')
      const time = calculateReadingTime(words)
      
      expect(time).toBe(2)
    })
  })

  describe('extractMetadata', () => {
    it('should extract frontmatter metadata from markdown', () => {
      const source = `---
title: Test Guide
description: A test description
order: 1
---

# Content here
`
      const metadata = extractMetadata(source)
      
      expect(metadata.title).toBe('Test Guide')
      expect(metadata.description).toBe('A test description')
      expect(metadata.order).toBe(1)
    })

    it('should return empty object for markdown without frontmatter', () => {
      const source = '# Just a heading\n\nSome content'
      const metadata = extractMetadata(source)
      
      expect(Object.keys(metadata).length).toBe(0)
    })

    it('should handle partial frontmatter', () => {
      const source = `---
title: Only Title
---

Content
`
      const metadata = extractMetadata(source)
      
      expect(metadata.title).toBe('Only Title')
      expect(metadata.description).toBeUndefined()
    })
  })
})
