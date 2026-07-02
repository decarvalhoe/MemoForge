// Constructeurs d'AST fournis par la lane moteur (src/engine/ast.js) — cf. docs/COORDINATION.md.
import { lit, variable, addr, deref, assign, malloc, free as freeOp, write, strlen, atoi, node, field, freeNode, open, read, close, bin, loop, whileLoop, iter, load, store, ifThen, call, ret, func } from '../engine/ast.js';

// Implémentations de référence de la libft, injectées comme REPLI dans les niveaux qui
// réutilisent une ft_ (ex. ft_strdup appelle ft_strlen + ft_strcpy). Le joueur qui a déjà
// forgé la fonction joue avec LA SIENNE (functionsFor la fait primer, cf. libft.js) ; sinon
// il joue avec cette référence — le niveau reste jouable. Ce sont exactement les solutions
// canoniques des niveaux « écris ft_strlen / ft_strcpy ».
const V = variable;
const REF_STRLEN = func('ft_strlen', ['s'], [
	assign(V('len'), lit(0)),
	whileLoop(bin('!=', load(V('s'), V('len')), lit(0)), [assign(V('len'), bin('+', V('len'), lit(1)))]),
	ret(V('len'))
]);
const REF_STRCPY = func('ft_strcpy', ['dst', 'src'], [
	assign(V('i'), lit(0)),
	whileLoop(bin('!=', load(V('src'), V('i')), lit(0)), [
		assign(store(V('dst'), V('i')), load(V('src'), V('i'))),
		assign(V('i'), bin('+', V('i'), lit(1)))
	]),
	assign(store(V('dst'), V('i')), lit(0)),
	ret(V('dst'))
]);

