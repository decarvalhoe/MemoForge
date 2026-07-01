import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';
import * as ast from '../../src/engine/ast.js';

function str(chars) {
	return new Memory(chars.map((value, i) => ({ name: 'c' + i, value })));
}
function atoi(chars) {
	const m = str(chars);
	return m.atoi(m.addrOf('c0'));
}
const evalExpr = (e) => new Interpreter(new Memory([]), []).evalExpr(e);

describe('atoi (B3/B5) — texte → nombre', () => {
	test('"42" → 42', () => assert.equal(atoi(['4', '2', 0]), 42));
	test('espaces + signe "  -42" → -42', () => assert.equal(atoi([' ', ' ', '-', '4', '2', 0]), -42));
	test('"+7" → 7', () => assert.equal(atoi(['+', '7', 0]), 7));
	test('tabulation ignorée "\\t5" → 5', () => assert.equal(atoi(['\t', '5', 0]), 5));
	test('"123abc" → 123 (stop au 1er non-chiffre)', () => assert.equal(atoi(['1', '2', '3', 'a', 'b', 'c', 0]), 123));
	test('INT_MIN "-2147483648" accepté', () => {
		assert.equal(atoi(['-', '2', '1', '4', '7', '4', '8', '3', '6', '4', '8', 0]), -2147483648);
	});
	test('débordement positif → erreur', () => {
		assert.throws(() => atoi(['2', '1', '4', '7', '4', '8', '3', '6', '4', '8', 0]), /débordement/);
	});
	test('débordement négatif → erreur', () => {
		assert.throws(() => atoi(['-', '2', '1', '4', '7', '4', '8', '3', '6', '4', '9', 0]), /débordement/);
	});
	test('atoi(NULL) → déréférencement de NULL', () => {
		assert.throws(() => str(['4', 0]).atoi(0), /déréférencement de NULL/);
	});
	test('via l\'interpréteur : res = atoi(&c0)', () => {
		const m = new Memory([
			{ name: 'c0', value: '9' }, { name: 'c1', value: '1' }, { name: 'c2', value: 0 },
			{ name: 'res', value: 0 }
		]);
		new Interpreter(m, [{ ast: ast.assign(ast.variable('res'), ast.atoi(ast.addr('c0'))) }]).run();
		assert.equal(m.getVar('res'), 91);
	});
});

describe('putnbr_base (B3/B4) — nombre → texte', () => {
	function emit(n, base) {
		const m = new Memory([]);
		m.putnbrBase(n, base);
		return m.output;
	}
	test('42 en base 10 → "42"', () => assert.equal(emit(42, '0123456789'), '42'));
	test('négatif -42 → "-42"', () => assert.equal(emit(-42, '0123456789'), '-42'));
	test('zéro → "0"', () => assert.equal(emit(0, '0123456789'), '0'));
	test('255 en hexa → "FF"', () => assert.equal(emit(255, '0123456789ABCDEF'), 'FF'));
	test('INT_MIN en base 10', () => assert.equal(emit(-2147483648, '0123456789'), '-2147483648'));
	test('base < 2 symboles → erreur', () => {
		assert.throws(() => emit(5, '0'), /base invalide/);
	});
	test('via l\'interpréteur : op putnbr_base émet', () => {
		const m = new Memory([{ name: 'n', value: 26 }]);
		new Interpreter(m, [{ ast: ast.putnbrBase(ast.variable('n'), ast.lit('0123456789ABCDEF')) }]).run();
		assert.equal(m.output, '1A');
	});
});

describe('arithmétique entière (B4/B5)', () => {
	test('7 / 2 → 3 (troncature)', () => assert.equal(evalExpr(ast.bin('/', ast.lit(7), ast.lit(2))), 3));
	test('-7 / 2 → -3 (vers zéro)', () => assert.equal(evalExpr(ast.bin('/', ast.lit(-7), ast.lit(2))), -3));
	test('7 % 2 → 1', () => assert.equal(evalExpr(ast.bin('%', ast.lit(7), ast.lit(2))), 1));
	test('-7 % 2 → -1 (style C)', () => assert.equal(evalExpr(ast.bin('%', ast.lit(-7), ast.lit(2))), -1));
	test('+ - * de base', () => {
		assert.equal(evalExpr(ast.bin('+', ast.lit(3), ast.lit(4))), 7);
		assert.equal(evalExpr(ast.bin('-', ast.lit(5), ast.lit(2))), 3);
		assert.equal(evalExpr(ast.bin('*', ast.lit(3), ast.lit(4))), 12);
	});
	test('accumulateur B5 : (4 * 10) + 2 → 42', () => {
		assert.equal(evalExpr(ast.bin('+', ast.bin('*', ast.lit(4), ast.lit(10)), ast.lit(2))), 42);
	});
	test('division par zéro → erreur', () => {
		assert.throws(() => evalExpr(ast.bin('/', ast.lit(1), ast.lit(0))), /division par zéro/);
		assert.throws(() => evalExpr(ast.bin('%', ast.lit(1), ast.lit(0))), /division par zéro/);
	});
	test('opérateur inconnu → erreur', () => {
		assert.throws(() => evalExpr(ast.bin('^', ast.lit(1), ast.lit(2))), /opérateur inconnu/);
	});
});
