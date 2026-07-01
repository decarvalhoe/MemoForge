// Tests des « questions à se poser » (E4-6). Auto-porté : n'importe que questions.js. node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, questionsForBrique, questionsForBriques, coveredBriques } from '../../src/game/questions.js';

describe('QUESTIONS — couverture des 12 briques', () => {
	test('les 12 briques B1..B12 sont couvertes', () => {
		for (let i = 1; i <= 12; i++)
			assert.ok(QUESTIONS['B' + i], `brique B${i} sans questions`);
		assert.equal(coveredBriques().length, 12);
	});
	test('chaque brique a au moins une question non triviale', () => {
		for (const [b, qs] of Object.entries(QUESTIONS)) {
			assert.ok(qs.length >= 1, `${b} vide`);
			assert.ok(qs.every((q) => q.length > 15), `${b} a une question trop courte`);
		}
	});
});

describe('questionsForBrique', () => {
	test('renvoie les questions de la brique', () => {
		assert.deepEqual(questionsForBrique('B6'), QUESTIONS.B6);
	});
	test('brique inconnue → tableau vide', () => {
		assert.deepEqual(questionsForBrique('B99'), []);
	});
	test('renvoie une copie (pas la référence interne)', () => {
		const q = questionsForBrique('B1');
		q.push('mutation');
		assert.equal(QUESTIONS.B1.includes('mutation'), false);
	});
});

describe('questionsForBriques — agrégation sans doublon', () => {
	test('concatène plusieurs briques', () => {
		const q = questionsForBriques(['B3', 'B4']);
		assert.deepEqual(q, [...QUESTIONS.B3, ...QUESTIONS.B4]);
	});
	test('déduplique les questions communes', () => {
		// B3 partagée avec elle-même : pas de doublon
		const q = questionsForBriques(['B3', 'B3']);
		assert.deepEqual(q, QUESTIONS.B3);
	});
	test('liste vide → tableau vide', () => {
		assert.deepEqual(questionsForBriques([]), []);
		assert.deepEqual(questionsForBriques(), []);
	});
});
