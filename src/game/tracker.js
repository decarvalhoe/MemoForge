// Tracker de maîtrise + répétition espacée (issue E4-4).
// Miroir jouable de TRACKER_PROGRESSION.md : trois états de maîtrise, et quand une brique
// atteint « chrono » (prête exam), on planifie des révisions J+1 / J+3 / J+7.
//
// Le stockage est INJECTABLE (localStorage par défaut) → le module est testable sans
// navigateur. Le temps `now` est aussi injectable → tests déterministes.

const DAY = 24 * 60 * 60 * 1000;

/** Les 3 états, du plus faible au plus fort (cf. TRACKER_PROGRESSION.md). */
export const STATES = ['none', 'compris', 'refait', 'chrono'];

/** Décalages de révision une fois « chrono » atteint. */
export const REVIEW_OFFSETS = [1 * DAY, 3 * DAY, 7 * DAY];

/**
 * Crée un tracker persistant.
 * @param {Storage} [storage]  backend clé/valeur (localStorage-like). Défaut : localStorage.
 * @param {string} [storageKey]
 */
export function createTracker(storage = globalThis.localStorage, storageKey = 'memoforge.tracker') {
	function load() {
		try {
			return JSON.parse(storage.getItem(storageKey)) || {};
		} catch {
			return {};
		}
	}
	function save(data) {
		storage.setItem(storageKey, JSON.stringify(data));
	}

	return {
		/** @returns {string} état d'une brique/niveau ('none' si inconnu). */
		getState(id) {
			const e = load()[id];
			return (e && e.state) || 'none';
		},

		/**
		 * Fixe l'état. Atteindre « chrono » (re)planifie les révisions J+1/J+3/J+7.
		 * @returns {object} l'entrée mise à jour.
		 */
		setState(id, state, now = Date.now()) {
			if (!STATES.includes(state)) throw new Error(`état inconnu : ${state}`);
			const data = load();
			const entry = data[id] || {};
			entry.state = state;
			if (state === 'chrono') {
				entry.acquiredAt = now;
				entry.reviews = REVIEW_OFFSETS.map((off) => ({ due: now + off, done: false }));
			}
			data[id] = entry;
			save(data);
			return entry;
		},

		/** @returns {string[]} ids ayant au moins une révision due (due<=now, non faite). */
		dueReviews(now = Date.now()) {
			const data = load();
			const out = [];
			for (const [id, e] of Object.entries(data)) {
				if (!e.reviews) continue;
				if (e.reviews.some((r) => !r.done && r.due <= now)) out.push(id);
			}
			return out;
		},

		/**
		 * Marque la plus ancienne révision due comme faite.
		 * @returns {boolean} vrai si une révision a été marquée.
		 */
		markReviewed(id, now = Date.now()) {
			const data = load();
			const e = data[id];
			if (!e || !e.reviews) return false;
			const next = e.reviews
				.filter((r) => !r.done && r.due <= now)
				.sort((a, b) => a.due - b.due)[0];
			if (!next) return false;
			next.done = true;
			save(data);
			return true;
		},

		/** @returns {boolean} vrai si toutes les révisions planifiées sont faites. */
		isConsolidated(id) {
			const e = load()[id];
			return !!(e && e.reviews && e.reviews.every((r) => r.done));
		},

		/** @returns {object} instantané complet (pour debug / UI). */
		all() {
			return load();
		},

		reset() {
			save({});
		}
	};
}
