import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';

function str(chars) {
	return new Memory(chars.map((value, i) => ({ name: 'c' + i, value })));
}

describe('Chaînes & sentinelle (B2)', () => {
	test("strlen s'arrête sur '\\0' (terminateur 0)", () => {
		const m = str(['H', 'i', 0]);
		assert.equal(m.strlen(m.addrOf('c0')), 2);
	});
	test("terminateur '\\0' littéral accepté", () => {
		const m = str(['H', 'i', '\0']);
		assert.equal(m.strlen(m.addrOf('c0')), 2);
	});
	test('chaîne vide → longueur 0', () => {
		const m = str([0]);
		assert.equal(m.strlen(m.addrOf('c0')), 0);
	});
	test('chaîne sans borne → erreur pédagogique', () => {
		const m = str(['H', 'i']);
		assert.throws(() => m.strlen(m.addrOf('c0')), /chaîne sans borne/);
	});
	test('strlen(NULL) → déréférencement de NULL', () => {
		assert.throws(() => str(['H', 0]).strlen(0), /déréférencement de NULL/);
	});
	test('via l\'interpréteur : len = strlen(&c0)', () => {
		const m = new Memory([
			{ name: 'c0', value: 'H' },
			{ name: 'c1', value: 'i' },
			{ name: 'c2', value: 0 },
			{ name: 'len', value: 0 }
		]);
		const i = new Interpreter(m, [
			{ ast: { lhs: { t: 'var', name: 'len' }, rhs: { t: 'strlen', src: { t: 'addr', name: 'c0' } } } }
		]);
		i.run();
		assert.equal(m.getVar('len'), 2);
	});
});
