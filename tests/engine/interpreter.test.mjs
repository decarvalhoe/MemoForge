import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory, RuntimeError } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';

function fresh() {
	return new Memory([
		{ name: 'n', value: 5, kind: 'int' },
		{ name: 'p', kind: 'ptr' }
	]);
}
const lit = (v) => ({ t: 'lit', v });
const variable = (name) => ({ t: 'var', name });
const addr = (name) => ({ t: 'addr', name });
const deref = (name) => ({ t: 'deref', name });
const run = (m, program) => {
	const i = new Interpreter(m, program);
	i.run();
	return i;
};

describe('Interpreter — evalExpr', () => {
	test('lit renvoie la valeur littérale', () => {
		assert.equal(new Interpreter(fresh(), []).evalExpr(lit(42)), 42);
	});
	test('var lit la valeur de la variable', () => {
		assert.equal(new Interpreter(fresh(), []).evalExpr(variable('n')), 5);
	});
	test('addr renvoie l\'adresse de la variable', () => {
		assert.equal(new Interpreter(fresh(), []).evalExpr(addr('n')), 1000);
	});
	test('deref suit le pointeur jusqu\'à la valeur', () => {
		const m = fresh();
		m.setVar('p', m.addrOf('n'));
		assert.equal(new Interpreter(m, []).evalExpr(deref('p')), 5);
	});
	test('malloc alloue et renvoie l\'adresse du tas', () => {
		const m = fresh();
		assert.equal(new Interpreter(m, []).evalExpr({ t: 'malloc' }), 5000);
	});
	test('expression inconnue → RuntimeError', () => {
		assert.throws(() => new Interpreter(fresh(), []).evalExpr({ t: '???' }), /expression inconnue/);
	});
});

describe('Interpreter — writePlace', () => {
	test('écriture dans une variable', () => {
		const m = fresh();
		new Interpreter(m, []).writePlace(variable('n'), 99);
		assert.equal(m.getVar('n'), 99);
	});
	test('écriture via déréférencement marque la case pointée modifiée', () => {
		const m = fresh();
		m.setVar('p', m.addrOf('n'));
		m.clearChanged();
		new Interpreter(m, []).writePlace(deref('p'), 7);
		assert.equal(m.getVar('n'), 7);
		assert.ok(m.changed.has('n'));
	});
	test('cible non assignable → RuntimeError', () => {
		assert.throws(() => new Interpreter(fresh(), []).writePlace({ t: 'addr', name: 'n' }, 1), RuntimeError);
	});
});

describe('Interpreter — exécution', () => {
	test('programme vide : done d\'emblée', () => {
		assert.equal(new Interpreter(fresh(), []).done, true);
	});
	test('run exécute une affectation simple', () => {
		const m = fresh();
		run(m, [{ ast: { lhs: variable('n'), rhs: lit(42) } }]);
		assert.equal(m.getVar('n'), 42);
	});
	test('instruction free libère le casier pointé', () => {
		const m = fresh();
		const a = m.allocate();
		m.setVar('p', a);
		run(m, [{ ast: { op: 'free', ptr: 'p' } }]);
		assert.deepEqual(m.leaks(), []);
	});
	test('une erreur d\'exécution stoppe et remonte le message', () => {
		const m = fresh();
		const i = run(m, [{ ast: { lhs: deref('p'), rhs: lit(1) } }]);
		assert.equal(i.done, true);
		assert.match(i.error, /déréférencement de NULL/);
	});
	test('step après erreur reste terminé', () => {
		const m = fresh();
		const i = run(m, [{ ast: { lhs: deref('p'), rhs: lit(1) } }]);
		const r = i.step();
		assert.equal(r.done, true);
	});
});
