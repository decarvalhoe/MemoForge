// Constructeurs d'AST des instructions moteur.
//
// Lane : Agent A (moteur) possède ce module. Agent B (contenu) l'importe pour
// écrire les données de niveaux (src/game/levels.js) sans dupliquer la forme des
// nœuds ni toucher aux primitives du moteur.
//
// Une instruction exécutable par l'interpréteur est soit une affectation
// { lhs, rhs }, soit une opération { op, ... }. Les expressions portent un tag `t`.

// --- Expressions (rhs / src) ---
export const lit = (v) => ({ t: 'lit', v });
export const variable = (name) => ({ t: 'var', name });
export const addr = (name) => ({ t: 'addr', name });
export const deref = (name) => ({ t: 'deref', name });
export const malloc = (size) => (size === undefined ? { t: 'malloc' } : { t: 'malloc', size });
export const strlen = (src) => ({ t: 'strlen', src });
export const atoi = (src) => ({ t: 'atoi', src });
export const bin = (op, a, b) => ({ t: 'bin', op, a, b });

// --- Cibles (lhs) ---
// var(name) et deref(name) servent aussi de cibles d'affectation.

// --- Instructions ---
export const assign = (lhs, rhs) => ({ lhs, rhs });
export const free = (ptr) => ({ op: 'free', ptr });
export const write = (fd, src, count) => ({ op: 'write', fd, src, count });
export const putnbrBase = (n, base) => ({ op: 'putnbr_base', n, base });
export const strcpy = (dst, src) => ({ op: 'strcpy', dst, src });
