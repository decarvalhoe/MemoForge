// Tests des niveaux de contenu (E3-3/4/5) ancrés sur les capacités moteur B1/B2/B3-5.
// Réutilise tests/helpers.mjs (byId/runProgram/goalMet/solved). node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { byId, runProgram, goalMet, solved } from '../helpers.mjs';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';

// Runner local qui installe les fichiers du niveau (helpers.runProgram ne le fait pas).
function runWithFiles(level, ids) {
	const mem = new Memory(level.vars);
	if (level.files) for (const [n, c] of Object.entries(level.files)) mem.setFile(n, c);
	const program = ids.map((id) => level.bank.find((b) => b.id === id));
	const interp = new Interpreter(mem, program);
	interp.run();
	return { mem, error: interp.error };
}

describe('s-1 — Sortie & ASCII (write / ft_putstr)', () => {
	const L = byId['s-1'];
	test('write c0 puis c1 → "Hi"', () => assert.ok(solved(L, ['w-c0', 'w-c1'])));
	test('write(1,&c0,2) émet les 2 octets contigus → "Hi"', () => assert.ok(solved(L, ['w-c0-2'])));
	test('ordre inverse → "iH", échoue', () => {
		const { mem } = runProgram(L, ['w-c1', 'w-c0']);
		assert.equal(mem.output, 'iH');
		assert.equal(goalMet(L, mem), false);
	});
});

describe('str-1 — Chaînes (strcpy / sentinelle)', () => {
	const L = byId['str-1'];
	test('strcpy(&d0,&s0) recopie "Hi\\0"', () => assert.ok(solved(L, ['cpy'])));
	test('strcpy(&d0,&d0) ne copie rien → échoue', () => {
		const { mem } = runProgram(L, ['cpy-bad']);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('str-2 — Chaînes (sentinelle : borner avant de mesurer)', () => {
	const L = byId['str-2'];
	test('borner puis strlen → n = 2', () => assert.ok(solved(L, ['set-term', 'measure'])));
	test('mesurer AVANT de borner → crash "sans borne"', () => {
		const { error } = runProgram(L, ['measure', 'set-term']);
		assert.match(error, /sans borne/);
	});
	test('atoi sur "Hi" ne donne pas la longueur → échoue', () => {
		const { mem } = runProgram(L, ['set-term', 'atoi-bad']);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('conv-1 — Conversion (atoi)', () => {
	const L = byId['conv-1'];
	test('n = atoi("42") = 42', () => assert.ok(solved(L, ['atoi'])));
	test('strlen donne la longueur (2), pas la valeur → échoue', () => {
		const { mem } = runProgram(L, ['len']);
		assert.equal(mem.getVar('n'), 2);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('conv-2 — Conversion (putnbr_base)', () => {
	const L = byId['conv-2'];
	test('putnbr_base(42, hex) → "2a"', () => {
		const { mem } = runProgram(L, ['hex']);
		assert.equal(mem.output, '2a');
		assert.ok(solved(L, ['hex']));
	});
	test('base binaire → "101010", pas "2a" → échoue', () => {
		const { mem } = runProgram(L, ['bin']);
		assert.equal(mem.output, '101010');
		assert.equal(goalMet(L, mem), false);
	});
});

describe('l-1 — Listes (nœuds ->next, piège de libération)', () => {
	const L = byId['l-1'];
	test('créer, chaîner, libérer tête puis queue → propre', () => {
		assert.ok(solved(L, ['mk-n1', 'mk-n2', 'link', 'free-n1', 'free-n2']));
	});
	test('libérer la queue encore chaînée → crash "encore chaîné"', () => {
		const { error } = runProgram(L, ['mk-n1', 'mk-n2', 'link', 'free-n2']);
		assert.match(error, /chaîné/);
	});
	test('oublier un free → fuite, cible non atteinte', () => {
		const { mem } = runProgram(L, ['mk-n1', 'mk-n2', 'link', 'free-n1']);
		assert.ok(mem.leaks().length > 0);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('f-1 — Fichiers (open/read/write/close, B12)', () => {
	const L = byId['f-1'];
	test('open → read → write → close : affiche "Hi", 0 descripteur ouvert', () => {
		const { mem, error } = runWithFiles(L, ['open', 'read', 'write', 'close']);
		assert.equal(error, null);
		assert.equal(mem.output, 'Hi');
		assert.ok(L.goalCheck(mem));
	});
	test('oublier close → descripteur fuité, cible non atteinte', () => {
		const { mem } = runWithFiles(L, ['open', 'read', 'write']);
		assert.equal(mem.output, 'Hi');
		assert.ok(mem.openDescriptors().length > 0);
		assert.equal(L.goalCheck(mem), false);
	});
	test('lire après close → crash "lecture après close"', () => {
		const { error } = runWithFiles(L, ['open', 'close', 'read']);
		assert.match(error, /après close/);
	});
});

describe('dup-1 — Tas (ft_strdup, dimensionner malloc)', () => {
	const L = byId['dup-1'];
	test('malloc(3) → strcpy → write → free : "Hi", zéro fuite', () => {
		assert.ok(solved(L, ['malloc-3', 'copy', 'show', 'free-p']));
	});
	test('malloc(1) trop petit → strcpy déborde → crash "adresse invalide"', () => {
		const { error } = runProgram(L, ['malloc-1', 'copy']);
		assert.match(error, /adresse invalide/);
	});
	test('oublier free → fuite, cible non atteinte', () => {
		const { mem } = runProgram(L, ['malloc-3', 'copy', 'show']);
		assert.equal(mem.output, 'Hi');
		assert.ok(mem.leaks().length > 0);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('conv-3 — Conversion (extraction de chiffres, B4)', () => {
	const L = byId['conv-3'];
	test('u = n%10 (2), t = n/10 (4) → cible atteinte', () => {
		assert.ok(solved(L, ['u-mod', 't-div']));
	});
	test('u = n/10 (4) au lieu de %10 → échoue', () => {
		const { mem } = runProgram(L, ['u-div-bad', 't-div']);
		assert.equal(mem.getVar('u'), 4);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('strn-1 — Boucle bornée (ft_strncpy, B7)', () => {
	const L = byId['strn-1'];
	test('boucle 2× copie exactement 2 caractères → cible atteinte', () => {
		assert.ok(solved(L, ['loop-2']));
	});
	test('boucle 3× déborde sur le 3e (d2 = "!") → échoue', () => {
		const { mem } = runProgram(L, ['loop-3']);
		assert.equal(mem.getVar('d2'), '!');
		assert.equal(goalMet(L, mem), false);
	});
});
