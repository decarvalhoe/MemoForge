// Tests des niveaux de contenu (E3-3/4/5) ancrés sur les capacités moteur B1/B2/B3-5.
// Réutilise tests/helpers.mjs (byId/runProgram/goalMet/solved). node:test.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { byId, runProgram, goalMet, solved } from '../helpers.mjs';
import { Memory } from '../../src/engine/memory.js';
import { Interpreter } from '../../src/engine/interpreter.js';

// Runner local qui installe les fichiers du niveau (helpers.runProgram ne le fait pas).
function runWithFiles(level, ids) {
	const mem = new Memory(level.vars);
	if (level.files) for (const [n, c] of Object.entries(level.files)) mem.setFile(n, c);
	const program = ids.map((id) => level.bank.find((b) => b.id === id));
	const interp = new Interpreter(mem, program);
	interp.run();
	return { mem, error: interp.error };
}

describe('s-1 — Sortie & ASCII (write / ft_putstr)', () => {
	const L = byId['s-1'];
	test('write c0 puis c1 → "Hi"', () => assert.ok(solved(L, ['w-c0', 'w-c1'])));
	test('write(1,&c0,2) émet les 2 octets contigus → "Hi"', () => assert.ok(solved(L, ['w-c0-2'])));
	test('ordre inverse → "iH", échoue', () => {
		const { mem } = runProgram(L, ['w-c1', 'w-c0']);
		assert.equal(mem.output, 'iH');
		assert.equal(goalMet(L, mem), false);
	});
});

describe('io-1/2/3 — Sortie (ft_putstr, print_alphabet, print_numbers)', () => {
	test('ft_putstr : len = ft_strlen(s) puis write(1, s, len) → "Hi"', () => {
		assert.ok(solved(byId['io-1'], ['len', 'emit']));
	});
	test('ft_putstr sans la longueur (write ..., 1) → "H", échoue', () => {
		const { mem } = runProgram(byId['io-1'], ['len', 'emit-bad']);
		assert.equal(mem.output, 'H');
		assert.equal(goalMet(byId['io-1'], mem), false);
	});
	test('print_alphabet : c = \'a\' + i → "abc…z"', () => {
		const { mem } = runProgram(byId['io-2'], ['loop']);
		assert.equal(mem.output, 'abcdefghijklmnopqrstuvwxyz');
	});
	test('print_alphabet sans le + i → "aaaa…", échoue', () => {
		assert.equal(goalMet(byId['io-2'], runProgram(byId['io-2'], ['loop-bad']).mem), false);
	});
	test('print_numbers : c = i + \'0\' → "0123456789"', () => {
		const { mem } = runProgram(byId['io-3'], ['loop']);
		assert.equal(mem.output, '0123456789');
	});
	test('print_numbers sans le + \'0\' (émet des codes de contrôle) → échoue', () => {
		assert.equal(goalMet(byId['io-3'], runProgram(byId['io-3'], ['loop-bad']).mem), false);
	});
});

describe('str-1 — Écris ft_strcpy (forge depuis zéro)', () => {
	const L = byId['str-1'];
	test('init → copy → term → return : recopie "Hi\\0" dans dst', () => {
		assert.ok(solved(L, ['init', 'copy', 'term', 'ret']));
	});
	test('oublier la sentinelle (pas de term) → dst[2] reste « X » → échoue', () => {
		const { mem } = runProgram(L, ['init', 'copy', 'ret']);
		assert.equal(mem.getVar('d2'), 'X');
		assert.equal(goalMet(L, mem), false);
	});
});

