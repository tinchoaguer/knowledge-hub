import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearGitHubToken,
  getGitHubToken,
  hasGitHubToken,
  maskGitHubToken,
  setGitHubToken,
} from './githubToken'

describe('githubToken storage', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
    })
  })

  it('saves, reads, and clears a token', () => {
    expect(hasGitHubToken()).toBe(false)

    setGitHubToken('  github_pat_abc  ')
    expect(getGitHubToken()).toBe('github_pat_abc')
    expect(hasGitHubToken()).toBe(true)

    clearGitHubToken()
    expect(getGitHubToken()).toBeUndefined()
    expect(hasGitHubToken()).toBe(false)
  })

  it('treats an empty save as clear', () => {
    setGitHubToken('token')
    setGitHubToken('   ')
    expect(getGitHubToken()).toBeUndefined()
  })

  it('masks tokens for display', () => {
    expect(maskGitHubToken('github_pat_abcdefghij')).toMatch(/••••.*hij$/)
  })
})
