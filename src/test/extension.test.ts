import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Line Sort Extension Tests', () => {
	vscode.window.showInformationMessage('Running Line Sort tests');

	/**
	 * Helper function to create a document, select text, and run alphabetize command
	 */
	async function testAlphabetize(input: string, expected: string): Promise<void> {
		const document = await vscode.workspace.openTextDocument({
			content: input,
			language: 'text',
		});

		const editor = await vscode.window.showTextDocument(document);

		// Select all text
		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length)
		);
		editor.selection = new vscode.Selection(fullRange.start, fullRange.end);

		// Execute alphabetize command
		await vscode.commands.executeCommand('linesort.alphabetize');

		const actual = document.getText();
		assert.strictEqual(actual, expected);

		// Close the document without saving
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	}

	test('ASCII order: numbers before uppercase before lowercase', async () => {
		const input = 'zebra\nApple\nbanana\n123';
		const expected = '123\nApple\nbanana\nzebra';
		await testAlphabetize(input, expected);
	});

	test('ASCII order: special characters before numbers', async () => {
		const input = '5\n!\n@\n1\n#';
		const expected = '!\n#\n1\n5\n@';
		await testAlphabetize(input, expected);
	});

	test('ASCII order: uppercase letters', async () => {
		const input = 'Z\nA\nM\nB';
		const expected = 'A\nB\nM\nZ';
		await testAlphabetize(input, expected);
	});

	test('ASCII order: lowercase letters', async () => {
		const input = 'z\na\nm\nb';
		const expected = 'a\nb\nm\nz';
		await testAlphabetize(input, expected);
	});

	test('ASCII order: mixed case sensitivity', async () => {
		const input = 'apple\nApple\nAPPLE';
		const expected = 'APPLE\nApple\napple';
		await testAlphabetize(input, expected);
	});

	test('Empty lines are sorted', async () => {
		const input = 'zebra\n\napple\n\nbanana';
		const expected = '\n\napple\nbanana\nzebra';
		await testAlphabetize(input, expected);
	});

	test('Single line returns unchanged', async () => {
		const input = 'single line';
		const expected = 'single line';
		await testAlphabetize(input, expected);
	});

	test('Already sorted lines remain unchanged', async () => {
		const input = '1\n2\n3\nA\nB\nC\na\nb\nc';
		const expected = '1\n2\n3\nA\nB\nC\na\nb\nc';
		await testAlphabetize(input, expected);
	});

	test('Complex ASCII sort with all character types', async () => {
		const input = 'zebra\n!\n123\nApple\n@\nbanana\n456\nZoo';
		const expected = '!\n123\n456\n@\nApple\nZoo\nbanana\nzebra';
		await testAlphabetize(input, expected);
	});

	test('Lines with spaces', async () => {
		const input = 'zebra zoo\napple pie\nbanana split';
		const expected = 'apple pie\nbanana split\nzebra zoo';
		await testAlphabetize(input, expected);
	});

	test('Reverse alphabetical order', async () => {
		const input = 'z\ny\nx\nw\nv';
		const expected = 'v\nw\nx\ny\nz';
		await testAlphabetize(input, expected);
	});
});
