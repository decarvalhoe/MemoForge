import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';
import * as ast from '../../src/engine/ast.js';

function run(vars, program) {
	const m = new Memory(vars);
	new Interpreter(m, program).run();
	return m;
}

describe('AST constructeurs (ast.js)', () => {
	test('assign/lit/var : n = 42', () => {
		const m = run([{ name: 'n', value: 0 }], [
			{ ast: ast.assign(ast.variable('n'), ast.lit(42)) }
		]);
		assert.equal(m.getVar('n'), 42);
	});
	test('addr/deref : p = &n puis *p = 7', () => {
		const m = run([{ name: 'n', value: 0 }, { name: 'p', kind: 'ptr' }], [
			{ ast: ast.assign(ast.variable('p'), ast.addr('n')) },
			{ ast: ast.assign(ast.deref('p'), ast.lit(7)) }
		]);
		assert.equal(m.getVar('n'), 7);
	});
	test('malloc/free : réserve puis libère → zéro fuite', () => {
		const m = run([{ name: 'p', kind: 'ptr' }], [
			{ ast: ast.assign(ast.variable('p'), ast.malloc()) },
			{ ast: ast.free('p') }
		]);
		assert.deepEqual(m.leaks(), []);
	});
	test('write : émet la chaîne dans l\'ordre', () => {
		const m = run([{ name: 'a', value: 'H' }, { name: 'b', value: 'i' }], [
			{ ast: ast.write(1, ast.addr('a'), ast.lit(2)) }
		]);
		assert.equal(m.output, 'Hi');
	});
	test('strlen : longueur jusqu\'au terminateur', () => {
		const m = run(
			[{ name: 'c0', value: 'H' }, { name: 'c1', value: 'i' }, { name: 'c2', value: 0 }, { name: 'len', value: 0 }],
			[{ ast: ast.assign(ast.variable('len'), ast.strlen(ast.addr('c0'))) }]
		);
		assert.equal(m.getVar('len'), 2);
	});
});
