import { useEffect, useState } from 'react'
import TreeView from '../components/TreeView/TreeView'
import {
  createRepositoryProvider,
  loadNavigationTree,
  loadWorkspaceFromJson,
  type NavigationNode,
  type WorkspaceConfig,
} from '../domain'
import workspaceConfig from '../../workspace.json'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; nodes: NavigationNode[] }
  | { status: 'error'; message: string }

export default function Explorer() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [selectedNode, setSelectedNode] = useState<NavigationNode | undefined>()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const workspace = loadWorkspaceFromJson(workspaceConfig as WorkspaceConfig)
        const nodes = await loadNavigationTree(
          workspace.getAllRepositories(),
          createRepositoryProvider,
        )

        if (!cancelled) {
          setState({ status: 'ready', nodes })
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to load workspace',
          })
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSelect = (node: NavigationNode) => {
    setSelectedId(node.id)
    setSelectedNode(node)
  }

  return (
    <div className="explorer">
      <aside className="explorer-sidebar">
        <header className="explorer-sidebar-header">
          <h1>Workspace</h1>
          <p>Browse repositories and folders</p>
        </header>

        {state.status === 'loading' ? <p className="explorer-status">Loading tree…</p> : null}
        {state.status === 'error' ? (
          <p className="explorer-status explorer-status--error">{state.message}</p>
        ) : null}
        {state.status === 'ready' ? (
          <TreeView nodes={state.nodes} selectedId={selectedId} onSelect={handleSelect} />
        ) : null}
      </aside>

      <section className="explorer-main">
        {selectedNode ? (
          <>
            <h2>{selectedNode.name}</h2>
            <p className="explorer-selection-meta">
              {selectedNode.type}
              {selectedNode.path ? ` · ${selectedNode.path}` : ''}
              {` · ${selectedNode.repositoryId}`}
            </p>
            <p className="explorer-placeholder">
              Document rendering is not available yet. Use the tree to explore repositories and
              folders.
            </p>
          </>
        ) : (
          <>
            <h2>Knowledge Hub</h2>
            <p className="explorer-placeholder">
              Select a repository or folder in the navigation tree to inspect its place in the
              workspace.
            </p>
          </>
        )}
      </section>
    </div>
  )
}
