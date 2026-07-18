import { useEffect, useMemo, useState } from 'react'
import DocumentPane from '../components/DocumentPane'
import GitHubTokenForm from '../components/GitHubTokenForm'
import TreeView from '../components/TreeView/TreeView'
import {
  createRepositoryProvider,
  getGitHubToken,
  loadNavigationTree,
  loadWorkspaceFromJson,
  type Document,
  type NavigationNode,
  type RepositoryProvider,
  type WorkspaceConfig,
} from '../domain'
import workspaceConfig from '../../workspace.json'

type TreeState =
  | { status: 'loading' }
  | { status: 'ready'; nodes: NavigationNode[] }
  | { status: 'error'; message: string }

type DocumentState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; document: Document }
  | { status: 'error'; message: string }

export default function Explorer() {
  const [token, setToken] = useState<string | undefined>(() => getGitHubToken())
  const [treeState, setTreeState] = useState<TreeState>({ status: 'loading' })
  const [providers, setProviders] = useState<Map<string, RepositoryProvider>>(new Map())
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [selectedNode, setSelectedNode] = useState<NavigationNode | undefined>()
  const [documentState, setDocumentState] = useState<DocumentState>({ status: 'idle' })

  const workspace = useMemo(
    () => loadWorkspaceFromJson(workspaceConfig as WorkspaceConfig),
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function loadTree() {
      setTreeState({ status: 'loading' })

      try {
        const repositories = workspace.getAllRepositories()
        const nextProviders = new Map<string, RepositoryProvider>()

        for (const repository of repositories) {
          nextProviders.set(
            repository.id,
            createRepositoryProvider(repository, { token }),
          )
        }

        const nodes = await loadNavigationTree(
          repositories,
          (repository) =>
            nextProviders.get(repository.id) ??
            createRepositoryProvider(repository, { token }),
        )

        if (!cancelled) {
          setProviders(nextProviders)
          setTreeState({ status: 'ready', nodes })
        }
      } catch (error) {
        if (!cancelled) {
          setTreeState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to load workspace',
          })
        }
      }
    }

    void loadTree()
    return () => {
      cancelled = true
    }
  }, [workspace, token])

  useEffect(() => {
    let cancelled = false

    async function loadDocument() {
      if (!selectedNode || selectedNode.type !== 'file' || !selectedNode.path) {
        setDocumentState({ status: 'idle' })
        return
      }

      const provider = providers.get(selectedNode.repositoryId)
      if (!provider) {
        setDocumentState({ status: 'error', message: 'Repository provider is unavailable' })
        return
      }

      setDocumentState({ status: 'loading' })

      try {
        const document = await provider.getDocument(selectedNode.path)
        if (!cancelled) {
          setDocumentState({ status: 'ready', document })
        }
      } catch (error) {
        if (!cancelled) {
          setDocumentState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to load document',
          })
        }
      }
    }

    void loadDocument()
    return () => {
      cancelled = true
    }
  }, [selectedNode, providers])

  const handleSelect = (node: NavigationNode) => {
    setSelectedId(node.id)
    setSelectedNode(node)
  }

  const handleTokenChange = (next: string | undefined) => {
    setSelectedId(undefined)
    setSelectedNode(undefined)
    setDocumentState({ status: 'idle' })
    setToken(next)
  }

  return (
    <div className="explorer">
      <aside className="explorer-sidebar">
        <header className="explorer-sidebar-header">
          <h1>Workspace</h1>
          <p>Browse repositories and folders</p>
        </header>

        <GitHubTokenForm onTokenChange={handleTokenChange} />

        {treeState.status === 'loading' ? <p className="explorer-status">Loading tree…</p> : null}
        {treeState.status === 'error' ? (
          <p className="explorer-status explorer-status--error">{treeState.message}</p>
        ) : null}
        {treeState.status === 'ready' ? (
          <TreeView nodes={treeState.nodes} selectedId={selectedId} onSelect={handleSelect} />
        ) : null}
      </aside>

      <section className="explorer-main">
        {!selectedNode ? (
          <>
            <h2>Knowledge Hub</h2>
            <p className="explorer-placeholder">
              Select a repository, folder, or document in the navigation tree. Private repositories
              need a GitHub token saved in the sidebar.
            </p>
          </>
        ) : (
          <>
            <h2>{selectedNode.name}</h2>
            <p className="explorer-selection-meta">
              {selectedNode.type}
              {selectedNode.path ? ` · ${selectedNode.path}` : ''}
              {` · ${selectedNode.repositoryId}`}
            </p>

            {selectedNode.type === 'file' ? (
              <>
                {documentState.status === 'loading' ? (
                  <p className="explorer-status">Loading document…</p>
                ) : null}
                {documentState.status === 'error' ? (
                  <p className="explorer-status explorer-status--error">{documentState.message}</p>
                ) : null}
                {documentState.status === 'ready' ? (
                  <DocumentPane document={documentState.document} />
                ) : null}
              </>
            ) : (
              <p className="explorer-placeholder">
                {selectedNode.type === 'repository'
                  ? 'Expand this repository in the tree to browse its folders and documents.'
                  : 'Select a Markdown or JSON file to render its contents.'}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
