// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { VTEXContextProvider } from './contextProvider';
import { VTEXTreeDataProvider } from './treeDataProvider';

// Global instances
let contextProvider: VTEXContextProvider;
let treeDataProvider: VTEXTreeDataProvider;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log('VTEX Context Reader extension is being activated...');

	// Get the current workspace
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		console.log('No workspace folder found');
		return;
	}

	try {
		// Initialize context provider
		contextProvider = new VTEXContextProvider(workspaceFolder.uri.fsPath);
		await contextProvider.initialize();

		// Initialize tree data provider
		treeDataProvider = new VTEXTreeDataProvider(contextProvider);

		// Register tree view
		const treeView = vscode.window.createTreeView('vtexContext', {
			treeDataProvider: treeDataProvider,
			showCollapseAll: true
		});

		// Register commands
		const showContextCommand = vscode.commands.registerCommand('vtex-context-reader.showContext', () => {
			const summary = contextProvider.getContextSummary();
			vscode.window.showInformationMessage(`VTEX Context: ${summary}`);
		});

		const refreshContextCommand = vscode.commands.registerCommand('vtex-context-reader.refreshContext', async () => {
			await contextProvider.refreshContext();
			treeDataProvider.refresh();
			vscode.window.showInformationMessage('VTEX context refreshed');
		});

		// Register for Copilot integration (if available)
		registerCopilotIntegration(context);

		// Register file watchers for automatic context updates
		registerFileWatchers(context);

		// Add to subscriptions
		context.subscriptions.push(
			treeView,
			showContextCommand,
			refreshContextCommand,
			contextProvider,
			treeDataProvider
		);

		// Show success message only if VTEX project detected
		if (contextProvider.isVTEXProject()) {
			vscode.window.showInformationMessage('VTEX Context Reader activated! Context is now available for Copilot.');
		}

		console.log('VTEX Context Reader extension activated successfully');
	} catch (error) {
		console.error('Error activating VTEX Context Reader:', error);
		vscode.window.showErrorMessage(`Failed to activate VTEX Context Reader: ${error}`);
	}
}

/**
 * Register integration with GitHub Copilot
 */
function registerCopilotIntegration(context: vscode.ExtensionContext) {
	// Listen for active editor changes to provide context
	const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor && contextProvider?.isVTEXProject()) {
			const filePath = editor.document.fileName;
			const fileContext = contextProvider.getFileContext(filePath);
			
			// Store context for potential Copilot usage
			if (fileContext) {
				// This could be enhanced to directly integrate with Copilot API when available
				console.log(`VTEX context available for file: ${filePath}`);
			}
		}
	});

	context.subscriptions.push(onDidChangeActiveEditor);
}

/**
 * Register file watchers for automatic context updates
 */
function registerFileWatchers(context: vscode.ExtensionContext) {
	// Watch for changes in VTEX configuration files
	const manifestWatcher = vscode.workspace.createFileSystemWatcher('**/manifest.json');
	const serviceWatcher = vscode.workspace.createFileSystemWatcher('**/service.json');
	const schemaWatcher = vscode.workspace.createFileSystemWatcher('**/schema.json');

	const refreshOnChange = async () => {
		if (contextProvider) {
			await contextProvider.refreshContext();
			treeDataProvider?.refresh();
		}
	};

	manifestWatcher.onDidChange(refreshOnChange);
	manifestWatcher.onDidCreate(refreshOnChange);
	manifestWatcher.onDidDelete(refreshOnChange);

	serviceWatcher.onDidChange(refreshOnChange);
	serviceWatcher.onDidCreate(refreshOnChange);
	serviceWatcher.onDidDelete(refreshOnChange);

	schemaWatcher.onDidChange(refreshOnChange);
	schemaWatcher.onDidCreate(refreshOnChange);
	schemaWatcher.onDidDelete(refreshOnChange);

	context.subscriptions.push(manifestWatcher, serviceWatcher, schemaWatcher);
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('VTEX Context Reader extension deactivated');
}
