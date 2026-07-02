// Constructeurs d'AST fournis par la lane moteur (src/engine/ast.js) — cf. docs/COORDINATION.md.
import { lit, variable, addr, deref, assign, malloc, free as freeOp, write, strlen, atoi, putnbrBase, node, field, freeNode, open, read, close, bin, loop, whileLoop, iter, load, store, ifThen, call, ret, func } from '../engine/ast.js';

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
		id: '2-1',
		world: 'Tableaux & échange',
		title: 'Inverse le tableau',
		goalText: 'Inverse [1, 2, 3] en [3, 2, 1] : t0 doit valoir 3 et t2 doit valoir 1.',
		hint: 'Inverser les extrémités, c\'est l\'opération à deux cases déjà vue au swap — avec le même piège de la valeur perdue (cours M4).',
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
		id: 'conv-2',
		world: 'Conversion nombre↔texte',
		title: 'putnbr_base : nombre → hexa',
		goalText: 'Affiche 42 en base 16 (hexadécimal) : la sortie doit être « 2a ».',
		hint: 'Afficher en base B, c\'est extraire les chiffres par deux opérations arithmétiques. Combien de symboles compte la base 16 ? (cours M2)',
		vars: [
			{ name: 'n', value: 42, kind: 'int' }
		],
		slots: 1,
		par: 1,
		goalCheck: (mem) => mem.output === '2a',
		bank: [
			{ id: 'hex', label: 'putnbr_base(n, hex)', ast: putnbrBase(variable('n'), lit('0123456789abcdef')) },
			{ id: 'bin', label: 'putnbr_base(n, bin)', ast: putnbrBase(variable('n'), lit('01')) }
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
		id: 'conv-3',
		world: 'Conversion nombre↔texte',
		title: 'Extrais les chiffres',
		goalText: 'Sépare 42 : u = les unités (2), t = les dizaines (4). C\'est le cœur de putnbr.',
		hint: 'Quel calcul isole le dernier chiffre d\'un nombre ? Lequel retire ce chiffre ? C\'est le cœur de putnbr (cours M2).',
		vars: [
			{ name: 'n', value: 42, kind: 'int' },
			{ name: 'u', value: 0, kind: 'int' },
			{ name: 't', value: 0, kind: 'int' }
		],
		slots: 2,
		par: 2,
		goal: { u: 2, t: 4 },
		bank: [
			{ id: 'u-mod', label: 'u = n % 10', ast: assign(variable('u'), bin('%', variable('n'), lit(10))) },
			{ id: 't-div', label: 't = n / 10', ast: assign(variable('t'), bin('/', variable('n'), lit(10))) },
			{ id: 'u-div-bad', label: 'u = n / 10', ast: assign(variable('u'), bin('/', variable('n'), lit(10))) }
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
	}
];
