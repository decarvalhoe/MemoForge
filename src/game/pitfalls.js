// Feedback pédagogique = les pièges de l'analyse (issue E4-3).
// Traduit les erreurs brutes du moteur (RuntimeError) et les fuites mémoire en messages
// qui enseignent — la version jouable de l'anti-sèche §7 de ANALYSE_PISCINE_C.md.
//
// Module de DONNÉES pur : il ne connaît ni le moteur ni le DOM. On lui passe un message
// d'erreur (string) ou un nombre de fuites, il renvoie de quoi remplir un FeedbackBanner
// ({ tone, title, hint }). L'appariement se fait sur des motifs stables des messages moteur.

/**
 * @typedef {Object} Feedback
 * @property {'success'|'crash'|'leak'} tone
 * @property {string} title
 * @property {string} hint
 */

/** Pièges reconnus, du plus spécifique au plus générique (premier match gagne). */
export const PITFALLS = [
	{ id: 'null-deref', match: /NULL/, tone: 'crash', title: 'CRASH — déréférencement de NULL',
		hint: "Un pointeur à NULL ne pointe sur rien. As-tu d'abord fait p = &x (ou malloc) avant *p ?" },
	{ id: 'use-after-free', match: /déjà libéré/, tone: 'crash', title: 'CRASH — accès après libération',
		hint: 'Ce casier a été rendu par free : on ne peut plus le lire ni y écrire.' },
	{ id: 'double-free', match: /free invalide/, tone: 'crash', title: 'CRASH — free invalide',
		hint: "On ne libère qu'une adresse allouée, et une seule fois (double free = crash)." },
	{ id: 'bad-addr', match: /adresse invalide/, tone: 'crash', title: 'CRASH — adresse invalide',
		hint: "Ce pointeur ne contient pas l'adresse d'un casier valide." },
	{ id: 'unknown-var', match: /variable inconnue/, tone: 'crash', title: 'ERREUR — variable inconnue',
		hint: 'Cette variable n\'existe pas dans ce niveau.' }
];

const GENERIC_CRASH = { tone: 'crash', title: 'CRASH', hint: "L'exécution s'est arrêtée sur une erreur." };

/**
 * Explique un message d'erreur moteur.
 * @param {string|null|undefined} errorMessage
 * @returns {Feedback|null} null si pas d'erreur.
 */
export function explainError(errorMessage) {
	if (!errorMessage) return null;
	const p = PITFALLS.find((x) => x.match.test(errorMessage));
	if (!p) return { ...GENERIC_CRASH, hint: errorMessage };
	return { tone: p.tone, title: p.title, hint: p.hint };
}

/**
 * Explique une fuite mémoire (casiers alloués jamais libérés).
 * @param {number} leakCount
 * @returns {Feedback|null} null si aucune fuite.
 */
export function explainLeak(leakCount) {
	if (!leakCount || leakCount < 1) return null;
	const s = leakCount > 1 ? 's' : '';
	return {
		tone: 'leak',
		title: 'FUITE MÉMOIRE',
		hint: `${leakCount} casier${s} alloué${s} n'${leakCount > 1 ? 'ont' : 'a'} jamais été libéré${s} : un malloc sans free.`
	};
}

/**
 * Feedback prioritaire pour un résultat d'exécution : crash > fuite > succès.
 * @param {{error?:string|null, leaks?:number, goalMet?:boolean}} r
 * @returns {Feedback}
 */
export function explainRun(r = {}) {
	return (
		explainError(r.error) ||
		explainLeak(r.leaks) ||
		(r.goalMet
			? { tone: 'success', title: 'RÉUSSITE', hint: 'Cible atteinte, sans erreur ni fuite.' }
			: { tone: 'crash', title: 'CIBLE NON ATTEINTE', hint: 'Le résultat ne correspond pas encore. Réessaie.' })
	);
}
