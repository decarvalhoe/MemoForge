// Verdict façon valgrind + discipline N+1 free (E6-5, cours M9).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { valgrindReport, measureLeaks } from '../../src/game/valgrind.js';
import { byId, runProgram, goalMet } from '../helpers.mjs';
import { Memory, WORD } from '../../src/engine/memory.js';

describe('valgrindReport — le verdict M9', () => {
	test('propre : 0 fuite, 0 erreur → objectif atteint', () => {
		const r = valgrindReport({ blocks: 0, bytes: 0, errors: 0 });
		assert.equal(r.clean, true);
		assert.match(r.lines.join('\n'), /no leaks are possible/);
		assert.match(r.lines.join('\n'), /ERROR SUMMARY: 0 errors/);
	});
	test('fuite : blocs et octets perdus rapportés', () => {
		const r = valgrindReport({ blocks: 1, bytes: 8, errors: 0 });
		assert.equal(r.clean, false);
		assert.match(r.lost, /definitely lost: 8 bytes in 1 blocks/);
	});
	test('erreur (crash) compte dans ERROR SUMMARY', () => {
		const r = valgrindReport({ blocks: 0, bytes: 0, errors: 1 });
		assert.equal(r.clean, false);
		assert.match(r.summary, /1 errors/);
	});
});

describe('measureLeaks — mesure depuis la mémoire moteur', () => {
	test('un malloc non libéré = 1 bloc, octets = cellules × WORD', () => {
		const m = new Memory([]);
		m.allocate(2); // 2 cellules, jamais libérées
		const meas = measureLeaks(m, WORD, false);
		assert.equal(meas.blocks, 1);
		assert.equal(meas.bytes, 2 * WORD);
		assert.equal(meas.errors, 0);
	});
	test('tout libéré → 0 bloc, 0 octet', () => {
		const m = new Memory([]);
		const base = m.allocate(2);
		m.free(base);
		assert.deepEqual(measureLeaks(m, WORD, false), { blocks: 0, bytes: 0, errors: 0 });
	});
});

describe('split-1 — libérer un tableau de chaînes (N+1 free)', () => {
	const L = byId['split-1'];
	test('N chaînes + 1 tableau : N+1 free → zéro fuite', () => {
		const { mem } = runProgram(L, ['a0', 'a1', 'at', 'l0', 'l1', 'f0', 'f1', 'ft']);
		assert.equal(mem.leaks().length, 0);
		assert.ok(goalMet(L, mem));
	});
	test('libérer les chaînes mais OUBLIER le tableau → le conteneur fuit', () => {
		const { mem } = runProgram(L, ['a0', 'a1', 'at', 'l0', 'l1', 'f0', 'f1']);
		assert.ok(mem.leaks().length > 0);
		assert.equal(goalMet(L, mem), false);
		// et le rapport valgrind le dit
		const r = valgrindReport(measureLeaks(mem, WORD, false));
		assert.equal(r.clean, false);
		assert.match(r.lost, /definitely lost/);
	});
});
