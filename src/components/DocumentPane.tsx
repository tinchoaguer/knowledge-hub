import type { Document } from '../domain'
import { resolveRenderer } from '../renderers'

export interface DocumentPaneProps {
  document: Document
}

/**
 * Displays a document using the first matching renderer.
 *
 * Does not load repositories. Rendering is read-only.
 */
export default function DocumentPane({ document }: DocumentPaneProps) {
  const rendered = resolveRenderer(document)

  if (!rendered) {
    return (
      <p className="explorer-placeholder">
        No renderer is available for <code>{document.path}</code> yet.
      </p>
    )
  }

  return <div className="document-pane">{rendered}</div>
}
