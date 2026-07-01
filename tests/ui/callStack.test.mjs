// Tests du modèle de pile d'appels (cœur pur de callStackView, sans DOM). node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { callStackModel } from '../../src/ui/callStackView.js';

describe('callStackModel — contrat frames() (#20)', () => {
	test('programme à plat (0 ou 1 frame) → non visible', () => {
		assert.equal(callStackModel([]).visible, false);
		assert.equal(callStackModel([{ label: 'main', vars: [] }]).visible, false);
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

	test('badge de boucle « tour i/n »', () => {
		const m = callStackModel([
			{ label: 'main', vars: [] },
			{ label: 'boucle', vars: [{ name: 'i', value: 1 }], loop: { i: 2, n: 5 } }
		]);
		assert.equal(m.frames[0].loopLabel, 'tour 2/5');
		assert.equal(m.frames[1].loopLabel, null);
	});

	test('valeurs nulles → tiret', () => {
		const m = callStackModel([
			{ label: 'a', vars: [] },
			{ label: 'b', vars: [{ name: 'p', value: null }] }
		]);
		assert.equal(m.frames[0].vars[0].value, '—');
	});
});
