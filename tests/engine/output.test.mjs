import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';

function chars() {
	return new Memory([
		{ name: 'a', value: 'A' },
		{ name: 'b', value: 'B' },
		{ name: 'c', value: 'C' }
	]);
}
const addr = (name) => ({ t: 'addr', name });
const lit = (v) => ({ t: 'lit', v });
const writeI = (fd, src, count) => ({ ast: { op: 'write', fd, src, count } });
function run(m, program) {
	const i = new Interpreter(m, program);
	i.run();
	return i;
}

describe('Sortie (B1 write)', () => {
	test('émet les octets dans l\'ordre (ft_putstr)', () => {
		const m = chars();
		run(m, [writeI(1, addr('a'), lit(3))]);
		assert.equal(m.output, 'ABC');
	});
	test('ft_putchar : un seul caractère', () => {
		const m = chars();
		run(m, [writeI(1, addr('b'), lit(1))]);
		assert.equal(m.output, 'B');
	});
	test('deux write concaténés préservent l\'ordre', () => {
		const m = chars();
		run(m, [writeI(1, addr('c'), lit(1)), writeI(1, addr('a'), lit(1))]);
		assert.equal(m.output, 'CA');
	});
	test('valeur numérique émise comme octet ASCII', () => {
		const m = new Memory([{ name: 'x', value: 65 }]);
		m.emit(1, m.addrOf('x'), 1);
		assert.equal(m.output, 'A');
	});
	test('write sur NULL → erreur remontée', () => {
		const m = new Memory([{ name: 'p', kind: 'ptr' }]);
		const i = run(m, [writeI(1, { t: 'var', name: 'p' }, lit(1))]);
		assert.match(i.error, /déréférencement de NULL/);
	});
	test('flux autre que fd 1 → erreur', () => {
		assert.throws(() => chars().emit(2, 1000, 1), /flux inconnu/);
	});
});
