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
export const node = (data) => ({ t: 'node', data });
export const field = (nodeExpr, name) => ({ t: 'field', node: nodeExpr, field: name });
export const open = (name) => ({ t: 'open', name });
export const read = (fd, dst, count) => ({ t: 'read', fd, dst, count });
export const load = (base, index) => ({ t: 'load', base, index });
export const store = (base, index) => ({ t: 'store', base, index });
export const iter = () => ({ t: 'iter' });

// --- Cibles (lhs) ---
// var(name) et deref(name) servent aussi de cibles d'affectation.

// --- Instructions ---
export const assign = (lhs, rhs) => ({ lhs, rhs });
export const free = (ptr) => ({ op: 'free', ptr });
export const write = (fd, src, count) => ({ op: 'write', fd, src, count });
export const putnbrBase = (n, base) => ({ op: 'putnbr_base', n, base });
export const strcpy = (dst, src) => ({ op: 'strcpy', dst, src });
export const freeNode = (nodeExpr) => ({ op: 'free_node', node: nodeExpr });
export const close = (fd) => ({ op: 'close', fd });
export const loop = (count, body) => ({ op: 'loop', count, body: body.map((a) => ({ ast: a })) });
export const whileLoop = (guard, body) => ({ op: 'while', guard, body: body.map((a) => ({ ast: a })) });
export const ifThen = (guard, body) => ({ op: 'if', guard, body: body.map((a) => ({ ast: a })) });

// --- Fonctions & appels (B9 récursion, B11 valeurs-fonction) ---
// func() décrit une définition (params + corps + valeur de retour). call() est une
// instruction top-level qui livre le retour dans `place` (jamais imbriquée dans une
// expression : la pile d'appels reste visualisable pas-à-pas). ret() renvoie une valeur.
export const func = (name, params, body) => ({ name, params, body: body.map((a) => ({ ast: a })) });
export const call = (place, name, args) => ({ op: 'call', place, name, args });
export const ret = (value) => ({ op: 'return', value });
