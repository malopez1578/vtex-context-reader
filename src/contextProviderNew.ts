import * as vscode from 'vscode';
import { VTEXMultiProjectParser } from './multiProjectParser';
import { VTEXProjectContext, VTEXWorkspaceContext } from './types';

/**
 * VTEX Context Provider for GitHub Copilot (Multi-Project Support)
 * Provides VTEX-specific context to improve code generation across multiple projects
 */
export class VTEXContextProvider {
  private readonly multiProjectParser: VTEXMultiProjectParser;
  private workspaceContext: VTEXWorkspaceContext;
  private readonly outputChannel: vscode.OutputChannel;

  constructor() {
    this.multiProjectParser = new VTEXMultiProjectParser();
    this.outputChannel = vscode.window.createOutputChannel('VTEX Context Provider');
    this.workspaceContext = {
      hasVTEXProjects: false,
      projects: [],
      workspaceRoots: []
    };
  }

  /**
   * Initialize and analyze all VTEX projects in workspace
   */
  async initialize(): Promise<void> {
    try {
      this.workspaceContext = await this.multiProjectParser.scanWorkspace();
      
      if (this.workspaceContext.hasVTEXProjects) {
        const projectCount = this.workspaceContext.projects.length;
        const projectNames = this.workspaceContext.projects.map(p => p.projectName).join(', ');
        
        this.log(`Initialized VTEX context for ${projectCount} project(s): ${projectNames}`);
        
        // Set context variable for when clause
        await vscode.commands.executeCommand('setContext', 'vtexProject', true);
        await vscode.commands.executeCommand('setContext', 'vtexMultiProject', projectCount > 1);
      } else {
        this.log('No VTEX projects detected in workspace');
        await vscode.commands.executeCommand('setContext', 'vtexProject', false);
        await vscode.commands.executeCommand('setContext', 'vtexMultiProject', false);
      }
    } catch (error) {
      this.log(`Error initializing VTEX context: ${error}`);
    }
  }

  /**
   * Get context for the current file
   */
  getFileContext(filePath: string): string {
    if (!this.workspaceContext.hasVTEXProjects) {
      return '';
    }

    // Find the project that contains this file
    const project = this.multiProjectParser.getProjectForFile(filePath);
    if (!project) {
      return '';
    }

    const contextParts: string[] = [];

    // Add project overview
    contextParts.push(this.getProjectOverview(project));

    // Add file-specific context
    const fileContext = this.getSpecificFileContext(filePath, project);
    if (fileContext) {
      contextParts.push(fileContext);
    }

    // Add relevant dependencies context
    const depsContext = this.getDependenciesContext(project);
    if (depsContext) {
      contextParts.push(depsContext);
    }

    // Add multi-project context if applicable
    if (this.workspaceContext.projects.length > 1) {
      contextParts.push(this.getMultiProjectContext(project));
    }

    return contextParts.join('\n\n');
  }

  /**
   * Get project overview context
   */
  private getProjectOverview(project: VTEXProjectContext): string {
    if (!project.manifest) {
      return '';
    }

    const manifest = project.manifest;
    const overview = [
      '// VTEX Project Context',
      `// Project: ${manifest.vendor}.${manifest.name} v${manifest.version}`,
      `// Type: ${project.projectType}`,
      `// Description: ${manifest.description}`,
      `// Location: ${project.relativePath}`,
      ''
    ];

    if (project.builders.length > 0) {
      overview.push(`// Builders: ${project.builders.join(', ')}`);
    }

    if (Object.keys(manifest.dependencies ?? {}).length > 0) {
      overview.push(`// Main Dependencies: ${Object.keys(manifest.dependencies ?? {}).slice(0, 5).join(', ')}`);
    }

    return overview.join('\n');
  }

  /**
   * Get multi-project context
   */
  private getMultiProjectContext(currentProject: VTEXProjectContext): string {
    const otherProjects = this.workspaceContext.projects.filter(p => p !== currentProject);
    
    if (otherProjects.length === 0) {
      return '';
    }

    const context = [
      '// Multi-Project Workspace Context',
      `// Current project: ${currentProject.projectName}`,
      `// Other VTEX projects in workspace: ${otherProjects.map(p => p.projectName).join(', ')}`,
      '// Consider dependencies and interactions between projects'
    ];

    return context.join('\n');
  }

  /**
   * Get file-specific context based on the current file type
   */
  private getSpecificFileContext(filePath: string, project: VTEXProjectContext): string {
    const contextParts: string[] = [];

    // React component context
    if (filePath.includes('/react/') && /\.(tsx?|jsx?)$/.exec(filePath)) {
      contextParts.push(this.getReactComponentContext(project));
    }

    // Node service context
    if (filePath.includes('/node/') && /\.(ts|js)$/.exec(filePath)) {
      contextParts.push(this.getNodeServiceContext(project));
    }

    // GraphQL context
    if (filePath.includes('/graphql/') || /\.(gql|graphql)$/.exec(filePath)) {
      contextParts.push(this.getGraphQLContext(project));
    }

    // Manifest context
    if (filePath.endsWith('manifest.json')) {
      contextParts.push(this.getManifestContext(project));
    }

    return contextParts.join('\n\n');
  }

