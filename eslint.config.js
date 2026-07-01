import js from '@eslint/js';
import globals from 'globals';

const normeLite = {
	'no-var': 'error',
	'prefer-const': 'error',
	eqeqeq: ['error', 'always'],
	'no-unused-vars': 'error',
	'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
	'max-depth': ['error', 4],
	'no-console': 'error'
};

export default [
	// src/ui/** est volontairement hors périmètre tant que la refonte design-system
	// (EPIC 1) est en cours ; il rejoindra le lint une fois cette couche stabilisée.
	{ ignores: ['node_modules/**', 'design/**', 'styles/**', 'src/ui/**'] },

	js.configs.recommended,

	{
		files: ['src/**/*.js'],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: { ...globals.browser }
		},
		rules: normeLite
	},
	{
		files: ['tests/**/*.mjs'],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: { ...globals.node }
		},
		rules: { ...normeLite, 'no-console': 'off', 'max-lines-per-function': 'off' }
	}
];
