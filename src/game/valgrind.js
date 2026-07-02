// Verdict façon valgrind (E6-5, cours M9). Les bugs du tas sont silencieux → valgrind est
// le filet, et l'objectif 42 est un verdict précis : « definitely lost: 0 bytes ·
// ERROR SUMMARY: 0 errors ». Ce module TRADUIT un résultat d'exécution en ce rapport.
//
// Module de DONNÉES pur : on lui passe des nombres déjà mesurés (blocs/octets fuités,
// erreurs), il rend de quoi afficher un mini-rapport. Aucune dépendance au moteur ni au DOM.

/**
 * @param {{blocks?:number, bytes?:number, errors?:number}} m  mesures d'exécution
 * @returns {{clean:boolean, lost:string, summary:string, lines:string[]}}
 */
export function valgrindReport({ blocks = 0, bytes = 0, errors = 0 } = {}) {
	const clean = blocks === 0 && errors === 0;
	const lost = `definitely lost: ${bytes} bytes in ${blocks} blocks`;
	const summary = `ERROR SUMMARY: ${errors} errors from ${errors} contexts`;
	return {
		clean,
		lost,
		summary,
		lines: clean
			? ['All heap blocks were freed -- no leaks are possible', 'ERROR SUMMARY: 0 errors from 0 contexts']
			: [lost, summary]
	};
}

/**
 * Mesure les fuites d'une mémoire moteur en unités valgrind : un bloc = un malloc non
 * libéré ; les octets = cellules vivantes × WORD. (mem.blocks : base → taille des blocs
 * encore alloués ; mem.leaks() : cellules encore allouées.)
 * @param {import('../engine/memory.js').Memory} mem
 * @param {number} word  taille d'une cellule en octets (WORD)
 * @param {boolean} hasError  une RuntimeError s'est-elle produite
 */
export function measureLeaks(mem, word, hasError) {
	return {
		blocks: mem.blocks.size,
		bytes: mem.leaks().length * word,
		errors: hasError ? 1 : 0
	};
}
