// Constructeurs d'AST fournis par la lane moteur (src/engine/ast.js) — cf. docs/COORDINATION.md.
import { lit, variable, addr, deref, assign, malloc, free as freeOp, write, strlen, atoi, putnbrBase, strcpy, node, field, freeNode, open, read, close, bin, loop, whileLoop, iter, load, store, ifThen, call, ret } from '../engine/ast.js';

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
	},
	{
		id: 's-1',
		world: 'Sortie & ASCII',
		title: 'Affiche « Hi »',
		goalText: 'Fais apparaître Hi sur la sortie. write(1, &c, 1) émet UN octet lu à une adresse.',
		hint: 'Comme ft_putchar : write(1, &c0, 1) puis write(1, &c1, 1). L\'ordre compte (Hi ≠ iH).',
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
		id: 'str-1',
		world: 'Chaînes & bornes',
		title: 'Copie la chaîne',
		goalText: 'Copie src (« Hi ») dans dst. strcpy recopie octet par octet jusqu\'à la borne \'\\0\'.',
		hint: 'strcpy(&d0, &s0) : la destination reçoit \'H\', \'i\', \'\\0\'. La borne fait partie de la copie.',
		vars: [
			{ name: 's0', value: 'H', kind: 'char' },
			{ name: 's1', value: 'i', kind: 'char' },
			{ name: 's2', value: 0, kind: 'char' },
			{ name: 'd0', value: 0, kind: 'char' },
			{ name: 'd1', value: 0, kind: 'char' },
			{ name: 'd2', value: 0, kind: 'char' }
		],
		slots: 1,
		par: 1,
		goalCheck: (mem) => mem.getVar('d0') === 'H' && mem.getVar('d1') === 'i' && mem.getVar('d2') === 0,
		bank: [
			{ id: 'cpy', label: 'strcpy(&d0, &s0)', ast: strcpy(addr('d0'), addr('s0')) },
			{ id: 'cpy-bad', label: 'strcpy(&d0, &d0)', ast: strcpy(addr('d0'), addr('d0')) }
		]
	},
	{
		id: 'conv-1',
		world: 'Conversion nombre↔texte',
		title: 'atoi : texte → nombre',
		goalText: 'Convertis la chaîne « 42 » en l\'entier 42 dans n.',
		hint: 'atoi lit les chiffres : res = res*10 + (c - \'0\'). Fais n = atoi(&c0).',
		vars: [
			{ name: 'c0', value: '4', kind: 'char' },
			{ name: 'c1', value: '2', kind: 'char' },
			{ name: 'c2', value: 0, kind: 'char' },
			{ name: 'n', value: 0, kind: 'int' }
		],
		slots: 1,
		par: 1,
		goal: { n: 42 },
		bank: [
			{ id: 'atoi', label: 'n = atoi(&c0)', ast: assign(variable('n'), atoi(addr('c0'))) },
			{ id: 'len', label: 'n = strlen(&c0)', ast: assign(variable('n'), strlen(addr('c0'))) }
		]
	},
	{
		id: 'conv-2',
		world: 'Conversion nombre↔texte',
		title: 'putnbr_base : nombre → hexa',
		goalText: 'Affiche 42 en base 16 (hexadécimal) : la sortie doit être « 2a ».',
		hint: 'putnbr_base(n, base) émet n dans la base donnée. La base 16 = "0123456789abcdef".',
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
		id: 'l-1',
		world: 'Listes & arbres',
		title: 'Chaîne deux maillons, puis libère',
		goalText: 'Crée n1 et n2, chaîne-les (n1->next = n2), puis libère les deux SANS fuite ni crash.',
		hint: 'On ne libère pas un maillon encore pointé : libère la TÊTE (n1) d\'abord — ça détache n2 — puis n2.',
		vars: [
			{ name: 'n1', value: 0, kind: 'ptr' },
			{ name: 'n2', value: 0, kind: 'ptr' }
		],
		slots: 5,
		par: 5,
		goalCheck: (mem) => mem.leaks().length === 0 && mem.freed.size >= 4,
		bank: [
			{ id: 'mk-n1', label: 'n1 = node(1)', ast: assign(variable('n1'), node(lit(1))) },
			{ id: 'mk-n2', label: 'n2 = node(2)', ast: assign(variable('n2'), node(lit(2))) },
			{ id: 'link', label: 'n1->next = n2', ast: assign(field(variable('n1'), 'next'), variable('n2')) },
			{ id: 'free-n1', label: 'free(n1)', ast: freeNode(variable('n1')) },
			{ id: 'free-n2', label: 'free(n2)', ast: freeNode(variable('n2')) }
		]
	},
	{
		id: 'str-2',
		world: 'Chaînes & bornes',
		title: 'Termine, puis mesure',
		goalText: 'Mesure la longueur de « Hi » dans n (doit valoir 2). Mais d\'abord, borne la chaîne.',
		hint: 'strlen s\'arrête sur \'\\0\'. Sans borne, elle part dans le vide (crash). Pose la borne AVANT de mesurer.',
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
		hint: 'Ordre : open → read (dans le buffer) → write(1, …) → close. Oublier close = descripteur fuité.',
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
		id: 'dup-1',
		world: 'Mémoire dynamique — le Tas',
		title: 'Duplique la chaîne (ft_strdup)',
		goalText: 'Réserve la bonne taille, copie « Hi », affiche-la, puis libère. Zéro fuite.',
		hint: 'malloc(len + 1) — n\'oublie pas la place du \'\\0\' ! Trop petit → strcpy déborde. Puis free.',
		vars: [
			{ name: 's0', value: 'H', kind: 'char' },
			{ name: 's1', value: 'i', kind: 'char' },
			{ name: 's2', value: 0, kind: 'char' },
			{ name: 'p', value: 0, kind: 'ptr' }
		],
		slots: 4,
		par: 4,
		goalCheck: (mem) => mem.output === 'Hi' && mem.leaks().length === 0,
		bank: [
			{ id: 'malloc-3', label: 'p = malloc(3)', ast: assign(variable('p'), malloc(lit(3))) },
			{ id: 'malloc-1', label: 'p = malloc(1)', ast: assign(variable('p'), malloc(lit(1))) },
			{ id: 'copy', label: 'strcpy(p, &s0)', ast: strcpy(variable('p'), addr('s0')) },
			{ id: 'show', label: 'write(1, p, 2)', ast: write(1, variable('p'), lit(2)) },
			{ id: 'free-p', label: 'free(p)', ast: freeOp('p') }
		]
	},
	{
		id: 'conv-3',
		world: 'Conversion nombre↔texte',
		title: 'Extrais les chiffres',
		goalText: 'Sépare 42 : u = les unités (2), t = les dizaines (4). C\'est le cœur de putnbr.',
		hint: 'n % 10 donne le dernier chiffre (unités) ; n / 10 enlève ce chiffre (dizaines).',
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
		hint: 'Boucle bornée : d[i] = s[i], répété n fois. Ici n = 2 — pas 3, sinon tu débordes sur le 3e caractère.',
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
		hint: 'Une récursion = un cas de base (si n ≤ 1, réponds 1) posé AVANT l\'appel fact(n-1). Sans lui, la pile déborde.',
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
		hint: 'Vérifie CHAQUE pièce : le cas de base doit répondre 1 (pas 0), et la combinaison doit multiplier n PAR t (le retour de fact(n-1)).',
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
		id: 'while-1',
		world: 'Chaînes & bornes',
		title: 'Compte les caractères (strlen à la main)',
		goalText: 'Avance i tant que tu n\'as pas atteint la borne \'\\0\'. À la fin, i = la longueur (2).',
		hint: 'Boucle À GARDE : tant que s[i] != \'\\0\', avance. C\'est le sentinel qui arrête — pas un nombre magique.',
		vars: [
			{ name: 'i', value: 0, kind: 'int' },
			{ name: 's0', value: 'H', kind: 'char' },
			{ name: 's1', value: 'i', kind: 'char' },
			{ name: 's2', value: 0, kind: 'char' }
		],
		slots: 1,
		par: 1,
		goal: { i: 2 },
		bank: [
			{ id: 'w-sentinel', label: 'tant que s[i] != 0 : i = i+1', ast: whileLoop(bin('!=', load(addr('s0'), variable('i')), lit(0)), [assign(variable('i'), bin('+', variable('i'), lit(1)))]) },
			{ id: 'w-count3', label: 'tant que i < 3 : i = i+1', ast: whileLoop(bin('<', variable('i'), lit(3)), [assign(variable('i'), bin('+', variable('i'), lit(1)))]) }
		]
	}
];
