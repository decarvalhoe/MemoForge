// Tests du tracker de répétition espacée (E4-4). Auto-porté : storage & now injectés,
// donc déterministe et sans navigateur. node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createTracker, STATES, REVIEW_OFFSETS } from '../../src/game/tracker.js';

const DAY = 24 * 60 * 60 * 1000;
const T0 = 1_700_000_000_000; // instant de référence fixe

function fakeStorage() {
	const store = {};
	return {
		getItem: (k) => (k in store ? store[k] : null),
		setItem: (k, v) => { store[k] = String(v); },
		removeItem: (k) => { delete store[k]; },
		_dump: () => store
	};
}

const mk = () => createTracker(fakeStorage(), 'test.key');

describe('tracker — états', () => {
	test('état par défaut = none', () => {
		assert.equal(mk().getState('B1'), 'none');
	});
	test('setState persiste', () => {
		const t = mk();
		t.setState('B1', 'compris', T0);
		assert.equal(t.getState('B1'), 'compris');
	});
	test('setState refuse un état inconnu', () => {
		assert.throws(() => mk().setState('B1', 'maître', T0), /état inconnu/);
	});
	test('STATES ordonne du plus faible au plus fort', () => {
		assert.deepEqual(STATES, ['none', 'compris', 'refait', 'chrono']);
	});
});

describe('tracker — répétition espacée', () => {
	test('atteindre chrono planifie 3 révisions J+1/J+3/J+7', () => {
		const t = mk();
		const e = t.setState('B2', 'chrono', T0);
		assert.equal(e.reviews.length, 3);
		assert.deepEqual(e.reviews.map((r) => r.due - T0), REVIEW_OFFSETS);
		assert.deepEqual(e.reviews.map((r) => r.due - T0), [DAY, 3 * DAY, 7 * DAY]);
	});

	test('aucune révision due juste après acquisition', () => {
		const t = mk();
		t.setState('B2', 'chrono', T0);
		assert.deepEqual(t.dueReviews(T0), []);
	});

	test('à J+1 la première révision est due', () => {
		const t = mk();
		t.setState('B2', 'chrono', T0);
		assert.deepEqual(t.dueReviews(T0 + DAY), ['B2']);
	});

	test('markReviewed consomme la plus ancienne due', () => {
		const t = mk();
		t.setState('B2', 'chrono', T0);
		assert.equal(t.markReviewed('B2', T0 + DAY), true);
		// la J+1 faite, plus rien de dû avant J+3
		assert.deepEqual(t.dueReviews(T0 + DAY), []);
		assert.deepEqual(t.dueReviews(T0 + 3 * DAY), ['B2']);
	});

	test('markReviewed sans révision due renvoie false', () => {
		const t = mk();
		t.setState('B2', 'chrono', T0);
		assert.equal(t.markReviewed('B2', T0), false);
		assert.equal(t.markReviewed('inconnu', T0 + DAY), false);
	});

	test('après les 3 révisions, la brique est consolidée', () => {
		const t = mk();
		t.setState('B2', 'chrono', T0);
		assert.equal(t.markReviewed('B2', T0 + DAY), true);
		assert.equal(t.markReviewed('B2', T0 + 3 * DAY), true);
		assert.equal(t.markReviewed('B2', T0 + 7 * DAY), true);
		assert.equal(t.isConsolidated('B2'), true);
		assert.deepEqual(t.dueReviews(T0 + 30 * DAY), []);
	});

	test('reset vide le tracker', () => {
		const t = mk();
		t.setState('B1', 'compris', T0);
		t.reset();
		assert.equal(t.getState('B1'), 'none');
	});
});
