/**
 * Entry type in a repository tree.
 */
export type TreeEntryType = 'file' | 'directory'

/**
 * A node in the repository navigation tree.
 *
 * Directories may include nested children. Files never have children.
 */
export interface TreeEntry {
  /** File or directory name (last path segment) */
  name: string
  /** Path relative to the repository root */
  path: string
  /** Whether this entry is a file or a directory */
  type: TreeEntryType
  /** Nested entries when type is directory */
  children?: TreeEntry[]
}

/**
 * A document loaded from a repository.
 *
 * Documents contain content only. They do not know how they are displayed.
 */
export interface Document {
  /** Path relative to the repository root */
  path: string
  /** Text content of the document */
  content: string
}

/**
 * Loads repository contents for navigation and reading.
 *
 * Implementations must never render documents, contain UI logic,
 * or understand document semantics.
 */
export interface RepositoryProvider {
  /**
   * Returns the repository file and directory tree.
   */
  getTree(): Promise<TreeEntry[]>

  /**
   * Reads a document by path relative to the repository root.
   * @param path - Document path (e.g. "docs/architecture.md")
   */
  getDocument(path: string): Promise<Document>
}
