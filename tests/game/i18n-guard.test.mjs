// Garde i18n (E10-1) — aucune chaîne visible par le joueur n'est en dur. Le français est la
// source, l'anglais une surcharge : toute chaîne user-facing DOIT passer par t() pour être
// traduisible. Cette garde scanne les vues et échoue si un littéral de « prose » rendu à
// l'écran (valeur d'une propriété non structurelle) n'est pas routé par t().
// C'est le filet qui empêche le retour des oublis de traduction (cf. #160, DEFAULT_NOTE).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { EN } from '../../src/i18n/en.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Registre des chaînes traduisibles : les clés du pack EN (le français EST la clé). Un texte
// user-facing est « en règle » s'il est enregistré ici — qu'il soit passé à t() directement
// ou stocké comme clé-source dans une table (STATE_LABELS, DEFAULT_NOTE) puis t()'d au rendu.
const REGISTERED = new Set(Object.keys(EN.ui || {}));

// Un littéral de chaîne (gère les échappements \' et \").
const STRING_RE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g;
// « Prose » = une suite d'au moins 3 lettres (accents inclus). Distingue un texte humain
// d'un glyphe/symbole (« ⟳ », « ← », « n° »).
const PROSE_RE = /[A-Za-zÀ-ÖØ-öø-ÿ]{3,}/;

// Clés STRUCTURELLES : leur valeur est du code (CSS, classe, id, enum), jamais du texte
// affiché. Un littéral en valeur de ces clés est légitime et ignoré.
const STRUCTURAL = new Set([
	'class', 'style', 'id', 'href', 'src', 'type', 'role', 'tag', 'name', 'for', 'rel',
	'd', 'viewBox', 'xmlns', 'lang', 'dir', 'key', 'tone', 'state', 'status', 'kind',
	'variant', 'glyph', 'code', 'effectAllowed', 'dropEffect', 'draggable', 'disabled',
	'width', 'height', 'align', 'data', 'value', 'group',
	// Propriétés CSS (objets de style : Object.assign(el.style, {...})).
	'position', 'overflow', 'pointerEvents', 'inset', 'zIndex', 'top', 'left', 'right',
	'bottom', 'margin', 'padding', 'color', 'background', 'border', 'display', 'flex',
	'font', 'fontFamily', 'opacity', 'transform', 'transition', 'cursor', 'gap'
]);
// Clés-chaîne (entre guillemets) qui rendent bien du texte user-facing : on les surveille.
const QUOTED_TEXT_KEYS = new Set(['aria-label', 'placeholder', 'alt', 'title', 'aria-description']);

// Chaînes techniques identiques dans les deux langues (sortie d'outil, nom propre) :
// volontairement non traduites. Toute addition ici doit être un vrai invariant de locale.
const ALLOW = new Set([
	'// valgrind --leak-check=full',
	'==memoforge== '
]);
// Fichiers exemptés : la page de style est un outil de dev (non expédié au joueur).
const SKIP = new Set(['styleguide.js']);

function collectJs(dir) {
	const out = [];
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) out.push(...collectJs(p));
		else if (name.endsWith('.js') && !SKIP.has(name)) out.push(p);
	}
	return out;
}

// Sources user-facing : toutes les vues + le contrôleur de jeu (qui compose des libellés).
const FILES = [...collectJs(join(ROOT, 'src', 'ui')), join(ROOT, 'src', 'game', 'game.js')];

// La clé qui précède un littéral en position de valeur (« word: » ou « 'word': »), ou null
// si le littéral n'est pas une valeur de propriété (arg, élément de tableau, branche ?:).
function keyBefore(line, litIndex) {
	let j = litIndex - 1;
	while (j >= 0 && line[j] === ' ') j--;
	if (j < 0 || line[j] !== ':') return null;      // pas en position de valeur
	const head = line.slice(0, j);                  // tout ce qui précède le « : »
	const m = head.match(/(['"]?)([A-Za-z][\w-]*)\1\s*$/);
	if (!m) return null;
	// Une clé entre guillemets n'est un vrai attribut de texte que si elle est déclarée ;
	// sinon c'est la branche gauche d'un ternaire (« ? 'a' : 'b' ») → on ignore.
	if (m[1] && !QUOTED_TEXT_KEYS.has(m[2])) return null;
	return m[2];
}

function violationsIn(file) {
	const src = readFileSync(file, 'utf8');
	const found = [];
	src.split('\n').forEach((line, idx) => {
		const trimmed = line.trim();
		if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
		let s;
		STRING_RE.lastIndex = 0;
		while ((s = STRING_RE.exec(line))) {
			const inner = s[0].slice(1, -1);
			if (!PROSE_RE.test(inner) || ALLOW.has(inner)) continue;
			const key = keyBefore(line, s.index);
			if (key === null || STRUCTURAL.has(key)) continue;   // pas un texte affiché
			if (REGISTERED.has(inner)) continue;                 // enregistré → traduisible
			found.push({ line: idx + 1, key, literal: s[0] });
		}
	});
	return found;
}

// Second volet : toute clé passée à t('…') littéralement DOIT exister dans le pack EN.
// Sinon t() retombe sur le français en mode anglais — une fuite silencieuse (faute de
// frappe, clé désynchronisée). Les appels dynamiques t(variable) ne sont pas vérifiables.
const T_CALL_RE = /\bt\(\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*\)/g;

function unregisteredKeysIn(file) {
	const src = readFileSync(file, 'utf8');
	const bad = [];
	src.split('\n').forEach((line, idx) => {
		let m;
		T_CALL_RE.lastIndex = 0;
		while ((m = T_CALL_RE.exec(line))) {
			// Décode le littéral source (\n, \', …) pour comparer à la clé réelle du pack.
			let key;
			try { key = JSON.parse('"' + m[1].slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"') + '"'); }
			catch { key = m[1].slice(1, -1); }
			if (!PROSE_RE.test(key) || ALLOW.has(key)) continue;   // glyphe/technique
			if (!REGISTERED.has(key)) bad.push({ line: idx + 1, key: m[1] });
		}
	});
	return bad;
}

describe('garde i18n — chaque clé t(…) est enregistrée dans le pack EN', () => {
	for (const file of FILES) {
		const rel = relative(ROOT, file).replace(/\\/g, '/');
		test(`${rel} — aucune clé t() orpheline`, () => {
			const bad = unregisteredKeysIn(file);
			assert.equal(
				bad.length, 0,
				`clé(s) t() absente(s) du pack EN dans ${rel} :\n` +
				bad.map((x) => `  L${x.line}: t(${x.key})`).join('\n') +
				'\n→ ajoute la traduction dans src/i18n/en.js (sinon l\'anglais affiche le français).'
			);
		});
	}
});

describe('garde i18n — aucune chaîne user-facing en dur', () => {
	for (const file of FILES) {
		const rel = relative(ROOT, file).replace(/\\/g, '/');
		test(`${rel} — tout texte affiché passe par t()`, () => {
			const v = violationsIn(file);
			assert.equal(
				v.length, 0,
				`chaîne(s) non traduisible(s) dans ${rel} :\n` +
				v.map((x) => `  L${x.line} (${x.key}): ${x.literal}`).join('\n') +
				"\n→ enveloppe le texte dans t(...) et ajoute la clé dans src/i18n/en.js."
			);
		});
	}
});
