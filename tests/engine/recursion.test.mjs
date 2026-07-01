import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';
import * as ast from '../../src/engine/ast.js';

const V = ast.variable;
const L = ast.lit;

// ft_recursive_factorial(n) = n <= 1 ? 1 : n * fact(n - 1)
// Forme moteur : appel top-level (place `t`) puis combinaison `n * t`, pour que la
// pile grandisse pas-à-pas et reste visualisable (contrat callStackView / #79).
const FACT = {
	fact: ast.func('fact', ['n'], [
		ast.ifThen(ast.bin('<=', V('n'), L(1)), [ast.ret(L(1))]),
		ast.call(V('t'), 'fact', [ast.bin('-', V('n'), L(1))]),
		ast.ret(ast.bin('*', V('n'), V('t')))
	])
};

function runFact(nInit) {
	const m = new Memory([{ name: 'r', value: 0 }]);
	const i = new Interpreter(m, [{ ast: ast.call(V('r'), 'fact', [L(nInit)]) }], FACT);
	let maxDepth = 1;
	while (!i.done) {
		i.step();
		maxDepth = Math.max(maxDepth, i.frames().length);
	}
	return { m, i, maxDepth };
}

describe('if (branche simple, cas de base)', () => {
	test('garde vraie → corps exécuté une fois', () => {
		const m = new Memory([{ name: 'x', value: 0 }]);
		const i = new Interpreter(m, [
			{ ast: ast.ifThen(ast.bin('==', V('x'), L(0)), [ast.assign(V('x'), L(42))]) }
		]);
		i.run();
		assert.equal(m.getVar('x'), 42);
	});
	test('garde fausse → corps sauté', () => {
		const m = new Memory([{ name: 'x', value: 7 }]);
		const i = new Interpreter(m, [
			{ ast: ast.ifThen(ast.bin('>', L(0), L(5)), [ast.assign(V('x'), L(99))]) }
		]);
		i.run();
		assert.equal(m.getVar('x'), 7);
	});
});

describe('Récursion (B9 · ft_recursive_factorial)', () => {
	test('cas de base : fact(0) = fact(1) = 1', () => {
		assert.equal(runFact(0).m.getVar('r'), 1);
		assert.equal(runFact(1).m.getVar('r'), 1);
	});
	test('récursion linéaire : fact(3) = 6, fact(5) = 120', () => {
		assert.equal(runFact(3).m.getVar('r'), 6);
		assert.equal(runFact(5).m.getVar('r'), 120);
	});
	test('la pile grandit jusqu\'à profondeur n+1 (main + n frames)', () => {
		assert.equal(runFact(4).maxDepth, 5);
	});
	test('après complétion, la pile est entièrement redescendue', () => {
		const { i } = runFact(3);
		assert.equal(i.error, null);
		assert.equal(i.frames().length, 0);
	});
});

describe('Frames : portée locale par appel', () => {
	// À mi-course (au plus profond), chaque frame porte SON propre n : 3, 2, 1.
	test('chaque frame expose son n distinct', () => {
		const m = new Memory([{ name: 'r', value: 0 }]);
		const i = new Interpreter(m, [{ ast: ast.call(V('r'), 'fact', [L(3)]) }], FACT);
		let deepest = [];
		while (!i.done) {
			i.step();
			const fr = i.frames();
			if (fr.length > deepest.length)
				deepest = fr;
		}
		// deepest = [main, fact(3), fact(2), fact(1)]
		assert.equal(deepest.length, 4);
		assert.equal(deepest[1].label, 'fact(3)');
		const nOf = (f) => f.vars.find((v) => v.name === 'n').value;
		assert.deepEqual([nOf(deepest[1]), nOf(deepest[2]), nOf(deepest[3])], [3, 2, 1]);
	});
	test('une fonction peut lire une globale (repli de portée)', () => {
		const m = new Memory([{ name: 'g', value: 10 }, { name: 'r', value: 0 }]);
		const funcs = { addG: ast.func('addG', ['x'], [ast.ret(ast.bin('+', V('x'), V('g')))]) };
		const i = new Interpreter(m, [{ ast: ast.call(V('r'), 'addG', [L(5)]) }], funcs);
		i.run();
		assert.equal(m.getVar('r'), 15);
	});
});

describe('Débordement de pile borné (récursion sans cas de base)', () => {
	test('erreur « débordement de pile », sans pendre', () => {
		const funcs = {
			boom: ast.func('boom', ['n'], [
				ast.call(V('t'), 'boom', [ast.bin('+', V('n'), L(1))]),
				ast.ret(V('t'))
			])
		};
		const m = new Memory([{ name: 'r', value: 0 }]);
		const i = new Interpreter(m, [{ ast: ast.call(V('r'), 'boom', [L(0)]) }], funcs);
		i.run();
		assert.match(i.error, /débordement de pile/);
	});
	test('appel d\'une fonction inconnue → erreur', () => {
		const m = new Memory([{ name: 'r', value: 0 }]);
		const i = new Interpreter(m, [{ ast: ast.call(V('r'), 'nope', []) }], {});
		i.run();
		assert.match(i.error, /fonction inconnue/);
	});
});
