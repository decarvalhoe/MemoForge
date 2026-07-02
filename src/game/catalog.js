// Catalogue canonique du contenu (E6-10) — le référentiel exhaustif qui aligne le jeu sur
// les exercices officiels de 42 (C00→C13) et sur la libft intégrale (43 fonctions).
//
// Pourquoi ce fichier : garantir qu'AUCUNE fonction du cursus n'est oubliée, et que chaque
// entrée a un statut explicite (jouable / à forger / à refondre / hors-runtime / optionnel).
// tests/game/catalog.test.mjs vérifie la cohérence : ajouter une fonction sans la traiter,
// ou pointer un niveau inexistant, casse la CI. C'est la même discipline que la
// non-régression, appliquée à la couverture du cursus.
//
// tier = faisabilité moteur :
//   'ready' prêt aujourd'hui · 'char' débloqué par char↔code ASCII (E6-10, livré) ·
//   'octet' nécessite le modèle octet (E6-7/#105) · 'argv' nécessite argc/argv (C06).
//
// statut :
//   'jouable'     niveau conforme existant (level = id présent dans LEVELS)
//   'a-refondre'  niveau existant mais désaligné (brique magique / sémantique inventée)
//   'a-forger'    à créer — pas encore de niveau
//   'hors-runtime' préprocesseur / Makefile (fiches, pas de niveau — cf. BRIQUES §hors-jeu)
//   'optionnel'   bonus days (C11/C13) — la machinerie existe, priorité basse

/**
 * @typedef {Object} CatalogEntry
 * @property {string}  fn      nom canonique (ft_* ou primitive/concept)
 * @property {string}  module  module Piscine (C00..C13) ou groupe libft (libft-1/2/bonus)
 * @property {string}  concept axe pédagogique
 * @property {'ready'|'char'|'octet'|'argv'} tier  faisabilité moteur
 * @property {string[]} deps   ft_ prérequis (ordre de forge « ta libft »)
 * @property {'jouable'|'a-refondre'|'a-forger'|'hors-runtime'|'optionnel'} statut
 * @property {string|null} level  id de niveau si jouable/à refondre, sinon null
 * @property {string} [issue]  issue de suivi (refonte / création)
 */

