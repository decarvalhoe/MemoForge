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

describe('niveau 1-3 — écris ft_swap (par adresse)', () => {
	const L = byId['1-3'];
	test('tmp=*pa; *pa=*pb; *pb=tmp échange a et b de l\'appelant', () => {
		assert.ok(solved(L, ['save', 'copy', 'restore']));
	});
	test('sans tmp (*pa=*pb; *pb=*pa) → les deux valent b, échoue', () => {
		const { mem } = runProgram(L, ['copy', 'nosave']);
		assert.equal(mem.getVar('a'), mem.getVar('b'));
		assert.equal(goalMet(L, mem), false);
	});
});

describe('niveau ptr-1 — écris ft_ft (modifie via le pointeur)', () => {
	const L = byId['ptr-1'];
	test('*nbr = 42 écrit dans le x de l\'appelant', () => assert.ok(solved(L, ['deref-set'])));
	test('nbr = 42 ne change que la copie locale → x reste 0, échoue', () => {
		const { mem } = runProgram(L, ['var-set']);
		assert.equal(mem.getVar('x'), 0);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('niveau ptr-2 — écris ft_div_mod (deux retours)', () => {
	const L = byId['ptr-2'];
	test('*div et *mod rendent q=3 et r=1', () => assert.ok(solved(L, ['set-div', 'set-mod'])));
	test('div = a/b (dans la copie) ne rend pas q → échoue', () => {
		const { mem } = runProgram(L, ['div-bad', 'set-mod']);
		assert.equal(mem.getVar('q'), 0);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('niveau 2-1 — écris ft_rev_int_tab (renversement indexé)', () => {
	const L = byId['2-1'];
	test('i=0, j=size-1, boucle qui se croise → [3,2,1]', () => {
		assert.ok(solved(L, ['i0', 'j0', 'loop']));
	});
	test('boucle « i < size » va trop loin (dé-renverse) → échoue', () => {
		const { mem } = runProgram(L, ['i0', 'j0', 'loop-bad']);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('niveau range-1 — écris ft_range (tableau dynamique)', () => {
	const L = byId['range-1'];
	test('size → malloc → remplissage arr[i]=min+i → [2,3,4] sur le tas', () => {
		assert.ok(solved(L, ['size', 'alloc', 'i0', 'fill', 'ret']));
	});
	test('remplir arr[i] = i (oublie + min) → [0,1,2], échoue', () => {
		const { mem } = runProgram(L, ['size', 'alloc', 'i0', 'fill-bad', 'ret']);
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
