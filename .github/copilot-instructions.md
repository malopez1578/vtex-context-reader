# Copilot Instructions for VTEX Context Reader Extension

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a VS Code extension project. Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.

## Project Overview
This extension provides GitHub Copilot with VTEX-specific context to improve code generation and assistance for VTEX IO applications.

## Key Features to Implement
- **VTEX Context Provider**: Parse and provide context from VTEX-specific files
- **File Type Detection**: Identify VTEX projects and their structure
- **Schema Analysis**: Parse and understand VTEX app schemas
- **API Route Detection**: Identify and provide context for VTEX service APIs
- **Component Structure**: Understand React components in VTEX apps

## VTEX-Specific Files to Parse
- `manifest.json` - App configuration and dependencies
- `schema.json` - App configuration schema
- `service.json` - Service configuration
- React components in `/react/` folder
- GraphQL schemas in `/graphql/` folder
- Node.js services in `/node/` folder
- Configuration files in `/public/metadata/` folder

## Code Style Guidelines
- Use TypeScript with strict typing
- Follow VS Code extension best practices
- Implement proper error handling and logging
- Use async/await for file operations
- Provide comprehensive JSDoc comments
