import type { Repository } from './Workspace'
import type { RepositoryProvider } from './RepositoryProvider'
import { GitHubRepositoryProvider } from './providers/GitHubRepositoryProvider'

export interface CreateRepositoryProviderOptions {
  /** Optional GitHub personal access token for private repositories */
  token?: string
}

/**
 * Creates a RepositoryProvider for a workspace repository definition.
 */
export function createRepositoryProvider(
  repository: Repository,
  options: CreateRepositoryProviderOptions = {},
): RepositoryProvider {
  switch (repository.provider) {
    case 'github':
      return new GitHubRepositoryProvider({
        owner: repository.owner,
        repo: repository.repo,
        ref: repository.ref,
        token: options.token,
      })
    default: {
      const exhaustive: never = repository.provider
      throw new Error(`Unsupported repository provider: ${String(exhaustive)}`)
    }
  }
}
