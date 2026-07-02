// Modèle argc/argv (E8-1, C06) : argv est un char** — un tableau de pointeurs vers des
// chaînes, posé en mémoire par installArgv.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Memory, WORD } from '../../src/engine/memory.js';

describe('installArgv — argv en mémoire', () => {
	test('argc = nombre d\'arguments ; argv[i] pointe une chaîne terminée', () => {
		const m = new Memory([]);
		const { argc, argv } = m.installArgv(['prog', 'Hi']);
		assert.equal(argc, 2);
		const p0 = m.readAddr(argv);          // argv[0]
		const p1 = m.readAddr(argv + WORD);   // argv[1]
		assert.equal(m.readAddr(p0), 'p');    // "prog"
		assert.equal(m.readAddr(p1), 'H');    // "Hi"
		assert.equal(m.readAddr(p1 + WORD), 'i');
		assert.equal(m.readAddr(p1 + 2 * WORD), 0); // sentinelle
	});
	test('les arguments ne comptent pas comme des fuites (hors tas)', () => {
		const m = new Memory([]);
		m.installArgv(['a', 'bb']);
		assert.equal(m.leaks().length, 0);
	});
});
