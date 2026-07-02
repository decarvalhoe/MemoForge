// Statistiques d'apprentissage LOCALES et PRIVÉES (E9-4). Aucun réseau, aucune donnée
// personnelle : tout reste dans le navigateur (localStorage). But : repérer les niveaux
// (et pièges) qui bloquent, pour la réflexion du joueur — pas pour un serveur.
//
// Modèle PUR : opère sur un objet stats immuable. La persistance est une couche mince.

const KEY = 'memoforge.stats';

export function emptyStats() {
	return { levels: {} };
}

/**
 * Enregistre une tentative sur un niveau. @param {{passed:boolean, pitfall?:string}} r
 * @returns {object} un NOUVEL objet stats (immuable).
 */
export function record(stats, id, { passed = false, pitfall = null } = {}) {
	const prev = stats.levels[id] || { attempts: 0, fails: 0, solved: false, pitfalls: {} };
	const entry = {
		attempts: prev.attempts + 1,
		fails: prev.fails + (passed ? 0 : 1),
		solved: prev.solved || passed,
		pitfalls: { ...prev.pitfalls }
	};
	if (pitfall)
		entry.pitfalls[pitfall] = (entry.pitfalls[pitfall] || 0) + 1;
	return { ...stats, levels: { ...stats.levels, [id]: entry } };
}

/** @returns {{id:string, fails:number}[]} les niveaux les plus retravaillés (fails > 0). */
export function hardest(stats, n = 3) {
	return Object.entries(stats.levels)
		.map(([id, e]) => ({ id, fails: e.fails }))
		.filter((x) => x.fails > 0)
		.sort((a, b) => b.fails - a.fails)
		.slice(0, n);
}

/** @returns {{levels:number, solved:number, attempts:number}} un résumé pour le joueur. */
export function summary(stats) {
	const entries = Object.values(stats.levels);
	return {
		levels: entries.length,
		solved: entries.filter((e) => e.solved).length,
		attempts: entries.reduce((a, e) => a + e.attempts, 0)
	};
}

// ── Persistance locale (storage = localStorage-like, ou null/absent) ─────────
export function loadStats(storage) {
	try {
		return JSON.parse(storage.getItem(KEY)) || emptyStats();
	} catch {
		return emptyStats();
	}
}

export function saveStats(storage, stats) {
	try {
		storage.setItem(KEY, JSON.stringify(stats));
	} catch {
		/* stockage indisponible : les stats restent en mémoire de session */
	}
}
