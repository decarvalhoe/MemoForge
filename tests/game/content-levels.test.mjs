// Tests des niveaux de contenu (E3-3/4/5) ancrés sur les capacités moteur B1/B2/B3-5.
// Réutilise tests/helpers.mjs (byId/runProgram/goalMet/solved). node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { byId, runProgram, goalMet, solved } from '../helpers.mjs';

describe('s-1 — Sortie & ASCII (write / ft_putstr)', () => {
	const L = byId['s-1'];
	test('write c0 puis c1 → "Hi"', () => assert.ok(solved(L, ['w-c0', 'w-c1'])));
	test('write(1,&c0,2) émet les 2 octets contigus → "Hi"', () => assert.ok(solved(L, ['w-c0-2'])));
	test('ordre inverse → "iH", échoue', () => {
		const { mem } = runProgram(L, ['w-c1', 'w-c0']);
		assert.equal(mem.output, 'iH');
		assert.equal(goalMet(L, mem), false);
	});
});

describe('str-1 — Chaînes (strcpy / sentinelle)', () => {
	const L = byId['str-1'];
	test('strcpy(&d0,&s0) recopie "Hi\\0"', () => assert.ok(solved(L, ['cpy'])));
	test('strcpy(&d0,&d0) ne copie rien → échoue', () => {
		const { mem } = runProgram(L, ['cpy-bad']);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('str-2 — Chaînes (sentinelle : borner avant de mesurer)', () => {
	const L = byId['str-2'];
	test('borner puis strlen → n = 2', () => assert.ok(solved(L, ['set-term', 'measure'])));
	test('mesurer AVANT de borner → crash "sans borne"', () => {
		const { error } = runProgram(L, ['measure', 'set-term']);
		assert.match(error, /sans borne/);
	});
	test('atoi sur "Hi" ne donne pas la longueur → échoue', () => {
		const { mem } = runProgram(L, ['set-term', 'atoi-bad']);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('conv-1 — Conversion (atoi)', () => {
	const L = byId['conv-1'];
	test('n = atoi("42") = 42', () => assert.ok(solved(L, ['atoi'])));
	test('strlen donne la longueur (2), pas la valeur → échoue', () => {
		const { mem } = runProgram(L, ['len']);
		assert.equal(mem.getVar('n'), 2);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('conv-2 — Conversion (putnbr_base)', () => {
	const L = byId['conv-2'];
	test('putnbr_base(42, hex) → "2a"', () => {
		const { mem } = runProgram(L, ['hex']);
		assert.equal(mem.output, '2a');
		assert.ok(solved(L, ['hex']));
	});
	test('base binaire → "101010", pas "2a" → échoue', () => {
		const { mem } = runProgram(L, ['bin']);
		assert.equal(mem.output, '101010');
		assert.equal(goalMet(L, mem), false);
	});
});

describe('l-1 — Listes (nœuds ->next, piège de libération)', () => {
	const L = byId['l-1'];
	test('créer, chaîner, libérer tête puis queue → propre', () => {
		assert.ok(solved(L, ['mk-n1', 'mk-n2', 'link', 'free-n1', 'free-n2']));
	});
	test('libérer la queue encore chaînée → crash "encore chaîné"', () => {
		const { error } = runProgram(L, ['mk-n1', 'mk-n2', 'link', 'free-n2']);
		assert.match(error, /chaîné/);
	});
	test('oublier un free → fuite, cible non atteinte', () => {
		const { mem } = runProgram(L, ['mk-n1', 'mk-n2', 'link', 'free-n1']);
		assert.ok(mem.leaks().length > 0);
		assert.equal(goalMet(L, mem), false);
	});
});
