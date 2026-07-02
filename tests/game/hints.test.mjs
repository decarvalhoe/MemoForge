// Garde « indices sans réponse » (E6-11) — la règle n°1 du cours appliquée au jeu :
// un indice ne donne JAMAIS la solution. Concrètement : il ne cite aucune brique de la
// banque (sa solution) et ne déroule pas de séquence de pose. Cette garde survit aux
// futurs niveaux — écrire un indice qui triche casse la CI.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../../src/game/levels.js';
import { SANDBOX } from '../../src/game/sandbox.js';

const ALL = [...LEVELS, SANDBOX].filter((l) => l.hint);

// Mots/motifs qui trahissent une recette ordonnée (« d'abord X, ensuite Y », flèches).
const SEQUENCE = /d['’]abord|ensuite|→/i;

describe('indices — aucun ne donne la réponse', () => {
	for (const lv of ALL) {
		test(`${lv.id} — l'indice ne cite aucune brique de la banque`, () => {
			for (const brick of lv.bank) {
				// Le label d'une brique EST un fragment de code solution (« p = &n »,
				// « write(1, &c0, 1) »). Un indice qui le contient donne la réponse.
				if (brick.label && brick.label.length >= 5)
					assert.ok(
						!lv.hint.includes(brick.label),
						`indice de ${lv.id} cite la brique « ${brick.label} »`
					);
			}
		});

		test(`${lv.id} — l'indice ne déroule pas de séquence de pose`, () => {
			assert.ok(!SEQUENCE.test(lv.hint), `indice de ${lv.id} déroule une recette : « ${lv.hint} »`);
		});

		// Le bac à sable n'a pas de cible : son « indice » est une invitation à expérimenter,
		// pas une aide socratique — il est exempté de cette dernière vérification.
		if (lv.sandbox) continue;
		test(`${lv.id} — l'indice pose une question ou renvoie au modèle`, () => {
			// Un bon indice interroge (« ? ») ou ancre au cours/modèle (« cours M… »).
			// Filet minimal contre les indices purement impératifs (« fais X »).
			assert.ok(
				lv.hint.includes('?') || /cours M\d|modèle|sentinelle|règle/i.test(lv.hint),
				`indice de ${lv.id} n'interroge ni ne renvoie au modèle : « ${lv.hint} »`
			);
		});
	}
});
