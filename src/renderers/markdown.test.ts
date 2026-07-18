import { describe, it, expect } from 'vitest'
import { isMarkdownDocument } from './markdown'

describe('isMarkdownDocument', () => {
  it('accepts common Markdown extensions', () => {
    expect(isMarkdownDocument({ path: 'README.md', content: '# Hi' })).toBe(true)
    expect(isMarkdownDocument({ path: 'docs/Guide.Markdown', content: '' })).toBe(true)
    expect(isMarkdownDocument({ path: 'notes.mdx', content: '' })).toBe(true)
  })

  it('rejects non-Markdown documents', () => {
    expect(isMarkdownDocument({ path: 'package.json', content: '{}' })).toBe(false)
    expect(isMarkdownDocument({ path: 'src/main.ts', content: '' })).toBe(false)
    expect(isMarkdownDocument({ path: 'readme', content: '# Hi' })).toBe(false)
  })
})
