import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Document } from '../domain'
import { isMarkdownDocument } from './markdown'
import './MarkdownRenderer.css'

export interface MarkdownRendererProps {
  document: Document
}

/**
 * Read-only Markdown renderer with GitHub Flavored Markdown support.
 *
 * No editing. Does not access repositories.
 */
export default function MarkdownRenderer({ document }: MarkdownRendererProps) {
  return (
    <article className="markdown-renderer" aria-label={`Markdown document ${document.path}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Read-only: task-list checkboxes must not be interactive
          input: ({ ...props }) => <input {...props} disabled readOnly />,
        }}
      >
        {document.content}
      </ReactMarkdown>
    </article>
  )
}

MarkdownRenderer.supports = isMarkdownDocument
