import { describe, it, expect } from 'vitest'
import { loadWorkspaceFromJson, type Repository } from './Workspace'

describe('loadWorkspaceFromJson', () => {
  it('should load workspace from JSON configuration', () => {
    const config = {
      repositories: [
        {
          id: 'repo-1',
          name: 'Project A',
          url: 'https://github.com/user/project-a',
          description: 'A sample project',
        },
        {
          id: 'repo-2',
          name: 'Project B',
          url: 'https://github.com/user/project-b',
        },
      ] as Repository[],
    }

    const workspace = loadWorkspaceFromJson(config)

    expect(workspace.getRepositoryCount()).toBe(2)
    expect(workspace.getRepository('repo-1')?.name).toBe('Project A')
    expect(workspace.getRepository('repo-2')?.name).toBe('Project B')
  })

  it('should load empty workspace from empty configuration', () => {
    const config = { repositories: [] }
    const workspace = loadWorkspaceFromJson(config)
    expect(workspace.getRepositoryCount()).toBe(0)
  })
})
