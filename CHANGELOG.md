# Change Log

## [1.0.0] - 2024-12-20

### Added
- 🎯 **Multi-Project Detection**: Automatically identifies multiple VTEX projects in workspace
  - Supports multi-root workspaces
  - Handles monorepo structures with nested projects
  - Auto-discovers new projects when added to workspace

- 📊 **Comprehensive Context Analysis**: Parses all VTEX-specific files
  - `manifest.json` - App configuration and dependencies
  - `service.json` - Service configuration
  - `schema.json` - App configuration schema
  - React components in `/react/` folder
  - Node.js services in `/node/` folder
  - GraphQL schemas in `/graphql/` folder

- 🧩 **Enhanced GitHub Copilot Integration**: Provides intelligent VTEX context
  - File-specific context based on current active editor
  - Cross-project context sharing
  - Real-time context updates

- 🌳 **Multi-Project Tree View**: Shows all VTEX projects in Explorer
  - Hierarchical view of all detected projects
  - Expandable sections for project details
  - Visual indicators for different project types

- � **Smart File Watchers**: Automatic updates and monitoring
  - Project-specific refresh on file changes
  - Auto-detection of new/removed projects
  - Workspace folder change monitoring

### Technical Features
- TypeScript with strict typing
- ESLint integration for code quality
- ESBuild for fast compilation
- Comprehensive error handling and logging
- Performance optimized for large workspaces

### Supported VTEX Files
- `manifest.json` - Configuración de aplicación
- `service.json` - Configuración de servicios Node.js  
- `schema.json` - Schemas de configuración
- Componentes React en `/react/`
- Servicios Node.js en `/node/`
- Schemas GraphQL en `/graphql/`
- Metadatos en `/public/metadata/`