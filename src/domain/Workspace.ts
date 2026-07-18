/**
 * Supported repository provider kinds.
 */
export type RepositoryProviderKind = 'github'

/**
 * A repository definition in the workspace.
 *
 * Matches entries in workspace.json and is provider-agnostic at the UI layer.
 */
export interface Repository {
  /** Unique identifier for the repository */
  id: string
  /** Display name */
  name: string
  /** Provider used to load repository contents */
  provider: RepositoryProviderKind
  /** Repository owner (user or organization) */
  owner: string
  /** Repository name on the provider */
  repo: string
  /** Optional branch, tag, or commit SHA */
  ref?: string
  /** Optional description */
  description?: string
  /**
   * Optional paths to show in the explorer (folders or files).
   * When omitted, the full repository tree is shown.
   * When set (including empty), only matching paths are shown.
   */
  include?: string[]
}

/**
 * Raw repository entry as defined in workspace.json.
 */
export interface WorkspaceRepositoryConfig {
  name: string
  provider: RepositoryProviderKind
  owner: string
  repo: string
  ref?: string
  description?: string
  /** Optional folder/file paths to show in the explorer */
  include?: string[]
}

/**
 * Workspace configuration file shape.
 */
export interface WorkspaceConfig {
  repositories: WorkspaceRepositoryConfig[]
}

/**
 * Represents a collection of repositories.
 */
export class Workspace {
  private repositories: Map<string, Repository> = new Map()

  /**
   * Creates a new Workspace instance.
   * @param repositories - Initial list of repositories
   */
  constructor(repositories: Repository[] = []) {
    repositories.forEach((repo) => {
      this.repositories.set(repo.id, repo)
    })
  }

  /**
   * Adds a repository to the workspace.
   * @param repository - Repository to add
   * @throws Error if repository with same ID already exists
   */
  addRepository(repository: Repository): void {
    if (this.repositories.has(repository.id)) {
      throw new Error(`Repository with id ${repository.id} already exists`)
    }
    this.repositories.set(repository.id, repository)
  }

  /**
   * Removes a repository from the workspace.
   * @param repositoryId - ID of the repository to remove
   * @returns true if repository was removed, false if not found
   */
  removeRepository(repositoryId: string): boolean {
    return this.repositories.delete(repositoryId)
  }

  /**
   * Gets a repository by ID.
   * @param repositoryId - ID of the repository
   * @returns Repository or undefined if not found
   */
  getRepository(repositoryId: string): Repository | undefined {
    return this.repositories.get(repositoryId)
  }

  /**
   * Gets all repositories in the workspace.
   * @returns Array of repositories
   */
  getAllRepositories(): Repository[] {
    return Array.from(this.repositories.values())
  }

  /**
   * Gets the number of repositories in the workspace.
   * @returns Number of repositories
   */
  getRepositoryCount(): number {
    return this.repositories.size
  }

  /**
   * Checks if a repository exists in the workspace.
   * @param repositoryId - ID of the repository
   * @returns true if repository exists, false otherwise
   */
  hasRepository(repositoryId: string): boolean {
    return this.repositories.has(repositoryId)
  }
}

/**
 * Loads a workspace from a JSON configuration.
 * @param config - Workspace configuration with repositories array
 * @returns Workspace instance
 */
export function loadWorkspaceFromJson(config: WorkspaceConfig): Workspace {
  const repositories = config.repositories.map(toRepository)
  return new Workspace(repositories)
}

function toRepository(config: WorkspaceRepositoryConfig): Repository {
  if (config.provider !== 'github') {
    throw new Error(`Unsupported repository provider: ${String(config.provider)}`)
  }

  return {
    id: `${config.owner}/${config.repo}`,
    name: config.name,
    provider: config.provider,
    owner: config.owner,
    repo: config.repo,
    ref: config.ref,
    description: config.description,
    include: normalizeIncludePaths(config.include),
  }
}

function normalizeIncludePaths(include?: string[]): string[] | undefined {
  if (include === undefined) {
    return undefined
  }

  return include
    .map((path) => path.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '').trim())
    .filter((path) => path.length > 0)
}
