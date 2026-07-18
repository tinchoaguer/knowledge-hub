import type { ReactNode } from 'react'
import type { Document } from '../domain'

/**
 * A Renderer displays a document.
 *
 * Each renderer decides whether it supports a document.
 * Renderers never access repositories directly.
 */
export interface DocumentRenderer {
  /** Whether this renderer can display the document */
  supports(document: Document): boolean
  /** Renders the document as read-only content */
  render(document: Document): ReactNode
}
