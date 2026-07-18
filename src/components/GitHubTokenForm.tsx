import { useState, type FormEvent } from 'react'
import { clearGitHubToken, getGitHubToken, setGitHubToken } from '../domain'

export interface GitHubTokenFormProps {
  /** Called after the token is saved or cleared so the workspace can reload */
  onTokenChange?: (token: string | undefined) => void
}

/**
 * Lets the user store a GitHub personal access token in the browser.
 * Required to read private repositories. Never sent to Knowledge Hub servers.
 */
export default function GitHubTokenForm({ onTokenChange }: GitHubTokenFormProps) {
  const [draft, setDraft] = useState('')
  const [hasToken, setHasToken] = useState(() => Boolean(getGitHubToken()))
  const [message, setMessage] = useState<string | null>(null)

  const handleSave = (event: FormEvent) => {
    event.preventDefault()
    const next = draft.trim()
    if (!next) {
      setMessage('Paste a token first.')
      return
    }

    setGitHubToken(next)
    setDraft('')
    setHasToken(true)
    setMessage('Token saved in this browser.')
    onTokenChange?.(next)
  }

  const handleClear = () => {
    clearGitHubToken()
    setDraft('')
    setHasToken(false)
    setMessage('Token cleared.')
    onTokenChange?.(undefined)
  }

  return (
    <section className="github-token-form" aria-label="GitHub authentication">
      <h2>Private repos</h2>
      <p>
        Paste a fine-grained PAT with <strong>Contents: Read</strong> for your private
        repositories. Stored only in this browser.
      </p>

      <form onSubmit={handleSave}>
        <label className="github-token-label" htmlFor="github-token">
          GitHub token
        </label>
        <input
          id="github-token"
          className="github-token-input"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder={hasToken ? 'Token saved — paste to replace' : 'ghp_… or github_pat_…'}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="github-token-actions">
          <button type="submit" className="github-token-save">
            Save token
          </button>
          <button
            type="button"
            className="github-token-clear"
            onClick={handleClear}
            disabled={!hasToken}
          >
            Clear
          </button>
        </div>
      </form>

      <p className={`github-token-status${hasToken ? ' is-ready' : ''}`}>
        {hasToken ? 'Authenticated for private repos' : 'No token — public repos only'}
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
