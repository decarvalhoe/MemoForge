import js from '@eslint/js';
import globals from 'globals';

const normeLite = {
	'no-var': 'error',
	'prefer-const': 'error',
	// === partout, sauf l'idiome délibéré `x == null` (teste null ET undefined d'un coup).
	eqeqeq: ['error', 'always', { null: 'ignore' }],
	'no-unused-vars': 'error',
	'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
	'max-depth': ['error', 4],
	'no-console': 'error'
};

export default [
	// Tout src/ est désormais linté (E10-3, #164) : la couche UI/jeu suit les mêmes
	// standards que le moteur. Restent hors périmètre : dépendances, artefacts, CSS.
	{ ignores: ['node_modules/**', 'design/**', 'styles/**', 'dist/**'] },

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
		// Tests Node : globals node + browser (le harnais visuel exécute des callbacks
		// dans le contexte de la page via page.evaluate — document/window y sont légitimes).
		files: ['tests/**/*.mjs'],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: { ...globals.node, ...globals.browser }
		},
		rules: { ...normeLite, 'no-console': 'off', 'max-lines-per-function': 'off' }
	}
];
