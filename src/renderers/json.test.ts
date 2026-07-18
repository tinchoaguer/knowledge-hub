import { describe, it, expect } from 'vitest'
import {
  collectTableColumns,
  formatJsonValue,
  isArrayOfObjects,
  isJsonDocument,
  parseJsonDocument,
  resolveJsonViewMode,
} from './json'

describe('isJsonDocument', () => {
  it('accepts .json paths', () => {
    expect(isJsonDocument({ path: 'package.json', content: '{}' })).toBe(true)
    expect(isJsonDocument({ path: 'data/Config.JSON', content: '{}' })).toBe(true)
  })

  it('rejects non-JSON paths', () => {
    expect(isJsonDocument({ path: 'README.md', content: '{}' })).toBe(false)
    expect(isJsonDocument({ path: 'data.jsonc', content: '{}' })).toBe(false)
  })
})

describe('parseJsonDocument', () => {
  it('parses valid JSON', () => {
    expect(parseJsonDocument({ path: 'a.json', content: '{"a":1}' })).toEqual({
      ok: true,
      value: { a: 1 },
    })
  })

  it('returns an error for invalid JSON', () => {
    const result = parseJsonDocument({ path: 'a.json', content: '{bad' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(0)
    }
  })
})

describe('resolveJsonViewMode', () => {
  it('uses a property tree for objects', () => {
    expect(resolveJsonViewMode({ name: 'Knowledge Hub' })).toBe('property-tree')
    expect(resolveJsonViewMode({})).toBe('property-tree')
  })

  it('uses a table for arrays of objects', () => {
    expect(
      resolveJsonViewMode([
        { id: 1, name: 'A' },
        { id: 2, name: 'B', extra: true },
      ]),
    ).toBe('table')
  })

  it('uses formatted JSON otherwise', () => {
    expect(resolveJsonViewMode([])).toBe('formatted')
    expect(resolveJsonViewMode([1, 2, 3])).toBe('formatted')
    expect(resolveJsonViewMode([{ a: 1 }, 'x'])).toBe('formatted')
    expect(resolveJsonViewMode('hello')).toBe('formatted')
    expect(resolveJsonViewMode(42)).toBe('formatted')
    expect(resolveJsonViewMode(null)).toBe('formatted')
  })
})

describe('isArrayOfObjects', () => {
  it('requires a non-empty array of plain objects', () => {
    expect(isArrayOfObjects([{ a: 1 }])).toBe(true)
    expect(isArrayOfObjects([])).toBe(false)
    expect(isArrayOfObjects([null])).toBe(false)
    expect(isArrayOfObjects([[1]])).toBe(false)
  })
})

describe('collectTableColumns', () => {
  it('preserves first-seen key order across rows', () => {
    expect(
      collectTableColumns([
        { id: 1, name: 'A' },
        { name: 'B', role: 'admin', id: 2 },
      ]),
    ).toEqual(['id', 'name', 'role'])
  })
})

describe('formatJsonValue', () => {
  it('formats primitives and nested values', () => {
    expect(formatJsonValue(null)).toBe('null')
    expect(formatJsonValue('hi')).toBe('hi')
    expect(formatJsonValue(3)).toBe('3')
    expect(formatJsonValue(true)).toBe('true')
    expect(formatJsonValue({ a: 1 })).toBe('{"a":1}')
  })
})
