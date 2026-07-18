const STORAGE_KEY = 'knowledge-hub.github-token'

/**
 * Reads the GitHub personal access token from local browser storage.
 * The token never lives in the repository or build output.
 */
export function getGitHubToken(): string | undefined {
  if (typeof localStorage === 'undefined') {
    return undefined
  }

  const value = localStorage.getItem(STORAGE_KEY)?.trim()
  return value || undefined
}

/**
 * Saves the GitHub personal access token in local browser storage.
 */
export function setGitHubToken(token: string): void {
  const value = token.trim()
  if (!value) {
    clearGitHubToken()
    return
  }

  localStorage.setItem(STORAGE_KEY, value)
}

/**
 * Removes the stored GitHub personal access token.
 */
export function clearGitHubToken(): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Returns true when a non-empty token is stored locally.
 */
export function hasGitHubToken(): boolean {
  return Boolean(getGitHubToken())
}

/**
 * Returns a masked preview of a token for the UI (never the full secret).
 */
export function maskGitHubToken(token: string): string {
  const value = token.trim()
  if (value.length <= 8) {
    return '••••••••'
  }

  return `${'•'.repeat(Math.min(12, value.length - 4))}${value.slice(-4)}`
}
