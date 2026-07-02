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

// ── Persistance (pure, injectable) ─────────────────────────────────────────
function read(storage, key) {
	try {
		return JSON.parse(storage.getItem(key)) || {};
	} catch {
		return {};
	}
}
function write(storage, key, data) {
	storage.setItem(key, JSON.stringify(data));
}

// ── Logique d'état (pure : opère sur l'objet `data`, sans I/O) ──────────────
function applyState(data, id, state, now) {
	if (!STATES.includes(state)) throw new Error(`état inconnu : ${state}`);
	const entry = data[id] || {};
	entry.state = state;
	if (state === 'chrono') {
		entry.acquiredAt = now;
		entry.reviews = REVIEW_OFFSETS.map((off) => ({ due: now + off, done: false }));
	}
	data[id] = entry;
	return entry;
}
function collectDue(data, now) {
	return Object.entries(data)
		.filter(([, e]) => e.reviews && e.reviews.some((r) => !r.done && r.due <= now))
		.map(([id]) => id);
}
function applyReviewed(entry, now) {
	if (!entry || !entry.reviews) return false;
	const next = entry.reviews.filter((r) => !r.done && r.due <= now).sort((a, b) => a.due - b.due)[0];
	if (!next) return false;
	next.done = true;
	return true;
}

/**
 * Crée un tracker persistant. Fine couche d'I/O au-dessus des helpers purs ci-dessus.
 * @param {Storage} [storage]  backend clé/valeur (localStorage-like). Défaut : localStorage.
 * @param {string} [storageKey]
 */
export function createTracker(storage = globalThis.localStorage, storageKey = 'memoforge.tracker') {
	const load = () => read(storage, storageKey);
	const save = (data) => write(storage, storageKey, data);
	return {
		/** @returns {string} état d'une brique/niveau ('none' si inconnu). */
		getState(id) {
			return (load()[id] || {}).state || 'none';
		},
		/** Fixe l'état ; « chrono » (re)planifie les révisions. @returns {object} l'entrée. */
		setState(id, state, now = Date.now()) {
			const data = load();
			const entry = applyState(data, id, state, now);
			save(data);
			return entry;
		},
		/** @returns {string[]} ids ayant au moins une révision due (due<=now, non faite). */
		dueReviews(now = Date.now()) {
			return collectDue(load(), now);
		},
		/** Marque la plus ancienne révision due. @returns {boolean} vrai si marquée. */
		markReviewed(id, now = Date.now()) {
			const data = load();
			if (!applyReviewed(data[id], now)) return false;
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
