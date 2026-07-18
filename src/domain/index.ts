/**
 * Workspace Domain
 *
 * This module contains the core domain logic for managing workspaces.
 * A workspace represents a collection of repositories.
 *
 * For now, repositories are loaded from workspace.json configuration.
 * GitHub integration will be added in a future iteration.
 */

export { Workspace, loadWorkspaceFromJson, type Repository } from './Workspace'
