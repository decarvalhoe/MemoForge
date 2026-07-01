// Tests du modèle de pile d'appels (cœur pur de callStackView, sans DOM). node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { callStackModel } from '../../src/ui/callStackView.js';

describe('callStackModel — contrat frames() (#20)', () => {
	test('programme à plat sans boucle → non visible', () => {
		assert.equal(callStackModel([]).visible, false);
		assert.equal(callStackModel([{ label: 'main', vars: [] }]).visible, false);
	});

	test('une seule frame AVEC boucle → visible via l\'indicateur de boucle', () => {
		const m = callStackModel([{ label: 'main', vars: [], loop: { i: 0, n: 3 } }]);
		assert.equal(m.visible, true);
		assert.deepEqual(m.loop, { i: 0, n: 3 });
		assert.equal(m.frames.length, 0);   // pas de pile pour une seule frame
	});

	test('plusieurs frames → visible, sommet en premier et actif', () => {
		const m = callStackModel([
			{ label: 'fact(3)', vars: [{ name: 'n', value: 3 }] },
			{ label: 'fact(2)', vars: [{ name: 'n', value: 2 }] }
		]);
		assert.equal(m.visible, true);
		assert.equal(m.frames[0].label, 'fact(2)');   // sommet en premier
		assert.equal(m.frames[0].active, true);
		assert.equal(m.frames[1].active, false);
	});

	test('badge de boucle « tour i+1 / n » (i=2 → tour 3/5)', () => {
		const m = callStackModel([
			{ label: 'main', vars: [] },
			{ label: 'boucle', vars: [{ name: 'i', value: 1 }], loop: { i: 2, n: 5 } }
		]);
		assert.equal(m.frames[0].loopLabel, 'tour 3 / 5');
		assert.equal(m.frames[1].loopLabel, null);
	});

	test('boucle while (n = null) → « tour i » sans borne', () => {
		const m = callStackModel([{ label: 'main', vars: [], loop: { i: 1, n: null } }]);
		assert.equal(m.visible, true);
		assert.deepEqual(m.loop, { i: 1, n: null });
	});

	test('valeurs nulles → tiret', () => {
		const m = callStackModel([
			{ label: 'a', vars: [] },
			{ label: 'b', vars: [{ name: 'p', value: null }] }
		]);
		assert.equal(m.frames[0].vars[0].value, '—');
	});
});
