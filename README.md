# Knowledge Hub

A modern React application for managing and exploring knowledge repositories. Built with Vite, TypeScript, React Router, and comprehensive testing infrastructure.

## ✨ Features

- ⚡ **Vite** - Lightning-fast build tool and dev server
- 🎯 **React 18** - Latest React version with hooks support
- 🛣️ **React Router** - Client-side routing for multi-page experience
- 📘 **TypeScript** - Full type safety across the codebase
- 🎨 **Dark/Light Theme** - Built-in theme toggle support
- 🧪 **Vitest** - Fast unit testing framework
- 📋 **ESLint** - Code quality and consistency
- ✨ **Prettier** - Automated code formatting
- 📱 **Responsive Design** - Mobile-first design approach
- 🚀 **GitHub Pages Ready** - Automated deployment workflow

## 🎯 Project Goals

Knowledge Hub aims to provide a centralized platform for:
- Organizing multiple repositories
- Exploring and discovering projects
- Managing workspace configurations
- Building a scalable, extensible architecture

## 🏗️ Architecture

### Domain Layer (`src/domain/`)

The domain layer contains core business logic for workspace management:

- **Workspace** - Manages collections of repositories
  - Add/remove repositories
  - Query repository information
  - Manage workspace state

- **Repository** - Represents a project or repository
  - Unique identifier
  - Metadata (name, URL, description, language)
  - Type-safe structure

#### Workspace Class API

```typescript
// Create a workspace
const workspace = new Workspace()

// Add repositories
workspace.addRepository({
  id: 'my-repo',
  name: 'My Project',
  url: 'https://github.com/user/my-project'
})

// Query repositories
workspace.getRepository('my-repo')
workspace.getAllRepositories()
workspace.hasRepository('my-repo')

// Remove repositories
workspace.removeRepository('my-repo')

// Get counts
workspace.getRepositoryCount()
```

#### Load from JSON Configuration

```typescript
import { loadWorkspaceFromJson } from './domain'

const workspace = loadWorkspaceFromJson({
  repositories: [
    {
      id: 'repo-1',
      name: 'Project A',
      url: 'https://github.com/user/project-a',
      description: 'A sample project',
      language: 'TypeScript'
    }
  ]
})
```

### Component Layer (`src/pages/`)

- **Home** - Landing page with welcome message and interactive demo
- Future: Dashboard, Repository explorer, Settings, etc.

### Styling

- `src/index.css` - Global styles with theme variables
- `src/App.css` - App layout and component styles
- CSS variables for theme switching
- Responsive design with mobile breakpoints

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output is in the `dist/` directory, ready for GitHub Pages deployment.

## 🧪 Testing

### Run Tests

```bash
# Watch mode
npm run test

# Run once
npm run test:run

# With UI
npm run test:ui
```

### Test Coverage

Tests are located alongside source files with `.test.ts` suffix:
- `src/domain/Workspace.test.ts` - Workspace class tests
- `src/domain/WorkspaceLoader.test.ts` - JSON loader tests

## 📝 Code Quality

### Linting

```bash
npm run lint
```

ESLint configuration includes:
- TypeScript support
- React best practices
- React Hooks rules
- Modern JavaScript standards

### Code Formatting

```bash
npm run format
```

Prettier configuration for consistent code style across the project.

## 📁 Project Structure

```
src/
├── domain/                    # Core business logic
│   ├── index.ts              # Domain exports
│   ├── Workspace.ts          # Workspace class
│   ├── Workspace.test.ts     # Workspace tests
│   └── WorkspaceLoader.test.ts # Loader tests
│
├── pages/                     # Page components
│   └── Home.tsx              # Home page
│
├── App.tsx                    # Main app component
├── App.css                    # App styles
├── index.css                  # Global styles
└── main.tsx                   # React entry point

public/                        # Static assets

index.html                     # HTML entry point

vite.config.ts                # Vite configuration
tsconfig.json                 # TypeScript config
tsconfig.node.json            # Node TypeScript config
eslint.config.js              # ESLint configuration
.prettierrc                    # Prettier configuration
package.json                  # Dependencies and scripts
```

## 🎨 Theme System

The application supports dark and light themes with CSS variables:

```css
:root {
  --primary-color: #646cff;
  --primary-hover: #535bf2;
  /* other theme variables */
}

[data-theme="dark"] {
  /* dark theme overrides */
}

[data-theme="light"] {
  /* light theme overrides */
}
```

Toggle theme from the navbar button. Theme preference persists during the session.

## 🔄 Git Workflow

Each feature is developed on a dedicated branch and merged via pull request:

1. Create feature branch: `git checkout -b feature/description`
2. Make changes and commit: `git commit -m "feat: description"`
3. Push branch: `git push origin feature/description`
4. Create pull request on GitHub
5. Tests run automatically (linting, building)
6. After approval, merge to main
7. GitHub Pages deployment triggers automatically

## 📦 Dependencies

### Core
- `react@^18.3.1` - React library
- `react-dom@^18.3.1` - React DOM renderer
- `react-router-dom@^6.24.1` - Routing library

### Dev Tools
- `vite@^5.3.4` - Build tool
- `typescript@^5.5.3` - Type checking
- `eslint@^9.6.0` - Linting
- `prettier@^3.3.3` - Code formatting
- `vitest@^1.6.0` - Testing framework

See `package.json` for complete dependency list.

## 🚢 Deployment

The application is automatically deployed to GitHub Pages on every push to the `main` branch.

**Live URL:** [https://tinchoaguer.github.io/knowledge-hub/](https://tinchoaguer.github.io/knowledge-hub/)

### Deployment Workflow

The `.github/workflows/deploy.yml` workflow:
1. Triggers on push to `main` (or manual `workflow_dispatch`)
2. Installs dependencies
3. Runs unit tests
4. Builds the Vite production bundle into `dist/`
5. Uploads the Pages artifact
6. Deploys to GitHub Pages via GitHub Actions

> GitHub Pages must use **Source: GitHub Actions** (not “Deploy from a branch”), otherwise the raw source tree is published and the app will not render.

## 🔮 Roadmap

### Phase 1: Foundation ✅
- [x] React + Vite bootstrap
- [x] TypeScript setup
- [x] Workspace domain model
- [x] Basic component structure
- [x] Testing infrastructure

### Phase 2: Core Features (In Progress)
- [ ] GitHub API integration
- [ ] Dynamic repository loading
- [ ] Repository browser UI
- [ ] Search and filtering
- [ ] Favorites/bookmarks

### Phase 3: Advanced Features
- [ ] User authentication
- [ ] Persistent storage
- [ ] Analytics dashboard
- [ ] Custom workspaces
- [ ] Sharing and collaboration

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests as needed
5. Run `npm run lint` and `npm run format`
6. Submit a pull request

## 📄 License

MIT License - feel free to use this project for any purpose.

## 👤 Author

Martin Aguer ([@tinchoaguer](https://github.com/tinchoaguer))

## 🔗 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router Documentation](https://reactrouter.com)
- [Vitest Documentation](https://vitest.dev)

---

**Last Updated:** July 18, 2026

For questions or suggestions, please open an issue on GitHub.
