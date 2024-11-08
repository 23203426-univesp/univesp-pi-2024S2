import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
export default [
	stylistic.configs.customize({
		indent: 'tab',
		quotes: 'single',
		semi: true,
		jsx: false,
		commaDangle: 'always-multiline',
	}),
	{
		rules: {
			'@stylistic/max-len': [
				'error',
				{
					code: 80,
					ignoreComments: false,
					ignoreTrailingComments: false,
					ignoreStrings: false,
				},
			],
			'@stylistic/function-call-argument-newline': [
				'error',
				'consistent',
			],
			'@stylistic/object-curly-newline': [
				'error',
				{
					multiline: true,
					consistent: true,
				},
			],
			'@stylistic/object-property-newline': [
				'error',
				{
					allowAllPropertiesOnSameLine: false,
				},
			],
			'@stylistic/array-element-newline': [
				'error',
				{
					consistent: true,
					multiline: true,
				},
			],
			'@stylistic/brace-style': [
				'error',
				'1tbs',
				{
					allowSingleLine: true,
				},
			],
			'@stylistic/function-paren-newline': ['error', 'multiline'],
			'@stylistic/array-bracket-newline': [
				'error',
				{
					multiline: true,
				},
			],
		},
	},
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
];
