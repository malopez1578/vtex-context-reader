import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
    VTEXFileType,
    VTEXManifest,
    VTEXProjectContext,
    VTEXProjectType,
    VTEXSchema,
    VTEXService
} from './types';

/**
 * VTEX Project Parser
 * Analyzes workspace to detect and parse VTEX project structure
 */
export class VTEXProjectParser {
  private readonly workspaceRoot: string;
  private readonly outputChannel: vscode.OutputChannel;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.outputChannel = vscode.window.createOutputChannel('VTEX Context Reader');
  }

  /**
   * Parse the current workspace for VTEX context
   */
  async parseProject(): Promise<VTEXProjectContext> {
    this.log('Starting VTEX project analysis...');

    const context: VTEXProjectContext = {
      isVTEXProject: false,
      builders: [],
      dependencies: [],
      projectType: VTEXProjectType.UNKNOWN,
      workspaceRoot: this.workspaceRoot,
      contextFiles: [],
      projectName: '',
      relativePath: ''
    };

    try {
      // Check for manifest.json (main indicator of VTEX project)
      const manifestPath = path.join(this.workspaceRoot, 'manifest.json');
      if (await this.fileExists(manifestPath)) {
        context.isVTEXProject = true;
        context.manifest = await this.parseManifest(manifestPath);
        context.builders = Object.keys(context.manifest.builders || {});
        context.dependencies = Object.keys(context.manifest.dependencies || {});
        context.projectType = this.determineProjectType(context.manifest);
        context.projectName = context.manifest.name;
        context.relativePath = vscode.workspace.asRelativePath(this.workspaceRoot);
        
        context.contextFiles.push({
          path: manifestPath,
          type: VTEXFileType.MANIFEST,
          content: context.manifest,
          lastModified: await this.getFileModifiedTime(manifestPath)
        });

        this.log(`Found VTEX project: ${context.manifest.vendor}.${context.manifest.name}`);
      }

      // Check for service.json
      const servicePath = path.join(this.workspaceRoot, 'service.json');
      if (await this.fileExists(servicePath)) {
        context.service = await this.parseService(servicePath);
        context.contextFiles.push({
          path: servicePath,
          type: VTEXFileType.SERVICE,
          content: context.service,
          lastModified: await this.getFileModifiedTime(servicePath)
        });
        this.log('Found service.json configuration');
      }

      // Check for schema files
      await this.findSchemaFiles(context);

      // Find React components
      await this.findReactComponents(context);

      // Find GraphQL schemas
      await this.findGraphQLSchemas(context);

      // Find Node services
      await this.findNodeServices(context);

      this.log(`Analysis complete. Found ${context.contextFiles.length} context files`);
      
      return context;
    } catch (error) {
      this.log(`Error parsing VTEX project: ${error}`);
      return context;
    }
  }

  /**
   * Parse manifest.json file
   */
  private async parseManifest(manifestPath: string): Promise<VTEXManifest> {
    const content = await fs.promises.readFile(manifestPath, 'utf8');
    return JSON.parse(content) as VTEXManifest;
  }

  /**
   * Parse service.json file
   */
  private async parseService(servicePath: string): Promise<VTEXService> {
    const content = await fs.promises.readFile(servicePath, 'utf8');
    return JSON.parse(content) as VTEXService;
  }

  /**
   * Determine VTEX project type based on manifest
   */
  private determineProjectType(manifest: VTEXManifest): VTEXProjectType {
    const builders = Object.keys(manifest.builders || {});
    
    if (builders.includes('store')) {
      return VTEXProjectType.STORE_THEME;
    }
    if (builders.includes('react')) {
      return VTEXProjectType.REACT_APP;
    }
    if (builders.includes('node')) {
      return VTEXProjectType.NODE_SERVICE;
    }
    if (builders.includes('graphql')) {
      return VTEXProjectType.GRAPHQL_SERVICE;
    }
    if (builders.includes('pixel')) {
      return VTEXProjectType.PIXEL_APP;
    }
    
    return VTEXProjectType.APP;
  }

  /**
   * Find schema files in the project
   */
  private async findSchemaFiles(context: VTEXProjectContext): Promise<void> {
    const schemaPaths = [
      'public/metadata/schemas/*.json',
      'public/metadata/schema.json',
      'schema.json'
    ];

    for (const pattern of schemaPaths) {
      const files = await this.findFilesByPattern(pattern);
      for (const file of files) {
        try {
          const content = await fs.promises.readFile(file, 'utf8');
          const schema = JSON.parse(content) as VTEXSchema;
          
          context.contextFiles.push({
            path: file,
            type: VTEXFileType.SCHEMA,
            content: schema,
            lastModified: await this.getFileModifiedTime(file)
          });
        } catch (error) {
          this.log(`Error parsing schema file ${file}: ${error}`);
        }
      }
    }
  }

  /**
   * Find React components
   */
  private async findReactComponents(context: VTEXProjectContext): Promise<void> {
    const reactDir = path.join(this.workspaceRoot, 'react');
    if (await this.dirExists(reactDir)) {
      const components = await this.findFilesByPattern('react/**/*.{tsx,ts,jsx,js}');
      for (const component of components) {
        context.contextFiles.push({
          path: component,
          type: VTEXFileType.REACT_COMPONENT,
          lastModified: await this.getFileModifiedTime(component)
        });
      }
      this.log(`Found ${components.length} React components`);
    }
  }

  /**
   * Find GraphQL schemas
   */
  private async findGraphQLSchemas(context: VTEXProjectContext): Promise<void> {
    const graphqlDir = path.join(this.workspaceRoot, 'graphql');
    if (await this.dirExists(graphqlDir)) {
      const schemas = await this.findFilesByPattern('graphql/**/*.{gql,graphql}');
      for (const schema of schemas) {
        context.contextFiles.push({
          path: schema,
          type: VTEXFileType.GRAPHQL_SCHEMA,
          lastModified: await this.getFileModifiedTime(schema)
        });
      }
      this.log(`Found ${schemas.length} GraphQL schemas`);
    }
  }

  /**
   * Find Node services
   */
  private async findNodeServices(context: VTEXProjectContext): Promise<void> {
    const nodeDir = path.join(this.workspaceRoot, 'node');
    if (await this.dirExists(nodeDir)) {
      const services = await this.findFilesByPattern('node/**/*.{ts,js}');
      for (const service of services) {
        context.contextFiles.push({
          path: service,
          type: VTEXFileType.NODE_SERVICE,
          lastModified: await this.getFileModifiedTime(service)
        });
      }
      this.log(`Found ${services.length} Node service files`);
    }
  }

  /**
   * Find files by glob pattern
   */
  private async findFilesByPattern(pattern: string): Promise<string[]> {
    try {
      const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(this.workspaceRoot, pattern),
        '**/node_modules/**'
      );
      return files.map(file => file.fsPath);
    } catch (error) {
      this.log(`Error finding files with pattern ${pattern}: ${error}`);
      return [];
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if directory exists
   */
  private async dirExists(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.promises.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Get file modified time
   */
  private async getFileModifiedTime(filePath: string): Promise<number> {
    try {
      const stat = await fs.promises.stat(filePath);
      return stat.mtime.getTime();
    } catch {
      return 0;
    }
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
    this.outputChannel.dispose();
  }
}
