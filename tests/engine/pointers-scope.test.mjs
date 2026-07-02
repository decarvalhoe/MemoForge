// Portée locale + déréférencement (E6-2, cours M4) : passer par ADRESSE modifie la variable
// de l'appelant ; passer par COPIE ne touche que la copie locale. C'est LE concept du C01.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';
import * as ast from '../../src/engine/ast.js';

const V = ast.variable;
const L = ast.lit;

describe('par adresse vs par copie (M4)', () => {
	test('ft_ft(&x) : *nbr = 42 écrit dans le x de l\'appelant', () => {
		const m = new Memory([{ name: 'x', value: 0 }, { name: 'done', value: 0 }]);
		const funcs = { ft_ft: ast.func('ft_ft', ['nbr'], [ast.assign(ast.deref('nbr'), L(42))]) };
		const i = new Interpreter(m, [{ ast: ast.call(V('done'), 'ft_ft', [ast.addr('x')]) }], funcs);
		i.run();
		assert.equal(i.error, null);
		assert.equal(m.getVar('x'), 42);
	});

	test('par copie : nbr = 42 ne modifie que la locale, x inchangé', () => {
		const m = new Memory([{ name: 'x', value: 0 }, { name: 'done', value: 0 }]);
		const funcs = { modifie: ast.func('modifie', ['nbr'], [ast.assign(V('nbr'), L(42))]) };
		const i = new Interpreter(m, [{ ast: ast.call(V('done'), 'modifie', [V('x')]) }], funcs);
		i.run();
		assert.equal(m.getVar('x'), 0); // la copie a bougé, pas le vrai x
	});

	test('ft_swap(&a, &b) : échange réel via tmp et deux déréférencements', () => {
		const m = new Memory([{ name: 'a', value: 7 }, { name: 'b', value: 3 }, { name: 'done', value: 0 }]);
		const funcs = {
			ft_swap: ast.func('ft_swap', ['pa', 'pb'], [
				ast.assign(V('tmp'), ast.deref('pa')),
				ast.assign(ast.deref('pa'), ast.deref('pb')),
				ast.assign(ast.deref('pb'), V('tmp'))
			])
		};
		const i = new Interpreter(m, [{ ast: ast.call(V('done'), 'ft_swap', [ast.addr('a'), ast.addr('b')]) }], funcs);
		i.run();
		assert.equal(i.error, null);
		assert.deepEqual([m.getVar('a'), m.getVar('b')], [3, 7]);
	});

	test('ft_div_mod : deux résultats rendus par deux pointeurs', () => {
		const m = new Memory([{ name: 'q', value: 0 }, { name: 'r', value: 0 }, { name: 'done', value: 0 }]);
		const funcs = {
			ft_div_mod: ast.func('ft_div_mod', ['a', 'b', 'div', 'mod'], [
				ast.assign(ast.deref('div'), ast.bin('/', V('a'), V('b'))),
				ast.assign(ast.deref('mod'), ast.bin('%', V('a'), V('b')))
			])
		};
		const call = ast.call(V('done'), 'ft_div_mod', [L(13), L(4), ast.addr('q'), ast.addr('r')]);
		const i = new Interpreter(m, [{ ast: call }], funcs);
		i.run();
		assert.equal(i.error, null);
		assert.deepEqual([m.getVar('q'), m.getVar('r')], [3, 1]);
	});
});