/** @type {CatalogEntry[]} */
export const CATALOG = [
	// ── C00 · premiers pas, write ─────────────────────────────────────────────
	{ fn: 'ft_putchar', module: 'C00', concept: 'write ASCII', tier: 'ready', deps: [], statut: 'jouable', level: 's-1' },
	{ fn: 'ft_print_alphabet', module: 'C00', concept: 'boucle + write', tier: 'ready', deps: ['ft_putchar'], statut: 'a-forger', level: null, issue: '#107' },
	{ fn: 'ft_print_reverse_alphabet', module: 'C00', concept: 'boucle descendante', tier: 'ready', deps: ['ft_putchar'], statut: 'a-forger', level: null, issue: '#107' },
	{ fn: 'ft_print_numbers', module: 'C00', concept: "chiffre + '0'", tier: 'char', deps: ['ft_putchar'], statut: 'a-forger', level: null, issue: '#107' },
	{ fn: 'ft_is_negative', module: 'C00', concept: 'branche if', tier: 'ready', deps: ['ft_putchar'], statut: 'a-forger', level: null, issue: '#107' },
	{ fn: 'ft_putnbr', module: 'C00', concept: 'extraction chiffres (récursif)', tier: 'char', deps: ['ft_putchar'], statut: 'a-refondre', level: 'conv-3', issue: '#107' },

	// ── C01 · pointeurs, par adresse ──────────────────────────────────────────
	{ fn: 'ft_ft', module: 'C01', concept: 'passer une adresse', tier: 'ready', deps: [], statut: 'jouable', level: 'ptr-1' },
	{ fn: 'ft_ultimate_ft', module: 'C01', concept: 'peler les étoiles (int *********)', tier: 'ready', deps: [], statut: 'jouable', level: 'ptr-3' },
	{ fn: 'ft_swap', module: 'C01', concept: 'échange par adresse', tier: 'ready', deps: [], statut: 'jouable', level: '1-3' },
	{ fn: 'ft_div_mod', module: 'C01', concept: 'deux retours via pointeurs', tier: 'ready', deps: [], statut: 'jouable', level: 'ptr-2' },
	{ fn: 'ft_ultimate_div_mod', module: 'C01', concept: 'div_mod en place', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#100' },
	{ fn: 'ft_putstr', module: 'C01', concept: 'parcourir jusqu\'au \\0', tier: 'ready', deps: ['ft_putchar'], statut: 'a-forger', level: null, issue: '#107' },
	{ fn: 'ft_strlen', module: 'C01', concept: 'compter jusqu\'au \\0', tier: 'ready', deps: [], statut: 'jouable', level: 'while-1' },
	{ fn: 'ft_rev_int_tab', module: 'C01', concept: 'tab[i] ≡ *(tab+i)', tier: 'ready', deps: [], statut: 'jouable', level: '2-1' },
	{ fn: 'ft_sort_int_tab', module: 'C01', concept: 'tri par échanges indexés', tier: 'ready', deps: ['ft_swap'], statut: 'a-forger', level: null, issue: '#102' },

	// ── C02 · chaînes, tests de caractères ────────────────────────────────────
	{ fn: 'ft_strcpy', module: 'C02', concept: 'copie octet par octet + \\0', tier: 'ready', deps: [], statut: 'jouable', level: 'str-1' },
	{ fn: 'ft_strncpy', module: 'C02', concept: 'copie bornée', tier: 'ready', deps: [], statut: 'jouable', level: 'strn-1' },
	{ fn: 'ft_str_is_alpha', module: 'C02', concept: 'plage a-z/A-Z', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_str_is_numeric', module: 'C02', concept: "plage '0'-'9'", tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_str_is_lowercase', module: 'C02', concept: 'plage a-z', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_str_is_uppercase', module: 'C02', concept: 'plage A-Z', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_str_is_printable', module: 'C02', concept: "plage ' '-'~'", tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strupcase', module: 'C02', concept: 'minuscule - 32', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strlowcase', module: 'C02', concept: 'majuscule + 32', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strcapitalize', module: 'C02', concept: 'casse contextuelle', tier: 'char', deps: ['ft_strupcase', 'ft_strlowcase'], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_putstr_non_printable', module: 'C02', concept: 'échappement hexa', tier: 'octet', deps: ['ft_putchar'], statut: 'a-forger', level: null, issue: '#105' },
	{ fn: 'ft_print_memory', module: 'C02', concept: 'hexdump — le modèle octet', tier: 'octet', deps: [], statut: 'a-forger', level: null, issue: '#105' },

	// ── C03 · comparaison, concaténation, recherche ───────────────────────────
	{ fn: 'ft_strcmp', module: 'C03', concept: 'comparer code par code', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strncmp', module: 'C03', concept: 'comparaison bornée', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strcat', module: 'C03', concept: 'concaténer au \\0', tier: 'ready', deps: ['ft_strlen'], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strncat', module: 'C03', concept: 'concaténation bornée', tier: 'ready', deps: ['ft_strlen'], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strstr', module: 'C03', concept: 'recherche de sous-chaîne', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },

	// ── C04 · conversion nombre ↔ texte ───────────────────────────────────────
	{ fn: 'ft_atoi', module: 'C04', concept: "res = res*10 + (c-'0')", tier: 'char', deps: [], statut: 'jouable', level: 'conv-1' },
	{ fn: 'ft_putnbr_base', module: 'C04', concept: 'n%base / n/base', tier: 'char', deps: ['ft_putchar'], statut: 'a-refondre', level: 'conv-2', issue: '#107' },
	{ fn: 'ft_atoi_base', module: 'C04', concept: 'reconstruire en base', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },

	// ── C05 · récursivité (prêt aujourd'hui) ──────────────────────────────────
	{ fn: 'ft_iterative_factorial', module: 'C05', concept: 'boucle produit', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_recursive_factorial', module: 'C05', concept: 'cas de base + appel', tier: 'ready', deps: [], statut: 'jouable', level: 'rec-1' },
	{ fn: 'ft_iterative_power', module: 'C05', concept: 'boucle puissance', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_recursive_power', module: 'C05', concept: 'récursion puissance', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_fibonacci', module: 'C05', concept: 'double appel récursif', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_sqrt', module: 'C05', concept: 'recherche bornée', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_is_prime', module: 'C05', concept: 'divisibilité en boucle', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_find_next_prime', module: 'C05', concept: 'is_prime en boucle', tier: 'ready', deps: ['ft_is_prime'], statut: 'a-forger', level: null, issue: '#108' },

	// ── C06 · arguments du programme (modèle argv) ────────────────────────────
	{ fn: 'ft_print_program_name', module: 'C06', concept: 'argv[0]', tier: 'argv', deps: [], statut: 'a-forger', level: null, issue: '#104' },
	{ fn: 'ft_print_params', module: 'C06', concept: 'parcours argv', tier: 'argv', deps: [], statut: 'a-forger', level: null, issue: '#104' },
	{ fn: 'ft_rev_params', module: 'C06', concept: 'argv à l\'envers', tier: 'argv', deps: [], statut: 'a-forger', level: null, issue: '#104' },
	{ fn: 'ft_sort_params', module: 'C06', concept: 'tri de chaînes', tier: 'argv', deps: ['ft_strcmp'], statut: 'a-forger', level: null, issue: '#104' },

	// ── C07 · allocation dynamique, le tas ────────────────────────────────────
	{ fn: 'ft_strdup', module: 'C07', concept: 'malloc(len+1) + copie', tier: 'ready', deps: ['ft_strlen', 'ft_strcpy'], statut: 'jouable', level: 'dup-1' },
	{ fn: 'ft_range', module: 'C07', concept: 'tableau dynamique', tier: 'ready', deps: [], statut: 'jouable', level: 'range-1' },
	{ fn: 'ft_ultimate_range', module: 'C07', concept: 'range via pointeur', tier: 'ready', deps: ['ft_range'], statut: 'a-forger', level: null, issue: '#102' },
	{ fn: 'ft_strjoin', module: 'C07', concept: 'joindre N chaînes + sep', tier: 'ready', deps: ['ft_strlen', 'ft_strcat'], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_convert_base', module: 'C07', concept: 'atoi_base + putnbr_base', tier: 'char', deps: ['ft_atoi_base', 'ft_putnbr_base'], statut: 'optionnel', level: null },
	{ fn: 'ft_split', module: 'C07', concept: 'découper → tableau (N+1 free)', tier: 'ready', deps: ['ft_strlen'], statut: 'a-forger', level: null, issue: '#103' },

	// ── C08/C09 · hors-runtime (préprocesseur, Makefile) ──────────────────────
	{ fn: 'C08 · header & macros', module: 'C08', concept: 'préprocesseur', tier: 'ready', deps: [], statut: 'hors-runtime', level: null },
	{ fn: 'C09 · Makefile & libft', module: 'C09', concept: 'build', tier: 'ready', deps: [], statut: 'hors-runtime', level: null },

	// ── C10 · fichiers & syscalls ─────────────────────────────────────────────
	{ fn: 'display_file', module: 'C10', concept: 'open → read → write → close', tier: 'ready', deps: [], statut: 'jouable', level: 'f-1' },

	// ── C11/C12/C13 · fonctions-valeur, listes (bonus days) ───────────────────
	{ fn: 'ft_foreach', module: 'C11', concept: 'appliquer f(x)', tier: 'ready', deps: [], statut: 'optionnel', level: null },
	{ fn: 't_list · push/size/clear', module: 'C12', concept: '->next sur le tas', tier: 'ready', deps: [], statut: 'jouable', level: 'l-1' },

	// ── libft · Part 1 (fonctions de <ctype.h>/<string.h>/<stdlib.h> à refaire) ─
	{ fn: 'ft_isalpha', module: 'libft-1', concept: 'plage alpha', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_isdigit', module: 'libft-1', concept: "plage '0'-'9'", tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_isalnum', module: 'libft-1', concept: 'alpha ou digit', tier: 'char', deps: ['ft_isalpha', 'ft_isdigit'], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_isascii', module: 'libft-1', concept: 'plage 0-127', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_isprint', module: 'libft-1', concept: "plage ' '-'~'", tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_toupper', module: 'libft-1', concept: 'minuscule - 32', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_tolower', module: 'libft-1', concept: 'majuscule + 32', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strchr', module: 'libft-1', concept: 'trouver un char', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strrchr', module: 'libft-1', concept: 'trouver le dernier', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strncmp', module: 'libft-1', concept: 'comparaison bornée', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strlcpy', module: 'libft-1', concept: 'copie sûre + taille', tier: 'ready', deps: ['ft_strlen'], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strlcat', module: 'libft-1', concept: 'concat sûre', tier: 'octet', deps: ['ft_strlen'], statut: 'a-forger', level: null, issue: '#105' },
	{ fn: 'ft_strnstr', module: 'libft-1', concept: 'sous-chaîne bornée', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_atoi', module: 'libft-1', concept: 'texte → int', tier: 'char', deps: [], statut: 'jouable', level: 'conv-1' },
	{ fn: 'ft_memset', module: 'libft-1', concept: 'remplir n octets', tier: 'octet', deps: [], statut: 'a-forger', level: null, issue: '#105' },
	{ fn: 'ft_bzero', module: 'libft-1', concept: 'mettre à zéro', tier: 'octet', deps: ['ft_memset'], statut: 'a-forger', level: null, issue: '#105' },
	{ fn: 'ft_memcpy', module: 'libft-1', concept: 'copie n octets', tier: 'octet', deps: [], statut: 'a-forger', level: null, issue: '#105' },
	{ fn: 'ft_memmove', module: 'libft-1', concept: 'copie avec recouvrement', tier: 'octet', deps: [], statut: 'a-forger', level: null, issue: '#105' },
	{ fn: 'ft_memchr', module: 'libft-1', concept: 'chercher un octet', tier: 'octet', deps: [], statut: 'a-forger', level: null, issue: '#105' },
	{ fn: 'ft_memcmp', module: 'libft-1', concept: 'comparer n octets', tier: 'octet', deps: [], statut: 'a-forger', level: null, issue: '#105' },
	{ fn: 'ft_strdup', module: 'libft-1', concept: 'malloc + copie', tier: 'ready', deps: ['ft_strlen', 'ft_strcpy'], statut: 'jouable', level: 'dup-1' },
	{ fn: 'ft_calloc', module: 'libft-1', concept: 'malloc + bzero', tier: 'octet', deps: ['ft_bzero'], statut: 'a-forger', level: null, issue: '#105' },

	// ── libft · Part 2 (fonctions « augmentées », le tas + les callbacks) ─────
	{ fn: 'ft_substr', module: 'libft-2', concept: 'sous-chaîne allouée', tier: 'ready', deps: ['ft_strlen'], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strjoin', module: 'libft-2', concept: 'concat allouée', tier: 'ready', deps: ['ft_strlen'], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strtrim', module: 'libft-2', concept: 'rogner les bords', tier: 'char', deps: ['ft_strlen'], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_split', module: 'libft-2', concept: 'tableau de chaînes', tier: 'ready', deps: ['ft_strlen'], statut: 'a-forger', level: null, issue: '#103' },
	{ fn: 'ft_itoa', module: 'libft-2', concept: "int → texte (chiffre + '0')", tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_strmapi', module: 'libft-2', concept: 'map avec index (callback)', tier: 'ready', deps: [], statut: 'optionnel', level: null },
	{ fn: 'ft_striteri', module: 'libft-2', concept: 'iter avec index (callback)', tier: 'ready', deps: [], statut: 'optionnel', level: null },
	{ fn: 'ft_putchar_fd', module: 'libft-2', concept: 'write(fd, &c, 1)', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_putstr_fd', module: 'libft-2', concept: 'écrire sur un fd', tier: 'ready', deps: ['ft_strlen'], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_putendl_fd', module: 'libft-2', concept: 'putstr + newline', tier: 'ready', deps: ['ft_putstr_fd'], statut: 'a-forger', level: null, issue: '#108' },
	{ fn: 'ft_putnbr_fd', module: 'libft-2', concept: 'nombre sur un fd', tier: 'char', deps: [], statut: 'a-forger', level: null, issue: '#108' },

	// ── libft · bonus (listes chaînées — la machinerie ->next) ────────────────
	{ fn: 'ft_lstnew', module: 'libft-bonus', concept: 'nœud sur le tas', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#101' },
	{ fn: 'ft_lstadd_front', module: 'libft-bonus', concept: 'chaîner en tête', tier: 'ready', deps: ['ft_lstnew'], statut: 'a-forger', level: null, issue: '#101' },
	{ fn: 'ft_lstsize', module: 'libft-bonus', concept: 'compter les nœuds', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#101' },
	{ fn: 'ft_lstlast', module: 'libft-bonus', concept: 'dernier nœud', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#101' },
	{ fn: 'ft_lstadd_back', module: 'libft-bonus', concept: 'chaîner en queue', tier: 'ready', deps: ['ft_lstlast'], statut: 'a-forger', level: null, issue: '#101' },
	{ fn: 'ft_lstdelone', module: 'libft-bonus', concept: 'libérer un nœud', tier: 'ready', deps: [], statut: 'a-forger', level: null, issue: '#101' },
	{ fn: 'ft_lstclear', module: 'libft-bonus', concept: 'libérer (sauver ->next)', tier: 'ready', deps: ['ft_lstdelone'], statut: 'a-forger', level: null, issue: '#101' },
	{ fn: 'ft_lstiter', module: 'libft-bonus', concept: 'appliquer f à chaque nœud', tier: 'ready', deps: [], statut: 'optionnel', level: null },
	{ fn: 'ft_lstmap', module: 'libft-bonus', concept: 'map → nouvelle liste', tier: 'ready', deps: ['ft_lstnew'], statut: 'optionnel', level: null }
];

/** Statuts qui imposent un niveau existant (le catalogue ne peut pas mentir). */
export const STATUTS_AVEC_NIVEAU = new Set(['jouable', 'a-refondre']);

/** @returns {CatalogEntry[]} les entrées d'un statut donné. */
export function entriesByStatut(statut) {
	return CATALOG.filter((e) => e.statut === statut);
}

/** @returns {Object<string,number>} décompte par statut (pour le suivi de progression). */
export function coverageSummary() {
	const out = {};
	for (const e of CATALOG)
		out[e.statut] = (out[e.statut] || 0) + 1;
	return out;
}
