import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';
import * as ast from '../../src/engine/ast.js';

function run(vars, program) {
	const m = new Memory(vars);
	const i = new Interpreter(m, program);
	i.run();
	return { m, i };
}
const V = ast.variable;
const L = ast.lit;

describe('Boucle bornée (B7 loop)', () => {
	test('exécute le corps count fois', () => {
		const { m } = run([{ name: 'c', value: 0 }], [
			{ ast: ast.loop(L(3), [ast.assign(V('c'), ast.bin('+', V('c'), L(1)))]) }
		]);
		assert.equal(m.getVar('c'), 3);
	});
	test('iter expose l\'indice courant (0..n-1)', () => {
		const { m } = run([{ name: 's', value: 0 }], [
			{ ast: ast.loop(L(4), [ast.assign(V('s'), ast.bin('+', V('s'), ast.iter()))]) }
		]);
		assert.equal(m.getVar('s'), 0 + 1 + 2 + 3);
	});
	test('count <= 0 → corps ignoré', () => {
		const { m } = run([{ name: 'c', value: 7 }], [
			{ ast: ast.loop(L(0), [ast.assign(V('c'), L(99))]) }
		]);
		assert.equal(m.getVar('c'), 7);
	});
	test('ft_strncpy borné : copie indexée via load/store', () => {
		const { m } = run([
			{ name: 's0', value: 'H' }, { name: 's1', value: 'i' }, { name: 's2', value: '!' },
			{ name: 'd0', value: 0 }, { name: 'd1', value: 0 }, { name: 'd2', value: 0 }
		], [
			{ ast: ast.loop(L(3), [
				ast.assign(ast.store(ast.addr('d0'), ast.iter()), ast.load(ast.addr('s0'), ast.iter()))
			]) }
		]);
		assert.equal(m.getVar('d0'), 'H');
		assert.equal(m.getVar('d1'), 'i');
		assert.equal(m.getVar('d2'), '!');
	});
	test('boucles imbriquées', () => {
		const { m } = run([{ name: 'c', value: 0 }], [
			{ ast: ast.loop(L(2), [
				ast.loop(L(3), [ast.assign(V('c'), ast.bin('+', V('c'), L(1)))])
			]) }
		]);
		assert.equal(m.getVar('c'), 6);
	});
});

describe('Boucle gardée (B7 while) + garde anti-boucle-infinie', () => {
	test('while(i < n) incrémente jusqu\'à la borne', () => {
		const { m } = run([{ name: 'i', value: 0 }], [
			{ ast: ast.whileLoop(ast.bin('<', V('i'), L(3)), [ast.assign(V('i'), ast.bin('+', V('i'), L(1)))]) }
		]);
		assert.equal(m.getVar('i'), 3);
	});
	test('garde fausse d\'emblée → corps jamais exécuté', () => {
		const { m } = run([{ name: 'x', value: 1 }], [
			{ ast: ast.whileLoop(ast.bin('>', L(0), L(5)), [ast.assign(V('x'), L(99))]) }
		]);
		assert.equal(m.getVar('x'), 1);
	});
	test('boucle infinie → garde de pas → erreur', () => {
		const { i } = run([{ name: 'x', value: 0 }], [
			{ ast: ast.whileLoop(L(1), [ast.assign(V('x'), L(1))]) }
		]);
		assert.match(i.error, /boucle infinie/);
	});
});

describe('Comparaisons (evalBin)', () => {
	const ev = (op, a, b) => new Interpreter(new Memory([]), []).evalExpr(ast.bin(op, L(a), L(b)));
	test('< <= > >= == !=', () => {
		assert.equal(ev('<', 1, 2), 1);
		assert.equal(ev('<=', 2, 2), 1);
		assert.equal(ev('>', 1, 2), 0);
		assert.equal(ev('>=', 2, 1), 1);
		assert.equal(ev('==', 2, 2), 1);
		assert.equal(ev('!=', 2, 3), 1);
	});
});

describe('Contrat step() / frames()', () => {
	test('programme à plat : une seule frame, index compat', () => {
		const m = new Memory([{ name: 'n', value: 0 }]);
		const i = new Interpreter(m, [
			{ ast: ast.assign(V('n'), L(1)) },
			{ ast: ast.assign(V('n'), L(2)) }
		]);
		const r0 = i.step();
		assert.deepEqual({ f: r0.frameIndex, x: r0.instrIndex, idx: r0.index }, { f: 0, x: 0, idx: 0 });
		assert.deepEqual(i.frames(), [{ label: 'main', vars: m.snapshot() }]);
		const r1 = i.step();
		assert.equal(r1.instrIndex, 1);
	});
	test('en boucle : frames()[0].loop = { i, n }', () => {
		const m = new Memory([{ name: 'c', value: 0 }]);
		const i = new Interpreter(m, [
			{ ast: ast.loop(L(2), [ast.assign(V('c'), ast.bin('+', V('c'), L(1)))]) }
		]);
		i.step(); // entre dans la boucle
		i.step(); // exécute le corps (iter 0)
		const fr = i.frames();
		assert.equal(fr[0].loop.n, 2);
		assert.ok(fr[0].loop.i >= 0);
	});
	test('iter hors boucle → erreur', () => {
		assert.throws(() => new Interpreter(new Memory([]), []).evalExpr(ast.iter()), /hors d'une boucle/);
	});
});
