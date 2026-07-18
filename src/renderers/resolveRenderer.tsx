import type { ReactNode } from 'react'
import type { Document } from '../domain'
import MarkdownRenderer from './MarkdownRenderer'
import { isMarkdownDocument } from './markdown'

/**
 * Picks a renderer for the document, or returns null when unsupported.
 */
export function resolveRenderer(document: Document): ReactNode | null {
  if (isMarkdownDocument(document)) {
    return <MarkdownRenderer document={document} />
  }

  return null
}
