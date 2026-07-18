import type { Repository } from './Workspace'
import type { RepositoryProvider, TreeEntry } from './RepositoryProvider'

/**
 * Node types shown in the workspace navigation tree.
 */
export type NavigationNodeType = 'repository' | 'directory' | 'file'

/**
 * A node in the unified workspace navigation tree.
 *
 * The tree is independent from document rendering.
 */
export interface NavigationNode {
  /** Stable unique id within the workspace tree */
  id: string
  /** Display label */
  name: string
  /** Node kind */
  type: NavigationNodeType
  /** Owning repository id */
  repositoryId: string
  /** Path relative to the repository root (directories and files) */
  path?: string
  /** Nested children for repositories and directories */
  children?: NavigationNode[]
  /** Error message when a repository tree could not be loaded */
  error?: string
}

export type ProviderFactory = (repository: Repository) => RepositoryProvider

/**
 * Loads a unified navigation tree for all repositories in a workspace.
 *
 * Each repository becomes a root node. Folder/file children come from
 * the repository provider. Failures are captured on the repository node
 * so the rest of the workspace can still render.
 */
export async function loadNavigationTree(
  repositories: Repository[],
  createProvider: ProviderFactory,
): Promise<NavigationNode[]> {
  return Promise.all(
    repositories.map(async (repository) => {
      try {
        const provider = createProvider(repository)
        const entries = await provider.getTree()
        return {
          id: `repo:${repository.id}`,
          name: repository.name,
          type: 'repository' as const,
          repositoryId: repository.id,
          children: mapEntries(repository.id, entries),
        }
      } catch (error) {
        return {
          id: `repo:${repository.id}`,
          name: repository.name,
          type: 'repository' as const,
          repositoryId: repository.id,
          children: [],
          error: error instanceof Error ? error.message : 'Failed to load repository tree',
        }
      }
    }),
  )
}

function mapEntries(repositoryId: string, entries: TreeEntry[]): NavigationNode[] {
  return entries.map((entry) => mapEntry(repositoryId, entry))
}

function mapEntry(repositoryId: string, entry: TreeEntry): NavigationNode {
  if (entry.type === 'directory') {
    return {
      id: `dir:${repositoryId}:${entry.path}`,
      name: entry.name,
      type: 'directory',
      repositoryId,
      path: entry.path,
      children: mapEntries(repositoryId, entry.children ?? []),
    }
  }

  return {
    id: `file:${repositoryId}:${entry.path}`,
    name: entry.name,
    type: 'file',
    repositoryId,
    path: entry.path,
  }
}
