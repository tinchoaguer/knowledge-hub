import type { Document } from '../domain'

const MARKDOWN_EXTENSIONS = ['.md', '.markdown', '.mdown', '.mkd', '.mdx']

/**
 * Returns true when the document path looks like Markdown.
 */
export function isMarkdownDocument(document: Document): boolean {
  const path = document.path.toLowerCase()
  return MARKDOWN_EXTENSIONS.some((extension) => path.endsWith(extension))
}
