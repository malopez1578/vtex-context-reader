import * as path from 'path';
import * as vscode from 'vscode';
import { VTEXProjectParser } from './parser';
import { VTEXProjectContext, VTEXWorkspaceContext } from './types';

/**
 * Multi-Project VTEX Parser
 * Detects and manages multiple VTEX projects in a workspace
 */
export class VTEXMultiProjectParser {
  private readonly outputChannel: vscode.OutputChannel;
  private workspaceContext: VTEXWorkspaceContext;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('VTEX Multi-Project Parser');
    this.workspaceContext = {
      hasVTEXProjects: false,
      projects: [],
      workspaceRoots: []
    };
  }

  /**
   * Scan all workspace folders for VTEX projects
   */
  async scanWorkspace(): Promise<VTEXWorkspaceContext> {
    this.log('Starting multi-project workspace scan...');

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      this.log('No workspace folders found');
      return this.workspaceContext;
    }

    this.workspaceContext = {
      hasVTEXProjects: false,
      projects: [],
      workspaceRoots: workspaceFolders.map(folder => folder.uri.fsPath)
    };

    // Scan each workspace folder
    for (const folder of workspaceFolders) {
      await this.scanFolder(folder.uri.fsPath);
    }

    // Also scan for nested projects
    await this.scanForNestedProjects();

    this.workspaceContext.hasVTEXProjects = this.workspaceContext.projects.length > 0;

    this.log(`Scan complete. Found ${this.workspaceContext.projects.length} VTEX projects`);
    return this.workspaceContext;
  }

  /**
   * Scan a specific folder for VTEX projects
   */
  private async scanFolder(folderPath: string): Promise<void> {
    try {
      const manifestPath = path.join(folderPath, 'manifest.json');
      
      // Check if this folder contains a VTEX project
      if (await this.fileExists(manifestPath)) {
        this.log(`Found VTEX project at: ${folderPath}`);
        
        const parser = new VTEXProjectParser(folderPath);
        const projectContext = await parser.parseProject();
        
        if (projectContext.isVTEXProject) {
          // Add project metadata
          projectContext.projectName = projectContext.manifest?.name ?? path.basename(folderPath);
          projectContext.relativePath = vscode.workspace.asRelativePath(folderPath);
          
          this.workspaceContext.projects.push(projectContext);
          this.log(`Added project: ${projectContext.projectName}`);
        }
        
        parser.dispose();
      }
    } catch (error) {
      this.log(`Error scanning folder ${folderPath}: ${error}`);
    }
  }

  /**
   * Scan for nested VTEX projects within workspace folders
   */
  private async scanForNestedProjects(): Promise<void> {
    this.log('Scanning for nested VTEX projects...');

    try {
      // Find all manifest.json files in the workspace
      const manifestFiles = await vscode.workspace.findFiles(
        '**/manifest.json',
        '**/node_modules/**'
      );

      for (const manifestFile of manifestFiles) {
        const projectPath = path.dirname(manifestFile.fsPath);
        
        // Skip if we already have this project
        if (this.workspaceContext.projects.some(p => p.workspaceRoot === projectPath)) {
          continue;
        }

        // Skip if it's in node_modules or other excluded directories
        if (projectPath.includes('node_modules') || 
            projectPath.includes('.git') ||
            projectPath.includes('dist') ||
            projectPath.includes('build')) {
          continue;
        }

        this.log(`Found nested VTEX project at: ${projectPath}`);
        await this.scanFolder(projectPath);
      }
    } catch (error) {
      this.log(`Error scanning for nested projects: ${error}`);
    }
  }

  /**
   * Get project context for a specific file path
   */
  getProjectForFile(filePath: string): VTEXProjectContext | undefined {
    // Find the project that contains this file
    let bestMatch: VTEXProjectContext | undefined;
    let longestMatch = 0;

    for (const project of this.workspaceContext.projects) {
      const projectPath = project.workspaceRoot;
      
      // Check if file is within this project
      if (filePath.startsWith(projectPath)) {
        const matchLength = projectPath.length;
        if (matchLength > longestMatch) {
          longestMatch = matchLength;
          bestMatch = project;
        }
      }
    }

    return bestMatch;
  }

  /**
   * Get all VTEX projects in workspace
   */
  getAllProjects(): VTEXProjectContext[] {
    return [...this.workspaceContext.projects];
  }

  /**
   * Get workspace context
   */
  getWorkspaceContext(): VTEXWorkspaceContext {
    return { ...this.workspaceContext };
  }

  /**
   * Refresh all projects
   */
  async refreshAll(): Promise<void> {
    this.log('Refreshing all VTEX projects...');
    await this.scanWorkspace();
  }

  /**
   * Refresh a specific project
   */
  async refreshProject(projectPath: string): Promise<void> {
    this.log(`Refreshing project at: ${projectPath}`);
    
    // Remove existing project
    this.workspaceContext.projects = this.workspaceContext.projects.filter(
      p => p.workspaceRoot !== projectPath
    );
    
    // Re-scan the project
    await this.scanFolder(projectPath);
  }

  /**
   * Add a new project (when manifest.json is created)
   */
  async addProject(projectPath: string): Promise<void> {
    this.log(`Adding new project at: ${projectPath}`);
    await this.scanFolder(projectPath);
  }

  /**
   * Remove a project (when manifest.json is deleted)
   */
  removeProject(projectPath: string): void {
    this.log(`Removing project at: ${projectPath}`);
    this.workspaceContext.projects = this.workspaceContext.projects.filter(
      p => p.workspaceRoot !== projectPath
    );
    this.workspaceContext.hasVTEXProjects = this.workspaceContext.projects.length > 0;
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
      return true;
    } catch {
      return false;
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
