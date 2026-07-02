// Internationalisation (E9-3 / #149). Le FRANÇAIS est la langue SOURCE : les chaînes vivent
// inline dans levels.js/world.js/les vues. L'anglais est une couche de SURCHARGE (src/i18n/
// en.js) appliquée par-dessus, sans toucher aux données source. Bascule persistée.
//
// Deux points d'entrée :
//   t(key)         → chaîne d'UI traduite (ou la clé si absente).
//   localize(obj, kind, id) → renvoie l'objet avec ses champs traduits (niveaux, régions).

import { EN } from '../i18n/en.js';

const KEY = 'memoforge.lang';
const PACKS = { en: EN };

let current = 'fr';

export function getLang() {
	return current;
}

export function setLang(lang) {
	current = (lang === 'en') ? 'en' : 'fr';
	try {
		globalThis.localStorage.setItem(KEY, current);
	} catch {
		/* stockage indisponible */
	}
	return current;
}

export function initLang() {
	try {
		if (globalThis.localStorage.getItem(KEY) === 'en')
			current = 'en';
	} catch {
		/* stockage indisponible */
	}
	return current;
}

/** Chaîne d'UI : renvoie la traduction pour la langue courante, ou la source `key`. */
export function t(key) {
	if (current === 'fr')
		return key;
	const ui = (PACKS.en && PACKS.en.ui) || {};
	return Object.prototype.hasOwnProperty.call(ui, key) ? ui[key] : key;
}

/**
 * Surcharge les champs traduisibles d'un objet source. `kind` = 'levels' | 'regions'.
 * Ne modifie jamais la source : renvoie une copie superficielle avec les champs traduits.
 */
export function localize(obj, kind, id = obj.id) {
	if (current === 'fr' || !PACKS.en)
		return obj;
	const table = PACKS.en[kind] || {};
	const tr = table[id];
	return tr ? { ...obj, ...tr } : obj;
}
