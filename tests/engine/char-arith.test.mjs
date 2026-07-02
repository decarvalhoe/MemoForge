// Arithmétique de caractères (E6-10) : en C, un char EST son code ASCII. C'est le pattern
// central de la moitié de la libft (atoi, itoa, toupper/tolower, str_is_*, ft_putnbr…).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter, codeOf } from '../../src/engine/interpreter.js';
import * as ast from '../../src/engine/ast.js';

const V = ast.variable;
const L = ast.lit;
const ev = (expr) => new Interpreter(new Memory([]), []).evalExpr(expr);

describe('codeOf — chars ramenés à leur code, nombres inchangés', () => {
	test('char 1 caractère → code ASCII', () => {
		assert.equal(codeOf('0'), 48);
		assert.equal(codeOf('A'), 65);
		assert.equal(codeOf('\0'), 0);
	});
	test('nombres et non-mono-char inchangés', () => {
		assert.equal(codeOf(7), 7);
		assert.equal(codeOf(-2), -2);
		assert.equal(codeOf('abc'), 'abc');
	});
});

describe('evalBin — sémantique C sur les chars', () => {
	test("c - '0' donne le chiffre (cœur d'atoi)", () => {
		assert.equal(ev(ast.bin('-', L('7'), L('0'))), 7);
		assert.equal(ev(ast.bin('-', L('9'), L('0'))), 9);
	});
	test("chiffre + '0' redonne le char chiffre (cœur d'itoa/putnbr)", () => {
		assert.equal(ev(ast.bin('+', L(5), L('0'))), 53); // '5'
	});
	test("minuscule - 32 = majuscule (toupper)", () => {
		assert.equal(ev(ast.bin('-', L('a'), L(32))), 65); // 'A'
		assert.equal(ev(ast.bin('+', L('A'), L(32))), 97); // 'a' (tolower)
	});
	test("comparaisons de plage (str_is_alpha / isdigit)", () => {
		assert.equal(ev(ast.bin('<=', L('a'), L('z'))), 1);
		assert.equal(ev(ast.bin('>=', L('5'), L('0'))), 1);
		assert.equal(ev(ast.bin('<=', L('5'), L('9'))), 1);
		assert.equal(ev(ast.bin('>', L('Z'), L('a'))), 0); // 90 > 97 faux
	});
	test("char == nombre (code) et char != char", () => {
		assert.equal(ev(ast.bin('==', L('A'), L(65))), 1);
		assert.equal(ev(ast.bin('!=', L('a'), L('b'))), 1);
	});
	test("division par un char '\\0' (code 0) → division par zéro", () => {
		assert.throws(() => ev(ast.bin('/', L(10), L('\0'))), /division par zéro/);
	});
});

describe('bout-en-bout : ft_atoi à la main sur « 42 »', () => {
	// n = 0 ; boucle sur les chiffres : n = n*10 + (c - '0'). Ici déroulé sur c0='4', c1='2'.
	test('reconstruit 42 à partir des chars', () => {
		const m = new Memory([
			{ name: 'n', value: 0, kind: 'int' },
			{ name: 'c0', value: '4', kind: 'char' },
			{ name: 'c1', value: '2', kind: 'char' }
		]);
		const prog = [
			{ ast: ast.assign(V('n'), ast.bin('+', ast.bin('*', V('n'), L(10)), ast.bin('-', V('c0'), L('0')))) },
			{ ast: ast.assign(V('n'), ast.bin('+', ast.bin('*', V('n'), L(10)), ast.bin('-', V('c1'), L('0')))) }
		];
		const i = new Interpreter(m, prog);
		i.run();
		assert.equal(i.error, null);
		assert.equal(m.getVar('n'), 42);
	});
});
