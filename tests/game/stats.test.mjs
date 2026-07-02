// Stats d'apprentissage locales & privées (E9-4).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { emptyStats, record, hardest, summary, loadStats, saveStats } from '../../src/game/stats.js';

describe('stats — enregistrement immuable', () => {
	test('record incrémente attempts/fails et marque solved', () => {
		let s = emptyStats();
		s = record(s, 'rec-1', { passed: false, pitfall: 'crash' });
		s = record(s, 'rec-1', { passed: false, pitfall: 'crash' });
		s = record(s, 'rec-1', { passed: true });
		const e = s.levels['rec-1'];
		assert.equal(e.attempts, 3);
		assert.equal(e.fails, 2);
		assert.equal(e.solved, true);
		assert.equal(e.pitfalls.crash, 2);
	});
	test('record ne mute pas l\'objet d\'origine', () => {
		const a = emptyStats();
		const b = record(a, 'x', { passed: true });
		assert.deepEqual(a, emptyStats());
		assert.ok(b.levels['x']);
	});
});

describe('hardest / summary', () => {
	test('hardest classe par nombre d\'échecs', () => {
		let s = emptyStats();
		s = record(s, 'a', { passed: false });
		s = record(s, 'b', { passed: false });
		s = record(s, 'b', { passed: false });
		s = record(s, 'c', { passed: true });
		assert.deepEqual(hardest(s, 2), [{ id: 'b', fails: 2 }, { id: 'a', fails: 1 }]);
	});
	test('summary compte niveaux / résolus / tentatives', () => {
		let s = emptyStats();
		s = record(s, 'a', { passed: false });
		s = record(s, 'a', { passed: true });
		s = record(s, 'b', { passed: true });
		assert.deepEqual(summary(s), { levels: 2, solved: 2, attempts: 3 });
	});
});

describe('persistance locale', () => {
	function mockStorage() {
		const m = new Map();
		return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) };
	}
	test('save/load round-trip', () => {
		const st = mockStorage();
		let s = record(emptyStats(), 'a', { passed: false });
		saveStats(st, s);
		assert.deepEqual(loadStats(st), s);
	});
	test('stockage absent → stats vides, sans crash', () => {
		assert.deepEqual(loadStats(null), emptyStats());
		saveStats(null, emptyStats()); // ne lève pas
	});
});
