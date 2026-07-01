// Tests des médailles d'optimisation (E3-6). Auto-porté : n'importe que medals.js. node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeMedals, medalScore, isPerfect } from '../../src/game/medals.js';

const win = { goalMet: true, clean: true, instructions: 2, steps: 2, cells: 1 };
const par = { instructions: 2, steps: 2, cells: 1 };

describe('computeMedals', () => {
	test('toujours au moins la médaille « résolu »', () => {
		const m = computeMedals({ goalMet: false, clean: false }, {});
		assert.equal(m.length, 1);
		assert.equal(m[0].key, 'solved');
		assert.equal(m[0].earned, false);
	});

	test('résolu proprement = médaille solved gagnée', () => {
		assert.equal(computeMedals(win, par).find((x) => x.key === 'solved').earned, true);
	});

	test('cible atteinte mais fuite (clean=false) → non résolu', () => {
		const m = computeMedals({ ...win, clean: false }, par);
		assert.equal(m.find((x) => x.key === 'solved').earned, false);
		// aucune médaille d'optimisation sans résolution propre
		assert.ok(m.filter((x) => x.key !== 'solved').every((x) => !x.earned));
	});

	test('sous les seuils → toutes les médailles au par gagnées', () => {
		assert.ok(isPerfect(computeMedals(win, par)));
		assert.equal(medalScore(computeMedals(win, par)), 4);
	});

	test('au-dessus d\'un seuil → cette médaille manque', () => {
		const m = computeMedals({ ...win, instructions: 3 }, par);
		assert.equal(m.find((x) => x.key === 'instr').earned, false);
		assert.equal(isPerfect(m), false);
		assert.equal(medalScore(m), 3); // solved + steps + cells
	});

	test('un seuil absent → pas de médaille correspondante', () => {
		const m = computeMedals(win, { instructions: 2 });
		assert.deepEqual(m.map((x) => x.key), ['solved', 'instr']);
	});

	test('un seuil exactement atteint est « au par » (<=)', () => {
		assert.equal(computeMedals({ ...win, steps: 2 }, par).find((x) => x.key === 'steps').earned, true);
	});
});
