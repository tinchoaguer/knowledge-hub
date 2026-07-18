import { describe, it, expect } from 'vitest'
import { filterTreeEntries, loadNavigationTree } from './NavigationTree'
import type { Repository } from './Workspace'
import type { Document, RepositoryProvider, TreeEntry } from './RepositoryProvider'

const sampleTree: TreeEntry[] = [
  {
    name: 'docs',
    path: 'docs',
    type: 'directory',
    children: [
      { name: 'readme.md', path: 'docs/readme.md', type: 'file' },
      {
        name: 'guides',
        path: 'docs/guides',
        type: 'directory',
        children: [{ name: 'start.md', path: 'docs/guides/start.md', type: 'file' }],
      },
    ],
  },
  {
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [{ name: 'index.ts', path: 'src/index.ts', type: 'file' }],
  },
  { name: 'package.json', path: 'package.json', type: 'file' },
  { name: 'README.md', path: 'README.md', type: 'file' },
]

class FakeRepositoryProvider implements RepositoryProvider {
  constructor(
    private readonly tree: TreeEntry[],
    private readonly error?: Error,
  ) {}

  async getTree(): Promise<TreeEntry[]> {
    if (this.error) {
      throw this.error
    }
    return this.tree
  }

  async getDocument(): Promise<Document> {
    throw new Error('Not used')
  }
}

describe('loadNavigationTree', () => {
  const repositories: Repository[] = [
    {
      id: 'org/product',
      name: 'Product',
      provider: 'github',
      owner: 'org',
      repo: 'product',
    },
    {
      id: 'org/backend',
      name: 'Backend',
      provider: 'github',
      owner: 'org',
      repo: 'backend',
    },
  ]

  it('builds repository roots with folders and files from providers', async () => {
    const tree = await loadNavigationTree(repositories, (repository) => {
      if (repository.id === 'org/product') {
        return new FakeRepositoryProvider([
          {
            name: 'docs',
            path: 'docs',
            type: 'directory',
            children: [{ name: 'readme.md', path: 'docs/readme.md', type: 'file' }],
          },
          { name: 'package.json', path: 'package.json', type: 'file' },
        ])
      }

      return new FakeRepositoryProvider([
        { name: 'src', path: 'src', type: 'directory', children: [] },
      ])
    })

    expect(tree).toEqual([
      {
        id: 'repo:org/product',
        name: 'Product',
        type: 'repository',
        repositoryId: 'org/product',
        children: [
          {
            id: 'dir:org/product:docs',
            name: 'docs',
            type: 'directory',
            repositoryId: 'org/product',
            path: 'docs',
            children: [
              {
                id: 'file:org/product:docs/readme.md',
                name: 'readme.md',
                type: 'file',
                repositoryId: 'org/product',
                path: 'docs/readme.md',
              },
            ],
          },
          {
            id: 'file:org/product:package.json',
            name: 'package.json',
            type: 'file',
            repositoryId: 'org/product',
            path: 'package.json',
          },
        ],
      },
      {
        id: 'repo:org/backend',
        name: 'Backend',
        type: 'repository',
        repositoryId: 'org/backend',
        children: [
          {
            id: 'dir:org/backend:src',
            name: 'src',
            type: 'directory',
            repositoryId: 'org/backend',
            path: 'src',
            children: [],
          },
        ],
      },
    ])
  })

  it('keeps other repositories when one provider fails', async () => {
    const tree = await loadNavigationTree(repositories, (repository) => {
      if (repository.id === 'org/product') {
        return new FakeRepositoryProvider([], new Error('API unavailable'))
      }

      return new FakeRepositoryProvider([
        { name: 'README.md', path: 'README.md', type: 'file' },
      ])
    })

    expect(tree[0]).toMatchObject({
      name: 'Product',
      type: 'repository',
      error: 'API unavailable',
      children: [],
    })
    expect(tree[1].children).toHaveLength(1)
    expect(tree[1].error).toBeUndefined()
  })

  it('applies repository include paths when building the navigation tree', async () => {
    const repos: Repository[] = [
      {
        id: 'org/product',
        name: 'Product',
        provider: 'github',
        owner: 'org',
        repo: 'product',
        include: ['docs', 'README.md'],
      },
    ]

    const tree = await loadNavigationTree(repos, () => new FakeRepositoryProvider(sampleTree))

    expect(tree[0].children?.map((child) => child.path)).toEqual(['docs', 'README.md'])
    expect(tree[0].children?.[0].children?.map((child) => child.path)).toEqual([
      'docs/readme.md',
      'docs/guides',
    ])
  })
})

describe('filterTreeEntries', () => {
  it('returns the full tree when include is omitted', () => {
    expect(filterTreeEntries(sampleTree)).toEqual(sampleTree)
  })

  it('returns an empty tree when include is empty', () => {
    expect(filterTreeEntries(sampleTree, [])).toEqual([])
  })

  it('keeps included folders and files', () => {
    const filtered = filterTreeEntries(sampleTree, ['docs', 'README.md'])
    expect(filtered.map((entry) => entry.path)).toEqual(['docs', 'README.md'])
    expect(filtered[0].children?.map((entry) => entry.path)).toEqual([
      'docs/readme.md',
      'docs/guides',
    ])
  })

  it('keeps ancestor folders for nested include paths', () => {
    const filtered = filterTreeEntries(sampleTree, ['docs/guides'])
    expect(filtered).toEqual([
      {
        name: 'docs',
        path: 'docs',
        type: 'directory',
        children: [
          {
            name: 'guides',
            path: 'docs/guides',
            type: 'directory',
            children: [{ name: 'start.md', path: 'docs/guides/start.md', type: 'file' }],
          },
        ],
      },
    ])
  })
})
