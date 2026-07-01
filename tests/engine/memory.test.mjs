import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory, RuntimeError } from '../../src/engine/memory.js';

function mem() {
	return new Memory([
		{ name: 'n', value: 5, kind: 'int' },
		{ name: 'p', kind: 'ptr' }
	]);
}

describe('Memory — variables & adresses', () => {
	test('addresses are assigned by word (1000, 1004, …)', () => {
		const m = mem();
		assert.equal(m.addrOf('n'), 1000);
		assert.equal(m.addrOf('p'), 1004);
	});
	test('value defaults to 0 when undefined', () => {
		assert.equal(mem().getVar('p'), 0);
	});
	test('addrOf on unknown variable throws RuntimeError', () => {
		assert.throws(() => mem().addrOf('x'), RuntimeError);
		assert.throws(() => mem().addrOf('x'), /variable inconnue : x/);
	});
	test('setVar writes and records the change', () => {
		const m = mem();
		m.setVar('n', 42);
		assert.equal(m.getVar('n'), 42);
		assert.ok(m.changed.has('n'));
	});
	test('clearChanged resets the change set', () => {
		const m = mem();
		m.setVar('n', 1);
		m.clearChanged();
		assert.equal(m.changed.size, 0);
	});
});

describe('Memory — lecture/écriture par adresse', () => {
	test('readAddr(0) → déréférencement de NULL', () => {
		assert.throws(() => mem().readAddr(0), /déréférencement de NULL/);
	});
	test('writeAddr(0) → déréférencement de NULL', () => {
		assert.throws(() => mem().writeAddr(0, 1), /déréférencement de NULL/);
	});
	test('readAddr sur adresse inexistante → adresse invalide', () => {
		assert.throws(() => mem().readAddr(9999), /adresse invalide/);
	});
	test('writeAddr sur adresse inexistante → adresse invalide', () => {
		assert.throws(() => mem().writeAddr(9999, 1), /adresse invalide/);
	});
	test('write puis read sur une adresse valide', () => {
		const m = mem();
		m.writeAddr(1000, 7);
		assert.equal(m.readAddr(1000), 7);
	});
});

describe('Memory — mémoire dynamique', () => {
	test('allocate rend une adresse dans le tas et la marque allouée', () => {
		const m = mem();
		const a = m.allocate();
		assert.equal(a, 5000);
		assert.deepEqual(m.leaks(), [5000]);
	});
	test('free enlève des allouées et marque libéré', () => {
		const m = mem();
		const a = m.allocate();
		m.free(a);
		assert.deepEqual(m.leaks(), []);
	});
	test('lecture/écriture dans un casier libéré → erreur', () => {
		const m = mem();
		const a = m.allocate();
		m.free(a);
		assert.throws(() => m.readAddr(a), /lecture dans un casier déjà libéré/);
		assert.throws(() => m.writeAddr(a, 1), /écriture dans un casier déjà libéré/);
	});
	test('free(0) et free non-alloué → free invalide', () => {
		const m = mem();
		assert.throws(() => m.free(0), /free invalide/);
		assert.throws(() => m.free(1234), /free invalide/);
	});
	test('double free → free invalide', () => {
		const m = mem();
		const a = m.allocate();
		m.free(a);
		assert.throws(() => m.free(a), /free invalide/);
	});
	test('heap() liste alloués + libérés, trié, avec le drapeau freed', () => {
		const m = mem();
		const a = m.allocate();
		const b = m.allocate();
		m.free(a);
		assert.deepEqual(m.heap(), [
			{ address: a, value: 0, freed: true },
			{ address: b, value: 0, freed: false }
		]);
	});
});

describe('Memory — introspection', () => {
	test('nameAt renvoie le nom d\'une adresse nommée, sinon null', () => {
		const m = mem();
		assert.equal(m.nameAt(1000), 'n');
		assert.equal(m.nameAt(4242), null);
	});
	test('snapshot expose name/address/value/kind dans l\'ordre', () => {
		const snap = mem().snapshot();
		assert.deepEqual(snap, [
			{ name: 'n', address: 1000, value: 5, kind: 'int' },
			{ name: 'p', address: 1004, value: 0, kind: 'ptr' }
		]);
	});
});
