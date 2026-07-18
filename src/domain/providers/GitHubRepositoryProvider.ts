import type { Document, RepositoryProvider, TreeEntry } from '../RepositoryProvider'

const DEFAULT_API_BASE_URL = 'https://api.github.com'
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000

interface CacheEntry<T> {
  value: T
  expiresAt: number | null
}

interface GitHubRepoResponse {
  default_branch: string
}

interface GitHubTreeItem {
  path: string
  type: 'blob' | 'tree' | 'commit'
  sha: string
  size?: number
}

interface GitHubTreeResponse {
  sha: string
  tree: GitHubTreeItem[]
  truncated: boolean
}

interface GitHubContentFileResponse {
  type: 'file'
  path: string
  encoding: string
  content: string
  download_url: string | null
  size: number
}

export interface GitHubRepositoryProviderOptions {
  /** Repository owner (user or organization) */
  owner: string
  /** Repository name */
  repo: string
  /** Branch, tag, or commit SHA. Defaults to the repository default branch. */
  ref?: string
  /** Cache TTL in milliseconds. Defaults to 5 minutes. Use 0 for no expiration. */
  cacheTtlMs?: number
  /** Custom fetch implementation (useful for testing). */
  fetch?: typeof fetch
  /** GitHub API base URL. Defaults to https://api.github.com */
  apiBaseUrl?: string
}

/**
 * RepositoryProvider backed by the public GitHub REST API.
 *
 * Read-only and unauthenticated. Suitable for public repositories.
 */
export class GitHubRepositoryProvider implements RepositoryProvider {
  private readonly owner: string
  private readonly repo: string
  private readonly configuredRef?: string
  private readonly cacheTtlMs: number
  private readonly fetchFn: typeof fetch
  private readonly apiBaseUrl: string
  private readonly cache = new Map<string, CacheEntry<unknown>>()
  private resolvedRef: string | undefined

  constructor(options: GitHubRepositoryProviderOptions) {
    if (!options.owner.trim()) {
      throw new Error('GitHubRepositoryProvider requires a non-empty owner')
    }
    if (!options.repo.trim()) {
      throw new Error('GitHubRepositoryProvider requires a non-empty repo')
    }

    this.owner = options.owner
    this.repo = options.repo
    this.configuredRef = options.ref
    this.cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS
    this.fetchFn = options.fetch ?? fetch
    this.apiBaseUrl = (options.apiBaseUrl ?? DEFAULT_API_BASE_URL).replace(/\/$/, '')
  }

  async getTree(): Promise<TreeEntry[]> {
    const ref = await this.resolveRef()
    const cacheKey = `tree:${this.owner}/${this.repo}:${ref}`

    return this.getOrFetch(cacheKey, async () => {
      const data = await this.requestJson<GitHubTreeResponse>(
        `/repos/${this.owner}/${this.repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`,
      )

      if (data.truncated) {
        throw new Error(
          `GitHub tree for ${this.owner}/${this.repo}@${ref} is truncated; repository is too large for a recursive tree fetch`,
        )
      }

      return buildTree(data.tree)
    })
  }

  async getDocument(path: string): Promise<Document> {
    const normalizedPath = normalizePath(path)
    if (!normalizedPath) {
      throw new Error('Document path must not be empty')
    }

    const ref = await this.resolveRef()
    const cacheKey = `content:${this.owner}/${this.repo}:${ref}:${normalizedPath}`

    return this.getOrFetch(cacheKey, async () => {
      const encodedPath = normalizedPath
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')

      const data = await this.requestJson<GitHubContentFileResponse | GitHubContentFileResponse[]>(
        `/repos/${this.owner}/${this.repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`,
      )

      if (Array.isArray(data)) {
        throw new Error(`Path "${normalizedPath}" is a directory, not a document`)
      }

      if (data.type !== 'file') {
        throw new Error(`Path "${normalizedPath}" is not a file`)
      }

      const content = await this.decodeFileContent(data)
      return { path: data.path, content }
    })
  }

