// Mode examen (issue E4-5) : une séquence de niveaux « critiques » (le noyau exam de
// l'analyse — pointeurs, swap, sortie, atoi), enchaînés avec un CHRONO et SANS indice,
// terminée par un SCORE. On peut « passer » une question (elle compte comme non résolue).
//
// Data-only : réutilise des niveaux existants (par id) — pas de nouveau contenu.
export const EXAM = {
	title: 'Examen — noyau critique',
	levelIds: ['1-1', '1-2', '1-3', 's-1', 'conv-1']
};
