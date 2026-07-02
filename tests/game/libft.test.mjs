// « Ta libft » (E6-8) : mécanique d'inventaire — forger une ft_, la réutiliser.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
	emptyLibft, forge, hasForged, recall, forgedNames,
	functionsFor, missing, loadLibft, saveLibft
} from '../../src/game/libft.js';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';
import * as ast from '../../src/engine/ast.js';

const V = ast.variable;
const L = ast.lit;

// Corps de ft_strlen assemblé par le joueur (params: [s] = adresse du 1er caractère) :
//   len = 0 ; while (s[len] != 0) len = len + 1 ; return len
const STRLEN_BODY = [
	{ id: 'init', label: 'len = 0', ast: ast.assign(V('len'), L(0)) },
	{ id: 'scan', label: 'tant que s[len] != 0 : len = len + 1',
		ast: ast.whileLoop(ast.bin('!=', ast.load(V('s'), V('len')), L(0)), [ast.assign(V('len'), ast.bin('+', V('len'), L(1)))]) },
	{ id: 'ret', label: 'return len', ast: ast.ret(V('len')) }
];

describe('inventaire — forge / recall / immuabilité', () => {
	test('forger ajoute la fonction sans muter l\'inventaire d\'origine', () => {
		const a = emptyLibft();
		const b = forge(a, 'ft_strlen', ['s'], STRLEN_BODY);
		assert.equal(hasForged(a, 'ft_strlen'), false, 'a doit rester vide (immuable)');
		assert.equal(hasForged(b, 'ft_strlen'), true);
		assert.deepEqual(recall(b, 'ft_strlen').params, ['s']);
		assert.deepEqual(forgedNames(b), ['ft_strlen']);
	});
	test('recall d\'une fonction non forgée → null', () => {
		assert.equal(recall(emptyLibft(), 'ft_nope'), null);
	});
});

describe('functionsFor — la version forgée prime sur la référence', () => {
	test('injecte la ft_ forgée dans le registre', () => {
		const inv = forge(emptyLibft(), 'ft_strlen', ['s'], STRLEN_BODY);
		const reg = functionsFor(inv, ['ft_strlen'], {});
		assert.ok(reg.ft_strlen && reg.ft_strlen.body === STRLEN_BODY);
	});
	test('repli sur la référence du niveau si pas encore forgée', () => {
		const ref = { ft_strlen: { name: 'ft_strlen', params: ['s'], body: [] } };
		const reg = functionsFor(emptyLibft(), ['ft_strlen'], ref);
		assert.equal(reg.ft_strlen, ref.ft_strlen);
	});
	test('missing = ce qu\'il reste à forger (ni forgé, ni fourni)', () => {
		const inv = forge(emptyLibft(), 'ft_strlen', ['s'], STRLEN_BODY);
		assert.deepEqual(missing(inv, ['ft_strlen', 'ft_strcpy'], {}), ['ft_strcpy']);
		assert.deepEqual(missing(inv, ['ft_strcpy'], { ft_strcpy: {} }), []);
	});
});

describe('persistance — via un stockage localStorage-like', () => {
	function mockStorage() {
		const m = new Map();
		return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) };
	}
	test('save puis load restitue l\'inventaire (round-trip JSON)', () => {
		const s = mockStorage();
		const inv = forge(emptyLibft(), 'ft_strlen', ['s'], STRLEN_BODY);
		saveLibft(s, inv);
		const back = loadLibft(s);
		assert.equal(hasForged(back, 'ft_strlen'), true);
		assert.deepEqual(recall(back, 'ft_strlen').body, STRLEN_BODY);
	});
	test('stockage absent (null) → inventaire vide, sans crash', () => {
		assert.deepEqual(loadLibft(null), {});
		saveLibft(null, { ft_x: {} }); // ne doit pas lever
	});
});

describe('bout-en-bout — forger ft_strlen puis l\'appeler dans un autre niveau', () => {
	test('la ft_ forgée par le joueur calcule vraiment strlen("Hi") = 2', () => {
		// Le joueur a forgé ft_strlen. Un niveau ultérieur l'appelle via son driver.
		const inv = forge(emptyLibft(), 'ft_strlen', ['s'], STRLEN_BODY);
		const functions = functionsFor(inv, ['ft_strlen'], {});
		const m = new Memory([
			{ name: 's0', value: 'H', kind: 'char' }, { name: 's1', value: 'i', kind: 'char' },
			{ name: 's2', value: 0, kind: 'char' }, { name: 'n', value: 0, kind: 'int' }
		]);
		const driver = [{ ast: ast.call(V('n'), 'ft_strlen', [ast.addr('s0')]) }];
		const i = new Interpreter(m, driver, functions);
		i.run();
		assert.equal(i.error, null);
		assert.equal(m.getVar('n'), 2);
	});
});
