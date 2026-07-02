// Test de couverture du cursus (E6-10) : la même discipline que la non-régression, mais
// appliquée au CATALOGUE. Ajouter une fonction sans statut, pointer un niveau inexistant,
// ou oublier une fonction de la libft casse la CI.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, STATUTS_AVEC_NIVEAU, entriesByStatut, coverageSummary } from '../../src/game/catalog.js';
import { LEVELS } from '../../src/game/levels.js';

const STATUTS = new Set(['jouable', 'a-refondre', 'a-forger', 'hors-runtime', 'optionnel']);
const TIERS = new Set(['ready', 'char', 'octet', 'argv']);
const levelIds = new Set(LEVELS.map((l) => l.id));
const fnNames = new Set(CATALOG.map((e) => e.fn));

describe('CATALOG — intégrité structurelle', () => {
	test('chaque entrée a un statut et un tier valides', () => {
		for (const e of CATALOG) {
			assert.ok(STATUTS.has(e.statut), `statut invalide : ${e.fn} → ${e.statut}`);
			assert.ok(TIERS.has(e.tier), `tier invalide : ${e.fn} → ${e.tier}`);
			assert.ok(e.module && e.concept, `entrée incomplète : ${e.fn}`);
		}
	});

	test('un statut « avec niveau » pointe un niveau EXISTANT ; les autres ont level=null', () => {
		for (const e of CATALOG) {
			if (STATUTS_AVEC_NIVEAU.has(e.statut))
				assert.ok(levelIds.has(e.level), `${e.fn} (${e.statut}) pointe un niveau inconnu : ${e.level}`);
			else
				assert.equal(e.level, null, `${e.fn} (${e.statut}) ne doit pas pointer de niveau`);
		}
	});

	test('toute dépendance de forge référence une fonction du catalogue', () => {
		for (const e of CATALOG)
			for (const dep of e.deps)
				assert.ok(fnNames.has(dep), `dépendance inconnue : ${e.fn} → ${dep}`);
	});

	test('aucune dépendance circulaire directe (fn ne dépend pas d\'elle-même)', () => {
		for (const e of CATALOG)
			assert.ok(!e.deps.includes(e.fn), `dépendance circulaire : ${e.fn}`);
	});
});

describe('CATALOG — couverture du cursus', () => {
	test('la libft intégrale (43 fonctions) est présente', () => {
		const LIBFT = [
			// Part 1 (23)
			'ft_isalpha', 'ft_isdigit', 'ft_isalnum', 'ft_isascii', 'ft_isprint', 'ft_strlen',
			'ft_memset', 'ft_bzero', 'ft_memcpy', 'ft_memmove', 'ft_strlcpy', 'ft_strlcat',
			'ft_toupper', 'ft_tolower', 'ft_strchr', 'ft_strrchr', 'ft_strncmp', 'ft_memchr',
			'ft_memcmp', 'ft_strnstr', 'ft_atoi', 'ft_calloc', 'ft_strdup',
			// Part 2 (11)
			'ft_substr', 'ft_strjoin', 'ft_strtrim', 'ft_split', 'ft_itoa', 'ft_strmapi',
			'ft_striteri', 'ft_putchar_fd', 'ft_putstr_fd', 'ft_putendl_fd', 'ft_putnbr_fd',
			// Bonus (9)
			'ft_lstnew', 'ft_lstadd_front', 'ft_lstsize', 'ft_lstlast', 'ft_lstadd_back',
			'ft_lstdelone', 'ft_lstclear', 'ft_lstiter', 'ft_lstmap'
		];
		assert.equal(LIBFT.length, 43);
		for (const fn of LIBFT)
			assert.ok(fnNames.has(fn), `libft manquante du catalogue : ${fn}`);
	});

	test('les modules C00→C07 + C10 + C12 sont représentés', () => {
		const modules = new Set(CATALOG.map((e) => e.module));
		for (const m of ['C00', 'C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C10', 'C12'])
			assert.ok(modules.has(m), `module absent du catalogue : ${m}`);
	});

	test('tout niveau conforme du catalogue existe (cohérence catalogue → LEVELS)', () => {
		for (const e of entriesByStatut('jouable'))
			assert.ok(levelIds.has(e.level), `niveau jouable manquant : ${e.fn} → ${e.level}`);
	});

	test('plus aucune brique magique « à refondre » (réalignement EPIC 6/7 terminé)', () => {
		// Toutes les fonctions autrefois données toutes faites sont désormais forgées.
		assert.deepEqual(entriesByStatut('a-refondre'), []);
	});

	test('coverageSummary compte toutes les entrées', () => {
		const sum = coverageSummary();
		const total = Object.values(sum).reduce((a, b) => a + b, 0);
		assert.equal(total, CATALOG.length);
		assert.ok(sum['a-forger'] > 0 && sum['jouable'] > 0);
	});
});
