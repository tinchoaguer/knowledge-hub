import { describe, it, expect } from 'vitest'
import { loadWorkspaceFromJson } from './Workspace'

describe('loadWorkspaceFromJson', () => {
  it('should load workspace from JSON configuration', () => {
    const config = {
      repositories: [
        {
          name: 'Project A',
          provider: 'github' as const,
          owner: 'user',
          repo: 'project-a',
          description: 'A sample project',
        },
        {
          name: 'Project B',
          provider: 'github' as const,
          owner: 'user',
          repo: 'project-b',
        },
      ],
    }

    const workspace = loadWorkspaceFromJson(config)

    expect(workspace.getRepositoryCount()).toBe(2)
    expect(workspace.getRepository('user/project-a')).toMatchObject({
      name: 'Project A',
      provider: 'github',
      owner: 'user',
      repo: 'project-a',
    })
    expect(workspace.getRepository('user/project-b')?.name).toBe('Project B')
  })

  it('should load empty workspace from empty configuration', () => {
    const config = { repositories: [] }
    const workspace = loadWorkspaceFromJson(config)
    expect(workspace.getRepositoryCount()).toBe(0)
  })

  it('should reject unsupported providers', () => {
    const config = {
      repositories: [
        {
          name: 'Other',
          provider: 'gitlab' as 'github',
          owner: 'user',
          repo: 'other',
        },
      ],
    }

    expect(() => loadWorkspaceFromJson(config)).toThrow('Unsupported repository provider')
  })
})
