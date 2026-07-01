import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';
import * as ast from '../../src/engine/ast.js';

function withFile(content, extraVars = []) {
	const m = new Memory([
		{ name: 'fd', value: 0 }, { name: 'n', value: 0 },
		...extraVars
	]);
	m.setFile('f.txt', content);
	return m;
}

describe('Modèle fichier (B12 syscalls)', () => {
	test('open rend un descripteur (>= 3), fichier absent → -1', () => {
		const m = withFile('Hi');
		const fd = m.open('f.txt');
		assert.ok(fd >= 3);
		assert.equal(m.open('absent.txt'), -1);
	});
	test('read remplit la mémoire et renvoie le nombre d\'octets', () => {
		const m = withFile('Hi', [{ name: 'b0', value: 0 }, { name: 'b1', value: 0 }, { name: 'b2', value: 0 }]);
		const fd = m.open('f.txt');
		const n = m.read(fd, m.addrOf('b0'), 3);
		assert.equal(n, 2);
		assert.equal(m.getVar('b0'), 'H');
		assert.equal(m.getVar('b1'), 'i');
	});
	test('lecture jusqu\'à EOF puis 0', () => {
		const m = withFile('A', [{ name: 'b0', value: 0 }]);
		const fd = m.open('f.txt');
		assert.equal(m.read(fd, m.addrOf('b0'), 4), 1);
		assert.equal(m.read(fd, m.addrOf('b0'), 4), 0);
	});
	test('lecture après close → piège détecté', () => {
		const m = withFile('Hi', [{ name: 'b0', value: 0 }]);
		const fd = m.open('f.txt');
		m.close(fd);
		assert.throws(() => m.read(fd, m.addrOf('b0'), 1), /lecture après close/);
	});
	test('double close → erreur', () => {
		const m = withFile('Hi');
		const fd = m.open('f.txt');
		m.close(fd);
		assert.throws(() => m.close(fd), /double close/);
	});
	test('read / close sur descripteur invalide → erreur', () => {
		const m = withFile('Hi', [{ name: 'b0', value: 0 }]);
		assert.throws(() => m.read(99, m.addrOf('b0'), 1), /descripteur de fichier invalide/);
		assert.throws(() => m.close(99), /descripteur de fichier invalide/);
	});
	test('oubli de close → descripteur encore ouvert (fuite)', () => {
		const m = withFile('Hi');
		const fd = m.open('f.txt');
		assert.deepEqual(m.openDescriptors(), [fd]);
		m.close(fd);
		assert.deepEqual(m.openDescriptors(), []);
	});
	test('buffer trop petit → adresse invalide', () => {
		const m = withFile('Hi!', [{ name: 'b0', value: 0 }, { name: 'b1', value: 0 }]);
		const fd = m.open('f.txt');
		assert.throws(() => m.read(fd, m.addrOf('b0'), 5), /adresse invalide/);
	});

	test('display_file via l\'interpréteur : open → read → write → close', () => {
		const m = withFile('Hi', [
			{ name: 'b0', value: 0 }, { name: 'b1', value: 0 }, { name: 'b2', value: 0 }
		]);
		const i = new Interpreter(m, [
			{ ast: ast.assign(ast.variable('fd'), ast.open('f.txt')) },
			{ ast: ast.assign(ast.variable('n'), ast.read(ast.variable('fd'), ast.addr('b0'), ast.lit(3))) },
			{ ast: ast.write(1, ast.addr('b0'), ast.variable('n')) },
			{ ast: ast.close(ast.variable('fd')) }
		]);
		i.run();
		assert.equal(i.error, null);
		assert.equal(m.output, 'Hi');
		assert.deepEqual(m.openDescriptors(), []);
	});
});
