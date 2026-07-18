import type { Repository } from './Workspace'
import type { RepositoryProvider } from './RepositoryProvider'
import { GitHubRepositoryProvider } from './providers/GitHubRepositoryProvider'

/**
 * Creates a RepositoryProvider for a workspace repository definition.
 */
export function createRepositoryProvider(repository: Repository): RepositoryProvider {
  switch (repository.provider) {
    case 'github':
      return new GitHubRepositoryProvider({
        owner: repository.owner,
        repo: repository.repo,
        ref: repository.ref,
      })
    default: {
      const exhaustive: never = repository.provider
      throw new Error(`Unsupported repository provider: ${String(exhaustive)}`)
    }
  }
}
