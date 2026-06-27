// Defines the VS Code desktop test harness used by local and CI extension checks.
import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	launchArgs: [
		'--disable-dev-shm-usage',
		'--disable-extensions',
		'--disable-gpu',
	],
	version: '1.125.0',
});