  /**
   * Get React component specific context
   */
  private getReactComponentContext(project: VTEXProjectContext): string {
    const context = [
      '// VTEX React Component Context',
      '// This is a VTEX IO React component',
      '// Available VTEX hooks: useProduct, useOrderForm, useSession, usePixel',
      '// Use CSS Handles for styling: useCssHandles',
      '// VTEX components should export default and be wrapped with React.memo when appropriate'
    ];

    if (project.manifest?.dependencies) {
      const vtexDeps = Object.keys(project.manifest.dependencies)
        .filter(dep => dep.startsWith('vtex.'));
      
      if (vtexDeps.length > 0) {
        context.push(`// Available VTEX apps: ${vtexDeps.slice(0, 3).join(', ')}`);
      }
    }

    return context.join('\n');
  }

  /**
   * Get Node service specific context
   */
  private getNodeServiceContext(project: VTEXProjectContext): string {
    const context = [
      '// VTEX Node Service Context',
      '// This is a VTEX IO Node.js service',
      '// Available clients: IOClients (masterdata, checkout, catalog, etc.)',
      '// Use ctx for request context and state',
      '// Implement proper error handling and logging'
    ];

    if (project.service) {
      context.push(`// Service config: memory=${project.service.memory}MB, timeout=${project.service.timeout}ms`);
    }

    return context.join('\n');
  }

  /**
   * Get GraphQL specific context
   */
  private getGraphQLContext(project: VTEXProjectContext): string {
    return [
      '// VTEX GraphQL Context',
      '// This is a VTEX IO GraphQL schema/resolver',
      '// Use @cacheControl for query optimization',
      '// Available directives: @cacheControl, @deprecated',
      '// Implement proper type definitions and resolvers'
    ].join('\n');
  }

  /**
   * Get manifest specific context
   */
  private getManifestContext(project: VTEXProjectContext): string {
    return [
      '// VTEX Manifest Context',
      '// This is the VTEX app manifest configuration',
      '// Required fields: vendor, name, version, title, description, builders',
      '// Use semantic versioning for version field',
      '// Builders define the app type: react, node, store, graphql, etc.',
      `// Current project: ${project.projectName}`
    ].join('\n');
  }

  /**
   * Get dependencies context
   */
  private getDependenciesContext(project: VTEXProjectContext): string {
    if (!project.manifest?.dependencies) {
      return '';
    }

    const vtexDeps = Object.entries(project.manifest.dependencies)
      .filter(([dep]) => dep.startsWith('vtex.'))
      .slice(0, 5);

    if (vtexDeps.length === 0) {
      return '';
    }

    const context = [
      '// VTEX Dependencies Context',
      '// Available VTEX apps in this project:'
    ];

    vtexDeps.forEach(([dep, version]) => {
      context.push(`// - ${dep} (${version})`);
    });

    return context.join('\n');
  }

  /**
   * Refresh the context
   */
  async refreshContext(): Promise<void> {
    await this.initialize();
    this.log('VTEX context refreshed');
  }

  /**
   * Get current context summary
   */
  getContextSummary(): string {
    if (!this.workspaceContext.hasVTEXProjects) {
      return 'No VTEX projects detected';
    }

    if (this.workspaceContext.projects.length === 1) {
      const project = this.workspaceContext.projects[0];
      return [
        `Project: ${project.manifest?.vendor}.${project.manifest?.name}`,
        `Type: ${project.projectType}`,
        `Builders: ${project.builders.join(', ')}`,
        `Context Files: ${project.contextFiles.length}`,
        `Dependencies: ${project.dependencies.length}`
      ].join('\n');
    } else {
      return [
        `Multi-Project Workspace (${this.workspaceContext.projects.length} projects)`,
        ...this.workspaceContext.projects.map(p => 
          `• ${p.projectName} (${p.projectType}) - ${p.relativePath}`
        )
      ].join('\n');
    }
  }

  /**
   * Get all projects
   */
  getAllProjects(): VTEXProjectContext[] {
    return this.multiProjectParser.getAllProjects();
  }

  /**
   * Get project for specific file
   */
  getProjectForFile(filePath: string): VTEXProjectContext | undefined {
    return this.multiProjectParser.getProjectForFile(filePath);
  }

  /**
   * Check if the current workspace has VTEX projects
   */
  isVTEXProject(): boolean {
    return this.workspaceContext.hasVTEXProjects ?? false;
  }

  /**
   * Check if workspace has multiple VTEX projects
   */
  isMultiProject(): boolean {
    return this.workspaceContext.projects.length > 1;
  }

  /**
   * Refresh specific project
   */
  async refreshProject(projectPath: string): Promise<void> {
    await this.multiProjectParser.refreshProject(projectPath);
    this.workspaceContext = this.multiProjectParser.getWorkspaceContext();
  }

  /**
   * Add new project
   */
  async addProject(projectPath: string): Promise<void> {
    await this.multiProjectParser.addProject(projectPath);
    this.workspaceContext = this.multiProjectParser.getWorkspaceContext();
  }

  /**
   * Remove project
   */
  removeProject(projectPath: string): void {
    this.multiProjectParser.removeProject(projectPath);
    this.workspaceContext = this.multiProjectParser.getWorkspaceContext();
  }

  /**
   * Log message to output channel
   */
  private log(message: string): void {
    this.outputChannel.appendLine(`[${new Date().toISOString()}] ${message}`);
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.multiProjectParser.dispose();
    this.outputChannel.dispose();
  }
}
