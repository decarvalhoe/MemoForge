// Tests du modèle d'aventure RAM (E3-1). Auto-porté : n'importe que world.js + levels.js
// (pas de dépendance à tests/helpers.mjs). node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../../src/game/levels.js';
import {
	REGIONS, regionOfLevel, briquesOfLevel, levelIdsInOrder,
	isRegionSolved, isRegionUnlocked, regionStatus, currentRegion
} from '../../src/game/world.js';

const idsOf = (arr) => new Set(arr);

describe('REGIONS — invariants structurels', () => {
	test('tout levelId référencé existe dans LEVELS', () => {
		const known = new Set(LEVELS.map((l) => l.id));
		for (const r of REGIONS)
			for (const id of r.levelIds)
				assert.ok(known.has(id), `levelId inconnu : ${id} (région ${r.id})`);
	});

	test('chaque niveau de LEVELS appartient à exactement une région', () => {
		for (const l of LEVELS) {
			const owners = REGIONS.filter((r) => r.levelIds.includes(l.id));
			assert.equal(owners.length, 1, `niveau ${l.id} rattaché ${owners.length} fois`);
		}
	});

	test('chaque unlock pointe vers une région existante ou null', () => {
		const known = new Set(REGIONS.map((r) => r.id));
		for (const r of REGIONS)
			assert.ok(r.unlock === null || known.has(r.unlock), `unlock invalide : ${r.unlock}`);
	});

	test('une seule région de départ (unlock null)', () => {
		assert.equal(REGIONS.filter((r) => r.unlock === null).length, 1);
	});

	test('chaque région déclare au moins une brique', () => {
		for (const r of REGIONS)
			assert.ok(r.briques.length >= 1, `région ${r.id} sans brique`);
	});
});

describe('regionOfLevel / briquesOfLevel', () => {
	test('3-1 est dans la région du Tas et travaille B8', () => {
		assert.equal(regionOfLevel('3-1').id, 'r6');
		assert.deepEqual(briquesOfLevel('3-1'), ['B8']);
	});
	test('un id inconnu ne renvoie aucune région', () => {
		assert.equal(regionOfLevel('9-9'), null);
		assert.deepEqual(briquesOfLevel('9-9'), []);
	});
	test('levelIdsInOrder commence par la région de départ', () => {
		assert.deepEqual(levelIdsInOrder().slice(0, 3), ['1-1', '1-2', '1-3']);
	});
});

describe('progression — déverrouillage', () => {
	test('au départ : r1 déverrouillée, r2 verrouillée', () => {
		const solved = idsOf([]);
		assert.ok(isRegionUnlocked('r1', solved));
		assert.equal(isRegionUnlocked('r2', solved), false);
		assert.equal(regionStatus('r1', solved), 'current');
		assert.equal(regionStatus('r2', solved), 'locked');
	});

	test('résoudre tous les niveaux de r1 déverrouille r2', () => {
		const solved = idsOf(['1-1', '1-2', '1-3']);
		assert.ok(isRegionSolved('r1', solved));
		assert.ok(isRegionUnlocked('r2', solved));
		assert.equal(regionStatus('r1', solved), 'solved');
		assert.equal(regionStatus('r2', solved), 'current');
	});

	test('une région sans niveau est résolue par vacuité et ne bloque pas la suite', () => {
		// r3 n'a pas encore de niveaux : dès que r2 est résolue, r3 est "coming" et r4 devient jouable.
		const solved = idsOf(['1-1', '1-2', '1-3', '2-1']);
		assert.ok(isRegionSolved('r3', solved), 'r3 vide doit être résolue par vacuité');
		assert.equal(regionStatus('r3', solved), 'coming');
		assert.ok(isRegionUnlocked('r4', solved), 'r4 doit être jouable malgré r3 vide');
		assert.equal(regionStatus('r4', solved), 'current');
	});

	test('currentRegion suit la première région jouable non résolue', () => {
		assert.equal(currentRegion(idsOf([])).id, 'r1');
		assert.equal(currentRegion(idsOf(['1-1', '1-2', '1-3'])).id, 'r2');
	});
});
