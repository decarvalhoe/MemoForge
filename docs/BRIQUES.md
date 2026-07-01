# Les 12 briques — colonne vertébrale de MemoForge

> Source pédagogique : `ANALYSE_PISCINE_C.md` (méta-index transversal des ~118 exercices
> de la Piscine C @ 42). Le pari du jeu : on n'enseigne pas 118 exercices, on rend
> **jouables les 12 patterns** qui les composent tous.
>
> Couverture prouvée par l'analyse : **8 briques = 100 % du noyau exam** (52 exos) ·
> **12 briques = 100 % du C runtime** (102 exos) · 86 % de la piscine entière.

## Principe de progression

La piscine progresse `None → write → malloc → structures`. Le jeu suit **le même axe** :
chaque monde ajoute exactement une capacité mémoire, et le mur classique (`malloc`, C07)
devient une région-charnière franchissable pas à pas.

## Table de correspondance brique → mécanique → niveau

Légende état moteur : ✅ modélisé · 🟡 partiel · ❌ à construire (cf. EPIC 2 de la roadmap).

| # | Brique (pattern) | Concept / module | Moteur | Capacité moteur à ajouter | Mécanique en jeu | Niveau ancré sur un vrai `ft_*` |
|---|---|---|:--:|---|---|---|
| **B1** | `write(1,&c,1)` | I/O ASCII · C00/C04 | ❌ | flux de sortie (« ruban console ») + op `write` | pousser un caractère sur le ruban, le voir s'afficher | `ft_putchar` → `ft_putstr` |
| **B2** | `while (str[i])` + `'\0'` | parcours chaînes · C02/C03 | ❌ | chaîne = rangée de casiers + sentinelle `'\0'` + boucle | avancer un curseur jusqu'à la borne | `ft_strlen`, `ft_strcpy` |
| **B3** | `c-'0'` / `c+'0'` | char↔chiffre · C04 | 🟡 | valeurs `char` typées + conversion | transmuter un casier char↔int | `ft_atoi`, `ft_putnbr` |
| **B4** | `n % base` / `n / base` | extraction chiffres · C04 | ❌ | opérateurs `%` `/` + boucle d'émission | égrener les chiffres d'un nombre | `ft_putnbr_base` |
| **B5** | `res = res*base + (c-'0')` | reconstruction nombre · C04 | ❌ | accumulateur + boucle bornée | empiler chiffre par chiffre | `ft_atoi_base` |
| **B6** | `tmp=*a; *a=*b; *b=tmp` | swap · C01 | ✅ | — (présent) | échanger deux casiers via `tmp` | `ft_swap`, `ft_sort_int_tab` |
| **B7** | `i < n && str[i]` | boucle bornée · C02/C03 | ❌ | construct `while`/`for` borné + garde | répéter une action sous condition | `ft_strncpy`, `ft_strlcat` |
| **B8** | `malloc(len+1)` + test NULL + `'\0'` | alloc dynamique · C07 | 🟡 | `malloc` dimensionné + `NULL` explicite + copie | réserver une zone, la remplir, la borner | `ft_strdup`, `ft_split` |
| **B9** | cas de base + appel récursif | récursivité · C05/C13 | ❌ | pile d'appels visualisée (frames) | empiler/dépiler des appels | `ft_recursive_factorial`, `ten_queens` |
| **B10** | `->next` / `->left/right` | structures chaînées · C12/C13 | ❌ | nœuds `{data, next}` + suivi de pointeurs | se déplacer de nœud en nœud | `ft_list_push_back`, `btree_insert` |
| **B11** | `int (*f)(int)` puis `f(x)` | pointeur de fonction · C11 | ❌ | valeurs-fonction passables + application | brancher une fonction dans une machine | `ft_foreach`, `ft_map`, `do-op` |
| **B12** | `open`→`read`→`close` | syscalls fichiers · C10 | ❌ | modèle fichier (descripteur + buffer) | ouvrir, lire en boucle, fermer | `display_file`, `cat`, `hexdump` |

## Mondes du jeu (regroupement par concept, ordre de maîtrise)

| Monde | Briques | Modules couverts | Débloque |
|---|---|---|---|
| 1. Casiers & adresses | B6 + passage par adresse | C01 | la notion de pointeur |
| 2. Sortie & ASCII | B1, B3 | C00, C04 | fabriquer l'affichage à la main |
| 3. Chaînes & bornes | B2, B7 | C02, C03 | le sentinel `'\0'`, la boucle |
| 4. Conversion nombre↔texte | B3, B4, B5 | C04 | les « miroirs » atoi/putnbr |
| 5. Mémoire dynamique — le Tas | B8 | C07 | **le mur** : malloc/free/NULL/fuite |
| 6. Récursivité | B9 | C05 | la pile d'appels |
| 7. Pointeurs de fonction | B11 | C11 | passer un comportement |
| 8. Listes & arbres | B10 (+B9, B11) | C12, C13 | les structures chaînées |
| 9. Fichiers & syscalls | B12 | C10 | open/read/close |

Hors-runtime (préprocesseur C08, build/Makefile C09, Shell00) = **non jouable** par brique
(cf. analyse §4.3) → traité en annexes/fiches, pas en niveaux.

## Anti-sèche intégrée (pièges → feedback in-game)

Chaque piège de l'analyse §7 devient un **état d'échec pédagogique** (bannière + mascotte) :

| Piège | Déclencheur en jeu | Message |
|---|---|---|
| `INT_MIN` déborde | `-n` sur -2147483648 | « débordement : passe par `long` » |
| malloc sans `+1` | zone trop courte pour `'\0'` | « il manque la place du terminateur » |
| retour NULL non testé | `*p` sur alloc échouée | « et si malloc renvoyait NULL ? » |
| cas de base manquant | récursion sans arrêt | « ta récursion ne s'arrête jamais » |
| perdre `next` avant free | free d'un nœud encore chaîné | « tu as perdu le maillon suivant » |

Ces messages sont la version jouable des « questions à se poser » des fiches — on
apprend en butant sur le piège, pas en lisant la règle.