export const LEVELS = [
	{
		id: '1-1',
		world: 'Casiers & adresses',
		title: 'Mets 42 dans n',
		goalText: 'À la fin, le casier n doit contenir 42.',
		hint: 'Le CPU ne connaît que des adresses, jamais le nom « n » (cours M1). Parmi les briques, laquelle écrit dans le casier lui-même, et lesquelles supposent que n contienne déjà une adresse ?',
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
		hint: 'Au moment où tu écris à travers p, que doit-il contenir ? Un pointeur qui ne vise encore rien, c\'est NULL — et le déréférencer plante (cours M4).',
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
		// ÉCRIS ft_swap (C01 ex02) — le cas qui rend le pointeur indispensable : pour
		// échanger deux variables de l'appelant, une fonction reçoit leurs ADRESSES et
		// écrit à travers (*pa, *pb). Sans tmp, une valeur est perdue (M4).
		id: '1-3',
		world: 'Casiers & adresses',
		title: 'Écris ft_swap (par adresse)',
		goalText: 'Écris le CORPS de ft_swap(pa, pb). main échange a (7) et b (3) via leurs adresses : à la fin a = 3 et b = 7.',
		hint: 'Si tu écrases *pa en premier, où retrouver son ancienne valeur pour la donner à *pb ? À quoi peut servir tmp ? (cours M4)',
		assembleInto: 'ft_swap',
		params: ['pa', 'pb'],
		driverText: 'main (verrouillé) : ft_swap(&a, &b)',
		driver: [{ id: 'drv', label: 'ft_swap(&a, &b)', ast: call(variable('done'), 'ft_swap', [addr('a'), addr('b')]) }],
		vars: [
			{ name: 'a', value: 7, kind: 'int' },
			{ name: 'b', value: 3, kind: 'int' },
			{ name: 'done', value: 0, kind: 'int' }
		],
		slots: 3,
		par: 3,
		goal: { a: 3, b: 7 },
		bank: [
			{ id: 'save', label: 'tmp = *pa', ast: assign(variable('tmp'), deref('pa')) },
			{ id: 'copy', label: '*pa = *pb', ast: assign(deref('pa'), deref('pb')) },
			{ id: 'restore', label: '*pb = tmp', ast: assign(deref('pb'), variable('tmp')) },
			{ id: 'nosave', label: '*pb = *pa', ast: assign(deref('pb'), deref('pa')) }
		]
	},
	{
		// ft_ft (C01 ex00) : la fonction reçoit un pointeur et écrit À TRAVERS lui (*nbr).
		// Écrire dans le paramètre (nbr = 42) ne change qu'une copie locale de l'adresse.
		id: 'ptr-1',
		world: 'Casiers & adresses',
		title: 'Écris ft_ft (modifie via le pointeur)',
		goalText: 'Écris le CORPS de ft_ft(nbr). main appelle ft_ft(&x) : x doit valoir 42 à la fin.',
		hint: 'Pour changer le x de l\'appelant, écris-tu dans le pointeur (nbr), ou dans la case qu\'il désigne (*nbr) ? (cours M4)',
		assembleInto: 'ft_ft',
		params: ['nbr'],
		driverText: 'main (verrouillé) : ft_ft(&x)',
		driver: [{ id: 'drv', label: 'ft_ft(&x)', ast: call(variable('done'), 'ft_ft', [addr('x')]) }],
		vars: [
			{ name: 'x', value: 0, kind: 'int' },
			{ name: 'done', value: 0, kind: 'int' }
		],
		slots: 1,
		par: 1,
		goal: { x: 42 },
		bank: [
			{ id: 'deref-set', label: '*nbr = 42', ast: assign(deref('nbr'), lit(42)) },
			{ id: 'var-set', label: 'nbr = 42', ast: assign(variable('nbr'), lit(42)) }
		]
	},
	{
		// ft_div_mod (C01 ex03) : « retourner » DEUX résultats via deux pointeurs de sortie.
		id: 'ptr-2',
		world: 'Casiers & adresses',
		title: 'Écris ft_div_mod (deux retours)',
		goalText: 'Écris le CORPS de ft_div_mod(a, b, div, mod). main appelle (13, 4, &q, &r) : q doit valoir 3 et r valoir 1.',
		hint: 'Une fonction ne rend qu\'une valeur avec return. Comment en rendre DEUX à l\'appelant ? Par où passent q et r ? (cours M4)',
		assembleInto: 'ft_div_mod',
		params: ['a', 'b', 'div', 'mod'],
		driverText: 'main (verrouillé) : ft_div_mod(13, 4, &q, &r)',
		driver: [{ id: 'drv', label: 'ft_div_mod(13, 4, &q, &r)', ast: call(variable('done'), 'ft_div_mod', [lit(13), lit(4), addr('q'), addr('r')]) }],
		vars: [
			{ name: 'q', value: 0, kind: 'int' },
			{ name: 'r', value: 0, kind: 'int' },
			{ name: 'done', value: 0, kind: 'int' }
		],
		slots: 2,
		par: 2,
		goal: { q: 3, r: 1 },
		bank: [
			{ id: 'set-div', label: '*div = a / b', ast: assign(deref('div'), bin('/', variable('a'), variable('b'))) },
			{ id: 'set-mod', label: '*mod = a % b', ast: assign(deref('mod'), bin('%', variable('a'), variable('b'))) },
			{ id: 'div-bad', label: 'div = a / b', ast: assign(variable('div'), bin('/', variable('a'), variable('b'))) }
		]
	},
	{
		// ft_ultimate_ft (C01 ex01, M5) : peler les étoiles. nbr désigne x à travers deux
		// pointeurs (nbr → p2 → p1 → x). Chaque *p pèle un niveau ; il faut atteindre x pour
		// y écrire 42. Un déréférencement de trop ou de trop peu vise le mauvais casier.
		id: 'ptr-3',
		world: 'Casiers & adresses',
		title: 'Écris ft_ultimate_ft (pèle les étoiles)',
		goalText: 'nbr pointe vers x à travers deux pointeurs. Écris le CORPS qui pèle jusqu\'à x et y écrit 42 : à la fin x doit valoir 42.',
		hint: 'Chaque * pèle un niveau de pointeur. Combien de niveaux te séparent de x, et sur quel casier tombe une étoile de trop peu ? (cours M5)',
		assembleInto: 'ft_ultimate_ft',
		params: ['nbr'],
		driverText: 'main (verrouillé) : p1 = &x · p2 = &p1 · ft_ultimate_ft(&p2)',
		driver: [
			{ id: 'd1', label: 'p1 = &x', ast: assign(variable('p1'), addr('x')) },
			{ id: 'd2', label: 'p2 = &p1', ast: assign(variable('p2'), addr('p1')) },
			{ id: 'd3', label: 'ft_ultimate_ft(&p2)', ast: call(variable('done'), 'ft_ultimate_ft', [addr('p2')]) }
		],
		vars: [
			{ name: 'x', value: 0, kind: 'int' },
			{ name: 'p1', value: 0, kind: 'ptr' },
			{ name: 'p2', value: 0, kind: 'ptr' },
			{ name: 'done', value: 0, kind: 'int' }
		],
		slots: 3,
		par: 3,
		goal: { x: 42 },
		bank: [
			{ id: 'peel1', label: 'a = *nbr', ast: assign(variable('a'), deref('nbr')) },
			{ id: 'peel2', label: 'b = *a', ast: assign(variable('b'), deref('a')) },
			{ id: 'write', label: '*b = 42', ast: assign(deref('b'), lit(42)) },
			{ id: 'short', label: '*a = 42  (une étoile de trop peu)', ast: assign(deref('a'), lit(42)) }
		]
	},
	{
		// ÉCRIS ft_rev_int_tab (C01) — renversement INDEXÉ : tab[i] ≡ *(tab + i), et
		// l'arithmétique de pointeur scale par sizeof(int) (M11). Deux curseurs i et j se
		// croisent, on échange tab[i] et tab[j] via tmp.
		id: '2-1',
		world: 'Tableaux & échange',
		title: 'Écris ft_rev_int_tab',
		goalText: 'Écris le CORPS de ft_rev_int_tab(tab, size). main renverse [1, 2, 3] en place : t0 doit valoir 3 et t2 valoir 1.',
		hint: 'Deux curseurs partent des extrémités et se croisent : à chaque tour, qu\'échanges-tu, et que devient l\'ancienne valeur si tu n\'as pas de tmp ? (cours M11)',
		assembleInto: 'ft_rev_int_tab',
		params: ['tab', 'size'],
		driverText: 'main (verrouillé) : ft_rev_int_tab(&t0, 3)',
		driver: [{ id: 'drv', label: 'ft_rev_int_tab(&t0, 3)', ast: call(variable('done'), 'ft_rev_int_tab', [addr('t0'), lit(3)]) }],
		vars: [
			{ name: 't0', value: 1, kind: 'int' },
			{ name: 't1', value: 2, kind: 'int' },
			{ name: 't2', value: 3, kind: 'int' },
			{ name: 'done', value: 0, kind: 'int' }
		],
		slots: 3,
		par: 3,
		goal: { t0: 3, t1: 2, t2: 1 },
		bank: [
			{ id: 'i0', label: 'i = 0', ast: assign(variable('i'), lit(0)) },
			{ id: 'j0', label: 'j = size - 1', ast: assign(variable('j'), bin('-', variable('size'), lit(1))) },
			{ id: 'loop', label: 'tant que i < j : tmp = tab[i] ; tab[i] = tab[j] ; tab[j] = tmp ; i = i+1 ; j = j-1',
				ast: whileLoop(bin('<', variable('i'), variable('j')), [
					assign(variable('tmp'), load(variable('tab'), variable('i'))),
					assign(store(variable('tab'), variable('i')), load(variable('tab'), variable('j'))),
					assign(store(variable('tab'), variable('j')), variable('tmp')),
					assign(variable('i'), bin('+', variable('i'), lit(1))),
					assign(variable('j'), bin('-', variable('j'), lit(1)))
				]) },
			{ id: 'loop-bad', label: 'tant que i < size : … (i va trop loin)',
				ast: whileLoop(bin('<', variable('i'), variable('size')), [
					assign(variable('tmp'), load(variable('tab'), variable('i'))),
					assign(store(variable('tab'), variable('i')), load(variable('tab'), variable('j'))),
					assign(store(variable('tab'), variable('j')), variable('tmp')),
					assign(variable('i'), bin('+', variable('i'), lit(1))),
					assign(variable('j'), bin('-', variable('j'), lit(1)))
				]) }
		]
	},
	{
		id: '3-1',
		world: 'Mémoire dynamique',
		title: 'Réserve, écris, libère',
		goalText: 'Réserve un casier, écris 7 dedans, puis libère-le. Objectif : zéro fuite.',
		hint: 'Pour écrire dans *p sans crash, p doit viser un vrai casier : d\'où vient cette adresse ? Et un bloc du tas t\'appartient jusqu\'à quand ? (cours M7-M8)',
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
		hint: 'Règle du tas : à chaque malloc, un seul free — ni zéro (fuite), ni deux (double free, cours M8). Combien de blocs as-tu réservés ?',
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
		goalText: 'Forme la chaîne « Hi » dans c0, c1, c2 — sans oublier ce qui marque la fin d\'une vraie chaîne C.',
		hint: 'Une chaîne C n\'en est une que terminée par sa sentinelle \'\\0\' (valeur 0, cours M10). L\'as-tu posée au bon endroit ?',
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
	},
	{
		id: 's-1',
		world: 'Sortie & ASCII',
		title: 'Affiche « Hi »',
		goalText: 'Fais apparaître Hi sur la sortie. write(1, &c, 1) émet UN octet lu à une adresse.',
		hint: 'write émet les octets dans l\'ordre où tu les lui donnes (cours M3). Le ruban console garde cet ordre : compare Hi et iH.',
		vars: [
			{ name: 'c0', value: 'H', kind: 'char' },
			{ name: 'c1', value: 'i', kind: 'char' }
		],
		slots: 2,
		par: 2,
		goalCheck: (mem) => mem.output === 'Hi',
		bank: [
			{ id: 'w-c0', label: 'write(1, &c0, 1)', ast: write(1, addr('c0'), lit(1)) },
			{ id: 'w-c1', label: 'write(1, &c1, 1)', ast: write(1, addr('c1'), lit(1)) },
			{ id: 'w-c0-2', label: 'write(1, &c0, 2)', ast: write(1, addr('c0'), lit(2)) }
		]
	},
	{
		// ÉCRIS ft_putstr (C01/C04) en réutilisant ta libft : mesure la longueur avec
		// ft_strlen, puis émets tout le bloc d'un coup. Pas de longueur stockée en C — on
		// la calcule (M10).
		id: 'io-1',
		world: 'Sortie & ASCII',
		title: 'Écris ft_putstr (avec ta libft)',
		goalText: 'Écris le CORPS de ft_putstr(s). main l\'appelle sur « Hi » : la sortie doit être « Hi ». Utilise TON ft_strlen pour la longueur.',
		hint: 'write émet un nombre d\'octets donné depuis une adresse. Combien d\'octets fait « Hi », et où trouver ce nombre sans le recompter à la main ? (cours M10)',
		assembleInto: 'ft_putstr',
		params: ['s'],
		usesLibft: ['ft_strlen'],
		functions: { ft_strlen: REF_STRLEN },
		driverText: 'main (verrouillé) : ft_putstr(&c0)',
		driver: [{ id: 'drv', label: 'ft_putstr(&c0)', ast: call(variable('done'), 'ft_putstr', [addr('c0')]) }],
		vars: [
			{ name: 'c0', value: 'H', kind: 'char' },
			{ name: 'c1', value: 'i', kind: 'char' },
			{ name: 'c2', value: 0, kind: 'char' },
			{ name: 'done', value: 0, kind: 'int' }
		],
		slots: 2,
		par: 2,
		goalCheck: (mem) => mem.output === 'Hi',
		bank: [
			{ id: 'len', label: 'len = ft_strlen(s)', ast: call(variable('len'), 'ft_strlen', [variable('s')]) },
			{ id: 'emit', label: 'write(1, s, len)', ast: write(1, variable('s'), variable('len')) },
			{ id: 'emit-bad', label: 'write(1, s, 1)', ast: write(1, variable('s'), lit(1)) }
		]
	},
	{
		// ft_print_alphabet (C00) : émettre a…z. Une boucle où le caractère se CALCULE :
		// c = 'a' + i (un char est son code ASCII), puis write(1, &c, 1).
		id: 'io-2',
		world: 'Sortie & ASCII',
		title: 'Écris ft_print_alphabet',
		goalText: 'Affiche l\'alphabet « abc…z » sur la sortie, avec une seule boucle de 26 tours.',
		hint: 'À chaque tour, quel caractère écrire ? Un char est son code ASCII : que vaut « \'a\' + i » quand i va de 0 à 25 ? (cours M1/M2)',
		vars: [{ name: 'c', value: 0, kind: 'char' }],
		slots: 1,
		par: 1,
		goalCheck: (mem) => mem.output === 'abcdefghijklmnopqrstuvwxyz',
		bank: [
			{ id: 'loop', label: 'boucle 26× : c = \'a\' + i ; write(1, &c, 1)',
				ast: loop(lit(26), [assign(variable('c'), bin('+', lit('a'), iter())), write(1, addr('c'), lit(1))]) },
			{ id: 'loop-bad', label: 'boucle 26× : c = \'a\' ; write(1, &c, 1)',
				ast: loop(lit(26), [assign(variable('c'), lit('a')), write(1, addr('c'), lit(1))]) }
		]
	},
	{
		// ft_print_numbers (C00) : émettre 0…9. Même patron, mais le chiffre-caractère se
		// fabrique avec c = i + '0' (l'inverse de « c - '0' » d'atoi).
		id: 'io-3',
		world: 'Sortie & ASCII',
		title: 'Écris ft_print_numbers',
		goalText: 'Affiche « 0123456789 » sur la sortie, avec une seule boucle de 10 tours.',
		hint: 'Le chiffre i (0-9) et le CARACTÈRE qui l\'affiche n\'ont pas le même code. Quelle opération transforme le nombre i en son caractère ? (cours M2)',
		vars: [{ name: 'c', value: 0, kind: 'char' }],
		slots: 1,
		par: 1,
		goalCheck: (mem) => mem.output === '0123456789',
		bank: [
			{ id: 'loop', label: 'boucle 10× : c = i + \'0\' ; write(1, &c, 1)',
				ast: loop(lit(10), [assign(variable('c'), bin('+', iter(), lit('0'))), write(1, addr('c'), lit(1))]) },
			{ id: 'loop-bad', label: 'boucle 10× : c = i ; write(1, &c, 1)',
				ast: loop(lit(10), [assign(variable('c'), iter()), write(1, addr('c'), lit(1))]) }
		]
	},
	{
		// ÉCRIS ft_strcpy (C02) depuis zéro : boucle de copie + la sentinelle finale.
		// La destination est pré-remplie de « X » : oublier le \0 laisse un X → échec.
		id: 'str-1',
		world: 'Chaînes & bornes',
		title: 'Écris ft_strcpy',
		goalText: 'Écris le CORPS de ft_strcpy(dst, src). main copie « Hi » de src vers dst : à la fin, dst doit contenir H, i, puis la fin de chaîne.',
		hint: 'Copier une chaîne = recopier octet par octet jusqu\'où ? La sentinelle \'\\0\' fait-elle partie de la copie ? (cours M10)',
		assembleInto: 'ft_strcpy',
		params: ['dst', 'src'],
		driverText: 'main (verrouillé) : ft_strcpy(&d0, &s0)',
		driver: [{ id: 'drv', label: 'ft_strcpy(&d0, &s0)', ast: call(variable('done'), 'ft_strcpy', [addr('d0'), addr('s0')]) }],
		vars: [
			{ name: 's0', value: 'H', kind: 'char' },
			{ name: 's1', value: 'i', kind: 'char' },
			{ name: 's2', value: 0, kind: 'char' },
			{ name: 'd0', value: 'X', kind: 'char' },
			{ name: 'd1', value: 'X', kind: 'char' },
			{ name: 'd2', value: 'X', kind: 'char' },
			{ name: 'done', value: 0, kind: 'int' }
		],
		slots: 4,
		par: 4,
		goalCheck: (mem) => mem.getVar('d0') === 'H' && mem.getVar('d1') === 'i' && mem.getVar('d2') === 0,
		bank: [
			{ id: 'init', label: 'i = 0', ast: assign(variable('i'), lit(0)) },
			{ id: 'copy', label: 'tant que src[i] != 0 : dst[i] = src[i] ; i = i + 1',
				ast: whileLoop(bin('!=', load(variable('src'), variable('i')), lit(0)), [
					assign(store(variable('dst'), variable('i')), load(variable('src'), variable('i'))),
					assign(variable('i'), bin('+', variable('i'), lit(1)))
				]) },
			{ id: 'term', label: 'dst[i] = 0  (la fin de chaîne)', ast: assign(store(variable('dst'), variable('i')), lit(0)) },
			{ id: 'ret', label: 'return dst', ast: ret(variable('dst')) }
		]
	},
	{
		// ÉCRIS ft_atoi (C04) depuis zéro. Cœur : un chiffre-caractère vaut son code ASCII,
		// donc « c - '0' » donne le chiffre ; on empile avec res = res*10 + chiffre.
		id: 'conv-1',
		world: 'Conversion nombre↔texte',
		title: 'Écris ft_atoi',
		goalText: 'Écris le CORPS de ft_atoi(s). main l\'appelle sur « 42 » : n doit valoir 42.',
		hint: 'Un chiffre-caractère vaut son code ASCII : que donne « c moins \'0\' » ? Comment empiler les chiffres pour reformer le nombre ? (cours M2)',
		assembleInto: 'ft_atoi',
		params: ['s'],
		driverText: 'main (verrouillé) : n = ft_atoi(&c0)',
		driver: [{ id: 'drv', label: 'n = ft_atoi(&c0)', ast: call(variable('n'), 'ft_atoi', [addr('c0')]) }],
		vars: [
			{ name: 'c0', value: '4', kind: 'char' },
			{ name: 'c1', value: '2', kind: 'char' },
			{ name: 'c2', value: 0, kind: 'char' },
			{ name: 'n', value: 0, kind: 'int' }
		],
		slots: 4,
		par: 4,
		goal: { n: 42 },
		bank: [
			{ id: 'r0', label: 'res = 0', ast: assign(variable('res'), lit(0)) },
			{ id: 'i0', label: 'i = 0', ast: assign(variable('i'), lit(0)) },
			{ id: 'scan', label: "tant que s[i] != 0 : res = res*10 + (s[i] - '0') ; i = i + 1",
				ast: whileLoop(bin('!=', load(variable('s'), variable('i')), lit(0)), [
					assign(variable('res'), bin('+', bin('*', variable('res'), lit(10)), bin('-', load(variable('s'), variable('i')), lit('0')))),
					assign(variable('i'), bin('+', variable('i'), lit(1)))
				]) },
			{ id: 'ret', label: 'return res', ast: ret(variable('res')) },
			{ id: 'scan-bad', label: 'tant que s[i] != 0 : res = res*10 + s[i] ; i = i + 1',
				ast: whileLoop(bin('!=', load(variable('s'), variable('i')), lit(0)), [
					assign(variable('res'), bin('+', bin('*', variable('res'), lit(10)), load(variable('s'), variable('i')))),
					assign(variable('i'), bin('+', variable('i'), lit(1)))
				]) }
		]
	},
	{
		// ÉCRIS ft_putnbr_base (C04, récursif) — généralise ft_putnbr à une base B. Le chiffre
		// n'est plus (n%B + '0') mais le symbole base[n%B] : on INDEXE la chaîne de base
		// (tab[i] ≡ *(tab+i), M11). Ici base « 01 » (binaire) : 5 → « 101 ».
		id: 'conv-2',
		world: 'Conversion nombre↔texte',
		title: 'Écris ft_putnbr_base (binaire)',
		goalText: 'Écris le CORPS de ft_putnbr_base(n). main l\'appelle sur 5 avec la base « 01 » : la sortie doit être « 101 » (5 en binaire).',
		hint: 'Comme ft_putnbr, mais le symbole d\'un chiffre n\'est plus « + \'0\' » : il se lit dans la chaîne de base à l\'indice n % base. Combien de symboles compte le binaire ? (cours M2/M11)',
		assembleInto: 'ft_putnbr_base',
		params: ['n'],
		driverText: 'main (verrouillé) : ft_putnbr_base(5)  ·  base « 01 »',
		driver: [{ id: 'drv', label: 'ft_putnbr_base(5)', ast: call(variable('done'), 'ft_putnbr_base', [lit(5)]) }],
		vars: [
			{ name: 'base0', value: '0', kind: 'char' },
			{ name: 'base1', value: '1', kind: 'char' },
			{ name: 'done', value: 0, kind: 'int' }
		],
		slots: 3,
		par: 3,
		goalCheck: (mem) => mem.output === '101',
		bank: [
			{ id: 'rec', label: 'si (n >= 2) : q = n / 2 ; ft_putnbr_base(q)',
				ast: ifThen(bin('>=', variable('n'), lit(2)), [assign(variable('q'), bin('/', variable('n'), lit(2))), call(variable('_'), 'ft_putnbr_base', [variable('q')])]) },
			{ id: 'digit', label: 'd = base[n % 2]', ast: assign(variable('d'), load(addr('base0'), bin('%', variable('n'), lit(2)))) },
			{ id: 'emit', label: 'write(1, &d, 1)', ast: write(1, addr('d'), lit(1)) },
			{ id: 'digit-bad', label: 'd = n % 2  (le chiffre, pas son symbole)', ast: assign(variable('d'), bin('%', variable('n'), lit(2))) }
		]
	},
	{
		// Le piège reine de C12 (M12) : libérer toute la liste. free(cur) est légal, mais si
		// tu lis cur->next APRÈS l'avoir libéré, c'est un use-after-free (tu perds la suite).
		// La discipline : sauver ->next AVANT free(cur). L'appât free(n1->next) le montre.
		id: 'l-1',
		world: 'Listes & arbres',
		title: 'Libère toute la liste',
		goalText: 'La liste n1 → n2 est déjà chaînée. Libère les DEUX maillons sans fuite ni crash use-after-free.',
		hint: 'Pour libérer un nœud sans perdre la suite de la liste, que dois-tu lire et garder juste avant le free ? (cours M8/M12)',
		vars: [
			{ name: 'n1', value: 0, kind: 'ptr' },
			{ name: 'n2', value: 0, kind: 'ptr' },
			{ name: 'nxt', value: 0, kind: 'ptr' }
		],
		slots: 6,
		par: 6,
		goalCheck: (mem) => mem.leaks().length === 0 && mem.freed.size >= 4,
		bank: [
			{ id: 'mk-n1', label: 'n1 = node(1)', ast: assign(variable('n1'), node(lit(1))) },
			{ id: 'mk-n2', label: 'n2 = node(2)', ast: assign(variable('n2'), node(lit(2))) },
			{ id: 'link', label: 'n1->next = n2', ast: assign(field(variable('n1'), 'next'), variable('n2')) },
			{ id: 'save', label: 'nxt = n1->next', ast: assign(variable('nxt'), field(variable('n1'), 'next')) },
			{ id: 'free-n1', label: 'free(n1)', ast: freeNode(variable('n1')) },
			{ id: 'free-nxt', label: 'free(nxt)', ast: freeNode(variable('nxt')) },
			{ id: 'free-via', label: 'free(n1->next)', ast: freeNode(field(variable('n1'), 'next')) }
		]
	},
	{
		id: 'str-2',
		world: 'Chaînes & bornes',
		title: 'Termine, puis mesure',
		goalText: 'Mesure la longueur de « Hi » dans n (doit valoir 2). Mais d\'abord, borne la chaîne.',
		hint: 'strlen compte jusqu\'à la sentinelle \'\\0\' (cours M10). Si la chaîne n\'a pas de borne, où s\'arrête le comptage ?',
		vars: [
			{ name: 'n', value: 0, kind: 'int' },
			{ name: 'c0', value: 'H', kind: 'char' },
			{ name: 'c1', value: 'i', kind: 'char' },
			{ name: 'c2', value: 7, kind: 'char' }
		],
		slots: 2,
		par: 2,
		goal: { n: 2 },
		bank: [
			{ id: 'set-term', label: "c2 = '\\0'", ast: assign(variable('c2'), lit(0)) },
			{ id: 'measure', label: 'n = strlen(&c0)', ast: assign(variable('n'), strlen(addr('c0'))) },
			{ id: 'atoi-bad', label: 'n = atoi(&c0)', ast: assign(variable('n'), atoi(addr('c0'))) }
		]
	},
	{
		id: 'f-1',
		world: 'Fichiers & syscalls',
		title: 'Affiche le fichier',
		goalText: 'Ouvre le fichier, lis son contenu dans le buffer, écris-le sur la sortie, puis FERME-le.',
		hint: 'Un fichier se manipule par son descripteur (fd) : d\'où vient-il, et que ne doit-il plus rester d\'ouvert à la fin pour ne pas fuiter ?',
		files: { 'hi.txt': 'Hi' },
		vars: [
			{ name: 'fd', value: 0, kind: 'int' },
			{ name: 'buf0', value: 0, kind: 'char' },
			{ name: 'buf1', value: 0, kind: 'char' },
			{ name: 'n', value: 0, kind: 'int' }
		],
		slots: 4,
		par: 4,
		goalCheck: (mem) => mem.output === 'Hi' && mem.openDescriptors().length === 0,
		bank: [
			{ id: 'open', label: 'fd = open("hi.txt")', ast: assign(variable('fd'), open('hi.txt')) },
			{ id: 'read', label: 'n = read(fd, &buf0, 2)', ast: assign(variable('n'), read(variable('fd'), addr('buf0'), lit(2))) },
			{ id: 'write', label: 'write(1, &buf0, n)', ast: write(1, addr('buf0'), variable('n')) },
			{ id: 'close', label: 'close(fd)', ast: close(variable('fd')) }
		]
	},
	{
		// ÉCRIS ft_strdup (C07) en RÉUTILISANT ta libft : ft_strlen pour la taille, malloc,
		// ft_strcpy pour la copie. C'est le capstone de la chaîne de forge (M7 + M10).
		id: 'dup-1',
		world: 'Mémoire dynamique — le Tas',
		title: 'Écris ft_strdup (avec ta libft)',
		goalText: 'Écris le CORPS de ft_strdup(src) en appelant TES ft_strlen et ft_strcpy. main duplique « Hi » : p doit pointer une copie « Hi » sur le tas.',
		hint: 'Combien d\'octets réserver pour loger « Hi » ET sa sentinelle \'\\0\' ? Où trouver cette longueur sans la recompter à la main ? (cours M7/M10)',
		assembleInto: 'ft_strdup',
		params: ['src'],
		usesLibft: ['ft_strlen', 'ft_strcpy'],
		functions: { ft_strlen: REF_STRLEN, ft_strcpy: REF_STRCPY },
		driverText: 'main (verrouillé) : p = ft_strdup(&s0)',
		driver: [{ id: 'drv', label: 'p = ft_strdup(&s0)', ast: call(variable('p'), 'ft_strdup', [addr('s0')]) }],
		vars: [
			{ name: 's0', value: 'H', kind: 'char' },
			{ name: 's1', value: 'i', kind: 'char' },
			{ name: 's2', value: 0, kind: 'char' },
			{ name: 'p', value: 0, kind: 'ptr' }
		],
		slots: 5,
		par: 5,
		goalCheck: (mem) => {
			const p = mem.getVar('p');
			if (!p) return false;
			try {
				return mem.readAddr(p) === 'H' && mem.readAddr(p + 4) === 'i' && mem.readAddr(p + 8) === 0;
			} catch {
				return false;
			}
		},
		bank: [
			{ id: 'len', label: 'len = ft_strlen(src)', ast: call(variable('len'), 'ft_strlen', [variable('src')]) },
			{ id: 'size', label: 'size = len + 1', ast: assign(variable('size'), bin('+', variable('len'), lit(1))) },
			{ id: 'alloc', label: 'dst = malloc(size)', ast: assign(variable('dst'), malloc(variable('size'))) },
			{ id: 'copy', label: 'ft_strcpy(dst, src)', ast: call(variable('cp'), 'ft_strcpy', [variable('dst'), variable('src')]) },
			{ id: 'ret', label: 'return dst', ast: ret(variable('dst')) },
			{ id: 'alloc-bad', label: 'dst = malloc(len)', ast: assign(variable('dst'), malloc(variable('len'))) }
		]
	},
	{
		// ÉCRIS ft_range (C07) — un tableau DYNAMIQUE : malloc(size) puis remplissage
		// indexé arr[i] = min + i. Le pont M11 (tab[i] ≡ *(tab+i)) × M7 (le tas).
		id: 'range-1',
		world: 'Mémoire dynamique — le Tas',
		title: 'Écris ft_range',
		goalText: 'Écris le CORPS de ft_range(min, max). main appelle ft_range(2, 5) : p doit pointer un tableau [2, 3, 4] sur le tas.',
		hint: 'Combien de cases entre min et max ? Une fois le bloc réservé, comment remplir la case d\'indice i pour qu\'elle vaille min + i ? (cours M11/M7)',
		assembleInto: 'ft_range',
		params: ['min', 'max'],
		driverText: 'main (verrouillé) : p = ft_range(2, 5)',
		driver: [{ id: 'drv', label: 'p = ft_range(2, 5)', ast: call(variable('p'), 'ft_range', [lit(2), lit(5)]) }],
		vars: [{ name: 'p', value: 0, kind: 'ptr' }],
		slots: 5,
		par: 5,
		goalCheck: (mem) => {
			const p = mem.getVar('p');
			if (!p) return false;
			try {
				return mem.readAddr(p) === 2 && mem.readAddr(p + 4) === 3 && mem.readAddr(p + 8) === 4;
			} catch {
				return false;
			}
		},
		bank: [
			{ id: 'size', label: 'size = max - min', ast: assign(variable('size'), bin('-', variable('max'), variable('min'))) },
			{ id: 'alloc', label: 'arr = malloc(size)', ast: assign(variable('arr'), malloc(variable('size'))) },
			{ id: 'i0', label: 'i = 0', ast: assign(variable('i'), lit(0)) },
			{ id: 'fill', label: 'tant que i < size : arr[i] = min + i ; i = i+1',
				ast: whileLoop(bin('<', variable('i'), variable('size')), [
					assign(store(variable('arr'), variable('i')), bin('+', variable('min'), variable('i'))),
					assign(variable('i'), bin('+', variable('i'), lit(1)))
				]) },
			{ id: 'ret', label: 'return arr', ast: ret(variable('arr')) },
			{ id: 'fill-bad', label: 'tant que i < size : arr[i] = i ; i = i+1',
				ast: whileLoop(bin('<', variable('i'), variable('size')), [
					assign(store(variable('arr'), variable('i')), variable('i')),
					assign(variable('i'), bin('+', variable('i'), lit(1)))
				]) }
		]
	},
	{
		// Libère le résultat d'un ft_split (C07/M9) : un tableau de N chaînes = N blocs de
		// chaîne + 1 bloc de tableau. Il faut N+1 free. Le piège classique : libérer les
		// chaînes mais OUBLIER le tableau (fuite du conteneur). Regarde le rapport valgrind.
		id: 'split-1',
		world: 'Mémoire dynamique — le Tas',
		title: 'Libère un tableau de chaînes (N+1 free)',
		goalText: 'ft_split a rendu un tableau de 2 chaînes (déjà alloué). Libère TOUT sans fuite : les 2 chaînes ET le tableau. Vise « 0 bytes lost ».',
		hint: 'Un tableau de N chaînes, c\'est combien de blocs alloués en tout ? Combien de free faut-il, et lequel oublie-t-on le plus souvent ? (cours M9)',
		vars: [
			{ name: 's0', value: 0, kind: 'ptr' },
			{ name: 's1', value: 0, kind: 'ptr' },
			{ name: 'tab', value: 0, kind: 'ptr' }
		],
		slots: 8,
		par: 8,
		goalCheck: (mem) => mem.leaks().length === 0 && mem.freed.size >= 3,
		bank: [
			{ id: 'a0', label: 's0 = malloc(1)  (1re chaîne)', ast: assign(variable('s0'), malloc(lit(1))) },
			{ id: 'a1', label: 's1 = malloc(1)  (2e chaîne)', ast: assign(variable('s1'), malloc(lit(1))) },
			{ id: 'at', label: 'tab = malloc(2)  (le tableau)', ast: assign(variable('tab'), malloc(lit(2))) },
			{ id: 'l0', label: 'tab[0] = s0', ast: assign(store(variable('tab'), lit(0)), variable('s0')) },
			{ id: 'l1', label: 'tab[1] = s1', ast: assign(store(variable('tab'), lit(1)), variable('s1')) },
			{ id: 'f0', label: 'free(s0)', ast: freeOp('s0') },
			{ id: 'f1', label: 'free(s1)', ast: freeOp('s1') },
			{ id: 'ft', label: 'free(tab)', ast: freeOp('tab') }
		]
	},
	{
		// Le piège mortel du M6 : renvoyer &locale. Au return, la frame meurt → l'adresse
		// rendue pointe une case morte (dangling). C'est POURQUOI le tas existe (transition
		// M6 → M7) : le bloc malloc, lui, survit au return.
		id: 'dang-1',
		world: 'Mémoire dynamique — le Tas',
		title: 'Pourquoi le tas existe (dangling pointer)',
		goalText: 'Écris le CORPS de make_answer() qui rend un pointeur vers 42. main le déréférence après le return : y doit valoir 42, sans planter.',
		hint: 'Une variable locale meurt au return (sa frame est dépilée). Que reste-t-il si tu rends son adresse ? Où loger 42 pour qu\'il SURVIVE à la fonction ? (cours M6/M7)',
		assembleInto: 'make_answer',
		params: [],
		driverText: 'main (verrouillé) : p = make_answer() · y = *p · free(p)',
		driver: [
			{ id: 'd1', label: 'p = make_answer()', ast: call(variable('p'), 'make_answer', []) },
			{ id: 'd2', label: 'y = *p', ast: assign(variable('y'), deref('p')) },
			{ id: 'd3', label: 'free(p)', ast: freeOp('p') }
		],
		vars: [
			{ name: 'p', value: 0, kind: 'ptr' },
			{ name: 'y', value: 0, kind: 'int' }
		],
		slots: 3,
		par: 3,
		goal: { y: 42 },
		bank: [
			{ id: 'h-alloc', label: 'm = malloc(1)', ast: assign(variable('m'), malloc(lit(1))) },
			{ id: 'h-set', label: '*m = 42', ast: assign(deref('m'), lit(42)) },
			{ id: 'h-ret', label: 'return m  (le tas survit)', ast: ret(variable('m')) },
			{ id: 's-set', label: 'x = 42  (une locale)', ast: assign(variable('x'), lit(42)) },
			{ id: 's-ret', label: 'return &x  (l\'adresse d\'une locale)', ast: ret(addr('x')) }
		]
	},
	{
		// ÉCRIS ft_putnbr (C00/C04, récursif) — le capstone conversion : récursion (M6),
		// arithmétique de chiffres (n/10, n%10), char = code ASCII (chiffre + '0'), et
		// write via &d (locale adressable). Récursif : les chiffres de poids fort d'abord.
		id: 'conv-3',
		world: 'Conversion nombre↔texte',
		title: 'Écris ft_putnbr (récursif)',
		goalText: 'Écris le CORPS de ft_putnbr(n). main l\'appelle sur 42 : la sortie doit être « 42 ». Récursion : les chiffres de poids fort s\'affichent d\'abord.',
		hint: 'Pour afficher 42, il faut sortir le 4 AVANT le 2. Que fait ft_putnbr(n / 10) avant d\'afficher le dernier chiffre ? Et quel calcul transforme n % 10 en son caractère ? (cours M2/M6)',
		assembleInto: 'ft_putnbr',
		params: ['n'],
		driverText: 'main (verrouillé) : ft_putnbr(42)',
		driver: [{ id: 'drv', label: 'ft_putnbr(42)', ast: call(variable('done'), 'ft_putnbr', [lit(42)]) }],
		vars: [{ name: 'done', value: 0, kind: 'int' }],
		slots: 3,
		par: 3,
		goalCheck: (mem) => mem.output === '42',
		bank: [
			{ id: 'rec', label: 'si (n >= 10) : q = n / 10 ; ft_putnbr(q)',
				ast: ifThen(bin('>=', variable('n'), lit(10)), [assign(variable('q'), bin('/', variable('n'), lit(10))), call(variable('_'), 'ft_putnbr', [variable('q')])]) },
			{ id: 'digit', label: 'd = n % 10 + \'0\'', ast: assign(variable('d'), bin('+', bin('%', variable('n'), lit(10)), lit('0'))) },
			{ id: 'emit', label: 'write(1, &d, 1)', ast: write(1, addr('d'), lit(1)) },
			{ id: 'digit-bad', label: 'd = n % 10  (le chiffre brut, pas son caractère)', ast: assign(variable('d'), bin('%', variable('n'), lit(10))) }
		]
	},
	{
		// L'explorateur d'octets (M1/M2) : un int > 255 ne tient pas dans UNE case — il
		// s'étale sur plusieurs, en LITTLE-ENDIAN. Extraire un octet = base 256 : n % 256
		// donne l'octet de poids faible, n / 256 fait glisser au suivant. 1000 → e8 03 00 00.
		id: 'mem-1',
		world: 'Conversion nombre↔texte',
		title: 'L\'explorateur d\'octets (little-endian)',
		goalText: '1000 ne tient pas dans un octet (0-255) : il s\'étale sur plusieurs cases. Extrais l\'octet de poids faible (b0) et le suivant (b1). Pour 1000 : b0 = 232 (0xe8), b1 = 3.',
		hint: 'Un octet va de 0 à 255 : quelle opération donne le RESTE d\'un nombre par 256 ? Et laquelle fait glisser d\'un octet vers le suivant ? (cours M1/M2)',
		showBytes: ['n'],
		vars: [
			{ name: 'n', value: 1000, kind: 'int' },
			{ name: 'b0', value: 0, kind: 'int' },
			{ name: 'b1', value: 0, kind: 'int' }
		],
		slots: 2,
		par: 2,
		goal: { b0: 232, b1: 3 },
		bank: [
			{ id: 'lo', label: 'b0 = n % 256', ast: assign(variable('b0'), bin('%', variable('n'), lit(256))) },
			{ id: 'hi', label: 'b1 = (n / 256) % 256', ast: assign(variable('b1'), bin('%', bin('/', variable('n'), lit(256)), lit(256))) },
			{ id: 'lo-bad', label: 'b0 = n / 256  (big-endian, à l\'envers)', ast: assign(variable('b0'), bin('/', variable('n'), lit(256))) }
		]
	},
	{
		id: 'strn-1',
		world: 'Chaînes & bornes',
		title: 'Copie bornée (ft_strncpy)',
		goalText: 'Copie EXACTEMENT les 2 premiers caractères de src (« Hi! ») dans dst, avec une boucle.',
		hint: 'Combien de caractères dois-tu copier — donc combien de tours de boucle ? Un tour de trop touche le caractère suivant (cours M11).',
		vars: [
			{ name: 's0', value: 'H', kind: 'char' },
			{ name: 's1', value: 'i', kind: 'char' },
			{ name: 's2', value: '!', kind: 'char' },
			{ name: 'd0', value: 0, kind: 'char' },
			{ name: 'd1', value: 0, kind: 'char' },
			{ name: 'd2', value: 0, kind: 'char' }
		],
		slots: 1,
		par: 1,
		goalCheck: (mem) => mem.getVar('d0') === 'H' && mem.getVar('d1') === 'i' && mem.getVar('d2') === 0,
		bank: [
			{ id: 'loop-2', label: 'boucle 2× : d[i] = s[i]', ast: loop(lit(2), [assign(store(addr('d0'), iter()), load(addr('s0'), iter()))]) },
			{ id: 'loop-3', label: 'boucle 3× : d[i] = s[i]', ast: loop(lit(3), [assign(store(addr('d0'), iter()), load(addr('s0'), iter()))]) }
		]
	},
	{
		// Niveau-fonction (docs/GAME-DESIGN.md §4) : le joueur écrit le CORPS de fact(n),
		// main est un lanceur verrouillé. La pile d'appels à l'écran est la conséquence
		// réelle de son assemblage — et son débordement, le piège emblématique.
		id: 'rec-1',
		world: 'Récursivité',
		title: 'Écris fact(n) — le cas de base d\'abord',
		goalText: 'Tu écris le CORPS de fact(n). main appelle fact(3) : à la fin, r doit valoir 6. Regarde la pile monter… puis se dérouler.',
		hint: 'Qu\'est-ce qui arrête une fonction qui s\'appelle elle-même ? Et l\'appel doit-il rapprocher n de cet arrêt, ou l\'en éloigner ? (cours M6)',
		assembleInto: 'fact',
		params: ['n'],
		driverText: 'main (verrouillé) : r = fact(3)',
		driver: [{ id: 'drv', label: 'r = fact(3)', ast: call(variable('r'), 'fact', [lit(3)]) }],
		vars: [{ name: 'r', value: 0, kind: 'int' }],
		slots: 3,
		par: 3,
		goal: { r: 6 },
		bank: [
			{ id: 'base', label: 'si (n <= 1) : return 1', ast: ifThen(bin('<=', variable('n'), lit(1)), [ret(lit(1))]) },
			{ id: 'rec', label: 't = fact(n - 1)', ast: call(variable('t'), 'fact', [bin('-', variable('n'), lit(1))]) },
			{ id: 'comb', label: 'return n * t', ast: ret(bin('*', variable('n'), variable('t'))) },
			{ id: 'rec-bad', label: 't = fact(n)', ast: call(variable('t'), 'fact', [variable('n')]) }
		]
	},
	{
		id: 'rec-2',
		world: 'Récursivité',
		title: 'fact(5) — sans filet',
		goalText: 'Même machine, appel plus profond : main appelle fact(5), r doit valoir 120. Toutes les pièces se ressemblent — une seule combinaison est juste.',
		hint: 'Deux pièces se ressemblent, une seule est juste : que doit valoir le cas de base pour ne pas tout annuler ? La combinaison utilise-t-elle le retour de l\'appel ? (cours M6)',
		assembleInto: 'fact',
		params: ['n'],
		driverText: 'main (verrouillé) : r = fact(5)',
		driver: [{ id: 'drv', label: 'r = fact(5)', ast: call(variable('r'), 'fact', [lit(5)]) }],
		vars: [{ name: 'r', value: 0, kind: 'int' }],
		slots: 3,
		par: 3,
		goal: { r: 120 },
		bank: [
			{ id: 'base', label: 'si (n <= 1) : return 1', ast: ifThen(bin('<=', variable('n'), lit(1)), [ret(lit(1))]) },
			{ id: 'base-bad', label: 'si (n <= 1) : return 0', ast: ifThen(bin('<=', variable('n'), lit(1)), [ret(lit(0))]) },
			{ id: 'rec', label: 't = fact(n - 1)', ast: call(variable('t'), 'fact', [bin('-', variable('n'), lit(1))]) },
			{ id: 'comb', label: 'return n * t', ast: ret(bin('*', variable('n'), variable('t'))) },
			{ id: 'comb-bad', label: 'return n', ast: ret(variable('n')) }
		]
	},
	{
		// ÉCRIS ft_strlen (C01/C02) depuis zéro — la première brique de ta libft. La boucle
		// s'arrête sur la sentinelle \'\\0\', pas sur un compteur magique. Forgée, elle
		// resservira à ft_strdup (M10).
		id: 'while-1',
		world: 'Chaînes & bornes',
		title: 'Écris ft_strlen',
		goalText: 'Écris le CORPS de ft_strlen(s). main l\'appelle sur « Hi » : n doit valoir 2. Cette fonction entre dans ta libft — tu la réutiliseras.',
		hint: 'Qu\'est-ce qui marque la fin d\'une chaîne (cours M10) ? Ta boucle s\'arrête sur ce signal — pas sur un nombre choisi au hasard.',
		assembleInto: 'ft_strlen',
		params: ['s'],
		driverText: 'main (verrouillé) : n = ft_strlen(&s0)',
		driver: [{ id: 'drv', label: 'n = ft_strlen(&s0)', ast: call(variable('n'), 'ft_strlen', [addr('s0')]) }],
		vars: [
			{ name: 's0', value: 'H', kind: 'char' },
			{ name: 's1', value: 'i', kind: 'char' },
			{ name: 's2', value: 0, kind: 'char' },
			{ name: 'n', value: 0, kind: 'int' }
		],
		slots: 3,
		par: 3,
		goal: { n: 2 },
		bank: [
			{ id: 'init', label: 'len = 0', ast: assign(variable('len'), lit(0)) },
			{ id: 'scan', label: 'tant que s[len] != 0 : len = len + 1', ast: whileLoop(bin('!=', load(variable('s'), variable('len')), lit(0)), [assign(variable('len'), bin('+', variable('len'), lit(1)))]) },
			{ id: 'ret', label: 'return len', ast: ret(variable('len')) },
			{ id: 'scan-bad', label: 'tant que len < 3 : len = len + 1', ast: whileLoop(bin('<', variable('len'), lit(3)), [assign(variable('len'), bin('+', variable('len'), lit(1)))]) }
		]
	},
	{
		// ÉCRIS ft_isdigit (C02/libft) : un char est un chiffre s'il est DANS la plage
		// '0'..'9'. Deux conditions à combiner par ET → produit de deux booléens (0/1).
		id: 'chr-1',
		world: 'Chaînes & bornes',
		title: 'Écris ft_isdigit',
		goalText: 'Écris le CORPS de ft_isdigit(c) : 1 si c est un chiffre, 0 sinon. main teste \'5\' (→ 1) et \'a\' (→ 0).',
		hint: 'Un chiffre est à la fois ≥ \'0\' ET ≤ \'9\'. Comment combiner deux tests (chacun 0 ou 1) pour n\'obtenir 1 que si les DEUX sont vrais ? (cours M2)',
		assembleInto: 'ft_isdigit',
		params: ['c'],
		driverText: 'main (verrouillé) : r1 = ft_isdigit(\'5\') · r2 = ft_isdigit(\'a\')',
		driver: [
			{ id: 'd1', label: 'r1 = ft_isdigit(\'5\')', ast: call(variable('r1'), 'ft_isdigit', [lit('5')]) },
			{ id: 'd2', label: 'r2 = ft_isdigit(\'a\')', ast: call(variable('r2'), 'ft_isdigit', [lit('a')]) }
		],
		vars: [{ name: 'r1', value: 0, kind: 'int' }, { name: 'r2', value: 0, kind: 'int' }],
		slots: 1,
		par: 1,
		goal: { r1: 1, r2: 0 },
		bank: [
			{ id: 'and', label: 'return (c >= \'0\') * (c <= \'9\')', ast: ret(bin('*', bin('>=', variable('c'), lit('0')), bin('<=', variable('c'), lit('9')))) },
			{ id: 'or-bad', label: 'return (c >= \'0\') + (c <= \'9\')', ast: ret(bin('+', bin('>=', variable('c'), lit('0')), bin('<=', variable('c'), lit('9')))) },
			{ id: 'half-bad', label: 'return c >= \'0\'', ast: ret(bin('>=', variable('c'), lit('0'))) }
		]
	},
	{
		// ÉCRIS ft_isalpha (C02/libft) : lettre = plage a..z OU A..Z. Deux plages disjointes
		// → somme des deux ET (l'une OU l'autre est vraie, jamais les deux).
		id: 'chr-2',
		world: 'Chaînes & bornes',
		title: 'Écris ft_isalpha',
		goalText: 'Écris le CORPS de ft_isalpha(c) : 1 si c est une lettre, 0 sinon. main teste \'Z\' (→ 1) et \'5\' (→ 0).',
		hint: 'Une lettre est dans a..z OU dans A..Z (deux plages qui ne se chevauchent pas). Comment obtenir 1 si l\'UNE des deux est vraie ? (cours M2)',
		assembleInto: 'ft_isalpha',
		params: ['c'],
		driverText: 'main (verrouillé) : r1 = ft_isalpha(\'Z\') · r2 = ft_isalpha(\'5\')',
		driver: [
			{ id: 'd1', label: 'r1 = ft_isalpha(\'Z\')', ast: call(variable('r1'), 'ft_isalpha', [lit('Z')]) },
			{ id: 'd2', label: 'r2 = ft_isalpha(\'5\')', ast: call(variable('r2'), 'ft_isalpha', [lit('5')]) }
		],
		vars: [{ name: 'r1', value: 0, kind: 'int' }, { name: 'r2', value: 0, kind: 'int' }],
		slots: 1,
		par: 1,
		goal: { r1: 1, r2: 0 },
		bank: [
			{ id: 'or', label: 'return (c>=\'a\')*(c<=\'z\') + (c>=\'A\')*(c<=\'Z\')', ast: ret(bin('+', bin('*', bin('>=', variable('c'), lit('a')), bin('<=', variable('c'), lit('z'))), bin('*', bin('>=', variable('c'), lit('A')), bin('<=', variable('c'), lit('Z'))))) },
			{ id: 'low-bad', label: 'return (c >= \'a\') * (c <= \'z\')', ast: ret(bin('*', bin('>=', variable('c'), lit('a')), bin('<=', variable('c'), lit('z')))) }
		]
	},
	{
		// ÉCRIS ft_toupper (C02/libft) : une minuscule vaut sa majuscule − 32 ; le reste est
		// inchangé. La CONDITION protège les non-lettres (toupper('A') = 'A', pas 'A'−32).
		id: 'chr-3',
		world: 'Chaînes & bornes',
		title: 'Écris ft_toupper',
		goalText: 'Écris le CORPS de ft_toupper(c) : majuscule si c est minuscule, inchangé sinon. main teste \'a\' (→ \'A\' = 65) et \'A\' (→ \'A\' = 65).',
		hint: 'Une minuscule et sa majuscule sont écartées de 32 dans la table ASCII. Mais que doit-il arriver à un caractère qui n\'est PAS une minuscule ? (cours M2)',
		assembleInto: 'ft_toupper',
		params: ['c'],
		driverText: 'main (verrouillé) : r1 = ft_toupper(\'a\') · r2 = ft_toupper(\'A\')',
		driver: [
			{ id: 'd1', label: 'r1 = ft_toupper(\'a\')', ast: call(variable('r1'), 'ft_toupper', [lit('a')]) },
			{ id: 'd2', label: 'r2 = ft_toupper(\'A\')', ast: call(variable('r2'), 'ft_toupper', [lit('A')]) }
		],
		vars: [{ name: 'r1', value: 0, kind: 'int' }, { name: 'r2', value: 0, kind: 'int' }],
		slots: 2,
		par: 2,
		// toupper('A') renvoie le char 'A' inchangé (code 65) ; toupper('a') renvoie 65
		// (nombre). On compare les CODES pour accepter les deux formes.
		goalCheck: (mem) => {
			const code = (v) => (typeof v === 'string' ? v.charCodeAt(0) : v);
			return code(mem.getVar('r1')) === 65 && code(mem.getVar('r2')) === 65;
		},
		bank: [
			{ id: 'cond', label: 'si ((c>=\'a\')*(c<=\'z\')) : c = c - 32', ast: ifThen(bin('*', bin('>=', variable('c'), lit('a')), bin('<=', variable('c'), lit('z'))), [assign(variable('c'), bin('-', variable('c'), lit(32)))]) },
			{ id: 'ret', label: 'return c', ast: ret(variable('c')) },
			{ id: 'uncond-bad', label: 'c = c - 32  (sans condition)', ast: assign(variable('c'), bin('-', variable('c'), lit(32))) }
		]
	}
];
