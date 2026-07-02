// Non-régression de l'AST unifié (E2-10). Un balayage data-driven, source unique de la
// garantie « les niveaux actuels passent toujours » : chaque niveau de LEVELS doit rester
// résoluble via son chemin canonique, et aucune brique ne doit reposer sur un nœud AST
// inconnu. Ajouter un niveau sans solution ici → ce test casse (discipline volontaire).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../../src/game/levels.js';
import { goalMet, interpFor } from '../helpers.mjs';
import { Memory } from '../../src/engine/memory.js';

// Chemins canoniques gagnants (golden), un par niveau.
const SOLUTIONS = {
	'1-1': ['set-n'],
	'1-2': ['p-addr-n', 'star-p-42'],
	'1-3': ['save', 'copy', 'restore'],
	'ptr-1': ['deref-set'],
	'ptr-2': ['set-div', 'set-mod'],
	'ptr-3': ['peel1', 'peel2', 'write'],
	'dang-1': ['h-alloc', 'h-set', 'h-ret'],
	'2-1': ['i0', 'j0', 'loop'],
	'range-1': ['size', 'alloc', 'i0', 'fill', 'ret'],
	'split-1': ['a0', 'a1', 'at', 'l0', 'l1', 'f0', 'f1', 'ft'],
	'3-1': ['p-malloc', 'star-p-7', 'free-p'],
	'3-2': ['p-malloc', 'q-malloc', 'free-p', 'free-q'],
	'4-1': ['c0-H', 'c1-i', 'c2-nul'],
	's-1': ['w-c0', 'w-c1'],
	'io-1': ['len', 'emit'],
	'io-2': ['loop'],
	'io-3': ['loop'],
	'str-1': ['init', 'copy', 'term', 'ret'],
	'conv-1': ['r0', 'i0', 'scan', 'ret'],
	'conv-2': ['rec', 'digit', 'emit'],
	'l-1': ['mk-n1', 'mk-n2', 'link', 'save', 'free-n1', 'free-nxt'],
	'str-2': ['set-term', 'measure'],
	'f-1': ['open', 'read', 'write', 'close'],
	'dup-1': ['len', 'size', 'alloc', 'copy', 'ret'],
	'conv-3': ['rec', 'digit', 'emit'],
	'mem-1': ['lo', 'hi'],
	'strn-1': ['loop-2'],
	'while-1': ['init', 'scan', 'ret'],
	'chr-1': ['and'],
	'chr-2': ['or'],
	'chr-3': ['cond', 'ret'],
	'rec-1': ['base', 'rec', 'comb'],
	'rec-2': ['base', 'rec', 'comb']
};

function freshMem(level) {
	const mem = new Memory(level.vars);
	if (level.files)
		for (const [n, c] of Object.entries(level.files))
			mem.setFile(n, c);
	return mem;
}

function runIds(level, ids) {
	const program = ids.map((id) => {
		const item = level.bank.find((b) => b.id === id);
		assert.ok(item, `bank id manquant : ${level.id}/${id}`);
		return item;
	});
	const interp = interpFor(level, program, freshMem(level));
	interp.run();
	return { mem: interp.mem, error: interp.error };
}

describe('Non-régression AST unifié (E2-10)', () => {
	test('chaque niveau de LEVELS a une solution canonique déclarée', () => {
		assert.deepEqual(Object.keys(SOLUTIONS).sort(), LEVELS.map((l) => l.id).sort());
	});

	for (const level of LEVELS) {
		test(`${level.id} — résolu par sa solution canonique, sans erreur`, () => {
			const { mem, error } = runIds(level, SOLUTIONS[level.id]);
			assert.equal(error, null, `erreur inattendue : ${error}`);
			assert.ok(goalMet(level, mem), `cible non atteinte : ${level.id}`);
		});
	}
});

describe('Surface du mini-langage : aucune brique ne repose sur un nœud AST inconnu', () => {
	// Une brique peut légitimement planter (piège pédagogique), mais jamais parce que
	// l'interpréteur ne reconnaît pas le nœud (« expression/opérateur inconnu »).
	for (const level of LEVELS) {
		test(`${level.id} — banque exécutable sans nœud inconnu`, () => {
			for (const item of level.bank) {
				const interp = interpFor(level, [item], freshMem(level));
				interp.run();
				if (interp.error)
					assert.doesNotMatch(
						interp.error,
						/expression inconnue|opérateur inconnu/,
						`${level.id}/${item.id} : ${interp.error}`
					);
			}
		});
	}
});
