import { useState } from 'react'
import type { Document } from '../domain'
import {
  collectTableColumns,
  formatJsonValue,
  isJsonDocument,
  parseJsonDocument,
  resolveJsonViewMode,
} from './json'
import './JsonRenderer.css'

export interface JsonRendererProps {
  document: Document
}

function PropertyTree({
  name,
  value,
  depth = 0,
  defaultExpanded = true,
}: {
  name?: string
  value: unknown
  depth?: number
  defaultExpanded?: boolean
}) {
  const isObject = typeof value === 'object' && value !== null
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (!isObject) {
    return (
      <div className="json-tree-row" style={{ paddingLeft: `${depth * 0.9}rem` }}>
        {name !== undefined ? <span className="json-tree-key">{name}</span> : null}
        {name !== undefined ? <span className="json-tree-sep">: </span> : null}
        <span className={`json-tree-value json-tree-value--${valueType(value)}`}>
          {formatLeaf(value)}
        </span>
      </div>
    )
  }

  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value as Record<string, unknown>)

  const summary = Array.isArray(value)
    ? `Array(${value.length})`
    : `Object(${entries.length})`

  return (
    <div className="json-tree-node">
      <button
        type="button"
        className="json-tree-toggle"
        style={{ paddingLeft: `${depth * 0.9}rem` }}
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
      >
        <span className="json-tree-twistie" aria-hidden="true">
          {expanded ? '▾' : '▸'}
        </span>
        {name !== undefined ? <span className="json-tree-key">{name}</span> : null}
        {name !== undefined ? <span className="json-tree-sep">: </span> : null}
        <span className="json-tree-summary">{summary}</span>
      </button>

      {expanded
        ? entries.map(([key, child]) => (
            <PropertyTree
              key={key}
              name={key}
              value={child}
              depth={depth + 1}
              defaultExpanded={depth < 1}
            />
          ))
        : null}
    </div>
  )
}

function JsonTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = collectTableColumns(rows)

  return (
    <div className="json-table-wrap">
      <table className="json-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column}>
                  {Object.prototype.hasOwnProperty.call(row, column)
                    ? formatJsonValue(row[column])
                    : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FormattedJson({ value }: { value: unknown }) {
  return <pre className="json-formatted">{JSON.stringify(value, null, 2)}</pre>
}

function valueType(value: unknown): string {
  if (value === null) {
    return 'null'
  }
  return typeof value
}

function formatLeaf(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  return formatJsonValue(value)
}

/**
 * Read-only JSON renderer.
 *
 * - object → property tree
 * - array of objects → table
 * - otherwise → formatted JSON
 */
export default function JsonRenderer({ document }: JsonRendererProps) {
  const parsed = parseJsonDocument(document)

  if (!parsed.ok) {
    return (
      <div className="json-renderer" aria-label={`JSON document ${document.path}`}>
        <p className="json-error">Invalid JSON: {parsed.error}</p>
        <pre className="json-formatted">{document.content}</pre>
      </div>
    )
  }

  const mode = resolveJsonViewMode(parsed.value)

  return (
    <article className="json-renderer" aria-label={`JSON document ${document.path}`}>
      {mode === 'property-tree' ? <PropertyTree value={parsed.value} /> : null}
      {mode === 'table' ? <JsonTable rows={parsed.value as Record<string, unknown>[]} /> : null}
      {mode === 'formatted' ? <FormattedJson value={parsed.value} /> : null}
    </article>
  )
}

JsonRenderer.supports = isJsonDocument
