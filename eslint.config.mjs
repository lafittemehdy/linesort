import tseslint from "typescript-eslint";

export default tseslint.config(
	{ files: ["**/*.ts"] },
	...tseslint.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
		},
		rules: {
			"@typescript-eslint/naming-convention": [
				"warn",
				{
					format: ["camelCase", "PascalCase"],
					selector: "import",
				},
			],
			curly: "warn",
			eqeqeq: "warn",
			"no-throw-literal": "warn",
			semi: "warn",
		},
	}
);
