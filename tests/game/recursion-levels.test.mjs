// Niveaux Monde 6 — Récursivité (E3-4, ancrage B9, cf. docs/GAME-DESIGN.md §3-4).
// Vérifie le contrat pédagogique : la solution s'exécute VRAIMENT (pile réelle), les
// appâts produisent le crash/l'échec qu'ils enseignent, et la carte rattache la région.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { byId, runProgram, goalMet, solved, interpFor } from '../helpers.mjs';
import { Memory } from '../../src/engine/memory.js';
import { regionOfLevel } from '../../src/game/world.js';
import { explainError } from '../../src/game/pitfalls.js';

describe('rec-1 — écrire le corps de fact(n), fact(3) = 6', () => {
	const L = byId['rec-1'];

	test('base → rec → comb : r = 6, sans erreur', () => {
		assert.ok(solved(L, ['base', 'rec', 'comb']));
	});

	test('la pile monte réellement à main + 3 frames, chaque frame porte SON n', () => {
		const program = ['base', 'rec', 'comb'].map((id) => L.bank.find((b) => b.id === id));
		const interp = interpFor(L, program, new Memory(L.vars));
		let deepest = [];
		while (!interp.done) {
			interp.step();
			const fr = interp.frames();
			if (fr.length > deepest.length) deepest = fr;
		}
		assert.equal(deepest.length, 4); // main + fact(3) + fact(2) + fact(1)
		const nOf = (f) => f.vars.find((v) => v.name === 'n').value;
		assert.deepEqual([nOf(deepest[1]), nOf(deepest[2]), nOf(deepest[3])], [3, 2, 1]);
	});

	test('cas de base APRÈS l\'appel récursif → la pile déborde (borné)', () => {
		const { error } = runProgram(L, ['rec', 'base', 'comb']);
		assert.match(error, /débordement de pile/);
	});

	test('appât t = fact(n) (n ne rétrécit pas) → débordement', () => {
		const { error } = runProgram(L, ['base', 'rec-bad', 'comb']);
		assert.match(error, /débordement de pile/);
	});

	test('le débordement est traduit en piège pédagogique', () => {
		const f = explainError('débordement de pile : récursion sans cas de base');
		assert.equal(f.tone, 'crash');
		assert.match(f.title, /pile déborde/);
		assert.match(f.hint, /cas de base/);
	});
});

describe('rec-2 — fact(5) = 120, appâts plus fins', () => {
	const L = byId['rec-2'];

	test('base → rec → comb : r = 120', () => {
		assert.ok(solved(L, ['base', 'rec', 'comb']));
	});

	test('cas de base qui répond 0 → tout s\'annule (r = 0), échec propre', () => {
		const { mem, error } = runProgram(L, ['base-bad', 'rec', 'comb']);
		assert.equal(error, null);
		assert.equal(mem.getVar('r'), 0);
		assert.equal(goalMet(L, mem), false);
	});

	test('combinaison return n (ignore t) → r = 5, échec propre', () => {
		const { mem, error } = runProgram(L, ['base', 'rec', 'comb-bad']);
		assert.equal(error, null);
		assert.equal(mem.getVar('r'), 5);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('carte — la région Récursivité est jouable', () => {
	test('rec-1 et rec-2 appartiennent à r7 (briques B9)', () => {
		assert.equal(regionOfLevel('rec-1').id, 'r7');
		assert.equal(regionOfLevel('rec-2').id, 'r7');
		assert.deepEqual(regionOfLevel('rec-1').briques, ['B9']);
	});
});
