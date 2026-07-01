import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { byId, runProgram, goalMet, solved } from '../helpers.mjs';

describe('niveau 1-1 — mettre 42 dans n', () => {
	const L = byId['1-1'];
	test('n = 42 atteint la cible', () => assert.ok(solved(L, ['set-n'])));
	test('*n = 42 plante (NULL)', () => assert.ok(runProgram(L, ['deref-n']).error));
});

describe('niveau 1-2 — via le pointeur', () => {
	const L = byId['1-2'];
	test('p=&n puis *p=42 atteint la cible', () => assert.ok(solved(L, ['p-addr-n', 'star-p-42'])));
	test('mauvais ordre plante (NULL)', () => assert.ok(runProgram(L, ['star-p-42', 'p-addr-n']).error));
});

describe('niveau 1-3 — échange a/b', () => {
	const L = byId['1-3'];
	test('tmp=a; a=b; b=tmp échange bien', () => assert.ok(solved(L, ['tmp-a', 'a-b', 'b-tmp'])));
	test('a=b; b=a échoue (pas de tmp)', () => {
		const { mem } = runProgram(L, ['a-b', 'b-a']);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('niveau 2-1 — inverser le tableau', () => {
	const L = byId['2-1'];
	test('swap des bouts inverse le tableau', () => assert.ok(solved(L, ['tmp-t0', 't0-t2', 't2-tmp'])));
	test('sans tmp, échoue', () => {
		const { mem } = runProgram(L, ['t0-t2', 't2-t0']);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('niveau 3-1 — réserve, écris, libère', () => {
	const L = byId['3-1'];
	test('malloc; *p=7; free → zéro fuite', () => assert.ok(solved(L, ['p-malloc', 'star-p-7', 'free-p'])));
	test('oublier free → fuite (cible non atteinte, pas de crash)', () => {
		const { mem, error } = runProgram(L, ['p-malloc', 'star-p-7']);
		assert.equal(goalMet(L, mem), false);
		assert.equal(error, null);
	});
	test('*p avant malloc → crash NULL', () => assert.ok(runProgram(L, ['star-p-7', 'p-malloc', 'free-p']).error));
	test('p=7 puis *p → adresse invalide', () => assert.ok(runProgram(L, ['p-7-bad', 'star-p-7']).error));
});

describe('niveau 3-2 — chaque malloc a son free', () => {
	const L = byId['3-2'];
	test('deux malloc, deux free → zéro fuite', () => assert.ok(solved(L, ['p-malloc', 'q-malloc', 'free-p', 'free-q'])));
	test('double free → crash', () => assert.ok(runProgram(L, ['p-malloc', 'free-p', 'free-p2']).error));
});

describe('niveau 4-1 — écrire "Hi"', () => {
	const L = byId['4-1'];
	test("'H','i','\\0' forme la chaîne", () => assert.ok(solved(L, ['c0-H', 'c1-i', 'c2-nul'])));
	test('mauvaise lettre → échoue', () => {
		const { mem } = runProgram(L, ['c0-i', 'c1-i', 'c2-nul']);
		assert.equal(goalMet(L, mem), false);
	});
});
