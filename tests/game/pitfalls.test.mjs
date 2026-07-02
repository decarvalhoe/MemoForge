// Tests du feedback pédagogique (E4-3). Auto-porté : n'importe que pitfalls.js. node:test.
// Les messages d'erreur testés correspondent aux RuntimeError réels du moteur (memory.js).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { explainError, explainLeak, explainRun, PITFALLS } from '../../src/game/pitfalls.js';

describe('explainError — mappe les erreurs moteur sur l\'anti-sèche', () => {
	test('pas d\'erreur → null', () => {
		assert.equal(explainError(null), null);
		assert.equal(explainError(''), null);
	});
	test('déréférencement de NULL', () => {
		const f = explainError('déréférencement de NULL');
		assert.equal(f.tone, 'crash');
		assert.match(f.title, /NULL/);
	});
	test('accès après libération (lecture/écriture déjà libéré)', () => {
		assert.match(explainError('lecture dans un casier déjà libéré').title, /après libération/);
		assert.match(explainError('écriture dans un casier déjà libéré').title, /après libération/);
	});
	test('double free', () => {
		assert.match(explainError('free invalide (adresse non allouée)').title, /free invalide/);
	});
	test('adresse invalide', () => {
		assert.match(explainError('adresse invalide').title, /adresse invalide/);
	});
	test('erreur inconnue → crash générique conservant le message', () => {
		const f = explainError('un message bizarre');
		assert.equal(f.tone, 'crash');
		assert.equal(f.hint, 'un message bizarre');
	});
	test('dangling pointer (variable locale morte)', () => {
		const f = explainError('variable locale morte : sa frame a été dépilée (dangling pointer)');
		assert.equal(f.tone, 'crash');
		assert.match(f.title, /dangling/);
		assert.match(f.hint, /tas|malloc/);
	});
	test('chaque piège a un hint pédagogique non vide', () => {
		for (const p of PITFALLS) assert.ok(p.hint.length > 10, `${p.id} sans hint`);
	});
});

describe('explainLeak', () => {
	test('aucune fuite → null', () => {
		assert.equal(explainLeak(0), null);
		assert.equal(explainLeak(), null);
	});
	test('une fuite = singulier', () => {
		const f = explainLeak(1);
		assert.equal(f.tone, 'leak');
		assert.match(f.hint, /1 casier alloué n'a jamais/);
	});
	test('plusieurs fuites = pluriel', () => {
		assert.match(explainLeak(3).hint, /3 casiers alloués n'ont jamais/);
	});
});

describe('explainRun — priorité crash > fuite > succès', () => {
	test('crash l\'emporte sur tout', () => {
		assert.equal(explainRun({ error: 'déréférencement de NULL', leaks: 2, goalMet: false }).tone, 'crash');
	});
	test('fuite l\'emporte sur le succès', () => {
		assert.equal(explainRun({ error: null, leaks: 1, goalMet: true }).tone, 'leak');
	});
	test('succès si cible atteinte, sans erreur ni fuite', () => {
		assert.equal(explainRun({ error: null, leaks: 0, goalMet: true }).tone, 'success');
	});
	test('cible non atteinte sans crash', () => {
		const f = explainRun({ error: null, leaks: 0, goalMet: false });
		assert.match(f.title, /NON ATTEINTE/);
	});
});
