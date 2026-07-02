// Pack de langue ANGLAIS (E9-3 / #149). Couche de surcharge appliquée par src/game/i18n.js
// sur les données source françaises. Les libellés de briques (code : « n = 42 ») ne sont pas
// traduits (langage-neutres). Terminologie : casier→cell, brique→brick, fuite→leak,
// maillon/nœud→node, sentinelle '\0'→null terminator, cours M…→course M…, main verrouillé→
// main (locked).

export const EN = {
	// ── Régions de la carte ────────────────────────────────────────────────
	regions: {
		r1: { name: 'Cells & addresses', addr: '0x0000 · low stack' },
		r2: { name: 'Arrays & swap' },
		r3: { name: 'Output & ASCII' },
		r4: { name: 'Strings & terminators' },
		r5: { name: 'Number ↔ text conversion' },
		r6: { name: 'Dynamic memory — the Heap' },
		r7: { name: 'Recursion', addr: 'the stack · 0x2000' },
		r9: { name: 'Lists & trees' },
		r10: { name: 'Files & syscalls' }
	},

	// ── Niveaux ────────────────────────────────────────────────────────────
	levels: {
		'1-1': { title: 'Put 42 into n', goalText: 'By the end, cell n must contain 42.', hint: 'The CPU only knows addresses, never the name « n » (course M1). Among the bricks, which one writes into the cell itself, and which ones assume n already holds an address?' },
		'1-2': { title: 'Reach n through pointer p', goalText: 'n must become 42 — but you may not touch it directly: go through p.', hint: 'When you write through p, what must it contain? A pointer aiming at nothing yet is NULL — and dereferencing it crashes (course M4).' },
		'1-3': { title: 'Write ft_swap (by address)', goalText: 'Write the BODY of ft_swap(pa, pb). main swaps a (7) and b (3) via their addresses: in the end a = 3 and b = 7.', hint: 'If you overwrite *pa first, where do you find its old value to give to *pb? What could tmp be for? (course M4)', driverText: 'main (locked): ft_swap(&a, &b)' },
		'ptr-1': { title: 'Write ft_ft (modify through the pointer)', goalText: 'Write the BODY of ft_ft(nbr). main calls ft_ft(&x): x must become 42.', hint: 'To change the caller\'s x, do you write into the pointer (nbr), or into the cell it designates (*nbr)? (course M4)', driverText: 'main (locked): ft_ft(&x)' },
		'ptr-2': { title: 'Write ft_div_mod (two returns)', goalText: 'Write the BODY of ft_div_mod(a, b, div, mod). main calls (13, 4, &q, &r): q must be 3 and r must be 1.', hint: 'A function returns only one value with return. How do you return TWO to the caller? Where do q and r travel through? (course M4)', driverText: 'main (locked): ft_div_mod(13, 4, &q, &r)' },
		'ptr-3': { title: 'Write ft_ultimate_ft (peel the stars)', goalText: 'nbr points to x through two pointers. Write the BODY that peels down to x and writes 42 there: in the end x must be 42.', hint: 'Each * peels one pointer level. How many levels separate you from x, and which cell does one star too few land on? (course M5)', driverText: 'main (locked): p1 = &x · p2 = &p1 · ft_ultimate_ft(&p2)' },
		'2-1': { title: 'Write ft_rev_int_tab', goalText: 'Write the BODY of ft_rev_int_tab(tab, size). main reverses [1, 2, 3] in place: t0 must be 3 and t2 must be 1.', hint: 'Two cursors start from the ends and cross: each turn, what do you swap, and what happens to the old value without a tmp? (course M11)', driverText: 'main (locked): ft_rev_int_tab(&t0, 3)' },
		'3-1': { title: 'Reserve, write, free', goalText: 'Reserve a cell, write 7 into it, then free it. Goal: zero leaks.', hint: 'To write into *p without crashing, p must aim at a real cell: where does that address come from? And a heap block is yours until when? (course M7-M8)' },
		'3-2': { title: 'Every malloc has its free', goalText: 'Reserve two cells and free BOTH of them. Goal: zero leaks.', hint: 'Heap rule: for each malloc, exactly one free — not zero (leak), not two (double free, course M8). How many blocks did you reserve?' },
		'4-1': { title: 'Write the string "Hi"', goalText: 'Form the string « Hi » in c0, c1, c2 — without forgetting what marks the end of a real C string.', hint: 'A C string is only one when terminated by its \'\\0\' sentinel (value 0, course M10). Did you place it in the right spot?' },
		's-1': { title: 'Print « Hi »', goalText: 'Make Hi appear on the output. write(1, &c, 1) emits ONE byte read at an address.', hint: 'write emits bytes in the order you give them (course M3). The console tape keeps that order: compare Hi and iH.' },
		'io-1': { title: 'Write ft_putstr (with your libft)', goalText: 'Write the BODY of ft_putstr(s). main calls it on « Hi »: the output must be « Hi ». Use YOUR ft_strlen for the length.', hint: 'write emits a given number of bytes from an address. How many bytes is « Hi », and where do you find that number without recounting by hand? (course M10)', driverText: 'main (locked): ft_putstr(&c0)' },
		'io-2': { title: 'Write ft_print_alphabet', goalText: 'Print the alphabet « abc…z » on the output, with a single 26-turn loop.', hint: 'Each turn, which character do you write? A char IS its ASCII code: what is « \'a\' + i » as i goes from 0 to 25? (course M1/M2)' },
		'io-3': { title: 'Write ft_print_numbers', goalText: 'Print « 0123456789 » on the output, with a single 10-turn loop.', hint: 'The digit i (0-9) and the CHARACTER that shows it do not share the same code. Which operation turns the number i into its character? (course M2)' },
		'str-1': { title: 'Write ft_strcpy', goalText: 'Write the BODY of ft_strcpy(dst, src). main copies « Hi » from src to dst: in the end dst must contain H, i, then the end of string.', hint: 'Copying a string = recopying byte by byte until where? Is the \'\\0\' sentinel part of the copy? (course M10)', driverText: 'main (locked): ft_strcpy(&d0, &s0)' },
		'conv-1': { title: 'Write ft_atoi', goalText: 'Write the BODY of ft_atoi(s). main calls it on « 42 »: n must become 42.', hint: 'A digit character IS its ASCII code: what does « c minus \'0\' » give? How do you stack digits to rebuild the number? (course M2)', driverText: 'main (locked): n = ft_atoi(&c0)' },
		'conv-2': { title: 'Write ft_putnbr_base (binary)', goalText: 'Write the BODY of ft_putnbr_base(n). main calls it on 5 with the base « 01 »: the output must be « 101 » (5 in binary).', hint: 'Like ft_putnbr, but a digit\'s symbol is no longer « + \'0\' »: it is read in the base string at index n % base. How many symbols does binary have? (course M2/M11)', driverText: 'main (locked): ft_putnbr_base(5)  ·  base « 01 »' },
		'l-1': { title: 'Free the whole list', goalText: 'The list n1 → n2 is already linked. Free BOTH nodes without a leak or a use-after-free crash.', hint: 'To free a node without losing the rest of the list, what must you read and keep just before the free? (course M8/M12)' },
		'str-2': { title: 'Terminate, then measure', goalText: 'Measure the length of « Hi » into n (must be 2). But first, terminate the string.', hint: 'strlen counts up to the \'\\0\' sentinel (course M10). If the string has no terminator, where does counting stop?' },
		'f-1': { title: 'Print the file', goalText: 'Open the file, read its contents into the buffer, write it to the output, then CLOSE it.', hint: 'A file is handled through its descriptor (fd): where does it come from, and what must no longer be left open at the end so nothing leaks?' },
		'dup-1': { title: 'Write ft_strdup (with your libft)', goalText: 'Write the BODY of ft_strdup(src) by calling YOUR ft_strlen and ft_strcpy. main duplicates « Hi »: p must point to a « Hi » copy on the heap.', hint: 'How many bytes to hold « Hi » AND its \'\\0\' sentinel? Where do you find that length without recounting by hand? (course M7/M10)', driverText: 'main (locked): p = ft_strdup(&s0)' },
		'range-1': { title: 'Write ft_range', goalText: 'Write the BODY of ft_range(min, max). main calls ft_range(2, 5): p must point to an array [2, 3, 4] on the heap.', hint: 'How many cells between min and max? Once the block is reserved, how do you fill the cell at index i so it holds min + i? (course M11/M7)', driverText: 'main (locked): p = ft_range(2, 5)' },
		'split-1': { title: 'Free a string array (N+1 free)', goalText: 'ft_split returned an array of 2 strings (already allocated). Free EVERYTHING without a leak: the 2 strings AND the array. Aim for « 0 bytes lost ».', hint: 'An array of N strings is how many blocks in total? How many frees are needed, and which one is forgotten most often? (course M9)' },
		'dang-1': { title: 'Why the heap exists (dangling pointer)', goalText: 'Write the BODY of make_answer() that returns a pointer to 42. main dereferences it after the return: y must be 42, without crashing.', hint: 'A local variable dies at return (its frame is popped). What is left if you return its address? Where do you place 42 so it SURVIVES the function? (course M6/M7)', driverText: 'main (locked): p = make_answer() · y = *p · free(p)' },
		'conv-3': { title: 'Write ft_putnbr (recursive)', goalText: 'Write the BODY of ft_putnbr(n). main calls it on 42: the output must be « 42 ». Recursion: the high-order digits print first.', hint: 'To print 42, you must output the 4 BEFORE the 2. What does ft_putnbr(n / 10) do before printing the last digit? And which computation turns n % 10 into its character? (course M2/M6)', driverText: 'main (locked): ft_putnbr(42)' },
		'mem-1': { title: 'The byte explorer (little-endian)', goalText: '1000 does not fit in one byte (0-255): it spreads over several cells. Extract the low-order byte (b0) and the next (b1). For 1000: b0 = 232 (0xe8), b1 = 3.', hint: 'A byte ranges from 0 to 255: which operation gives the REMAINDER of a number by 256? And which one shifts from one byte to the next? (course M1/M2)' },
		'strn-1': { title: 'Bounded copy (ft_strncpy)', goalText: 'Copy EXACTLY the first 2 characters of src (« Hi! ») into dst, with a loop.', hint: 'How many characters must you copy — so how many loop turns? One turn too many touches the next character (course M11).' },
		'rec-1': { title: 'Write fact(n) — base case first', goalText: 'You write the BODY of fact(n). main calls fact(3): in the end, r must be 6. Watch the stack grow… then unwind.', hint: 'What stops a function that calls itself? And should the call bring n closer to that stop, or further from it? (course M6)', driverText: 'main (locked): r = fact(3)' },
		'rec-2': { title: 'fact(5) — without a net', goalText: 'Same machine, deeper call: main calls fact(5), r must be 120. All the pieces look alike — only one combination is right.', hint: 'Two pieces look alike, only one is right: what must the base case return so it does not cancel everything? Does the combination use the call\'s return value? (course M6)', driverText: 'main (locked): r = fact(5)' },
		'while-1': { title: 'Write ft_strlen', goalText: 'Write the BODY of ft_strlen(s). main calls it on « Hi »: n must be 2. This function joins your libft — you will reuse it.', hint: 'What marks the end of a string (course M10)? Your loop stops on that signal — not on a number picked at random.', driverText: 'main (locked): n = ft_strlen(&s0)' },
		'chr-1': { title: 'Write ft_isdigit', goalText: 'Write the BODY of ft_isdigit(c): 1 if c is a digit, 0 otherwise. main tests \'5\' (→ 1) and \'a\' (→ 0).', hint: 'A digit is both ≥ \'0\' AND ≤ \'9\'. How do you combine two tests (each 0 or 1) so you get 1 only when BOTH are true? (course M2)', driverText: 'main (locked): r1 = ft_isdigit(\'5\') · r2 = ft_isdigit(\'a\')' },
		'chr-2': { title: 'Write ft_isalpha', goalText: 'Write the BODY of ft_isalpha(c): 1 if c is a letter, 0 otherwise. main tests \'Z\' (→ 1) and \'5\' (→ 0).', hint: 'A letter is in a..z OR in A..Z (two ranges that do not overlap). How do you get 1 if EITHER is true? (course M2)', driverText: 'main (locked): r1 = ft_isalpha(\'Z\') · r2 = ft_isalpha(\'5\')' },
		'chr-3': { title: 'Write ft_toupper', goalText: 'Write the BODY of ft_toupper(c): uppercase if c is lowercase, unchanged otherwise. main tests \'a\' (→ \'A\' = 65) and \'A\' (→ \'A\' = 65).', hint: 'A lowercase letter and its uppercase are 32 apart in the ASCII table. But what should happen to a character that is NOT lowercase? (course M2)', driverText: 'main (locked): r1 = ft_toupper(\'a\') · r2 = ft_toupper(\'A\')' },
		'cmp-1': { title: 'Write ft_strcmp', goalText: 'Write the BODY of ft_strcmp(s1, s2). main compares « Hi »/« Hi » (→ 0) and « Hi »/« Ha » (→ gap at the 2nd character, \'i\'-\'a\' = 8).', hint: 'Advance while both characters are equal AND the string is not over. At the first gap, what does the DIFFERENCE of their codes return? (course M2/M10)', driverText: 'main (locked): r1 = ft_strcmp(&a0,&b0) · r2 = ft_strcmp(&a0,&c0)' },
		'cat-1': { title: 'Write ft_strcat (with your libft)', goalText: 'Write the BODY of ft_strcat(dst, src). main sticks « ! » to the end of « Hi »: dst must become « Hi! ».', hint: 'Concatenating means writing src AFTER dst\'s contents. Where does « after » begin — and how do you find that index without counting by hand? (course M10)', driverText: 'main (locked): ft_strcat(&d0, &s0)' },
		'pow-1': { title: 'Write ft_power (recursive)', goalText: 'Write the BODY of ft_power(b, e). main calls ft_power(2, 5): r must be 32.', hint: 'Which exponent stops the recursion, and what is b^0? At each step, how do you relate b^e to b^(e−1)? (course M5)', driverText: 'main (locked): r = ft_power(2, 5)' },
		'fib-1': { title: 'Write ft_fibonacci (double recursion)', goalText: 'Write the BODY of ft_fibonacci(n). main calls ft_fibonacci(6): r must be 8. Two calls per level — the stack branches.', hint: 'Below which n does the sequence give itself directly? And a term is built from how many previous terms? (course M5/M6)', driverText: 'main (locked): r = ft_fibonacci(6)' },
		'prime-1': { title: 'Write ft_is_prime', goalText: 'Write the BODY of ft_is_prime(n): 1 if prime, 0 otherwise. main tests 7 (→ 1) and 9 (→ 0).', hint: 'n is prime if NO number from 2 to n−1 divides it. As soon as a divisor appears (remainder zero), should you keep looping? (course M5)', driverText: 'main (locked): r1 = ft_is_prime(7) · r2 = ft_is_prime(9)' },
		'sub-1': { title: 'Write ft_substr', goalText: 'Write the BODY of ft_substr(s, start, len). main extracts 2 characters of « Hello » from index 1: p must point to « el » on the heap.', hint: 'Reserve room for len characters AND the end of string. Which index of s do you read to fill cell i of the copy? (course M7/M11)', driverText: 'main (locked): p = ft_substr(&s0, 1, 2)' },
		'join-1': { title: 'Write ft_strjoin (all of your libft)', goalText: 'Write the BODY of ft_strjoin(s1, s2) by calling YOUR ft_strlen, ft_strcpy and ft_strcat. main joins « Hi » and « ! »: p must point to « Hi! » on the heap.', hint: 'How long is the joined string, terminator included? With the block reserved, which two already-forged functions place s1 and s2 without rewriting a loop? (course M7/M10)', driverText: 'main (locked): p = ft_strjoin(&a0, &b0)' },
		'lst-1': { title: 'Write ft_lstsize', goalText: 'The list h1 → h2 is already built. Write the BODY of ft_lstsize(head) that counts the nodes: r must be 2.', hint: 'A cursor starts at the head and follows ->next each turn. What marks the end of the list, and so stops the count? (course M12)', driverText: 'main (locked): h1→h2 built · r = ft_lstsize(h1)' },
		'lst-2': { title: 'Write ft_lstlast', goalText: 'The list h1 → h2 is already built. Write the BODY of ft_lstlast(head) that returns the LAST node: last must be h2.', hint: 'To stop ON the last node (not past it), do you check whether the current node exists, or whether its ->next still exists? (course M12)', driverText: 'main (locked): h1→h2 built · last = ft_lstlast(h1)' },
		'each-1': { title: 'Write ft_foreach (apply f)', goalText: 'Write the BODY of ft_foreach(f, base, n). main plugs in emit (prints a digit) over [1, 2, 3]: the output must be « 123 ».', hint: 'f expects a VALUE. Each turn, do you pass it a cell of the array, or the address of the array itself? (course M11)', driverText: 'main (locked): ft_foreach(emit, &a0, 3)' },
		'each-2': { title: 'Write ft_lstiter (apply f to each node)', goalText: 'The list h1 → h2 (data 1, 2) is built. Write the BODY of ft_lstiter(head, f): main plugs in emit → the output must be « 12 ».', hint: 'You move node to node via ->next. At each node, what do you apply f to: the node itself, or its data (->data)? (course M12)', driverText: 'main (locked): h1→h2 · ft_lstiter(h1, emit)' },
		'arg-1': { title: 'Write ft_print_params', goalText: 'main launches the program with the arguments « Hi » and « ! ». Write ft_print_params(argc, argv) that prints each argument (not the program name): the output must be « Hi! ».', hint: 'argv[0] is the program name, not an argument. From which index do the real arguments start? argv[i] is a string — which already-forged function prints it? (course — argv = char**)', driverText: 'main (locked): ./prog Hi ! → ft_print_params(argc, argv)' },
		'arg-2': { title: 'Write ft_rev_params', goalText: 'Same arguments « Hi » « ! ». Write ft_rev_params(argc, argv) that prints them IN REVERSE: the output must be « !Hi ».', hint: 'The last argument is at index argc − 1. Which way do you vary i to go from the last to the first real argument? (course — argv)', driverText: 'main (locked): ./prog Hi ! → ft_rev_params(argc, argv)' },
		'mem-2': { title: 'Write ft_memset', goalText: 'Write the BODY of ft_memset(ptr, val, n). main fills 3 cells with 65 (\'A\'): b0, b1, b2 must be 65.', hint: 'memset writes THE SAME value into each cell, from 0 to n−1. What do you write into cell i: the value, or the index i? (course M1)', driverText: 'main (locked): ft_memset(&b0, 65, 3)' },
		'mem-3': { title: 'Write ft_memcpy', goalText: 'Write the BODY of ft_memcpy(dst, src, n). main copies 3 cells from src (1, 2, 3) to dst: d0, d1, d2 must be 1, 2, 3.', hint: 'memcpy recopies n cells. What do you put into dst[i]: the matching cell of src, or something else? (course M1/M11)', driverText: 'main (locked): ft_memcpy(&d0, &s0, 3)' },
		sandbox: { title: 'Sandbox — experiment freely', goalText: 'No imposed target: assemble whatever you want and watch the memory.', hint: 'Trigger a leak (malloc without free), a double free, a NULL dereference…' }
	},

	// ── Chaînes d'interface (clé = la chaîne source française) ──────────────
	ui: {
		'Comprends les pointeurs et la mémoire C en assemblant des programmes.': 'Understand C pointers and memory by assembling programs.',
		'← carte': '← map', 'mur de casiers': 'wall of cells', 'ton programme': 'your program',
		'palette': 'palette', 'ta libft': 'your libft', 'bac à sable': 'sandbox', 'examen': 'exam',
		'Indice : ': 'Hint: ', 'niveau ': 'level ', 'Réussi !': 'Solved!', 'Crash : ': 'Crash: ',
		'Cible non atteinte. Réessaie.': 'Target not reached. Try again.',
		'cible atteinte': 'target reached', 'sans erreur ni fuite': 'no error or leak',
		'Exécuter': 'Run', 'Pas-à-pas': 'Step', 'Réinitialiser': 'Reset', 'Suivant →': 'Next →',
		'Passer': 'Skip', '// pile d\'appels': '// call stack',
		'// explorateur d\'octets (little-endian)': '// byte explorer (little-endian)',
		'GLIF surveille la mémoire': 'GLIF watches the memory',
		'GLIF valide !': 'GLIF approves!', 'GLIF réfléchit…': 'GLIF is thinking…',
		'réutilise ta libft : ': 'reuses your libft: ',
		// Noms de mondes (= noms de régions), utilisés dans le tag de mission.
		'Casiers & adresses': 'Cells & addresses', 'Tableaux & échange': 'Arrays & swap',
		'Sortie & ASCII': 'Output & ASCII', 'Chaînes & bornes': 'Strings & terminators',
		'Conversion nombre↔texte': 'Number ↔ text conversion',
		'Mémoire dynamique — le Tas': 'Dynamic memory — the Heap', 'Récursivité': 'Recursion',
		'Listes & arbres': 'Lists & trees', 'Fichiers & syscalls': 'Files & syscalls',
		'Bac à sable': 'Sandbox',
		// Carte
		'LA RAM': 'THE RAM', 'à venir': 'coming soon', 'Entrer dans la salle': 'Enter room',
		"des fuites menacent la RAM — remets de l'ordre dans une région pour débloquer la suivante": 'leaks threaten the RAM — tidy up a region to unlock the next one',
		// Contrôles & mascotte
		'passer →': 'skip →', 'Niveau suivant →': 'Next level →', 'indice :': 'hint:',
		'GLIF surveille\nla mémoire': 'GLIF watches\nthe memory', 'instructions': 'instructions',
		'Suivant': 'Next',
		// Pièges (feedback) — titres + hints
		'CRASH — déréférencement de NULL': 'CRASH — NULL dereference',
		"Un pointeur à NULL ne pointe sur rien. As-tu d'abord fait p = &x (ou malloc) avant *p ?": 'A NULL pointer points to nothing. Did you first do p = &x (or malloc) before *p?',
		'CRASH — accès après libération': 'CRASH — use after free',
		'Ce casier a été rendu par free : on ne peut plus le lire ni y écrire.': 'This cell was returned by free: it can no longer be read or written.',
		'CRASH — free invalide': 'CRASH — invalid free',
		"On ne libère qu'une adresse allouée, et une seule fois (double free = crash).": 'You only free an allocated address, and only once (double free = crash).',
		'CRASH — adresse invalide': 'CRASH — invalid address',
		"Ce pointeur ne contient pas l'adresse d'un casier valide.": 'This pointer does not hold the address of a valid cell.',
		'ERREUR — variable inconnue': 'ERROR — unknown variable',
		'Cette variable n\'existe pas dans ce niveau.': 'This variable does not exist in this level.',
		'CRASH — la pile déborde (stack overflow)': 'CRASH — the stack overflows',
		'Chaque appel empile une frame, et rien ne les arrête. Pose le cas de base AVANT l\'appel récursif, et fais rétrécir n (fact(n-1), pas fact(n)).': 'Each call pushes a frame, and nothing stops them. Put the base case BEFORE the recursive call, and shrink n (fact(n-1), not fact(n)).',
		'ERREUR — fonction inconnue': 'ERROR — unknown function',
		'Cette valeur n\'est pas une fonction branchable : branche d\'abord une vraie fonction avant de l\'appliquer.': 'This value is not a callable function: plug in a real function before applying it.',
		'CRASH — dangling pointer (case morte)': 'CRASH — dangling pointer (dead cell)',
		'Tu déréférences l\'adresse d\'une variable locale dont la fonction a déjà rendu la main : sa frame est dépilée, la case est morte. Pour survivre au return, la donnée doit vivre sur le tas (malloc).': 'You dereference the address of a local variable whose function has already returned: its frame is popped, the cell is dead. To survive the return, the data must live on the heap (malloc).',
		'CRASH': 'CRASH', 'FUITE MÉMOIRE': 'MEMORY LEAK', 'RÉUSSITE': 'SUCCESS',
		'Cible atteinte, sans erreur ni fuite.': 'Target reached, no error or leak.',
		'CIBLE NON ATTEINTE': 'TARGET NOT REACHED',
		'Le résultat ne correspond pas encore. Réessaie.': 'The result does not match yet. Try again.',
		'slot libre': 'empty slot', 'clair': 'light', 'sombre': 'dark',
		// Casiers / mémoire
		'normal': 'normal', 'modifié': 'changed', 'pointeur': 'pointer', 'alloué': 'allocated',
		'libéré': 'freed', 'tas — mémoire dynamique': 'heap — dynamic memory', '// sortie': '// output',
		'(réf)': '(ref)',
		// Bac à sable
		'EXÉCUTÉ': 'RAN', 'Aucune cible : observe la mémoire. Provoque une fuite, un double free, un déréf. de NULL…': 'No target: watch the memory. Trigger a leak, a double free, a NULL dereference…',
		// Examen
		'examen terminé': 'exam finished', 'Score : ': 'Score: ', 'Temps : ': 'Time: ', 'recommencer': 'restart',
		// Stats locales (carte)
		'le plus retravaillé : ': 'most retried: ', 'essais avant réussite': 'attempts before solving',
		'stats locales, jamais envoyées': 'local stats, never sent',
		'forge_memoire — carte.ram — 0x0000…0xFFFF': 'memory_forge — map.ram — 0x0000…0xFFFF'
	}
};
