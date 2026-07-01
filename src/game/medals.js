// Médailles d'optimisation (issue E3-6). Fonctions PURES : à partir du résultat d'une
// exécution et des seuils « par » du niveau, calcule quelles médailles sont gagnées.
// Étend la notion d'« étoiles » actuelle. Aucune dépendance au DOM ni au moteur : on lui
// passe des nombres déjà mesurés, ce qui la rend trivialement testable.

/**
 * @typedef {Object} RunResult
 * @property {boolean} goalMet       la cible est atteinte
 * @property {boolean} clean         aucune erreur ni fuite mémoire
 * @property {number}  instructions  nombre d'instructions du programme
 * @property {number}  steps         nombre de pas d'exécution
 * @property {number}  cells         nombre de casiers utilisés
 *
 * @typedef {Object} Par  seuils « au par » du niveau (chaque champ est optionnel)
 * @property {number} [instructions]
 * @property {number} [steps]
 * @property {number} [cells]
 *
 * @typedef {Object} Medal
 * @property {string}  key
 * @property {string}  label
 * @property {boolean} earned
 */

/**
 * @param {RunResult} r
 * @param {Par} [par]
 * @returns {Medal[]}
 */
export function computeMedals(r, par = {}) {
	const solved = !!r.goalMet && !!r.clean;
	const medals = [{ key: 'solved', label: 'résolu', earned: solved }];

	// Les médailles d'optimisation exigent d'abord d'avoir résolu proprement.
	const under = (v, limit) => solved && typeof v === 'number' && v <= limit;

	if (par.instructions != null)
		medals.push({ key: 'instr', label: `≤ ${par.instructions} instructions`, earned: under(r.instructions, par.instructions) });
	if (par.steps != null)
		medals.push({ key: 'steps', label: `≤ ${par.steps} pas d'exécution`, earned: under(r.steps, par.steps) });
	if (par.cells != null)
		medals.push({ key: 'cells', label: `≤ ${par.cells} casiers utilisés`, earned: under(r.cells, par.cells) });

	return medals;
}

/** @returns {number} nombre de médailles gagnées. */
export function medalScore(medals) {
	return medals.filter((m) => m.earned).length;
}

/** @returns {boolean} vrai si toutes les médailles proposées sont gagnées (« parfait »). */
export function isPerfect(medals) {
	return medals.length > 0 && medals.every((m) => m.earned);
}