describe('dangling pointer (M6) — la pile meurt au return', () => {
	// bad(): { x = 42 ; return &x }  → renvoie l'adresse d'une locale morte.
	const BAD = { bad: ast.func('bad', [], [ast.assign(V('x'), L(42)), ast.ret(ast.addr('x'))]) };
	// good(): { m = malloc(1) ; *m = 42 ; return m } → le tas survit.
	const GOOD = { good: ast.func('good', [], [ast.assign(V('m'), ast.malloc(L(1))), ast.assign(ast.deref('m'), L(42)), ast.ret(V('m'))]) };

	test('renvoyer &local puis le déréférencer → dangling pointer', () => {
		const m = new Memory([{ name: 'p', value: 0 }, { name: 'y', value: 0 }]);
		const prog = [
			{ ast: ast.call(V('p'), 'bad', []) },
			{ ast: ast.assign(V('y'), ast.deref('p')) }
		];
		const i = new Interpreter(m, prog, BAD);
		i.run();
		assert.match(i.error, /dangling|locale morte/);
	});

	test('écrire à travers un dangling pointer → même mort détectée', () => {
		const m = new Memory([{ name: 'p', value: 0 }]);
		const prog = [
			{ ast: ast.call(V('p'), 'bad', []) },
			{ ast: ast.assign(ast.deref('p'), L(5)) } // *p = 5 sur une locale morte
		];
		const i = new Interpreter(m, prog, BAD);
		i.run();
		assert.match(i.error, /dangling|locale morte/);
	});

	test('renvoyer un bloc du tas survit au return → *p = 42', () => {
		const m = new Memory([{ name: 'p', value: 0 }, { name: 'y', value: 0 }]);
		const prog = [
			{ ast: ast.call(V('p'), 'good', []) },
			{ ast: ast.assign(V('y'), ast.deref('p')) }
		];
		const i = new Interpreter(m, prog, GOOD);
		i.run();
		assert.equal(i.error, null);
		assert.equal(m.getVar('y'), 42);
	});

	test('&local reste vivant PENDANT l\'exécution : px = &x ; *px = 7 ; return x', () => {
		const funcs = { f: ast.func('f', [], [
			ast.assign(V('x'), L(0)),
			ast.assign(V('px'), ast.addr('x')),
			ast.assign(ast.deref('px'), L(7)),
			ast.ret(V('x'))
		]) };
		const m = new Memory([{ name: 'r', value: 0 }]);
		const i = new Interpreter(m, [{ ast: ast.call(V('r'), 'f', []) }], funcs);
		i.run();
		assert.equal(i.error, null);
		assert.equal(m.getVar('r'), 7); // écrire via &x a bien modifié x (sync addrCell)
	});

	test('après &x, écrire x par son nom reste vu par *px (sync bidirectionnel)', () => {
		// px = &x ; x = 9 ; return *px  → *px doit valoir 9.
		const funcs = { g: ast.func('g', [], [
			ast.assign(V('x'), L(0)),
			ast.assign(V('px'), ast.addr('x')),
			ast.assign(V('x'), L(9)),
			ast.ret(ast.deref('px'))
		]) };
		const m = new Memory([{ name: 'r', value: 0 }]);
		const i = new Interpreter(m, [{ ast: ast.call(V('r'), 'g', []) }], funcs);
		i.run();
		assert.equal(i.error, null);
		assert.equal(m.getVar('r'), 9);
	});

	test('&x pris deux fois donne la MÊME adresse ; frames() affiche la locale promue', () => {
		// h(): x = 5 ; px = &x ; py = &x ; return px - py  → 0 (même adresse)
		const funcs = { h: ast.func('h', [], [
			ast.assign(V('x'), L(5)),
			ast.assign(V('px'), ast.addr('x')),
			ast.assign(V('py'), ast.addr('x')),
			ast.ret(ast.bin('-', V('px'), V('py')))
		]) };
		const m = new Memory([{ name: 'r', value: 0 }]);
		const i = new Interpreter(m, [{ ast: ast.call(V('r'), 'h', []) }], funcs);
		let sawPromoted = false;
		while (!i.done) {
			i.step();
			const fr = i.frames();
			const top = fr[fr.length - 1];
			if (top && top.vars.some((v) => v.name === 'x' && v.value === 5))
				sawPromoted = true; // localsVars a lu le casier de pile de x
		}
		assert.equal(i.error, null);
		assert.equal(m.getVar('r'), 0); // px == py
		assert.ok(sawPromoted);
	});
});
