import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';
import * as ast from '../../src/engine/ast.js';

const V = ast.variable;
const L = ast.lit;

// Opérations arithmétiques comme valeurs-fonction (do-op).
const OPS = {
	add: ast.func('add', ['a', 'b'], [ast.ret(ast.bin('+', V('a'), V('b')))]),
	sub: ast.func('sub', ['a', 'b'], [ast.ret(ast.bin('-', V('a'), V('b')))])
};

describe('Valeurs-fonction (B11 · apply / funcRef)', () => {
	test('application directe : apply(funcRef(add), 3, 4) = 7', () => {
		const m = new Memory([{ name: 'r', value: 0 }]);
		const i = new Interpreter(m, [
			{ ast: ast.apply(V('r'), ast.funcRef('add'), [L(3), L(4)]) }
		], OPS);
		i.run();
		assert.equal(m.getVar('r'), 7);
	});

	test('valeur-fonction stockée dans une variable puis appliquée', () => {
		const m = new Memory([{ name: 'f', value: 0 }, { name: 'r', value: 0 }]);
		const i = new Interpreter(m, [
			{ ast: ast.assign(V('f'), ast.funcRef('sub')) },
			{ ast: ast.apply(V('r'), V('f'), [L(10), L(3)]) }
		], OPS);
		i.run();
		assert.equal(m.getVar('r'), 7);
	});

	test('do-op : passer f à travers une fonction puis l\'appliquer', () => {
		// do_op(f, a, b) = f(a, b) — f est un paramètre valeur-fonction.
		const funcs = {
			...OPS,
			do_op: ast.func('do_op', ['f', 'a', 'b'], [
				ast.apply(V('res'), V('f'), [V('a'), V('b')]),
				ast.ret(V('res'))
			])
		};
		const runOp = (fname, a, b) => {
			const m = new Memory([{ name: 'r', value: 0 }]);
			new Interpreter(m, [
				{ ast: ast.call(V('r'), 'do_op', [ast.funcRef(fname), L(a), L(b)]) }
			], funcs).run();
			return m.getVar('r');
		};
		assert.equal(runOp('add', 2, 3), 5);
		assert.equal(runOp('sub', 9, 4), 5);
	});
});

describe('ft_foreach (B11 · appliquer f sur chaque élément)', () => {
	// emit(x) : effet de bord observable (écrit x en base 10 sur la sortie).
	// foreach(f, base, n) : applique f à chaque case tab[i].
	const funcs = {
		emit: ast.func('emit', ['x'], [
			ast.putnbrBase(V('x'), L('0123456789'))
		]),
		foreach: ast.func('foreach', ['f', 'base', 'n'], [
			ast.loop(V('n'), [
				ast.apply(V('_'), V('f'), [ast.load(V('base'), ast.iter())])
			])
		])
	};

	test('applique f aux 3 éléments dans l\'ordre → sortie "123"', () => {
		const m = new Memory([
			{ name: 'a0', value: 1 }, { name: 'a1', value: 2 }, { name: 'a2', value: 3 },
			{ name: 'done', value: 0 }
		]);
		const i = new Interpreter(m, [
			{ ast: ast.call(V('done'), 'foreach', [ast.funcRef('emit'), ast.addr('a0'), L(3)]) }
		], funcs);
		i.run();
		assert.equal(i.error, null);
		assert.equal(m.output, '123');
	});

	test('length 0 → f jamais appliquée, sortie vide', () => {
		const m = new Memory([{ name: 'a0', value: 9 }, { name: 'done', value: 0 }]);
		new Interpreter(m, [
			{ ast: ast.call(V('done'), 'foreach', [ast.funcRef('emit'), ast.addr('a0'), L(0)]) }
		], funcs).run();
		assert.equal(m.output, '');
	});
});

describe('Robustesse', () => {
	test('appliquer une valeur non-fonction → erreur', () => {
		const m = new Memory([{ name: 'r', value: 0 }]);
		const i = new Interpreter(m, [
			{ ast: ast.apply(V('r'), L(5), [L(1)]) }
		], OPS);
		i.run();
		assert.match(i.error, /fonction inconnue/);
	});
});
