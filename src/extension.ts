// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { VTEXContextProvider } from './contextProvider';
import { VTEXCopilotTester } from './copilotTester';
import { VTEXTreeDataProvider } from './treeDataProvider';

// Global instances
let contextProvider: VTEXContextProvider;
let treeDataProvider: VTEXTreeDataProvider;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log('VTEX Context Reader extension is being activated...');

	try {
		// Initialize context provider (now handles multiple workspace folders)
		contextProvider = new VTEXContextProvider();
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

		// Register test commands for Copilot verification
		VTEXCopilotTester.registerTestCommand(context, contextProvider);

		const testCopilotCommand = vscode.commands.registerCommand('vtex-context-reader.verifyCopilotContext', async () => {
			await VTEXCopilotTester.verifyCopilotSuggestions();
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
			testCopilotCommand,
			contextProvider,
			treeDataProvider
		);

		// Show success message based on project detection
		if (contextProvider.isVTEXProject()) {
			const projectCount = contextProvider.getAllProjects().length;
			const message = projectCount === 1 
				? 'VTEX Context Reader activated! Context is now available for Copilot.'
				: `VTEX Context Reader activated! Found ${projectCount} VTEX projects. Context is now available for Copilot.`;
			vscode.window.showInformationMessage(message);
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
 * Register file watchers for automatic context updates (multi-project)
 */
function registerFileWatchers(context: vscode.ExtensionContext) {
	// Watch for changes in VTEX configuration files across all workspace folders
	const manifestWatcher = vscode.workspace.createFileSystemWatcher('**/manifest.json');
	const serviceWatcher = vscode.workspace.createFileSystemWatcher('**/service.json');
	const schemaWatcher = vscode.workspace.createFileSystemWatcher('**/schema.json');

	const refreshOnChange = async (uri: vscode.Uri) => {
		if (contextProvider) {
			const projectPath = uri.fsPath.endsWith('manifest.json') 
				? uri.fsPath.replace('/manifest.json', '')
				: uri.fsPath.replace(/\/(service|schema)\.json$/, '');
			
			console.log(`VTEX file changed in project: ${projectPath}`);
			await contextProvider.refreshProject(projectPath);
			treeDataProvider?.refresh();
		}
	};

	const addProject = async (uri: vscode.Uri) => {
		if (contextProvider && uri.fsPath.endsWith('manifest.json')) {
			const projectPath = uri.fsPath.replace('/manifest.json', '');
			console.log(`New VTEX project detected: ${projectPath}`);
			await contextProvider.addProject(projectPath);
			treeDataProvider?.refresh();
		}
	};

	const removeProject = (uri: vscode.Uri) => {
		if (contextProvider && uri.fsPath.endsWith('manifest.json')) {
			const projectPath = uri.fsPath.replace('/manifest.json', '');
			console.log(`VTEX project removed: ${projectPath}`);
			contextProvider.removeProject(projectPath);
			treeDataProvider?.refresh();
		}
	};

	// Set up watchers
	manifestWatcher.onDidChange(refreshOnChange);
	manifestWatcher.onDidCreate(addProject);
	manifestWatcher.onDidDelete(removeProject);

	serviceWatcher.onDidChange(refreshOnChange);
	serviceWatcher.onDidCreate(refreshOnChange);
	serviceWatcher.onDidDelete(refreshOnChange);

	schemaWatcher.onDidChange(refreshOnChange);
	schemaWatcher.onDidCreate(refreshOnChange);
	schemaWatcher.onDidDelete(refreshOnChange);

	// Watch for workspace folder changes
	const workspaceFoldersWatcher = vscode.workspace.onDidChangeWorkspaceFolders(async () => {
		console.log('Workspace folders changed, rescanning for VTEX projects...');
		await contextProvider?.refreshContext();
		treeDataProvider?.refresh();
	});

	context.subscriptions.push(
		manifestWatcher, 
		serviceWatcher, 
		schemaWatcher,
		workspaceFoldersWatcher
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('VTEX Context Reader extension deactivated');
}