describe('str-2 — Chaînes (sentinelle : borner avant de mesurer)', () => {
	const L = byId['str-2'];
	test('borner puis strlen → n = 2', () => assert.ok(solved(L, ['set-term', 'measure'])));
	test('mesurer AVANT de borner → crash "sans borne"', () => {
		const { error } = runProgram(L, ['measure', 'set-term']);
		assert.match(error, /sans borne/);
	});
	test('atoi sur "Hi" ne donne pas la longueur → échoue', () => {
		const { mem } = runProgram(L, ['set-term', 'atoi-bad']);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('conv-1 — Écris ft_atoi (forge depuis zéro)', () => {
	const L = byId['conv-1'];
	test('res=0 → i=0 → scan → return : atoi("42") = 42', () => {
		assert.ok(solved(L, ['r0', 'i0', 'scan', 'ret']));
	});
	test('oublier le « - \'0\' » (scan-bad) → additionne des codes ASCII → échoue', () => {
		const { mem } = runProgram(L, ['r0', 'i0', 'scan-bad', 'ret']);
		assert.notEqual(mem.getVar('n'), 42);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('conv-2 — Écris ft_putnbr_base (binaire, récursif)', () => {
	const L = byId['conv-2'];
	test('rec → digit(base[n%2]) → emit : 5 → "101"', () => {
		const { mem } = runProgram(L, ['rec', 'digit', 'emit']);
		assert.equal(mem.output, '101');
		assert.ok(solved(L, ['rec', 'digit', 'emit']));
	});
	test('d = n % 2 (le chiffre brut, pas le symbole) → échoue', () => {
		assert.equal(goalMet(L, runProgram(L, ['rec', 'digit-bad', 'emit']).mem), false);
	});
});

describe('l-1 — Libère toute la liste (vrai piège M12)', () => {
	const L = byId['l-1'];
	test('sauver ->next AVANT free → les deux libérés, propre', () => {
		assert.ok(solved(L, ['mk-n1', 'mk-n2', 'link', 'save', 'free-n1', 'free-nxt']));
	});
	test('free(n1) puis free(n1->next) → use-after-free (lecture d\'un nœud libéré)', () => {
		const { error } = runProgram(L, ['mk-n1', 'mk-n2', 'link', 'free-n1', 'free-via']);
		assert.match(error, /déjà libéré/);
	});
	test('oublier un free → fuite, cible non atteinte', () => {
		const { mem } = runProgram(L, ['mk-n1', 'mk-n2', 'link', 'save', 'free-n1']);
		assert.ok(mem.leaks().length > 0);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('f-1 — Fichiers (open/read/write/close, B12)', () => {
	const L = byId['f-1'];
	test('open → read → write → close : affiche "Hi", 0 descripteur ouvert', () => {
		const { mem, error } = runWithFiles(L, ['open', 'read', 'write', 'close']);
		assert.equal(error, null);
		assert.equal(mem.output, 'Hi');
		assert.ok(L.goalCheck(mem));
	});
	test('oublier close → descripteur fuité, cible non atteinte', () => {
		const { mem } = runWithFiles(L, ['open', 'read', 'write']);
		assert.equal(mem.output, 'Hi');
		assert.ok(mem.openDescriptors().length > 0);
		assert.equal(L.goalCheck(mem), false);
	});
	test('lire après close → crash "lecture après close"', () => {
		const { error } = runWithFiles(L, ['open', 'close', 'read']);
		assert.match(error, /après close/);
	});
});

describe('dup-1 — Écris ft_strdup (réutilise ta libft)', () => {
	const L = byId['dup-1'];
	test('len(ft_strlen) → size+1 → malloc → ft_strcpy → return : copie "Hi" sur le tas', () => {
		assert.ok(solved(L, ['len', 'size', 'alloc', 'copy', 'ret']));
	});
	test('malloc(len) sans le +1 → ft_strcpy déborde du bloc → crash "adresse invalide"', () => {
		const { error } = runProgram(L, ['len', 'size', 'alloc-bad', 'copy', 'ret']);
		assert.match(error, /adresse invalide/);
	});
	test('sans allouer (pas de malloc) → dst reste NULL → crash', () => {
		const { error } = runProgram(L, ['len', 'copy', 'ret']);
		assert.ok(error);
	});
});

describe('conv-3 — Écris ft_putnbr (récursif)', () => {
	const L = byId['conv-3'];
	test('rec(n/10) → digit(n%10 + \'0\') → emit : 42 → "42"', () => {
		const { mem } = runProgram(L, ['rec', 'digit', 'emit']);
		assert.equal(mem.output, '42');
		assert.ok(solved(L, ['rec', 'digit', 'emit']));
	});
	test('d = n % 10 (chiffre brut, pas son caractère) → émet des codes de contrôle, échoue', () => {
		assert.equal(goalMet(L, runProgram(L, ['rec', 'digit-bad', 'emit']).mem), false);
	});
	test('sans la récursion → un seul chiffre, échoue', () => {
		const { mem } = runProgram(L, ['digit', 'emit']);
		assert.equal(mem.output, '2');
		assert.equal(goalMet(L, mem), false);
	});
});

describe('strn-1 — Boucle bornée (ft_strncpy, B7)', () => {
	const L = byId['strn-1'];
	test('boucle 2× copie exactement 2 caractères → cible atteinte', () => {
		assert.ok(solved(L, ['loop-2']));
	});
	test('boucle 3× déborde sur le 3e (d2 = "!") → échoue', () => {
		const { mem } = runProgram(L, ['loop-3']);
		assert.equal(mem.getVar('d2'), '!');
		assert.equal(goalMet(L, mem), false);
	});
});

describe('while-1 — Écris ft_strlen (forge depuis zéro)', () => {
	const L = byId['while-1'];
	test('init → scan(sentinelle) → return : ft_strlen("Hi") = 2', () => {
		const { mem } = runProgram(L, ['init', 'scan', 'ret']);
		assert.equal(mem.getVar('n'), 2);
		assert.ok(solved(L, ['init', 'scan', 'ret']));
	});
	test('boucle « len < 3 » (nombre magique) ignore la sentinelle → n = 3, échoue', () => {
		const { mem } = runProgram(L, ['init', 'scan-bad', 'ret']);
		assert.equal(mem.getVar('n'), 3);
		assert.equal(goalMet(L, mem), false);
	});
});

describe('chr-1/2/3 — Caractères & casse (char = code ASCII)', () => {
	test('ft_isdigit : (c>=\'0\')*(c<=\'9\') → 1 pour \'5\', 0 pour \'a\'', () => {
		assert.ok(solved(byId['chr-1'], ['and']));
	});
	test('ft_isdigit avec + (OU) au lieu de * (ET) → échoue', () => {
		assert.equal(goalMet(byId['chr-1'], runProgram(byId['chr-1'], ['or-bad']).mem), false);
	});
	test('ft_isalpha : somme des deux plages a-z / A-Z → 1 pour \'Z\', 0 pour \'5\'', () => {
		assert.ok(solved(byId['chr-2'], ['or']));
	});
	test('ft_isalpha avec la seule plage a-z rate les majuscules → échoue', () => {
		assert.equal(goalMet(byId['chr-2'], runProgram(byId['chr-2'], ['low-bad']).mem), false);
	});
	test('ft_toupper : - 32 SOUS CONDITION → \'a\'→\'A\', \'A\' inchangé', () => {
		assert.ok(solved(byId['chr-3'], ['cond', 'ret']));
	});
	test('ft_toupper sans condition abîme les non-minuscules → échoue', () => {
		assert.equal(goalMet(byId['chr-3'], runProgram(byId['chr-3'], ['uncond-bad', 'ret']).mem), false);
	});
});

describe('cmp-1/cat-1 — Comparaison & concaténation', () => {
	test('ft_strcmp : 0 pour égales, écart de codes au 1er mismatch', () => {
		assert.ok(solved(byId['cmp-1'], ['i0', 'walk', 'diff']));
	});
	test('ft_strcmp sans le test d\'égalité (avance jusqu\'au bout) → écart raté, échoue', () => {
		assert.equal(goalMet(byId['cmp-1'], runProgram(byId['cmp-1'], ['i0', 'walk-bad', 'diff']).mem), false);
	});
	test('ft_strcat : ft_strlen(dst) puis copie src → "Hi!"', () => {
		assert.ok(solved(byId['cat-1'], ['end', 'j0', 'copy', 'term', 'ret']));
	});
	test('ft_strcat avec i = 0 (écrase dst) → échoue', () => {
		assert.equal(goalMet(byId['cat-1'], runProgram(byId['cat-1'], ['j0-bad', 'j0', 'copy', 'term', 'ret']).mem), false);
	});
});

describe('pow-1/fib-1/prime-1 — Récursivité & maths (C05)', () => {
	test('ft_power : cas de base e=0 → 1, sinon b * power(b, e-1) → 2^5 = 32', () => {
		assert.ok(solved(byId['pow-1'], ['base', 'rec', 'comb']));
	});
	test('ft_power avec return e * t (au lieu de b) → échoue', () => {
		assert.equal(goalMet(byId['pow-1'], runProgram(byId['pow-1'], ['base', 'rec', 'comb-bad']).mem), false);
	});
	test('ft_fibonacci : double récursion fib(n-1)+fib(n-2) → fib(6) = 8', () => {
		assert.ok(solved(byId['fib-1'], ['base', 'rec1', 'rec2', 'comb']));
	});
	test('ft_fibonacci avec a * b (au lieu de a + b) → échoue', () => {
		assert.equal(goalMet(byId['fib-1'], runProgram(byId['fib-1'], ['base', 'rec1', 'rec2', 'comb-bad']).mem), false);
	});
	test('ft_is_prime : retour anticipé au 1er diviseur → 7 premier, 9 non', () => {
		assert.ok(solved(byId['prime-1'], ['i0', 'scan', 'prime']));
	});
	test('ft_is_prime sans le test de divisibilité → tout « premier », échoue', () => {
		assert.equal(goalMet(byId['prime-1'], runProgram(byId['prime-1'], ['i0', 'scan-bad', 'prime']).mem), false);
	});
});

describe('sub-1/join-1 — Chaînes allouées (libft Part 2)', () => {
	test('ft_substr : malloc(len+1) + copie de s[start+i] → "el"', () => {
		assert.ok(solved(byId['sub-1'], ['alloc', 'i0', 'copy', 'term', 'ret']));
	});
	test('ft_substr qui ignore start (s[i]) → "He", échoue', () => {
		assert.equal(goalMet(byId['sub-1'], runProgram(byId['sub-1'], ['alloc', 'i0', 'copy-bad', 'term', 'ret']).mem), false);
	});
	test('ft_strjoin : compose ft_strlen + ft_strcpy + ft_strcat → "Hi!"', () => {
		assert.ok(solved(byId['join-1'], ['l1', 'l2', 'alloc', 'cpy', 'cat', 'ret']));
	});
	test('ft_strjoin sans le +1 → strcat déborde → crash', () => {
		assert.ok(runProgram(byId['join-1'], ['l1', 'l2', 'alloc-bad', 'cpy', 'cat', 'ret']).error);
	});
});
