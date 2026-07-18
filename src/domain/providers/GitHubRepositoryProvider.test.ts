import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildTree, GitHubRepositoryProvider } from './GitHubRepositoryProvider'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function textResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/plain' },
  })
}

describe('buildTree', () => {
  it('builds a nested tree from a flat GitHub tree response', () => {
    const tree = buildTree([
      { path: 'README.md', type: 'blob', sha: '1' },
      { path: 'docs', type: 'tree', sha: '2' },
      { path: 'docs/architecture.md', type: 'blob', sha: '3' },
      { path: 'docs/guides', type: 'tree', sha: '4' },
      { path: 'docs/guides/start.md', type: 'blob', sha: '5' },
      { path: 'src', type: 'tree', sha: '6' },
      { path: 'src/index.ts', type: 'blob', sha: '7' },
    ])

    expect(tree).toEqual([
      {
        name: 'docs',
        path: 'docs',
        type: 'directory',
        children: [
          {
            name: 'guides',
            path: 'docs/guides',
            type: 'directory',
            children: [
              {
                name: 'start.md',
                path: 'docs/guides/start.md',
                type: 'file',
              },
            ],
          },
          {
            name: 'architecture.md',
            path: 'docs/architecture.md',
            type: 'file',
          },
        ],
      },
      {
        name: 'src',
        path: 'src',
        type: 'directory',
        children: [
          {
            name: 'index.ts',
            path: 'src/index.ts',
            type: 'file',
          },
        ],
      },
      {
        name: 'README.md',
        path: 'README.md',
        type: 'file',
      },
    ])
  })

  it('ignores commit entries', () => {
    const tree = buildTree([
      { path: 'submodule', type: 'commit', sha: 'abc' },
      { path: 'file.txt', type: 'blob', sha: 'def' },
    ])

    expect(tree).toEqual([{ name: 'file.txt', path: 'file.txt', type: 'file' }])
  })
})

describe('GitHubRepositoryProvider', () => {
  const owner = 'octocat'
  const repo = 'hello-world'
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
  })

  it('requires owner and repo', () => {
    expect(() => new GitHubRepositoryProvider({ owner: '', repo })).toThrow('owner')
    expect(() => new GitHubRepositoryProvider({ owner, repo: '  ' })).toThrow('repo')
  })

  it('reads the repository tree using the default branch', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ default_branch: 'main' }))
      .mockResolvedValueOnce(
        jsonResponse({
          sha: 'tree-sha',
          truncated: false,
          tree: [
            { path: 'docs', type: 'tree', sha: 'a' },
            { path: 'docs/readme.md', type: 'blob', sha: 'b' },
          ],
        }),
      )

    const provider = new GitHubRepositoryProvider({
      owner,
      repo,
      fetch: fetchMock as unknown as typeof fetch,
    })

    const tree = await provider.getTree()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.github.com/repos/octocat/hello-world')
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://api.github.com/repos/octocat/hello-world/git/trees/main?recursive=1',
    )
    expect(tree).toEqual([
      {
        name: 'docs',
        path: 'docs',
        type: 'directory',
        children: [{ name: 'readme.md', path: 'docs/readme.md', type: 'file' }],
      },
    ])
  })

  it('reads file contents and decodes base64', async () => {
    const content = 'Hello Knowledge Hub'
    const encoded = btoa(content)

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        type: 'file',
        path: 'README.md',
        encoding: 'base64',
        content: encoded,
        download_url: null,
        size: content.length,
      }),
    )

    const provider = new GitHubRepositoryProvider({
      owner,
      repo,
      ref: 'main',
      fetch: fetchMock as unknown as typeof fetch,
    })

    const document = await provider.getDocument('README.md')

    expect(document).toEqual({ path: 'README.md', content })
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.github.com/repos/octocat/hello-world/contents/README.md?ref=main',
    )
  })

  it('downloads large files via download_url when encoding is none', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          type: 'file',
          path: 'large.md',
          encoding: 'none',
          content: '',
          download_url: 'https://raw.githubusercontent.com/octocat/hello-world/main/large.md',
          size: 2_000_000,
        }),
      )
      .mockResolvedValueOnce(textResponse('# Large file'))

    const provider = new GitHubRepositoryProvider({
      owner,
      repo,
      ref: 'main',
      fetch: fetchMock as unknown as typeof fetch,
    })

    const document = await provider.getDocument('large.md')
    expect(document.content).toBe('# Large file')
  })

  it('caches tree and document requests', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          sha: 'tree-sha',
          truncated: false,
          tree: [{ path: 'a.md', type: 'blob', sha: '1' }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          type: 'file',
          path: 'a.md',
          encoding: 'base64',
          content: btoa('cached'),
          download_url: null,
          size: 6,
        }),
      )

    const provider = new GitHubRepositoryProvider({
      owner,
      repo,
      ref: 'main',
      fetch: fetchMock as unknown as typeof fetch,
    })

    await provider.getTree()
    await provider.getTree()
    await provider.getDocument('a.md')
    await provider.getDocument('a.md')

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('rejects directory paths when reading documents', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        {
          type: 'file',
          path: 'docs/a.md',
          encoding: 'base64',
          content: '',
          download_url: null,
          size: 0,
        },
      ]),
    )

    const provider = new GitHubRepositoryProvider({
      owner,
      repo,
      ref: 'main',
      fetch: fetchMock as unknown as typeof fetch,
    })

    await expect(provider.getDocument('docs')).rejects.toThrow('directory')
  })

  it('throws when the recursive tree is truncated', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        sha: 'tree-sha',
        truncated: true,
        tree: [{ path: 'a.md', type: 'blob', sha: '1' }],
      }),
    )

    const provider = new GitHubRepositoryProvider({
      owner,
      repo,
      ref: 'main',
      fetch: fetchMock as unknown as typeof fetch,
    })

    await expect(provider.getTree()).rejects.toThrow('truncated')
  })

  it('throws on GitHub API errors', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Not Found' }, 404))

    const provider = new GitHubRepositoryProvider({
      owner,
      repo,
      ref: 'main',
      fetch: fetchMock as unknown as typeof fetch,
    })

    await expect(provider.getTree()).rejects.toThrow('404')
  })

  it('sends GitHub API headers and never authenticates', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        sha: 'tree-sha',
        truncated: false,
        tree: [],
      }),
    )

    const provider = new GitHubRepositoryProvider({
      owner,
      repo,
      ref: 'main',
      fetch: fetchMock as unknown as typeof fetch,
    })

    await provider.getTree()

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers).toEqual({
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    })
    expect(init.headers).not.toHaveProperty('Authorization')
  })
})
