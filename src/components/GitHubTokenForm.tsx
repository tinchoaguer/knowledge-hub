import { useState, type FormEvent } from 'react'
import {
  clearGitHubToken,
  getGitHubToken,
  maskGitHubToken,
  setGitHubToken,
} from '../domain'

export interface GitHubTokenFormProps {
  /** Called after the token is saved or cleared so the workspace can reload */
  onTokenChange?: (token: string | undefined) => void
}

/**
 * Lets the user store a GitHub personal access token in the browser.
 * Required to read private repositories. Never sent to Knowledge Hub servers.
 */
export default function GitHubTokenForm({ onTokenChange }: GitHubTokenFormProps) {
  const [storedToken, setStoredToken] = useState(() => getGitHubToken())
  const [editing, setEditing] = useState(() => !getGitHubToken())
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const hasToken = Boolean(storedToken)

  const handleSave = (event: FormEvent) => {
    event.preventDefault()
    const next = draft.trim()
    if (!next) {
      setMessage('Paste a token first.')
      return
    }

    setGitHubToken(next)
    setStoredToken(next)
    setDraft('')
    setEditing(false)
    setMessage('Token saved in this browser. Reloading repositories…')
    onTokenChange?.(next)
  }

  const handleEdit = () => {
    setEditing(true)
    setDraft('')
    setMessage('Paste a new token to replace the current one.')
  }

  const handleCancelEdit = () => {
    setDraft('')
    setEditing(false)
    setMessage(null)
  }

  const handleClear = () => {
    clearGitHubToken()
    setStoredToken(undefined)
    setDraft('')
    setEditing(true)
    setMessage('Token cleared.')
    onTokenChange?.(undefined)
  }

  return (
    <section className="github-token-form" aria-label="GitHub authentication">
      <h2>Private repos</h2>
      <p>
        Use a fine-grained PAT with access to each private repo and{' '}
        <strong>Contents: Read</strong>. Stored only in this browser.
      </p>

      {hasToken && !editing ? (
        <div className="github-token-saved">
          <p className="github-token-mask">
            Saved token: <code>{maskGitHubToken(storedToken!)}</code>
          </p>
          <div className="github-token-actions">
            <button type="button" className="github-token-save" onClick={handleEdit}>
              Edit token
            </button>
            <button type="button" className="github-token-clear" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <label className="github-token-label" htmlFor="github-token">
            {hasToken ? 'Replace GitHub token' : 'GitHub token'}
          </label>
          <input
            id="github-token"
            className="github-token-input"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="ghp_… or github_pat_…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="github-token-actions">
            <button type="submit" className="github-token-save">
              {hasToken ? 'Update token' : 'Save token'}
            </button>
            {hasToken ? (
              <button type="button" className="github-token-clear" onClick={handleCancelEdit}>
                Cancel
              </button>
            ) : (
              <button type="button" className="github-token-clear" onClick={handleClear} disabled>
                Clear
              </button>
            )}
          </div>
        </form>
      )}

      <p className={`github-token-status${hasToken ? ' is-ready' : ''}`}>
        {hasToken ? 'Token present — used for private repo API calls' : 'No token — public repos only'}
      </p>
      {message ? <p className="github-token-message">{message}</p> : null}

      <a
        className="github-token-help"
        href="https://github.com/settings/personal-access-tokens/new"
        target="_blank"
        rel="noreferrer"
      >
        Create a fine-grained token
      </a>
    </section>
  )
}
