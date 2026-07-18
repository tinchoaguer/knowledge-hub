# Architecture

## Overview

Knowledge Hub follows a modular architecture based on independent responsibilities.

The application is composed of small interchangeable components connected through well-defined contracts.

```
                   Workspace
                       │
                       ▼
              Repository Provider
                       │
                       ▼
                  Documents
                       │
                       ▼
                   Renderer
                       │
                       ▼
                      UI
```

No component should depend on implementation details of another component.

---

# Core Concepts

## Workspace

A Workspace represents a collection of repositories.

The Workspace is responsible for presenting multiple repositories as a unified navigation experience.

A Workspace does not know how repositories are implemented.

Responsibilities

- load repository definitions
- organize repositories
- expose a unified tree

---

## Repository

A Repository represents a source of knowledge.

Examples include:

- GitHub repository
- local folder
- GitLab repository

Repositories expose documents.

Repositories never render documents.

---

## Repository Provider

A Repository Provider is responsible for loading repository contents.

Responsibilities

- list directories
- read documents
- search documents

A Repository Provider must never:

- render documents
- contain UI logic
- understand document semantics

Future providers may include:

- GitHub
- Local Filesystem
- GitLab
- Azure DevOps

---

## Document

A Document represents one piece of knowledge.

Examples:

- Markdown
- JSON
- YAML
- OpenAPI
- HTML

Documents contain content.

Documents do not know how they are displayed.

---

## Renderer

A Renderer displays a document.

Each renderer decides whether it supports a document.

Examples:

- Markdown Renderer
- JSON Renderer
- OpenAPI Renderer
- Feature Renderer
- Epic Renderer

Renderers never access repositories directly.

---

## Navigation Tree

The navigation tree provides a hierarchical view of all repositories inside a workspace.

Tree nodes represent:

- repositories
- folders
- documents

The tree is independent from document rendering.

---

## Search

Search operates at the Workspace level.

Search is independent from repository providers.

Repository providers expose searchable content.

The Workspace aggregates results.

---

# Dependency Rules

UI depends on abstractions.

Renderers depend on Documents.

Documents never depend on Renderers.

Repository Providers never depend on UI.

Repositories never depend on Renderers.

Workspace depends only on Repository Providers.

---

# Extensibility

The architecture must support adding:

- new repository providers
- new renderers
- new search engines
- new relationship engines

without modifying existing implementations.

---

# Source of Truth

Knowledge Hub owns no business knowledge.

Business knowledge always belongs to Git repositories.

Knowledge Hub only provides discovery, navigation, rendering, and future editing capabilities.

---

# Future Architecture

Future versions may introduce:

- authentication
- editing
- Git operations
- AI assistants
- semantic indexing
- plugin marketplace

These capabilities should extend the existing architecture instead of replacing it.
