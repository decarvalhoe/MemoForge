import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';
import * as ast from '../../src/engine/ast.js';

const heap = () => new Memory([]);

describe('Nœuds chaînés (B10 ->next)', () => {
	test('createNode : data posée, next = NULL', () => {
		const m = heap();
		const n = m.createNode(42);
		assert.equal(m.nodeField(n, 'data'), 42);
		assert.equal(m.nodeField(n, 'next'), 0);
	});
	test('createNode → 0 (NULL) si le tas est plein', () => {
		const m = heap();
		m.allocate(4096);
		assert.equal(m.createNode(1), 0);
	});
	test('push_back + traversée ->next', () => {
		const m = heap();
		const a = m.createNode(1);
		const b = m.createNode(2);
		const c = m.createNode(3);
		m.setNodeField(a, 'next', b);
		m.setNodeField(b, 'next', c);
		const out = [];
		let cur = a;
		while (cur !== 0) {
			out.push(m.nodeField(cur, 'data'));
			cur = m.nodeField(cur, 'next');
		}
		assert.deepEqual(out, [1, 2, 3]);
	});
	test('setNodeField data modifie la donnée', () => {
		const m = heap();
		const n = m.createNode(1);
		m.setNodeField(n, 'data', 9);
		assert.equal(m.nodeField(n, 'data'), 9);
	});
	test('le vrai piège M12 : lire ->next d\'un nœud déjà libéré (use-after-free)', () => {
		const m = heap();
		const a = m.createNode(1);
		const b = m.createNode(2);
		m.setNodeField(a, 'next', b);
		m.freeNode(a); // free légal, comme en C
		assert.throws(() => m.nodeField(a, 'next'), /déjà libéré/);
	});
	test('démantèlement correct tête→queue', () => {
		const m = heap();
		const a = m.createNode(1);
		const b = m.createNode(2);
		m.setNodeField(a, 'next', b);
		m.freeNode(a);
		m.freeNode(b);
		assert.deepEqual(m.leaks(), []);
	});
	test('ré-affecter next remplace le maillon pointé ; free reste libre (comme en C)', () => {
		const m = heap();
		const a = m.createNode(1);
		const b = m.createNode(2);
		const c = m.createNode(3);
		m.setNodeField(a, 'next', b);
		m.setNodeField(a, 'next', c);
		assert.equal(m.nodeField(a, 'next'), c); // a pointe désormais c
		m.freeNode(b);
		m.freeNode(c); // légal même si a->next == c : pas de garde artificielle
		assert.equal(m.leaks().length, 2); // seul a (2 cellules) n'a pas été libéré
	});
	test('champ/free sur NULL et adresse non allouée → erreurs', () => {
		const m = heap();
		assert.throws(() => m.nodeField(0, 'data'), /déréférencement de NULL/);
		assert.throws(() => m.setNodeField(0, 'next', 1), /déréférencement de NULL/);
		assert.throws(() => m.freeNode(0), /free invalide/);
	});
	test('via l\'interpréteur : node / field / free_node', () => {
		const m = new Memory([
			{ name: 'a', value: 0, kind: 'ptr' },
			{ name: 'b', value: 0, kind: 'ptr' },
			{ name: 'd', value: 0 }
		]);
		const i = new Interpreter(m, [
			{ ast: ast.assign(ast.variable('a'), ast.node(ast.lit(7))) },
			{ ast: ast.assign(ast.variable('b'), ast.node(ast.lit(8))) },
			{ ast: ast.assign(ast.field(ast.variable('a'), 'next'), ast.variable('b')) },
			{ ast: ast.assign(ast.variable('d'), ast.field(ast.field(ast.variable('a'), 'next'), 'data')) }
		]);
		i.run();
		assert.equal(i.error, null);
		assert.equal(m.getVar('d'), 8);
	});
	test('via l\'interpréteur : ast.freeNode libère un maillon non chaîné', () => {
		const m = new Memory([{ name: 'p', value: 0, kind: 'ptr' }]);
		const i = new Interpreter(m, [
			{ ast: ast.assign(ast.variable('p'), ast.node(ast.lit(1))) },
			{ ast: ast.freeNode(ast.variable('p')) }
		]);
		i.run();
		assert.equal(i.error, null);
		assert.deepEqual(m.leaks(), []);
	});
});
