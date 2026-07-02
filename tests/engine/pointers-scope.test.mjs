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
