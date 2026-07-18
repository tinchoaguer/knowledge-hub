/**
 * Represents a repository in the workspace.
 */
export interface Repository {
  /** Unique identifier for the repository */
  id: string
  /** Repository name */
  name: string
  /** Repository URL */
  url: string
  /** Repository description */
  description?: string
  /** Programming language or primary language */
  language?: string
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
export function loadWorkspaceFromJson(config: { repositories: Repository[] }): Workspace {
  return new Workspace(config.repositories)
}
