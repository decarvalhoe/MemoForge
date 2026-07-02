// Modèle de l'aventure RAM (issue E3-1).
// La carte = la mémoire, découpée en régions. Chaque région correspond à un concept de
// la Piscine et à une ou plusieurs « briques » (voir docs/BRIQUES.md). La progression suit
// l'axe canonique None -> write -> malloc -> structures : une région se déverrouille quand
// la précédente est résolue.
//
// Ce module est PUR (aucune dépendance au DOM) et data-driven : ajouter une région = une
// entrée dans REGIONS ; rattacher un niveau = ajouter son id dans `levelIds`.
import { LEVELS } from './levels.js';

/**
 * @typedef {Object} Region
 * @property {string} id            identifiant stable de la région
 * @property {string} name          nom affiché
 * @property {string} addr          adresse « saveur » (flavor) pour la carte
 * @property {string} module        module(s) Piscine couvert(s)
 * @property {string[]} briques     briques travaillées (B1..B12)
 * @property {string[]} levelIds    ids de niveaux rattachés (peut être vide = à venir)
 * @property {string|null} unlock   région qui déverrouille celle-ci (null = point de départ)
 */

/** @type {Region[]} */
export const REGIONS = [
	{ id: 'r1', name: 'Casiers & adresses', addr: '0x0000 · pile basse', module: 'C01', briques: ['B6'], levelIds: ['1-1', '1-2', '1-3', 'ptr-1', 'ptr-2', 'ptr-3'], unlock: null },
	{ id: 'r2', name: 'Tableaux & échange', addr: '0x0040', module: 'C01', briques: ['B6'], levelIds: ['2-1'], unlock: 'r1' },
	{ id: 'r3', name: 'Sortie & ASCII', addr: 'write · 0x0080', module: 'C00/C04', briques: ['B1', 'B3'], levelIds: ['s-1', 'io-1', 'io-2', 'io-3'], unlock: 'r2' },
	{ id: 'r4', name: 'Chaînes & bornes', addr: "'\\0' · 0x00C0", module: 'C02/C03', briques: ['B2', 'B7'], levelIds: ['4-1', 'str-1', 'str-2', 'strn-1', 'while-1', 'chr-1', 'chr-2', 'chr-3', 'cmp-1', 'cat-1'], unlock: 'r3' },
	{ id: 'r5', name: 'Conversion nombre↔texte', addr: '0x0100', module: 'C04', briques: ['B3', 'B4', 'B5'], levelIds: ['conv-1', 'conv-2', 'conv-3', 'mem-1'], unlock: 'r4' },
	{ id: 'r6', name: 'Mémoire dynamique — le Tas', addr: 'malloc/free · 0x1388', module: 'C07', briques: ['B8'], levelIds: ['3-1', '3-2', 'dup-1', 'range-1', 'split-1', 'dang-1', 'sub-1', 'join-1'], unlock: 'r5' },
	{ id: 'r7', name: 'Récursivité', addr: 'la pile · 0x2000', module: 'C05', briques: ['B9'], levelIds: ['rec-1', 'rec-2', 'pow-1', 'fib-1', 'prime-1'], unlock: 'r6' },
	{ id: 'r9', name: 'Listes & arbres', addr: '->next · 0x4000', module: 'C12/C13', briques: ['B10'], levelIds: ['l-1', 'lst-1', 'lst-2', 'each-1', 'each-2'], unlock: 'r7' },
	{ id: 'r10', name: 'Fichiers & syscalls', addr: 'fd · 0x5000', module: 'C10', briques: ['B12'], levelIds: ['f-1'], unlock: 'r9' }
];

const BY_ID = Object.fromEntries(REGIONS.map((r) => [r.id, r]));

/** @returns {Region|null} la région contenant ce niveau, ou null. */
export function regionOfLevel(levelId) {
	return REGIONS.find((r) => r.levelIds.includes(levelId)) || null;
}

/** @returns {string[]} les briques travaillées par ce niveau (via sa région). */
export function briquesOfLevel(levelId) {
	const r = regionOfLevel(levelId);
	return r ? r.briques.slice() : [];
}

/** @returns {string[]} tous les ids de niveaux, dans l'ordre de progression des régions. */
export function levelIdsInOrder() {
	return REGIONS.flatMap((r) => r.levelIds);
}

/**
 * Une région est « résolue » si tous ses niveaux le sont. Une région SANS niveau (à venir)
 * est résolue par vacuité — elle ne bloque donc jamais la chaîne de progression.
 * @param {string} regionId
 * @param {Set<string>} solvedLevelIds
 */
export function isRegionSolved(regionId, solvedLevelIds) {
	const r = BY_ID[regionId];
	if (!r) return false;
	return r.levelIds.every((id) => solvedLevelIds.has(id));
}

/**
 * Une région est déverrouillée si elle est le point de départ, ou si la région qui la
 * déverrouille est à la fois RÉSOLUE **et** elle-même déverrouillée. La condition est donc
 * TRANSITIVE : une région vide (résolue par vacuité) laisse passer, mais une région à
 * contenu non résolue en amont bloque toute la suite — pas d'« îlots » débloqués.
 * @param {string} regionId
 * @param {Set<string>} solvedLevelIds
 */
export function isRegionUnlocked(regionId, solvedLevelIds) {
	const r = BY_ID[regionId];
	if (!r) return false;
	if (r.unlock === null) return true;
	return isRegionSolved(r.unlock, solvedLevelIds) && isRegionUnlocked(r.unlock, solvedLevelIds);
}

/**
 * Statut d'une région pour l'affichage de la carte.
 * @param {string} regionId
 * @param {Set<string>} solvedLevelIds
 * @returns {'locked'|'coming'|'current'|'solved'}
 */
export function regionStatus(regionId, solvedLevelIds) {
	const r = BY_ID[regionId];
	if (!r) return 'locked';
	if (!isRegionUnlocked(regionId, solvedLevelIds)) return 'locked';
	if (r.levelIds.length === 0) return 'coming';        // déverrouillée mais pas de contenu
	return isRegionSolved(regionId, solvedLevelIds) ? 'solved' : 'current';
}

/** @returns {Region|null} la première région déverrouillée non entièrement résolue. */
export function currentRegion(solvedLevelIds) {
	return REGIONS.find((r) => regionStatus(r.id, solvedLevelIds) === 'current') || null;
}
