// Bascule thème clair/sombre (issue E1-5).
// Défaut = sombre (aucune classe sur <html>) ; `.theme-light` active la variante jour, dont
// les tokens sont déjà définis dans styles/tokens/colors.css. Choix persisté en localStorage.
//
// Logique pure (storage/root injectables) → testable sans navigateur ; le câblage DOM en bas
// est ignoré hors navigateur.

import { t as tr } from '../game/i18n.js';
export const THEME_KEY = 'memoforge.theme';

/** @param {'dark'|'light'} current @returns {'dark'|'light'} */
export function nextTheme(current) {
	return current === 'light' ? 'dark' : 'light';
}

/** @param {Storage} [storage] @returns {'dark'|'light'} thème stocké (défaut 'dark'). */
export function readTheme(storage = globalThis.localStorage) {
	try {
		return storage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
	} catch {
		return 'dark';
	}
}

/** Applique le thème au <html> (ou à un root injecté). */
export function applyTheme(theme, root = document.documentElement) {
	root.classList.toggle('theme-light', theme === 'light');
}

/** Bascule, persiste, applique. @returns {'dark'|'light'} le nouveau thème. */
export function toggleTheme(storage = globalThis.localStorage, root = document.documentElement) {
	const t = nextTheme(readTheme(storage));
	try { storage.setItem(THEME_KEY, t); } catch { /* stockage indisponible : on applique quand même */ }
	applyTheme(t, root);
	return t;
}

// --- câblage DOM (ignoré hors navigateur / en test) ---
if (typeof document !== 'undefined') {
	const btn = document.getElementById('theme-toggle');
	if (btn) {
		const sync = (t) => {
			btn.setAttribute('aria-pressed', String(t === 'light'));
			btn.textContent = t === 'light' ? ('☾ ' + tr('sombre')) : ('☀ ' + tr('clair'));
		};
		const initial = readTheme();
		applyTheme(initial);
		sync(initial);
		btn.addEventListener('click', () => sync(toggleTheme()));
	}
}
