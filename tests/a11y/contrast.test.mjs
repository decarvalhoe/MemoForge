// Audit de contraste WCAG AA "as-code" (E5-1). Échoue si une paire couleur/fond des tokens
// régresse sous son seuil. Valeurs = styles/tokens/colors.css. node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, passesAA } from '../../src/util/contrast.js';

const DARK = {
	bg: '#060A06', surface: '#0B110B', well: '#000000',
	text: '#BFF2CF', muted: '#4F8A63', accent: '#46E08A', onAccent: '#041007',
	pointer: '#E8B84B', danger: '#FF6B5E'
};
const LIGHT = {
	bg: '#EAF3E9', surface: '#FFFFFF',
	text: '#123322', muted: '#4E7A5C', accent: '#0F7A3D', onAccent: '#FFFFFF',
	danger: '#C23A2B', pointer: '#B5731A'
};

const AA = (fg, bg) => assert.ok(passesAA(fg, bg), `${fg} sur ${bg} = ${contrastRatio(fg, bg).toFixed(2)} < 4.5`);
const AA_LARGE = (fg, bg) => assert.ok(passesAA(fg, bg, { large: true }), `${fg} sur ${bg} = ${contrastRatio(fg, bg).toFixed(2)} < 3.0`);

describe('util contrast — sanity', () => {
	test('noir/blanc = 21', () => assert.equal(Math.round(contrastRatio('#000000', '#ffffff')), 21));
	test('même couleur = 1', () => assert.equal(contrastRatio('#46E08A', '#46E08A'), 1));
});

describe('thème sombre (défaut) — texte normal ≥ AA 4.5', () => {
	test('texte sur bg / surface / well', () => {
		AA(DARK.text, DARK.bg); AA(DARK.text, DARK.surface); AA(DARK.text, DARK.well);
	});
	test('texte secondaire (muted) sur bg', () => AA(DARK.muted, DARK.bg));
	test('bouton primaire : on-accent sur accent', () => AA(DARK.onAccent, DARK.accent));
	test('signaux accent / pointer / danger sur bg (≥ 4.5)', () => {
		AA(DARK.accent, DARK.bg); AA(DARK.pointer, DARK.bg); AA(DARK.danger, DARK.bg);
	});
});

describe('thème clair — texte normal ≥ AA 4.5', () => {
	test('texte sur bg / surface', () => {
		AA(LIGHT.text, LIGHT.bg); AA(LIGHT.text, LIGHT.surface);
	});
	test('bouton primaire : on-accent sur accent', () => AA(LIGHT.onAccent, LIGHT.accent));
	test('accent et danger sur bg', () => {
		AA(LIGHT.accent, LIGHT.bg); AA(LIGHT.danger, LIGHT.bg);
	});
	// Contrainte documentée (voir docs/A11Y.md) : en thème CLAIR, `muted` (4.34) et `pointer`
	// (3.40) sont réservés au GRAND texte / éléments d'UI (seuil 3.0), jamais au petit corps.
	test('muted et pointer réservés grand texte/UI (≥ 3.0)', () => {
		AA_LARGE(LIGHT.muted, LIGHT.bg); AA_LARGE(LIGHT.pointer, LIGHT.bg);
		// et NE satisfont PAS le texte normal — garde-fou explicite contre un usage en petit corps
		assert.equal(passesAA(LIGHT.muted, LIGHT.bg), false);
		assert.equal(passesAA(LIGHT.pointer, LIGHT.bg), false);
	});
});
