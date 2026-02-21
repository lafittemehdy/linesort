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
 * Sorts selected lines in ASCII order (case-sensitive) or inline elements
 * Auto-detects: multi-line sorting vs single-line inline element sorting
 * Special characters, numbers, uppercase, then lowercase
 */
async function alphabetizeSelectedLines(): Promise<void> {
	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		vscode.window.showErrorMessage('No active text editor found');
		return;
	}

	const { document, selection } = editor;

	try {
		let textToSort: string;
		let rangeToReplace: vscode.Range;

		// Handle empty selection - use current line
		if (selection.isEmpty) {
			const currentLine = document.lineAt(selection.active.line);
			textToSort = currentLine.text;
			rangeToReplace = currentLine.range;
		} else {
			textToSort = document.getText(selection);
			rangeToReplace = selection;
		}

		const lines = textToSort.split(/\r?\n/);

		// Multi-line selection - sort lines (existing behavior)
		if (lines.length > 1) {
			const sortedLines = sortLinesAscii(lines);
			await editor.edit((editBuilder) => {
				editBuilder.replace(rangeToReplace, sortedLines.join('\n'));
			});
			return;
		}

		// Single line - try inline sorting
		const singleLine = lines[0];
		const delimiter = detectDelimiter(singleLine);

		if (delimiter) {
			const sortedLine = sortInlineElements(singleLine, delimiter);
			await editor.edit((editBuilder) => {
				editBuilder.replace(rangeToReplace, sortedLine);
			});
		} else {
			vscode.window.showInformationMessage(
				'No delimiter detected. Select multiple lines to sort, or ensure line contains comma, semicolon, pipe, or space-separated elements.'
			);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		vscode.window.showErrorMessage(`Failed to alphabetize: ${errorMessage}`);
	}
}

/**
 * Detects the delimiter used in a single line
 * Supports: comma, semicolon, pipe, and multiple spaces
 * @param text - The text to analyze
 * @returns The detected delimiter or null if none found
 */
function detectDelimiter(text: string): string | null {
	// Try to find content within brackets first
	const bracketMatch = text.match(/[\[{(](.+?)[\]})]/);
	const contentToAnalyze = bracketMatch ? bracketMatch[1] : text;

	// Count occurrences of different delimiters
	const delimiters = [',', ';', '|'];
	const counts = delimiters.map(d => ({
		delimiter: d,
		count: (contentToAnalyze.match(new RegExp(`\\${d}`, 'g')) || []).length
	}));

	// Find the most common delimiter
	const maxCount = Math.max(...counts.map(c => c.count));
	if (maxCount > 0) {
		const detected = counts.find(c => c.count === maxCount);
		return detected ? detected.delimiter : null;
	}

	// Check for multiple spaces as delimiter
	if (/\s{2,}/.test(contentToAnalyze)) {
		return 'REGEXP_SPACES'; // Multiple spaces
	}

	return null;
}

/**
 * Extracts elements from a line based on delimiter
 * Preserves quotes and surrounding context
 * @param text - The text to parse
 * @param delimiter - The delimiter to split on
 * @returns Object with elements and metadata for reconstruction
 */
function parseInlineElements(text: string, delimiter: string): {
	closeBracket: string;
	closeQuote: string;
	elements: string[];
	openBracket: string;
	openQuote: string;
	prefix: string;
	suffix: string;
} {
	let closeQuote = '';
	let closeBracket = '';
	let openBracket = '';
	let openQuote = '';
	let prefix = '';
	let suffix = '';
	let content = text;

	// Extract prefix before opening bracket
	const bracketPatterns = [
		{ open: '[', close: ']', regex: /^(.*?)(\[)(.+?)(\])(.*)$/ },
		{ open: '{', close: '}', regex: /^(.*?)(\{)(.+?)(\})(.*)$/ },
		{ open: '(', close: ')', regex: /^(.*?)(\()(.+?)(\))(.*)$/ }
	];

	let foundBracket = false;
	for (const pattern of bracketPatterns) {
		const match = text.match(pattern.regex);
		if (match) {
			prefix = match[1];
			openBracket = match[2];
			content = match[3];
			closeBracket = match[4];
			suffix = match[5];
			foundBracket = true;
			break;
		}
	}

	// If no brackets found, try to find sortable content after common prefixes
	if (!foundBracket) {
		// Look for patterns like "key: value, value, value" or "key = value, value, value"
		const prefixMatch = text.match(/^([^:=]*?[:=]\s*)(.+)$/);
		if (prefixMatch) {
			prefix = prefixMatch[1];
			content = prefixMatch[2];

			// Check if content is wrapped in quotes (e.g., colors = "red, blue, green")
			const quoteMatch = content.match(/^(["'])(.+)\1$/);
			if (quoteMatch) {
				openQuote = quoteMatch[1];
				closeQuote = quoteMatch[1];
				content = quoteMatch[2];
			}
		}
	}

	const splitRegex = delimiter === 'REGEXP_SPACES' ? /\s{2,}/ : delimiter;
	// Split and trim elements
	const elements = content.split(splitRegex).map(el => el.trim()).filter(el => el.length > 0);

	return { closeBracket, closeQuote, elements, openBracket, openQuote, prefix, suffix };
}

/**
 * Sorts elements within a single line
 * @param text - The line of text containing elements to sort
 * @param delimiter - The delimiter separating elements
 * @returns The line with sorted elements
 */
function sortInlineElements(text: string, delimiter: string): string {
	const parsed = parseInlineElements(text, delimiter);
	const sortedElements = sortLinesAscii(parsed.elements);

	// Reconstruct with normalized spacing
	let joinDelimiter: string;
	if (delimiter === '|') {
		joinDelimiter = ' | ';
	} else if (delimiter === 'REGEXP_SPACES') {
		joinDelimiter = '  ';
	} else {
		joinDelimiter = delimiter + ' ';
	}

	const joinedElements = sortedElements.join(joinDelimiter);

	return (
		parsed.prefix +
		parsed.openQuote +
		parsed.openBracket +
		joinedElements +
		parsed.closeBracket +
		parsed.closeQuote +
		parsed.suffix
	);
}

/**
 * Sorts lines in ASCII order (case-sensitive)
 * @param lines - Array of strings to sort
 * @returns Sorted array of strings
 */
function sortLinesAscii(lines: string[]): string[] {
	return [...lines].sort();
}
