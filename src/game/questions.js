// « Questions à se poser », par brique (issue E4-6).
// Méthode des fiches de révision (fiches/FICHES_QUESTIONS.md) : on n'apprend pas à réciter
// une solution, on apprend à RECONSTRUIRE la logique en répondant à quelques questions —
// c'est ce qui survit à la pression d'exam. Ici, une poignée de questions par brique.
//
// Module de DONNÉES pur, keyé par brique (B1..B12) pour rester autonome : le lien
// niveau -> brique vit dans world.js et sera câblé à l'intégration.

/** @type {Record<string, string[]>} */
export const QUESTIONS = {
	B1: [
		'Comment écris-tu UN seul caractère ? (le primitif : write(1, &c, 1))',
		'Tout affichage se ramène à quoi ?'
	],
	B2: [
		'Comment sais-tu que la chaîne est finie ? (le sentinel \'\\0\')',
		'Que teste exactement la condition de ta boucle while (str[i]) ?'
	],
	B3: [
		'Comment passes-tu d\'un chiffre à son caractère ? (c + \'0\') et inversement (c - \'0\') ?'
	],
	B4: [
		'Comment extrais-tu le dernier chiffre d\'un nombre ? (n % base)',
		'Comment passes-tu au chiffre suivant ? (n / base)'
	],
	B5: [
		'Comment reconstruis-tu un nombre chiffre par chiffre ? (res = res * base + (c - \'0\'))',
		'Quel piège avec INT_MIN et le signe ?'
	],
	B6: [
		'Pourquoi as-tu besoin d\'un tmp pour échanger deux valeurs ?',
		'Que se passe-t-il si tu écris a = b avant d\'avoir sauvegardé a ?'
	],
	B7: [
		'Quelle est ta condition d\'arrêt : la borne n, le \'\\0\', ou les deux (i < n && str[i]) ?'
	],
	B8: [
		'As-tu prévu la place du \'\\0\' ? (malloc(len + 1))',
		'As-tu testé le retour de malloc (NULL) ?',
		'Où est le free correspondant ?'
	],
	B9: [
		'Quel est ton cas de base (la condition d\'arrêt de la récursion) ?',
		'Chaque appel récursif se rapproche-t-il du cas de base ?'
	],
	B10: [
		'Comment passes-tu au maillon suivant ? (->next)',
		'Gardes-tu une référence sur next AVANT de libérer le nœud courant ?',
		'Que fais-tu si la liste est vide ?'
	],
	B11: [
		'Quel est le prototype exact du pointeur de fonction ? (int (*f)(int))',
		'Comment appelles-tu la fonction reçue en paramètre ? (f(x))'
	],
	B12: [
		'Quel est l\'ordre : open -> read (en boucle) -> close ?',
		'Gères-tu les erreurs de chaque syscall et la fermeture du descripteur ?'
	]
};

/** @returns {string[]} les questions d'une brique (vide si inconnue). */
export function questionsForBrique(brique) {
	return (QUESTIONS[brique] || []).slice();
}

/**
 * Rassemble (sans doublon, dans l'ordre) les questions de plusieurs briques —
 * utile pour un niveau qui en travaille plusieurs.
 * @param {string[]} briques
 * @returns {string[]}
 */
export function questionsForBriques(briques = []) {
	const seen = new Set();
	const out = [];
	for (const b of briques)
		for (const q of questionsForBrique(b))
			if (!seen.has(q)) { seen.add(q); out.push(q); }
	return out;
}

/** @returns {string[]} toutes les briques couvertes. */
export function coveredBriques() {
	return Object.keys(QUESTIONS);
}
