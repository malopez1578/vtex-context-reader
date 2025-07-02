import * as vscode from 'vscode';
import { VTEXProjectParser } from './parser';
import { VTEXProjectContext } from './types';

/**
 * VTEX Context Provider for GitHub Copilot
 * Provides VTEX-specific context to improve code generation
 */
export class VTEXContextProvider {
  private readonly parser: VTEXProjectParser;
  private context: VTEXProjectContext | null = null;
  private readonly outputChannel: vscode.OutputChannel;

  constructor(workspaceRoot: string) {
    this.parser = new VTEXProjectParser(workspaceRoot);
    this.outputChannel = vscode.window.createOutputChannel('VTEX Context Provider');
  }

  /**
   * Initialize and analyze the VTEX project
   */
  async initialize(): Promise<void> {
    try {
      this.context = await this.parser.parseProject();
      
      if (this.context.isVTEXProject) {
        this.log(`Initialized VTEX context for project: ${this.context.manifest?.vendor}.${this.context.manifest?.name}`);
        
        // Set context variable for when clause
        await vscode.commands.executeCommand('setContext', 'vtexProject', true);
      } else {
        this.log('No VTEX project detected in workspace');
        await vscode.commands.executeCommand('setContext', 'vtexProject', false);
      }
    } catch (error) {
      this.log(`Error initializing VTEX context: ${error}`);
    }
  }

  /**
   * Get context for the current file
   */
  getFileContext(filePath: string): string {
    if (!this.context?.isVTEXProject) {
      return '';
    }

    const contextParts: string[] = [];

    // Add project overview
    contextParts.push(this.getProjectOverview());

    // Add file-specific context
    const fileContext = this.getSpecificFileContext(filePath);
    if (fileContext) {
      contextParts.push(fileContext);
    }

    // Add relevant dependencies context
    const depsContext = this.getDependenciesContext();
    if (depsContext) {
      contextParts.push(depsContext);
    }

    return contextParts.join('\n\n');
  }

  /**
   * Get project overview context
   */
  private getProjectOverview(): string {
    if (!this.context?.manifest) {
      return '';
    }

    const manifest = this.context.manifest;
    const overview = [
      '// VTEX Project Context',
      `// Project: ${manifest.vendor}.${manifest.name} v${manifest.version}`,
      `// Type: ${this.context.projectType}`,
      `// Description: ${manifest.description}`,
      ''
    ];

    if (this.context.builders.length > 0) {
      overview.push(`// Builders: ${this.context.builders.join(', ')}`);
    }

    if (Object.keys(manifest.dependencies || {}).length > 0) {
      overview.push(`// Main Dependencies: ${Object.keys(manifest.dependencies || {}).slice(0, 5).join(', ')}`);
    }

    return overview.join('\n');
  }

  /**
   * Get file-specific context based on the current file type
   */
  private getSpecificFileContext(filePath: string): string {
    if (!this.context) {
      return '';
    }

    const contextParts: string[] = [];

    // React component context
    if (filePath.includes('/react/') && /\.(tsx?|jsx?)$/.exec(filePath)) {
      contextParts.push(this.getReactComponentContext());
    }

    // Node service context
    if (filePath.includes('/node/') && /\.(ts|js)$/.exec(filePath)) {
      contextParts.push(this.getNodeServiceContext());
    }

    // GraphQL context
    if (filePath.includes('/graphql/') || /\.(gql|graphql)$/.exec(filePath)) {
      contextParts.push(this.getGraphQLContext());
    }

    // Manifest context
    if (filePath.endsWith('manifest.json')) {
      contextParts.push(this.getManifestContext());
    }

    return contextParts.join('\n\n');
  }

  /**
   * Get React component specific context
   */
  private getReactComponentContext(): string {
    const context = [
      '// VTEX React Component Context',
      '// This is a VTEX IO React component',
      '// Available VTEX hooks: useProduct, useOrderForm, useSession, usePixel',
      '// Use CSS Handles for styling: useCssHandles',
      '// VTEX components should export default and be wrapped with React.memo when appropriate'
    ];

    if (this.context?.manifest?.dependencies) {
      const vtexDeps = Object.keys(this.context.manifest.dependencies)
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
  private getNodeServiceContext(): string {
    const context = [
      '// VTEX Node Service Context',
      '// This is a VTEX IO Node.js service',
      '// Available clients: IOClients (masterdata, checkout, catalog, etc.)',
      '// Use ctx for request context and state',
      '// Implement proper error handling and logging'
    ];

    if (this.context?.service) {
      context.push(`// Service config: memory=${this.context.service.memory}MB, timeout=${this.context.service.timeout}ms`);
    }

    return context.join('\n');
  }

  /**
   * Get GraphQL specific context
   */
  private getGraphQLContext(): string {
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
  private getManifestContext(): string {
    return [
      '// VTEX Manifest Context',
      '// This is the VTEX app manifest configuration',
      '// Required fields: vendor, name, version, title, description, builders',
      '// Use semantic versioning for version field',
      '// Builders define the app type: react, node, store, graphql, etc.'
    ].join('\n');
  }

  /**
   * Get dependencies context
   */
  private getDependenciesContext(): string {
    if (!this.context?.manifest?.dependencies) {
      return '';
    }

    const vtexDeps = Object.entries(this.context.manifest.dependencies)
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
    if (!this.context?.isVTEXProject) {
      return 'No VTEX project detected';
    }

    const summary = [
      `Project: ${this.context.manifest?.vendor}.${this.context.manifest?.name}`,
      `Type: ${this.context.projectType}`,
      `Builders: ${this.context.builders.join(', ')}`,
      `Context Files: ${this.context.contextFiles.length}`,
      `Dependencies: ${this.context.dependencies.length}`
    ];

    return summary.join('\n');
  }

  /**
   * Check if the current workspace is a VTEX project
   */
  isVTEXProject(): boolean {
    return this.context?.isVTEXProject || false;
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
    this.parser.dispose();
    this.outputChannel.dispose();
  }
}
