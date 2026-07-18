import { describe, it, expect, beforeEach } from 'vitest'
import { Workspace, type Repository } from './Workspace'

describe('Workspace', () => {
  let workspace: Workspace
  const mockRepositories: Repository[] = [
    {
      id: 'user/project-a',
      name: 'Project A',
      provider: 'github',
      owner: 'user',
      repo: 'project-a',
      description: 'A sample project',
    },
    {
      id: 'user/project-b',
      name: 'Project B',
      provider: 'github',
      owner: 'user',
      repo: 'project-b',
      description: 'Another sample project',
    },
  ]

  beforeEach(() => {
    workspace = new Workspace()
  })

  describe('constructor', () => {
    it('should create an empty workspace', () => {
      expect(workspace.getRepositoryCount()).toBe(0)
    })

    it('should initialize with repositories from constructor', () => {
      const ws = new Workspace(mockRepositories)
      expect(ws.getRepositoryCount()).toBe(2)
      expect(ws.getRepository('user/project-a')).toEqual(mockRepositories[0])
    })
  })

  describe('addRepository', () => {
    it('should add a repository to the workspace', () => {
      workspace.addRepository(mockRepositories[0])
      expect(workspace.getRepositoryCount()).toBe(1)
      expect(workspace.getRepository('user/project-a')).toEqual(mockRepositories[0])
    })

    it('should add multiple repositories', () => {
      workspace.addRepository(mockRepositories[0])
      workspace.addRepository(mockRepositories[1])
      expect(workspace.getRepositoryCount()).toBe(2)
    })

    it('should throw error when adding duplicate repository ID', () => {
      workspace.addRepository(mockRepositories[0])
      expect(() => workspace.addRepository(mockRepositories[0])).toThrow(
        'Repository with id user/project-a already exists',
      )
    })
  })

  describe('removeRepository', () => {
    beforeEach(() => {
      workspace.addRepository(mockRepositories[0])
      workspace.addRepository(mockRepositories[1])
    })

    it('should remove a repository from the workspace', () => {
      const removed = workspace.removeRepository('user/project-a')
      expect(removed).toBe(true)
      expect(workspace.getRepositoryCount()).toBe(1)
      expect(workspace.getRepository('user/project-a')).toBeUndefined()
    })

    it('should return false when removing non-existent repository', () => {
      const removed = workspace.removeRepository('non-existent')
      expect(removed).toBe(false)
      expect(workspace.getRepositoryCount()).toBe(2)
    })
  })

  describe('getRepository', () => {
    beforeEach(() => {
      workspace.addRepository(mockRepositories[0])
    })

    it('should return a repository by ID', () => {
      const repo = workspace.getRepository('user/project-a')
      expect(repo).toEqual(mockRepositories[0])
    })

    it('should return undefined for non-existent repository', () => {
      const repo = workspace.getRepository('non-existent')
      expect(repo).toBeUndefined()
    })
  })

  describe('getAllRepositories', () => {
    it('should return an empty array when workspace is empty', () => {
      expect(workspace.getAllRepositories()).toEqual([])
    })

    it('should return all repositories', () => {
      workspace.addRepository(mockRepositories[0])
      workspace.addRepository(mockRepositories[1])
      const repos = workspace.getAllRepositories()
      expect(repos).toHaveLength(2)
      expect(repos).toContainEqual(mockRepositories[0])
      expect(repos).toContainEqual(mockRepositories[1])
    })
  })

  describe('hasRepository', () => {
    beforeEach(() => {
      workspace.addRepository(mockRepositories[0])
    })

    it('should return true for existing repository', () => {
      expect(workspace.hasRepository('user/project-a')).toBe(true)
    })

    it('should return false for non-existent repository', () => {
      expect(workspace.hasRepository('non-existent')).toBe(false)
    })
  })

  describe('getRepositoryCount', () => {
    it('should return correct count', () => {
      expect(workspace.getRepositoryCount()).toBe(0)
      workspace.addRepository(mockRepositories[0])
      expect(workspace.getRepositoryCount()).toBe(1)
      workspace.addRepository(mockRepositories[1])
      expect(workspace.getRepositoryCount()).toBe(2)
      workspace.removeRepository('user/project-a')
      expect(workspace.getRepositoryCount()).toBe(1)
    })
  })
})
