import { useState } from 'react'
import type { NavigationNode } from '../../domain'
import './TreeView.css'

export interface TreeViewProps {
  /** Navigation nodes to display */
  nodes: NavigationNode[]
  /** Currently selected node id */
  selectedId?: string
  /** Called when a node is selected (no document rendering) */
  onSelect?: (node: NavigationNode) => void
}

function isExpandable(node: NavigationNode): boolean {
  return node.type === 'repository' || node.type === 'directory'
}

function TreeNodeItem({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: NavigationNode
  depth: number
  selectedId?: string
  onSelect?: (node: NavigationNode) => void
}) {
  const expandable = isExpandable(node)
  const [expanded, setExpanded] = useState(node.type === 'repository')
  const selected = selectedId === node.id
  const hasChildren = (node.children?.length ?? 0) > 0

  const handleToggle = () => {
    if (expandable) {
      setExpanded((current) => !current)
    }
    onSelect?.(node)
  }

  return (
    <li className="tree-node" role="treeitem" aria-expanded={expandable ? expanded : undefined}>
      <button
        type="button"
        className={`tree-node-label tree-node-label--${node.type}${selected ? ' is-selected' : ''}`}
        style={{ paddingLeft: `${0.5 + depth * 0.9}rem` }}
        onClick={handleToggle}
        aria-selected={selected}
      >
        <span className="tree-node-twistie" aria-hidden="true">
          {expandable ? (expanded ? '▾' : '▸') : '·'}
        </span>
        <span className={`tree-node-icon tree-node-icon--${node.type}`} aria-hidden="true" />
        <span className="tree-node-name">{node.name}</span>
      </button>

      {node.error ? (
        <p className="tree-node-error" style={{ paddingLeft: `${1.4 + depth * 0.9}rem` }}>
          {node.error}
        </p>
      ) : null}

      {expandable && expanded && hasChildren ? (
        <ul className="tree-children" role="group">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

/**
 * Hierarchical navigation tree for workspace repositories and folders.
 *
 * Renders structure only. Document content is not displayed.
 */
export default function TreeView({ nodes, selectedId, onSelect }: TreeViewProps) {
  if (nodes.length === 0) {
    return <p className="tree-view-empty">No repositories in this workspace.</p>
  }

  return (
    <ul className="tree-view" role="tree" aria-label="Workspace navigation">
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
