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

	// ===== Inline Sorting Tests =====

	test('Inline: comma-separated array with square brackets', async () => {
		const input = "const arr = ['zebra', 'apple', 'mango']";
		const expected = "const arr = ['apple', 'mango', 'zebra']";
		await testAlphabetize(input, expected);
	});

	test('Inline: comma-separated with spacing preserved', async () => {
		const input = 'colors = "red, blue, green, alpha"';
		const expected = 'colors = "alpha, blue, green, red"';
		await testAlphabetize(input, expected);
	});

	test('Inline: comma-separated without spaces', async () => {
		const input = 'tags: z,a,m,b';
		const expected = 'tags: a, b, m, z';
		await testAlphabetize(input, expected);
	});

	test('Inline: semicolon-separated elements', async () => {
		const input = 'path: /usr/bin; /home/user; /etc; /var';
		const expected = 'path: /etc; /home/user; /usr/bin; /var';
		await testAlphabetize(input, expected);
	});

	test('Inline: pipe-separated elements', async () => {
		const input = 'tags: python | javascript | rust | go';
		const expected = 'tags: go | javascript | python | rust';
		await testAlphabetize(input, expected);
	});

	test('Inline: curly braces with comma separation', async () => {
		const input = 'obj = {zebra, apple, mango}';
		const expected = 'obj = {apple, mango, zebra}';
		await testAlphabetize(input, expected);
	});

	test('Inline: parentheses with comma separation', async () => {
		const input = 'function foo(z, a, m, b)';
		const expected = 'function foo(a, b, m, z)';
		await testAlphabetize(input, expected);
	});

	test('Inline: already sorted elements remain unchanged', async () => {
		const input = "arr = ['a', 'b', 'c']";
		const expected = "arr = ['a', 'b', 'c']";
		await testAlphabetize(input, expected);
	});

	test('Inline: single element remains unchanged', async () => {
		const input = "arr = ['single']";
		const expected = "arr = ['single']";
		await testAlphabetize(input, expected);
	});

	test('Inline: elements with numbers', async () => {
		const input = 'items: item3, item1, item2, item10';
		const expected = 'items: item1, item10, item2, item3';
		await testAlphabetize(input, expected);
	});

	test('Inline: mixed case sensitivity in inline elements', async () => {
		const input = "['Zebra', 'apple', 'Mango', 'banana']";
		const expected = "['Mango', 'Zebra', 'apple', 'banana']";
		await testAlphabetize(input, expected);
	});

	test('Inline: preserves prefix and suffix', async () => {
		const input = 'const colors = [red, blue, green] as const;';
		const expected = 'const colors = [blue, green, red] as const;';
		await testAlphabetize(input, expected);
	});

	test('Inline: double-quoted elements', async () => {
		const input = '["zebra", "apple", "mango"]';
		const expected = '["apple", "mango", "zebra"]';
		await testAlphabetize(input, expected);
	});

	test('Inline: single-quoted elements', async () => {
		const input = "['zebra', 'apple', 'mango']";
		const expected = "['apple', 'mango', 'zebra']";
		await testAlphabetize(input, expected);
	});

	test('Inline: elements without brackets', async () => {
		const input = 'colors: red, blue, green';
		const expected = 'colors: blue, green, red';
		await testAlphabetize(input, expected);
	});
});
