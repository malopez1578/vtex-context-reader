import * as path from 'path';
import * as vscode from 'vscode';
import { VTEXContextProvider } from './contextProvider';
import { VTEXFileType } from './types';

export class VTEXTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType: 'root' | 'section' | 'file',
    public readonly filePath?: string,
    public readonly description?: string
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

    this.contextValue = itemType;
  }
}

type TreeDataChangeEvent = VTEXTreeItem | undefined | null | void;

export class VTEXTreeDataProvider implements vscode.TreeDataProvider<VTEXTreeItem> {
  private readonly _onDidChangeTreeData: vscode.EventEmitter<TreeDataChangeEvent> = new vscode.EventEmitter<TreeDataChangeEvent>();
  readonly onDidChangeTreeData: vscode.Event<TreeDataChangeEvent> = this._onDidChangeTreeData.event;

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
          'No VTEX project detected',
          vscode.TreeItemCollapsibleState.None,
          'root'
        )
      ]);
    }

    if (!element) {
      // Root level items
      return Promise.resolve([
        new VTEXTreeItem(
          'Project Info',
          vscode.TreeItemCollapsibleState.Expanded,
          'section'
        ),
        new VTEXTreeItem(
          'Configuration Files',
          vscode.TreeItemCollapsibleState.Expanded,
          'section'
        ),
        new VTEXTreeItem(
          'React Components',
          vscode.TreeItemCollapsibleState.Collapsed,
          'section'
        ),
        new VTEXTreeItem(
          'Node Services',
          vscode.TreeItemCollapsibleState.Collapsed,
          'section'
        ),
        new VTEXTreeItem(
          'GraphQL Schemas',
          vscode.TreeItemCollapsibleState.Collapsed,
          'section'
        )
      ]);
    }

    // Section items
    switch (element.label) {
      case 'Project Info':
        return this.getProjectInfoItems();
      case 'Configuration Files':
        return this.getConfigurationFiles();
      case 'React Components':
        return this.getReactComponents();
      case 'Node Services':
        return this.getNodeServices();
      case 'GraphQL Schemas':
        return this.getGraphQLSchemas();
      default:
        return Promise.resolve([]);
    }
  }

  private async getProjectInfoItems(): Promise<VTEXTreeItem[]> {
    const summary = this.contextProvider.getContextSummary();
    const lines = summary.split('\n');
    
    return lines.map(line => new VTEXTreeItem(
      line,
      vscode.TreeItemCollapsibleState.None,
      'root'
    ));
  }

  private async getConfigurationFiles(): Promise<VTEXTreeItem[]> {
    const items: VTEXTreeItem[] = [];
    
    // Check for common VTEX configuration files
    const configFiles = [
      { name: 'manifest.json', type: VTEXFileType.MANIFEST },
      { name: 'service.json', type: VTEXFileType.SERVICE },
      { name: 'schema.json', type: VTEXFileType.SCHEMA }
    ];

    for (const config of configFiles) {
      try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          continue;
        }

        const filePath = path.join(workspaceFolder.uri.fsPath, config.name);
        const fileUri = vscode.Uri.file(filePath);
        
        try {
          await vscode.workspace.fs.stat(fileUri);
          items.push(new VTEXTreeItem(
            config.name,
            vscode.TreeItemCollapsibleState.None,
            'file',
            filePath,
            `VTEX ${config.type} file`
          ));
        } catch {
          // File doesn't exist, skip
        }
      } catch (error) {
        console.error(`Error checking for ${config.name}:`, error);
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

  private async getReactComponents(): Promise<VTEXTreeItem[]> {
    return this.getFilesByPattern('react/**/*.{tsx,ts,jsx,js}', 'React Component');
  }

  private async getNodeServices(): Promise<VTEXTreeItem[]> {
    return this.getFilesByPattern('node/**/*.{ts,js}', 'Node Service');
  }

  private async getGraphQLSchemas(): Promise<VTEXTreeItem[]> {
    return this.getFilesByPattern('graphql/**/*.{gql,graphql}', 'GraphQL Schema');
  }

  private async getFilesByPattern(pattern: string, fileType: string): Promise<VTEXTreeItem[]> {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        return [];
      }

      const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(workspaceFolder, pattern),
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
          const relativePath = vscode.workspace.asRelativePath(file);
          
          return new VTEXTreeItem(
            fileName,
            vscode.TreeItemCollapsibleState.None,
            'file',
            file.fsPath,
            relativePath
          );
        });
    } catch (error) {
      console.error(`Error finding files for pattern ${pattern}:`, error);
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
