// Le modèle octet (E6-7, cours M1/M2) : little-endian + complément à deux.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { bytesOf, toHex, explain } from '../../src/game/bytes.js';
import { byId, runProgram, goalMet } from '../helpers.mjs';

describe('bytesOf — décomposition little-endian', () => {
	test('1000 → e8 03 00 00 (0x000003E8, rangé à l\'envers)', () => {
		assert.deepEqual(bytesOf(1000), [232, 3, 0, 0]);
		assert.equal(toHex(bytesOf(1000)), 'e8 03 00 00');
	});
	test('513 (short) → 01 02', () => {
		assert.deepEqual(bytesOf(513, 2), [1, 2]);
	});
	test('un octet simple : 65 → 41 00 00 00', () => {
		assert.equal(toHex(bytesOf(65)), '41 00 00 00');
	});
	test('un char passe par son code ASCII', () => {
		assert.deepEqual(bytesOf('A', 1), [65]);
	});
});

describe('complément à deux (M2)', () => {
	test('-1 → ff ff ff ff', () => {
		assert.equal(toHex(bytesOf(-1)), 'ff ff ff ff');
	});
	test('INT_MIN → 00 00 00 80 (le piège de ft_putnbr)', () => {
		assert.equal(toHex(bytesOf(-2147483648)), '00 00 00 80');
	});
});

describe('explain — représentation « comme le cours »', () => {
	test('valeur, hexa compact, octets', () => {
		const e = explain(1000);
		assert.equal(e.compact, '0x000003E8');
		assert.equal(e.hex, 'e8 03 00 00');
		assert.deepEqual(e.bytes, [232, 3, 0, 0]);
	});
});

describe('mem-1 — l\'explorateur d\'octets (jouable)', () => {
	const L = byId['mem-1'];
	test('b0 = n%256 (232), b1 = (n/256)%256 (3) → little-endian', () => {
		assert.ok(goalMet(L, runProgram(L, ['lo', 'hi']).mem));
	});
	test('b0 = n/256 (big-endian, à l\'envers) → b0 = 3, échoue', () => {
		const { mem } = runProgram(L, ['lo-bad', 'hi']);
		assert.equal(mem.getVar('b0'), 3);
		assert.equal(goalMet(L, mem), false);
	});
});
