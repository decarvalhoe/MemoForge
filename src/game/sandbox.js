// Bac à sable (issue E3-7) : un niveau SANS cible, palette large, pour expérimenter
// librement — provoquer une fuite, un double free, un déréférencement de NULL, etc.
//
// NOTE : les constructeurs d'AST sont dupliqués depuis levels.js en attendant que
// src/engine/ast.js (lane moteur) atterrisse sur main — à remplacer par un import à ce
// moment-là (cf. docs/COORDINATION.md). La palette n'utilise que des ops déjà supportées
// par le moteur sur main (affectation, &, *, malloc, free).
const lit = (v) => ({ t: 'lit', v });
const variable = (name) => ({ t: 'var', name });
const addr = (name) => ({ t: 'addr', name });
const deref = (name) => ({ t: 'deref', name });
const assign = (lhs, rhs) => ({ lhs, rhs });
const malloc = () => ({ t: 'malloc' });
const freeOp = (name) => ({ op: 'free', ptr: name });

export const SANDBOX = {
	id: 'sandbox',
	world: 'Bac à sable',
	title: 'Bac à sable — expérimente librement',
	goalText: 'Aucune cible imposée : assemble ce que tu veux et observe la mémoire.',
	hint: 'Provoque une fuite (malloc sans free), un double free, un déréférencement de NULL…',
	vars: [
		{ name: 'a', value: 0, kind: 'int' },
		{ name: 'b', value: 0, kind: 'int' },
		{ name: 'p', value: 0, kind: 'ptr' },
		{ name: 'q', value: 0, kind: 'ptr' }
	],
	slots: 8,
	par: 8,
	sandbox: true,
	goalCheck: () => false,   // jamais "résolu" : pas de cible
	bank: [
		{ id: 'a-1', label: 'a = 1', ast: assign(variable('a'), lit(1)) },
		{ id: 'b-2', label: 'b = 2', ast: assign(variable('b'), lit(2)) },
		{ id: 'p-addr-a', label: 'p = &a', ast: assign(variable('p'), addr('a')) },
		{ id: 'q-addr-b', label: 'q = &b', ast: assign(variable('q'), addr('b')) },
		{ id: 'star-p-9', label: '*p = 9', ast: assign(deref('p'), lit(9)) },
		{ id: 'a-b', label: 'a = b', ast: assign(variable('a'), variable('b')) },
		{ id: 'p-malloc', label: 'p = malloc()', ast: assign(variable('p'), malloc()) },
		{ id: 'q-malloc', label: 'q = malloc()', ast: assign(variable('q'), malloc()) },
		{ id: 'free-p', label: 'free(p)', ast: freeOp('p') },
		{ id: 'free-q', label: 'free(q)', ast: freeOp('q') }
	]
};