  /** Clears the in-memory request cache. */
  clearCache(): void {
    this.cache.clear()
    this.resolvedRef = undefined
  }

  private async resolveRef(): Promise<string> {
    if (this.configuredRef) {
      return this.configuredRef
    }

    if (this.resolvedRef) {
      return this.resolvedRef
    }

    const cacheKey = `repo:${this.owner}/${this.repo}`
    const repo = await this.getOrFetch(cacheKey, () =>
      this.requestJson<GitHubRepoResponse>(`/repos/${this.owner}/${this.repo}`),
    )

    this.resolvedRef = repo.default_branch
    return this.resolvedRef
  }

  private async decodeFileContent(file: GitHubContentFileResponse): Promise<string> {
    if (file.encoding === 'base64' && file.content) {
      return decodeBase64(file.content.replace(/\n/g, ''))
    }

    if (file.download_url) {
      const response = await this.fetchFn(file.download_url)
      if (!response.ok) {
        throw new Error(
          `Failed to download content for ${this.owner}/${this.repo}/${file.path}: ${response.status} ${response.statusText}`,
        )
      }
      return response.text()
    }

    throw new Error(
      `Unable to decode content for ${this.owner}/${this.repo}/${file.path} (encoding: ${file.encoding})`,
    )
  }

  private async getOrFetch<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key)
    if (cached && (cached.expiresAt === null || cached.expiresAt > Date.now())) {
      return cached.value as T
    }

    const value = await loader()
    this.cache.set(key, {
      value,
      expiresAt: this.cacheTtlMs > 0 ? Date.now() + this.cacheTtlMs : null,
    })
    return value
  }

  private async requestJson<T>(path: string): Promise<T> {
    const response = await this.fetchFn(`${this.apiBaseUrl}${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })

    if (!response.ok) {
      throw new Error(
        `GitHub API request failed for ${path}: ${response.status} ${response.statusText}`,
      )
    }

    return (await response.json()) as T
  }
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '')
}

function decodeBase64(value: string): string {
  const binary = atob(value)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/**
 * Builds a nested tree from a flat GitHub git tree response.
 */
export function buildTree(items: GitHubTreeItem[]): TreeEntry[] {
  const root: TreeEntry[] = []
  const directories = new Map<string, TreeEntry>()

  const ensureDirectory = (dirPath: string): TreeEntry => {
    const existing = directories.get(dirPath)
    if (existing) {
      return existing
    }

    const entry: TreeEntry = {
      name: dirPath.includes('/') ? dirPath.slice(dirPath.lastIndexOf('/') + 1) : dirPath,
      path: dirPath,
      type: 'directory',
      children: [],
    }
    directories.set(dirPath, entry)

    if (!dirPath.includes('/')) {
      root.push(entry)
    } else {
      const parentPath = dirPath.slice(0, dirPath.lastIndexOf('/'))
      const parent = ensureDirectory(parentPath)
      parent.children = parent.children ?? []
      parent.children.push(entry)
    }

    return entry
  }

  const sorted = [...items].sort((a, b) => a.path.localeCompare(b.path))

  for (const item of sorted) {
    if (item.type !== 'blob' && item.type !== 'tree') {
      continue
    }

    if (item.type === 'tree') {
      ensureDirectory(item.path)
      continue
    }

    const entry: TreeEntry = {
      name: item.path.includes('/') ? item.path.slice(item.path.lastIndexOf('/') + 1) : item.path,
      path: item.path,
      type: 'file',
    }

    if (!item.path.includes('/')) {
      root.push(entry)
      continue
    }

    const parentPath = item.path.slice(0, item.path.lastIndexOf('/'))
    const parent = ensureDirectory(parentPath)
    parent.children = parent.children ?? []
    parent.children.push(entry)
  }

  const sortEntries = (entries: TreeEntry[]): void => {
    entries.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
    for (const entry of entries) {
      if (entry.children) {
        sortEntries(entry.children)
      }
    }
  }

  sortEntries(root)
  return root
}
