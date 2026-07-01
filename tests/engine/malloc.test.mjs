import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';
import * as ast from '../../src/engine/ast.js';

const heap = () => new Memory([]);

describe('malloc dimensionné (B8)', () => {
	test('allocate(size) réserve size casiers contigus', () => {
		const m = heap();
		const base = m.allocate(3);
		m.writeAddr(base, 1);
		m.writeAddr(base + 8, 3);
		assert.equal(m.readAddr(base), 1);
		assert.equal(m.readAddr(base + 8), 3);
	});
	test('taille par défaut = 1', () => {
		const m = heap();
		m.allocate();
		assert.equal(m.leaks().length, 1);
	});
	test('taille invalide (0, négatif, non entier) → erreur', () => {
		assert.throws(() => heap().allocate(0), /taille de malloc invalide/);
		assert.throws(() => heap().allocate(-2), /taille de malloc invalide/);
		assert.throws(() => heap().allocate(1.5), /taille de malloc invalide/);
	});
	test('dépassement de capacité → NULL (0)', () => {
		assert.equal(heap().allocate(5000), 0);
	});
	test('free libère le bloc entier', () => {
		const m = heap();
		const base = m.allocate(3);
		m.free(base);
		assert.deepEqual(m.leaks(), []);
		assert.throws(() => m.writeAddr(base + 4, 9), /déjà libéré/);
	});
	test('double free → erreur', () => {
		const m = heap();
		const base = m.allocate(2);
		m.free(base);
		assert.throws(() => m.free(base), /free invalide/);
	});
	test('la capacité est restituée après free', () => {
		const m = heap();
		const big = m.allocate(4096);
		assert.notEqual(big, 0);
		m.free(big);
		assert.notEqual(m.allocate(4096), 0);
	});
});

describe('strcpy avec sentinelle (B8)', () => {
	function src() {
		return new Memory([
			{ name: 'c0', value: 'H' }, { name: 'c1', value: 'i' }, { name: 'c2', value: 0 }
		]);
	}
	test('copie la chaîne, terminateur inclus', () => {
		const m = src();
		const dst = m.allocate(3);
		m.strcpy(dst, m.addrOf('c0'));
		assert.equal(m.readAddr(dst), 'H');
		assert.equal(m.readAddr(dst + 4), 'i');
		assert.equal(m.readAddr(dst + 8), 0);
	});
	test('bloc trop petit (oubli du +1) → adresse invalide', () => {
		const m = src();
		const dst = m.allocate(2);
		assert.throws(() => m.strcpy(dst, m.addrOf('c0')), /adresse invalide/);
	});
	test('strcpy avec NULL → déréférencement de NULL', () => {
		const m = src();
		assert.throws(() => m.strcpy(0, m.addrOf('c0')), /déréférencement de NULL/);
		assert.throws(() => m.strcpy(m.allocate(3), 0), /déréférencement de NULL/);
	});
});

describe('ft_strdup via l\'interpréteur', () => {
	function base() {
		return new Memory([
			{ name: 'c0', value: 'H' }, { name: 'c1', value: 'i' }, { name: 'c2', value: 0 },
			{ name: 'len', value: 0 }, { name: 'p', value: 0, kind: 'ptr' }
		]);
	}
	const sizePlus1 = ast.bin('+', ast.variable('len'), ast.lit(1));

	test('strlen → malloc(len+1) → strcpy : chaîne dupliquée', () => {
		const m = base();
		const i = new Interpreter(m, [
			{ ast: ast.assign(ast.variable('len'), ast.strlen(ast.addr('c0'))) },
			{ ast: ast.assign(ast.variable('p'), ast.malloc(sizePlus1)) },
			{ ast: ast.strcpy(ast.variable('p'), ast.addr('c0')) }
		]);
		i.run();
		assert.equal(i.error, null);
		const p = m.getVar('p');
		assert.equal(m.readAddr(p), 'H');
		assert.equal(m.readAddr(p + 8), 0);
	});

	test('oubli du +1 (malloc(len)) → échec pédagogique', () => {
		const m = base();
		const i = new Interpreter(m, [
			{ ast: ast.assign(ast.variable('len'), ast.strlen(ast.addr('c0'))) },
			{ ast: ast.assign(ast.variable('p'), ast.malloc(ast.variable('len'))) },
			{ ast: ast.strcpy(ast.variable('p'), ast.addr('c0')) }
		]);
		i.run();
		assert.match(i.error, /adresse invalide/);
	});

	test('NULL non testé (malloc échoue) → échec pédagogique', () => {
		const m = base();
		const i = new Interpreter(m, [
			{ ast: ast.assign(ast.variable('p'), ast.malloc(ast.lit(5000))) },
			{ ast: ast.strcpy(ast.variable('p'), ast.addr('c0')) }
		]);
		i.run();
		assert.match(i.error, /déréférencement de NULL/);
	});
});
