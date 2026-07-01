const lit = (v) => ({ t: 'lit', v });
const variable = (name) => ({ t: 'var', name });
const addr = (name) => ({ t: 'addr', name });
const deref = (name) => ({ t: 'deref', name });
const assign = (lhs, rhs) => ({ lhs, rhs });
const malloc = () => ({ t: 'malloc' });
const freeOp = (name) => ({ op: 'free', ptr: name });

export const LEVELS = [
	{
		id: '1-1',
		world: 'Casiers & adresses',
		title: 'Mets 42 dans n',
		goalText: 'À la fin, le casier n doit contenir 42.',
		hint: 'n est une variable normale : on écrit directement dedans.',
		vars: [{ name: 'n', value: 0, kind: 'int' }],
		slots: 1,
		par: 1,
		goal: { n: 42 },
		bank: [
			{ id: 'set-n', label: 'n = 42', ast: assign(variable('n'), lit(42)) },
			{ id: 'deref-n', label: '*n = 42', ast: assign(deref('n'), lit(42)) },
			{ id: 'addr-n', label: '&n = 42', ast: assign(addr('n'), lit(42)) }
		]
	},
	{
		id: '1-2',
		world: 'Casiers & adresses',
		title: 'Atteins n à travers le pointeur p',
		goalText: 'n doit valoir 42 — mais tu n\'as pas le droit d\'y toucher directement : passe par p.',
		hint: 'D\'abord faire pointer p sur n (p = &n), ENSUITE écrire via *p. L\'ordre compte.',
		vars: [
			{ name: 'n', value: 0, kind: 'int' },
			{ name: 'p', value: 0, kind: 'ptr' }
		],
		slots: 2,
		par: 2,
		goal: { n: 42 },
		bank: [
			{ id: 'p-addr-n', label: 'p = &n', ast: assign(variable('p'), addr('n')) },
			{ id: 'star-p-42', label: '*p = 42', ast: assign(deref('p'), lit(42)) },
			{ id: 'p-42', label: 'p = 42', ast: assign(variable('p'), lit(42)) },
			{ id: 'star-p-n', label: '*p = n', ast: assign(deref('p'), variable('n')) }
		]
	},
	{
		id: '1-3',
		world: 'Casiers & adresses',
		title: 'Échange a et b',
		goalText: 'Inverse les valeurs : a doit valoir 3 et b doit valoir 7.',
		hint: 'Sauvegarde une valeur dans tmp AVANT de l\'écraser, sinon elle est perdue.',
		vars: [
			{ name: 'a', value: 7, kind: 'int' },
			{ name: 'b', value: 3, kind: 'int' },
			{ name: 'tmp', value: 0, kind: 'int' }
		],
		slots: 3,
		par: 3,
		goal: { a: 3, b: 7 },
		bank: [
			{ id: 'tmp-a', label: 'tmp = a', ast: assign(variable('tmp'), variable('a')) },
			{ id: 'a-b', label: 'a = b', ast: assign(variable('a'), variable('b')) },
			{ id: 'b-tmp', label: 'b = tmp', ast: assign(variable('b'), variable('tmp')) },
			{ id: 'b-a', label: 'b = a', ast: assign(variable('b'), variable('a')) }
		]
	},
	{
		id: '2-1',
		world: 'Tableaux & échange',
		title: 'Inverse le tableau',
		goalText: 'Inverse [1, 2, 3] en [3, 2, 1] : t0 doit valoir 3 et t2 doit valoir 1.',
		hint: 'Inverser = échanger le premier et le dernier. C\'est un swap, avec tmp.',
		vars: [
			{ name: 't0', value: 1, kind: 'int' },
			{ name: 't1', value: 2, kind: 'int' },
			{ name: 't2', value: 3, kind: 'int' },
			{ name: 'tmp', value: 0, kind: 'int' }
		],
		slots: 3,
		par: 3,
		goal: { t0: 3, t1: 2, t2: 1 },
		bank: [
			{ id: 'tmp-t0', label: 'tmp = t0', ast: assign(variable('tmp'), variable('t0')) },
			{ id: 't0-t2', label: 't0 = t2', ast: assign(variable('t0'), variable('t2')) },
			{ id: 't2-tmp', label: 't2 = tmp', ast: assign(variable('t2'), variable('tmp')) },
			{ id: 't2-t0', label: 't2 = t0', ast: assign(variable('t2'), variable('t0')) }
		]
	},
	{
		id: '3-1',
		world: 'Mémoire dynamique',
		title: 'Réserve, écris, libère',
		goalText: 'Réserve un casier, écris 7 dedans, puis libère-le. Objectif : zéro fuite.',
		hint: 'malloc D\'ABORD (sinon *p plante sur NULL), et n\'oublie jamais free à la fin.',
		vars: [{ name: 'p', value: 0, kind: 'ptr' }],
		slots: 3,
		par: 3,
		goalCheck: (mem) => mem.freed.size >= 1 && mem.leaks().length === 0,
		bank: [
			{ id: 'p-malloc', label: 'p = malloc()', ast: assign(variable('p'), malloc()) },
			{ id: 'star-p-7', label: '*p = 7', ast: assign(deref('p'), lit(7)) },
			{ id: 'free-p', label: 'free(p)', ast: freeOp('p') },
			{ id: 'p-7-bad', label: 'p = 7', ast: assign(variable('p'), lit(7)) }
		]
	},
	{
		id: '3-2',
		world: 'Mémoire dynamique',
		title: 'Chaque malloc a son free',
		goalText: 'Réserve deux casiers et libère-les TOUS LES DEUX. Objectif : zéro fuite.',
		hint: 'Un free par malloc. Libérer deux fois le même casier = crash (double free).',
		vars: [
			{ name: 'p', value: 0, kind: 'ptr' },
			{ name: 'q', value: 0, kind: 'ptr' }
		],
		slots: 4,
		par: 4,
		goalCheck: (mem) => mem.freed.size >= 2 && mem.leaks().length === 0,
		bank: [
			{ id: 'p-malloc', label: 'p = malloc()', ast: assign(variable('p'), malloc()) },
			{ id: 'q-malloc', label: 'q = malloc()', ast: assign(variable('q'), malloc()) },
			{ id: 'free-p', label: 'free(p)', ast: freeOp('p') },
			{ id: 'free-q', label: 'free(q)', ast: freeOp('q') },
			{ id: 'free-p2', label: 'free(p)', ast: freeOp('p') }
		]
	},
	{
		id: '4-1',
		world: 'Chaînes & fin',
		title: 'Écris la chaîne "Hi"',
		goalText: 'Range \'H\', puis \'i\', puis la borne de fin \'\\0\' (valeur 0) dans c0, c1, c2.',
		hint: 'Une chaîne se termine TOUJOURS par \'\\0\'. Sans cette borne, ce n\'est pas une vraie chaîne C.',
		vars: [
			{ name: 'c0', value: 0, kind: 'int' },
			{ name: 'c1', value: 0, kind: 'int' },
			{ name: 'c2', value: 0, kind: 'int' }
		],
		slots: 3,
		par: 3,
		goal: { c0: 'H', c1: 'i', c2: 0 },
		bank: [
			{ id: 'c0-H', label: "c0 = 'H'", ast: assign(variable('c0'), lit('H')) },
			{ id: 'c1-i', label: "c1 = 'i'", ast: assign(variable('c1'), lit('i')) },
			{ id: 'c2-nul', label: "c2 = '\\0'", ast: assign(variable('c2'), lit(0)) },
			{ id: 'c0-i', label: "c0 = 'i'", ast: assign(variable('c0'), lit('i')) }
		]
	}
];
