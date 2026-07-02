// Le modèle octet (E6-7, cours M1/M2) — la signature du cours rendue en données.
//
// Quatre faits : la RAM est une suite de cases d'1 octet (0-255) ; une valeur > 255 s'étale
// sur plusieurs cases consécutives, en LITTLE-ENDIAN (poids faible à l'adresse basse) ; les
// entiers signés sont en complément à deux (-1 → ff ff ff ff) ; un type = une taille.
//
// Module PUR : décompose une valeur en ses octets. Aucune dépendance moteur/DOM.

import { WORD } from '../engine/memory.js';

/** Code d'un char (chaîne d'un caractère) ; nombre inchangé. */
function asInt(v) {
	return (typeof v === 'string' && v.length === 1) ? v.charCodeAt(0) : (v || 0);
}

/**
 * Octets d'une valeur, LITTLE-ENDIAN (octet de poids faible en premier), en complément à
 * deux pour les négatifs. Ex. 1000 → [232, 3, 0, 0] (0x000003E8, rangé à l'envers).
 * @param {number|string} value
 * @param {number} size  nombre d'octets du type (défaut : la taille d'un mot)
 * @returns {number[]}
 */
export function bytesOf(value, size = WORD) {
	const span = Math.pow(256, size);
	let v = asInt(value) % span;
	if (v < 0)
		v += span; // complément à deux (wrap)
	const out = [];
	for (let i = 0; i < size; i++) {
		out.push(v % 256);
		v = Math.floor(v / 256);
	}
	return out;
}

/** Octets en hexa, séparés par des espaces. Ex. [232, 3, 0, 0] → "e8 03 00 00". */
export function toHex(bytes) {
	return bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ');
}

/** Représentation « comme le cours » : valeur, hexa compact, octets little-endian. */
export function explain(value, size = WORD) {
	const bytes = bytesOf(value, size);
	const compact = '0x' + [...bytes].reverse().map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
	return { value: asInt(value), compact, bytes, hex: toHex(bytes) };
}
