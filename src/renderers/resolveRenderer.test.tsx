import { describe, it, expect } from 'vitest'
import { isValidElement } from 'react'
import { resolveRenderer } from './resolveRenderer'
import JsonRenderer from './JsonRenderer'
import MarkdownRenderer from './MarkdownRenderer'

describe('resolveRenderer', () => {
  it('returns the Markdown renderer for Markdown documents', () => {
    const result = resolveRenderer({ path: 'docs/architecture.md', content: '# Architecture' })
    expect(isValidElement(result)).toBe(true)
    expect(result && isValidElement(result) && result.type).toBe(MarkdownRenderer)
  })

  it('returns the JSON renderer for JSON documents', () => {
    const result = resolveRenderer({ path: 'package.json', content: '{"name":"knowledge-hub"}' })
    expect(isValidElement(result)).toBe(true)
    expect(result && isValidElement(result) && result.type).toBe(JsonRenderer)
  })

  it('returns null when no renderer supports the document', () => {
    expect(resolveRenderer({ path: 'main.ts', content: 'export {}' })).toBeNull()
  })
})
