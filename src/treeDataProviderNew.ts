import * as path from 'path';
import * as vscode from 'vscode';
import { VTEXContextProvider } from './contextProvider';
import { VTEXFileType, VTEXProjectContext } from './types';

export class VTEXTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType: 'root' | 'section' | 'file' | 'project',
    public readonly filePath?: string,
    public readonly description?: string,
    public readonly project?: VTEXProjectContext
  ) {
    super(label, collapsibleState);
    this.tooltip = description ?? label;
    this.description = description;

    if (itemType === 'file' && filePath) {
      this.resourceUri = vscode.Uri.file(filePath);
      this.command = {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [this.resourceUri]
      };
    }

    // Set icons based on item type
    this.iconPath = this.getIcon(itemType);
    this.contextValue = itemType;
  }

  private getIcon(itemType: string): vscode.ThemeIcon | undefined {
    switch (itemType) {
      case 'project':
        return new vscode.ThemeIcon('folder-library');
      case 'section':
        return new vscode.ThemeIcon('folder');
      case 'file':
        return new vscode.ThemeIcon('file');
      default:
        return undefined;
    }
  }
}

export class VTEXTreeDataProvider implements vscode.TreeDataProvider<VTEXTreeItem> {
  private readonly _onDidChangeTreeData: vscode.EventEmitter<VTEXTreeItem | undefined | null | void> = new vscode.EventEmitter<VTEXTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<VTEXTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private readonly contextProvider: VTEXContextProvider) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: VTEXTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: VTEXTreeItem): Thenable<VTEXTreeItem[]> {
    if (!this.contextProvider.isVTEXProject()) {
      return Promise.resolve([
        new VTEXTreeItem(
          'No VTEX projects detected',
          vscode.TreeItemCollapsibleState.None,
          'root'
        )
      ]);
    }

    if (!element) {
      // Root level - show projects or single project info
      return this.getRootItems();
    }

    // Handle project-level items
    if (element.itemType === 'project' && element.project) {
      return this.getProjectItems(element.project);
    }

    // Handle section items
    return this.getSectionItems(element);
  }

  /**
   * Get root level items
   */
  private async getRootItems(): Promise<VTEXTreeItem[]> {
    const projects = this.contextProvider.getAllProjects();
    
    if (projects.length === 1) {
      // Single project - show sections directly
      return this.getProjectItems(projects[0]);
    } else {
      // Multi-project - show project nodes
      return projects.map(project => new VTEXTreeItem(
        `${project.projectName} (${project.projectType})`,
        vscode.TreeItemCollapsibleState.Expanded,
        'project',
        undefined,
        project.relativePath,
        project
      ));
    }
  }

  /**
   * Get items for a specific project
   */
  private async getProjectItems(project: VTEXProjectContext): Promise<VTEXTreeItem[]> {
    return [
      new VTEXTreeItem(
        'Project Info',
        vscode.TreeItemCollapsibleState.Expanded,
        'section',
        undefined,
        undefined,
        project
      ),
      new VTEXTreeItem(
        'Configuration Files',
        vscode.TreeItemCollapsibleState.Expanded,
        'section',
        undefined,
        undefined,
        project
      ),
      new VTEXTreeItem(
        'React Components',
        vscode.TreeItemCollapsibleState.Collapsed,
        'section',
        undefined,
        undefined,
        project
      ),
      new VTEXTreeItem(
        'Node Services',
        vscode.TreeItemCollapsibleState.Collapsed,
        'section',
        undefined,
        undefined,
        project
      ),
      new VTEXTreeItem(
        'GraphQL Schemas',
        vscode.TreeItemCollapsibleState.Collapsed,
        'section',
        undefined,
        undefined,
        project
      )
    ];
  }

  /**
   * Get items for sections
   */
  private async getSectionItems(element: VTEXTreeItem): Promise<VTEXTreeItem[]> {
    if (!element.project) {
      return [];
    }

    switch (element.label) {
      case 'Project Info':
        return this.getProjectInfoItems(element.project);
      case 'Configuration Files':
        return this.getConfigurationFiles(element.project);
      case 'React Components':
        return this.getReactComponents(element.project);
      case 'Node Services':
        return this.getNodeServices(element.project);
      case 'GraphQL Schemas':
        return this.getGraphQLSchemas(element.project);
      default:
        return [];
    }
  }

  /**
   * Get project info items
   */
  private async getProjectInfoItems(project: VTEXProjectContext): Promise<VTEXTreeItem[]> {
    const items: VTEXTreeItem[] = [];

    if (project.manifest) {
      const manifest = project.manifest;
      items.push(
        new VTEXTreeItem(`Name: ${manifest.vendor}.${manifest.name}`, vscode.TreeItemCollapsibleState.None, 'root'),
        new VTEXTreeItem(`Version: ${manifest.version}`, vscode.TreeItemCollapsibleState.None, 'root'),
        new VTEXTreeItem(`Type: ${project.projectType}`, vscode.TreeItemCollapsibleState.None, 'root'),
        new VTEXTreeItem(`Builders: ${project.builders.join(', ')}`, vscode.TreeItemCollapsibleState.None, 'root'),
        new VTEXTreeItem(`Dependencies: ${project.dependencies.length}`, vscode.TreeItemCollapsibleState.None, 'root'),
        new VTEXTreeItem(`Location: ${project.relativePath}`, vscode.TreeItemCollapsibleState.None, 'root')
      );
    }

    return items;
  }

  /**
   * Get configuration files for a project
   */
  private async getConfigurationFiles(project: VTEXProjectContext): Promise<VTEXTreeItem[]> {
    const items: VTEXTreeItem[] = [];
    
    // Check for common VTEX configuration files in project directory
    const configFiles = [
      { name: 'manifest.json', type: VTEXFileType.MANIFEST },
      { name: 'service.json', type: VTEXFileType.SERVICE },
      { name: 'schema.json', type: VTEXFileType.SCHEMA }
    ];

    for (const config of configFiles) {
      try {
        const filePath = path.join(project.workspaceRoot, config.name);
        const fileUri = vscode.Uri.file(filePath);
        
        try {
          await vscode.workspace.fs.stat(fileUri);
          items.push(new VTEXTreeItem(
            config.name,
            vscode.TreeItemCollapsibleState.None,
            'file',
            filePath,
            `VTEX ${config.type} file`,
            project
          ));
        } catch {
          // File doesn't exist, skip
        }
      } catch (error) {
        console.error(`Error checking for ${config.name} in ${project.projectName}:`, error);
      }
    }

    if (items.length === 0) {
      items.push(new VTEXTreeItem(
        'No configuration files found',
        vscode.TreeItemCollapsibleState.None,
        'root'
      ));
    }

    return items;
  }

  /**
   * Get React components for a project
   */
  private async getReactComponents(project: VTEXProjectContext): Promise<VTEXTreeItem[]> {
    return this.getFilesByPattern(project, 'react/**/*.{tsx,ts,jsx,js}', 'React Component');
  }

  /**
   * Get Node services for a project
   */
  private async getNodeServices(project: VTEXProjectContext): Promise<VTEXTreeItem[]> {
    return this.getFilesByPattern(project, 'node/**/*.{ts,js}', 'Node Service');
  }

  /**
   * Get GraphQL schemas for a project
   */
  private async getGraphQLSchemas(project: VTEXProjectContext): Promise<VTEXTreeItem[]> {
    return this.getFilesByPattern(project, 'graphql/**/*.{gql,graphql}', 'GraphQL Schema');
  }

  /**
   * Get files by pattern for a specific project
   */
  private async getFilesByPattern(project: VTEXProjectContext, pattern: string, fileType: string): Promise<VTEXTreeItem[]> {
    try {
      const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(project.workspaceRoot, pattern),
        '**/node_modules/**'
      );

      if (files.length === 0) {
        return [new VTEXTreeItem(
          `No ${fileType.toLowerCase()}s found`,
          vscode.TreeItemCollapsibleState.None,
          'root'
        )];
      }

      return files
        .slice(0, 20) // Limit to first 20 files
        .map(file => {
          const fileName = path.basename(file.fsPath);
          const relativePath = path.relative(project.workspaceRoot, file.fsPath);
          
          return new VTEXTreeItem(
            fileName,
            vscode.TreeItemCollapsibleState.None,
            'file',
            file.fsPath,
            relativePath,
            project
          );
        });
    } catch (error) {
      console.error(`Error finding files for pattern ${pattern} in ${project.projectName}:`, error);
      return [new VTEXTreeItem(
        'Error loading files',
        vscode.TreeItemCollapsibleState.None,
        'root'
      )];
    }
  }

  dispose(): void {
    this._onDidChangeTreeData.dispose();
  }
}
