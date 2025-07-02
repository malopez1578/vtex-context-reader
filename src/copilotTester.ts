import * as vscode from 'vscode';

/**
 * VTEX Copilot Context Tester
 * Herramienta para verificar que GitHub Copilot está recibiendo contexto de VTEX
 */
export class VTEXCopilotTester {
  
  /**
   * Registra un comando para probar el contexto de Copilot
   */
  static registerTestCommand(context: vscode.ExtensionContext, contextProvider: any) {
    const testCommand = vscode.commands.registerCommand('vtex-context-reader.testCopilotContext', async () => {
      await VTEXCopilotTester.runContextTest(contextProvider);
    });
    
    context.subscriptions.push(testCommand);
  }

  /**
   * Ejecuta una serie de pruebas para verificar el contexto
   */
  private static async runContextTest(contextProvider: any) {
    const outputChannel = vscode.window.createOutputChannel('VTEX Copilot Test');
    outputChannel.show();
    
    outputChannel.appendLine('🧪 Testing VTEX Copilot Context...\n');
    
    // Test 1: Verificar proyectos detectados
    outputChannel.appendLine('1. Checking detected VTEX projects:');
    if (contextProvider?.isVTEXProject()) {
      const projects = contextProvider.getAllProjects();
      outputChannel.appendLine(`   ✅ Found ${projects.length} VTEX project(s):`);
      projects.forEach((project: any, index: number) => {
        outputChannel.appendLine(`      ${index + 1}. ${project.projectName} (${project.relativePath})`);
      });
    } else {
      outputChannel.appendLine('   ❌ No VTEX projects detected');
      outputChannel.appendLine('   💡 Make sure you have manifest.json in your workspace');
      return;
    }

    // Test 2: Verificar contexto del archivo activo
    outputChannel.appendLine('\n2. Checking active file context:');
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const filePath = activeEditor.document.fileName;
      const fileContext = contextProvider.getFileContext(filePath);
      
      outputChannel.appendLine(`   📁 Active file: ${filePath}`);
      if (fileContext) {
        outputChannel.appendLine(`   ✅ Context available for this file`);
        outputChannel.appendLine(`   📋 Project: ${fileContext.projectName}`);
        outputChannel.appendLine(`   🏗️  Builders: ${fileContext.builders?.join(', ') ?? 'none'}`);
        outputChannel.appendLine(`   📦 Dependencies: ${Object.keys(fileContext.dependencies ?? {}).length} found`);
      } else {
        outputChannel.appendLine(`   ⚠️  No specific context for this file`);
      }
    } else {
      outputChannel.appendLine('   ℹ️  No active file open');
    }

    // Test 3: Verificar configuración de contexto
    outputChannel.appendLine('\n3. Checking context configuration:');
    const contextSummary = contextProvider.getContextSummary();
    outputChannel.appendLine(`   📊 Context Summary: ${contextSummary}`);

    // Test 4: Crear archivo de prueba para Copilot
    outputChannel.appendLine('\n4. Creating test file for Copilot verification:');
    await VTEXCopilotTester.createTestFile(outputChannel);

    outputChannel.appendLine('\n🎉 Context test completed!');
    outputChannel.appendLine('\n💡 Next steps:');
    outputChannel.appendLine('   1. Open the test file created');
    outputChannel.appendLine('   2. Try typing VTEX-specific code');
    outputChannel.appendLine('   3. Check if Copilot suggests VTEX patterns');
  }

  /**
   * Crea un archivo de prueba para verificar sugerencias de Copilot
   */
  private static async createTestFile(outputChannel: vscode.OutputChannel) {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        outputChannel.appendLine('   ❌ No workspace folder available');
        return;
      }

      const testContent = `// VTEX Copilot Context Test
// Este archivo fue generado para probar las sugerencias de Copilot

import React from 'react';
import { useCssHandles } from 'vtex.css-handles';

// Test 1: Escribe "const CSS_HANDLES" y presiona Tab
// Copilot debería sugerir un array con handles típicos de VTEX


// Test 2: Escribe "const Component = () => {" y presiona Tab
// Copilot debería sugerir estructura de componente VTEX


// Test 3: Escribe "// Create a product" y presiona Tab
// Copilot debería sugerir código relacionado con productos VTEX


// Test 4: En la línea siguiente, escribe "import {" y presiona Tab
// Copilot debería sugerir imports de VTEX


export default Component;
`;

      const testFileUri = vscode.Uri.joinPath(workspaceFolder.uri, 'vtex-copilot-test.tsx');
      const encoder = new TextEncoder();
      await vscode.workspace.fs.writeFile(testFileUri, encoder.encode(testContent));
      
      outputChannel.appendLine(`   ✅ Test file created: vtex-copilot-test.tsx`);
      
      // Abrir el archivo automáticamente
      const document = await vscode.workspace.openTextDocument(testFileUri);
      await vscode.window.showTextDocument(document);
      
      outputChannel.appendLine('   📝 Test file opened for verification');
    } catch (error) {
      outputChannel.appendLine(`   ❌ Error creating test file: ${error}`);
    }
  }

  /**
   * Verifica si las sugerencias de Copilot contienen contexto de VTEX
   */
  static async verifyCopilotSuggestions() {
    const outputChannel = vscode.window.createOutputChannel('VTEX Copilot Verification');
    outputChannel.show();
    
    outputChannel.appendLine('🔍 Verifying Copilot VTEX Context...\n');
    
    // Instrucciones para el usuario
    outputChannel.appendLine('📋 Manual verification steps:');
    outputChannel.appendLine('1. Open a .tsx file in your VTEX project');
    outputChannel.appendLine('2. Start typing: "import { useCssHandles }"');
    outputChannel.appendLine('3. Check if Copilot suggests: "from \'vtex.css-handles\'"');
    outputChannel.appendLine('4. Start typing: "const CSS_HANDLES = ["');
    outputChannel.appendLine('5. Check if Copilot suggests typical VTEX handles');
    outputChannel.appendLine('6. Try typing VTEX component patterns');
    
    outputChannel.appendLine('\n✅ If Copilot suggests VTEX-specific code, context is working!');
    outputChannel.appendLine('❌ If suggestions are generic, context may need adjustment');
  }
}
