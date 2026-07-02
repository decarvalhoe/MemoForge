// Niveaux Monde 7 — Pointeurs de fonction (E3-5, ancrage B11, cf. docs/GAME-DESIGN.md §3-4).
// Le joueur écrit le corps de la MACHINE qui reçoit f ; le lanceur la branche avec
// plusieurs fonctions. L'appât central : câbler une fonction en dur au lieu d'utiliser f.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { byId, runProgram, goalMet, solved } from '../helpers.mjs';
import { regionOfLevel } from '../../src/game/world.js';
import { explainError } from '../../src/game/pitfalls.js';

describe('fn-1 — do_op : la machine à opérations', () => {
	const L = byId['fn-1'];

	test('res = f(a,b) puis return res : r1 = 10 ET r2 = 4', () => {
		assert.ok(solved(L, ['apply-f', 'ret-res']));
	});

	test('câbler add en dur : marche pour add… mais sub rend 10 aussi → échec', () => {
		const { mem, error } = runProgram(L, ['apply-add', 'ret-res']);
		assert.equal(error, null);
		assert.equal(mem.getVar('r1'), 10); // le branchement add semble marcher…
		assert.equal(mem.getVar('r2'), 10); // …mais la machine ne sait pas soustraire
		assert.equal(goalMet(L, mem), false);
	});

	test('return res sans avoir appliqué f → res n\'existe pas, crash enseignant', () => {
		const { error } = runProgram(L, ['ret-res']);
		assert.match(error, /variable inconnue/);
	});
});

describe('fn-2 — ft_foreach : appliquer f à chaque case', () => {
	const L = byId['fn-2'];

	test('f(tab[i]) sur chaque élément → sortie "123"', () => {
		assert.ok(solved(L, ['loop-each']));
	});

	test('appât f(base) : émet l\'adresse, pas les éléments → échec propre', () => {
		const { mem, error } = runProgram(L, ['loop-base']);
		assert.equal(error, null);
		assert.notEqual(mem.output, '123');
		assert.match(mem.output, /^\d+$/); // une adresse répétée, très loin de "123"
		assert.equal(goalMet(L, mem), false);
	});
});

describe('carte & pièges — le Monde 7 est branché', () => {
	test('fn-1 et fn-2 appartiennent à r8 (briques B11)', () => {
		assert.equal(regionOfLevel('fn-1').id, 'r8');
		assert.equal(regionOfLevel('fn-2').id, 'r8');
		assert.deepEqual(regionOfLevel('fn-1').briques, ['B11']);
	});
	test('« fonction inconnue » est traduite en piège pédagogique', () => {
		const f = explainError('fonction inconnue : 5');
		assert.equal(f.tone, 'crash');
		assert.match(f.title, /fonction inconnue/);
		assert.match(f.hint, /branche/);
	});
});
