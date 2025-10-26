import * as vscode from 'vscode';

/**
 * Activates the extension and registers commands
 * @param context - The extension context provided by VS Code
 */
export function activate(context: vscode.ExtensionContext): void {
	const alphabetizeCommand = vscode.commands.registerCommand(
		'linesort.alphabetize',
		alphabetizeSelectedLines
	);

	context.subscriptions.push(alphabetizeCommand);
}

/**
 * Deactivates the extension
 */
export function deactivate(): void {}

/**
 * Sorts selected lines in ASCII order (case-sensitive)
 * Special characters, numbers, uppercase, then lowercase
 */
async function alphabetizeSelectedLines(): Promise<void> {
	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		vscode.window.showErrorMessage('No active text editor found');
		return;
	}

	const { document, selection } = editor;

	if (selection.isEmpty) {
		vscode.window.showInformationMessage('Please select text to alphabetize');
		return;
	}

	try {
		const selectedText = document.getText(selection);
		const lines = selectedText.split(/\r?\n/);
		const sortedLines = sortLinesAscii(lines);

		await editor.edit((editBuilder) => {
			editBuilder.replace(selection, sortedLines.join('\n'));
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		vscode.window.showErrorMessage(`Failed to alphabetize: ${errorMessage}`);
	}
}

/**
 * Sorts lines in ASCII order (case-sensitive)
 * @param lines - Array of strings to sort
 * @returns Sorted array of strings
 */
function sortLinesAscii(lines: string[]): string[] {
	return [...lines].sort((a, b) => {
		if (a < b) {
			return -1;
		}
		if (a > b) {
			return 1;
		}
		return 0;
	});
}
