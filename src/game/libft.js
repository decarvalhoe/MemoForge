// « Ta libft » (E6-8) — l'inventaire des ft_ que le joueur a forgées lui-même.
//
// Esprit libft : les fonctions qu'on utilise, on est capables de les écrire nous-mêmes.
// Quand un niveau « écris ft_xxx » (assembleInto) est résolu, le CORPS assemblé par le
// joueur entre dans son inventaire ; les niveaux suivants peuvent l'appeler comme brique.
// La progression du jeu = ta boîte à outils qui grandit — exactement la vraie Piscine.
//
// Modèle PUR : l'inventaire est un objet `nom -> { name, params, body }` (body = AST, donc
// sérialisable en JSON). La persistance (localStorage) est une couche mince, injectable.

const KEY = 'memoforge.libft';

export function emptyLibft() {
	return {};
}

/** Forge (ou re-forge) une fonction : renvoie un NOUVEL inventaire (immuable). */
export function forge(inv, name, params, body) {
	return { ...inv, [name]: { name, params: params || [], body } };
}

export function hasForged(inv, name) {
	return Object.prototype.hasOwnProperty.call(inv, name);
}

export function recall(inv, name) {
	return hasForged(inv, name) ? inv[name] : null;
}

export function forgedNames(inv) {
	return Object.keys(inv);
}

/**
 * Registre de fonctions pour l'interpréteur d'un niveau. Base : les fonctions de référence
 * fournies par le niveau (`refs`, ex. add/sub/emit ou un repli si pas encore forgé). Par-
 * dessus : la version FORGÉE par le joueur pour chaque ft_ demandée (elle prime — on joue
 * avec SA libft). Un niveau reste ainsi jouable même sans inventaire (repli), mais dès que
 * le joueur a forgé la fonction, c'est la sienne qui tourne.
 */
export function functionsFor(inv, names = [], refs = {}) {
	const out = { ...refs };
	for (const n of names)
		if (hasForged(inv, n))
			out[n] = recall(inv, n);
	return out;
}

/** Les ft_ demandées qu'il reste à forger (ni forgées, ni fournies en référence). */
export function missing(inv, names = [], refs = {}) {
	return names.filter((n) => !hasForged(inv, n) && !Object.prototype.hasOwnProperty.call(refs, n));
}

// ── Persistance (storage = objet localStorage-like, ou null/absent) ──────────
export function loadLibft(storage) {
	try {
		return JSON.parse(storage.getItem(KEY)) || {};
	} catch {
		return {};
	}
}

export function saveLibft(storage, inv) {
	try {
		storage.setItem(KEY, JSON.stringify(inv));
	} catch {
		/* stockage indisponible (mode privé, harnais…) : l'inventaire reste en mémoire */
	}
}
