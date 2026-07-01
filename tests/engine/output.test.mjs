// Tests du flux de sortie — brique B1 (write). Auto-porté : n'importe que le moteur.
// Fichier distinct de memory.test.mjs / interpreter.test.mjs (anti-collision). node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';

const lit = (v) => ({ t: 'lit', v });
const variable = (name) => ({ t: 'var', name });
const addr = (name) => ({ t: 'addr', name });
const deref = (name) => ({ t: 'deref', name });
const I = (ast) => ({ ast });                    // enveloppe d'instruction (comme levels.js)
const write = (arg) => I({ op: 'write', arg });
const assign = (lhs, rhs) => I({ lhs, rhs });

function run(vars, program) {
	const mem = new Memory(vars);
	const interp = new Interpreter(mem, program);
	interp.run();
	return { mem, interp };
}

describe('write — flux de sortie (B1)', () => {
	test("ft_putchar : write('H') émet \"H\"", () => {
		const { mem } = run([], [write(lit('H'))]);
		assert.equal(mem.outputString(), 'H');
	});

	test("ft_putstr \"Hi\" : deux writes préservent l'ordre", () => {
		const { mem } = run([], [write(lit('H')), write(lit('i'))]);
		assert.deepEqual(mem.stdout, ['H', 'i']);
		assert.equal(mem.outputString(), 'Hi');
	});

	test("write d'une variable émet sa valeur", () => {
		const { mem } = run([{ name: 'c', value: 'A', kind: 'int' }], [write(variable('c'))]);
		assert.equal(mem.outputString(), 'A');
	});

	test('un nombre est un code ASCII : write(72) -> "H"', () => {
		const { mem } = run([], [write(lit(72))]);
		assert.equal(mem.outputString(), 'H');
	});

	test("write via *p (déréférencement) émet l'octet pointé", () => {
		const vars = [{ name: 'c', value: 'Z', kind: 'int' }, { name: 'p', value: 0, kind: 'ptr' }];
		const { mem } = run(vars, [assign(variable('p'), addr('c')), write(deref('p'))]);
		assert.equal(mem.outputString(), 'Z');
	});

	test('write via *p sur NULL plante (déréférencement de NULL)', () => {
		const { interp } = run([{ name: 'p', value: 0, kind: 'ptr' }], [write(deref('p'))]);
		assert.match(interp.error, /NULL/);
	});

	test("non-régression : write cohabite avec l'assignation", () => {
		const { mem } = run([{ name: 'n', value: 0, kind: 'int' }], [
			assign(variable('n'), lit(42)),
			write(variable('n'))
		]);
		assert.equal(mem.getVar('n'), 42);
		assert.equal(mem.outputString(), String.fromCharCode(42)); // 42 -> '*'
	});
});
