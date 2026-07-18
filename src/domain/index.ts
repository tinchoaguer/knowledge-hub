/**
 * Workspace Domain
 *
 * This module contains the core domain logic for managing workspaces
 * and loading repository contents through providers.
 *
 * A workspace represents a collection of repositories.
 * Repository providers load tree and document data from external sources.
 */

export { Workspace, loadWorkspaceFromJson, type Repository } from './Workspace'
export type {
  Document,
  RepositoryProvider,
  TreeEntry,
  TreeEntryType,
} from './RepositoryProvider'
export {
  GitHubRepositoryProvider,
  buildTree,
  type GitHubRepositoryProviderOptions,
} from './providers/GitHubRepositoryProvider'
