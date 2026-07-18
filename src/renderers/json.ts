import type { Document } from '../domain'

const JSON_EXTENSIONS = ['.json']

export type JsonViewMode = 'property-tree' | 'table' | 'formatted'

export type JsonParseResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string }

/**
 * Returns true when the document path looks like JSON.
 */
export function isJsonDocument(document: Document): boolean {
  const path = document.path.toLowerCase()
  return JSON_EXTENSIONS.some((extension) => path.endsWith(extension))
}

/**
 * Parses document content as JSON.
 */
export function parseJsonDocument(document: Document): JsonParseResult {
  try {
    return { ok: true, value: JSON.parse(document.content) as unknown }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * True when every array element is a plain object.
 */
export function isArrayOfObjects(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.length > 0 && value.every(isPlainObject)
}

/**
 * Chooses how JSON should be displayed.
 *
 * - object → property tree
 * - array of objects → table
 * - otherwise → formatted JSON
 */
export function resolveJsonViewMode(value: unknown): JsonViewMode {
  if (isPlainObject(value)) {
    return 'property-tree'
  }

  if (isArrayOfObjects(value)) {
    return 'table'
  }

  return 'formatted'
}

/**
 * Collects column keys for an array-of-objects table (stable first-seen order).
 */
export function collectTableColumns(rows: Record<string, unknown>[]): string[] {
  const columns: string[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key)
        columns.push(key)
      }
    }
  }

  return columns
}

/**
 * Formats a JSON cell/value for display in tables and leaves.
 */
export function formatJsonValue(value: unknown): string {
  if (value === null) {
    return 'null'
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return JSON.stringify(value)
}
