/**
 * Workspace Domain
 *
 * This module contains the core domain logic for managing workspaces
 * and loading repository contents through providers.
 *
 * A workspace represents a collection of repositories.
 * Repository providers load tree and document data from external sources.
 */

export {
  Workspace,
  loadWorkspaceFromJson,
  type Repository,
  type RepositoryProviderKind,
  type WorkspaceConfig,
  type WorkspaceRepositoryConfig,
} from './Workspace'
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
export { createRepositoryProvider } from './createRepositoryProvider'
export {
  loadNavigationTree,
  type NavigationNode,
  type NavigationNodeType,
  type ProviderFactory,
} from './NavigationTree'
