// Tests de la bascule de thème (E1-5). Logique pure : storage & root injectés → sans
// navigateur (le câblage DOM de theme.js est ignoré car `document` est undefined ici). node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { nextTheme, readTheme, applyTheme, toggleTheme, THEME_KEY } from '../../src/ui/theme.js';

function fakeStorage(init = {}) {
	const store = { ...init };
	return {
		getItem: (k) => (k in store ? store[k] : null),
		setItem: (k, v) => { store[k] = String(v); },
		_get: (k) => store[k]
	};
}

function fakeRoot() {
	const s = new Set();
	return {
		classList: {
			toggle: (c, on) => { if (on) s.add(c); else s.delete(c); },
			contains: (c) => s.has(c)
		}
	};
}

describe('nextTheme', () => {
	test('inverse le thème', () => {
		assert.equal(nextTheme('dark'), 'light');
		assert.equal(nextTheme('light'), 'dark');
	});
});

describe('readTheme', () => {
	test('défaut = dark quand rien de stocké', () => {
		assert.equal(readTheme(fakeStorage()), 'dark');
	});
	test('lit light quand stocké', () => {
		assert.equal(readTheme(fakeStorage({ [THEME_KEY]: 'light' })), 'light');
	});
	test('toute autre valeur retombe sur dark', () => {
		assert.equal(readTheme(fakeStorage({ [THEME_KEY]: 'bleu' })), 'dark');
	});
});

describe('applyTheme', () => {
	test('light ajoute la classe, dark la retire', () => {
		const root = fakeRoot();
		applyTheme('light', root);
		assert.ok(root.classList.contains('theme-light'));
		applyTheme('dark', root);
		assert.equal(root.classList.contains('theme-light'), false);
	});
});

describe('toggleTheme', () => {
	test('dark → light : persiste et applique', () => {
		const storage = fakeStorage();
		const root = fakeRoot();
		const t = toggleTheme(storage, root);
		assert.equal(t, 'light');
		assert.equal(storage._get(THEME_KEY), 'light');
		assert.ok(root.classList.contains('theme-light'));
	});
	test('light → dark : retire la classe', () => {
		const storage = fakeStorage({ [THEME_KEY]: 'light' });
		const root = fakeRoot();
		root.classList.toggle('theme-light', true);
		const t = toggleTheme(storage, root);
		assert.equal(t, 'dark');
		assert.equal(root.classList.contains('theme-light'), false);
	});
});
