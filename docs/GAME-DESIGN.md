# MemoForge — Game design

> Réf : ancrage pédagogique [BRIQUES.md](BRIQUES.md) · progression [ROADMAP.md](ROADMAP.md) ·
> carte [world.js](../src/game/world.js). Ce document fixe **pourquoi** chaque mécanique a la
> forme qu'elle a, et le contrat des niveaux-fonction (Mondes 6-7).

## 1. Principe fondateur : la machine est vraie

**Le jeu ne simule pas le C — il l'exécute.** Chaque bloc posé par le joueur est une
instruction AST réellement interprétée par le moteur ; chaque pixel des vues est la
projection d'un état moteur réel :

| Vue à l'écran | Source moteur (vérité) |
|---|---|
| Casiers (variables) | `mem.snapshot()` |
| Le Tas (malloc/free) | `mem.heap()` |
| Ruban console | `mem.output` |
| **Pile d'appels** | `interp.frames()` |
| Descripteurs de fichiers | `mem.openDescriptors()` |
| Bloc actif (pas-à-pas) | `step() → {frameIndex, instrIndex}` |

Corollaire (la règle de cohérence pédagogique) : **si le joueur voit quelque chose bouger,
c'est qu'un événement moteur l'a produit.** Interdit : toute animation décorative qui ne
correspond pas à un état réel, tout niveau « quiz déguisé » où la réponse ne s'exécute pas.

## 2. La boucle de jeu (d'où vient le fun)

1. **Lire la mission** — fiction : une région de la RAM à réparer (la carte EST la mémoire).
2. **Choisir et ordonner** des blocs — la banque contient des **appâts** plausibles.
3. **Exécuter** — le pas-à-pas est un *film de la machine* : casiers qui changent,
   ruban qui s'imprime, pile qui respire.
4. **Échouer utile** — le crash est un spectacle qui enseigne : chaque RuntimeError du
   moteur est traduite en piège de l'anti-sèche (`pitfalls.js` → FeedbackBanner).
5. **Optimiser** — médailles `≤ N instructions · ≤ N pas · ≤ N casiers` = rejouabilité.

Quatre leviers de fun, tous déjà câblés, à préserver dans chaque nouveau niveau :
**spectacle** (la machine vit sous les yeux) · **risque** (les appâts rendent l'échec
probable et intéressant) · **golf** (médailles, par) · **liberté** (bac à sable pour
provoquer des catastrophes, examen chrono pour prouver la maîtrise).

## 3. Règle d'or des mécaniques : le geste du joueur = le geste du concept

| Monde | Concept | Ce que le joueur FAIT | Preuve à l'écran | Piège appâté |
|---|---|---|---|---|
| 1-2 Casiers, tableaux | adresse vs valeur | écrire dans un casier, viser via `p` | le casier change (highlight) | `*p` sur NULL, écraser sans `tmp` |
| 3 Sortie & ASCII | `write(1,&c,1)` | pousser des octets sur le ruban | le ruban s'imprime dans l'ordre | ordre inversé (`iH`) |
| 4 Chaînes & bornes | sentinelle `'\0'` | poser la borne, boucler dessus | strlen s'arrête (ou part dans le vide) | mesurer avant de borner |
| 5 Tas | malloc/free | réserver, remplir, rendre | blocs du Tas alloués/libérés/fuités | fuite, double free, malloc trop petit |
| **6 Récursivité** | cas de base + appel | **écrire le CORPS de `fact(n)`** — `main` est un lanceur verrouillé | **la pile monte** `fact(3) ▸ fact(2) ▸ fact(1)`, chaque frame montre SON `n`, puis se déroule | oublier/mal placer le cas de base → **la pile déborde** (borné `MAX_DEPTH`) |
| **7 Ptr de fonction** | passer `f`, appliquer `f(x)` | **brancher une valeur-fonction** dans une machine (`do_op`, `foreach`) | la frame de la fonction branchée apparaît à chaque application | brancher la mauvaise op ; appliquer une non-fonction |
| 8 Listes & arbres | `->next` | chaîner des maillons, libérer dans l'ordre | nœuds du tas + refs | libérer un maillon encore chaîné |
| 9 Fichiers | open/read/close | ouvrir, lire dans un buffer, fermer | fd ouverts/fermés, ruban | oublier close, lire après close |

Lecture de la ligne Monde 6 — c'est le cœur de la refonte : **on ne « regarde » pas la
récursion, on l'écrit.** Le joueur assemble les trois gestes qui *sont* la récursion
(s'arrêter · s'appeler plus petit · combiner), et la pile d'appels à l'écran est la
conséquence réelle de son code. L'échec emblématique (pas de cas de base) produit le
spectacle emblématique (débordement de pile) — le piège le plus célèbre de la Piscine
devient un moment de jeu.

## 4. Contrat des niveaux-fonction (Mondes 6-7)

Champs de niveau supplémentaires (data-driven, rétro-compatibles — un niveau à plat
n'en déclare aucun) :

```js
{
  assembleInto: 'fact',            // le programme du joueur devient le CORPS de cette fonction
  params: ['n'],                   // paramètres de la fonction assemblée
  driver: [{ ast: call(variable('r'), 'fact', [lit(3)]) }],  // main verrouillé (invisible à l'assemblage)
  driverText: 'main (verrouillé) : r = fact(3)',             // affiché dans la mission
  functions: { /* fonctions fournies toutes faites (Monde 7 : add, sub, emit…) */ }
}
```

Comportement runner (`game.js`) :
- `assembleInto` présent → l'interpréteur exécute `driver` avec un registre
  `functions[assembleInto] = { params, body: programme du joueur }` (+ `level.functions`).
- Pas-à-pas : le bloc actif du joueur n'est surligné **que** quand l'exécution est dans sa
  fonction (`frameIndex > 0`) ; dans le lanceur, rien n'est surligné (le lanceur n'est pas à lui).
- Médailles/par : comptées sur le programme du joueur (le corps), comme avant.

Pièges moteur → feedback (`pitfalls.js`) :
- `débordement de pile` → « CRASH — la pile déborde (stack overflow) » + hint cas de base ;
- `fonction inconnue` → hint « branche une vraie fonction avant de l'appliquer ».

## 4bis. Couverture du cursus & « ta libft »

Le contenu vise l'exhaustivité : les fonctions principales de **tous** les exos officiels
(C00→C13) et **la libft intégrale** (43 fonctions). Le référentiel canonique est
[`src/game/catalog.js`](../src/game/catalog.js) — chaque fonction y porte son module, ses
dépendances de forge, son tier de faisabilité moteur et son **statut** (jouable · à
refondre · à forger · hors-runtime · optionnel). `tests/game/catalog.test.mjs` interdit
toute dérive : oublier une fonction ou pointer un niveau fantôme casse la CI.

Deux règles moteur qui rendent ce contenu fidèle :
- **Un char EST son code ASCII** (`codeOf`, `evalBin`) : `c - '0'`, `'a' - 32`, `c <= 'z'`
  se comportent comme en C. C'est le socle de la moitié de la libft (atoi, itoa, casse,
  `str_is_*`, putnbr).
- **Esprit libft** : une banque ne contient que des primitives C (`= * & malloc/free`,
  arithmétique, `while`/`if`/`return`, syscalls) ou des `ft_` **déjà forgées** par le
  joueur — jamais une fonction toute faite que l'exo demande d'écrire (cf. §5).

## 5. Ce que ce contrat interdit (garde-fous)

- Pas de fonction récursive « fournie toute faite » à simplement invoquer : le cas de base
  doit être un choix du joueur, sinon le monde 6 n'enseigne rien (l'AC de #16 vit dans le
  gameplay, pas seulement dans les tests).
- Pas de mécanique jetable : le même contrat sert au Monde 6 (corps récursif) et au
  Monde 7 (corps qui applique `f`), et resservira pour tout niveau « écris la fonction ».
- Pas d'appel imbriqué dans une expression (`n * fact(n-1)` en un bloc) : un appel est un
  bloc à part entière, pour que **chaque frame poussée corresponde à un geste du joueur**.
- Pas de `ft_` magique en banque : si l'exo demande d'écrire `ft_atoi`, la banque ne
  propose pas un bloc `atoi` tout fait — seulement les primitives et les `ft_` déjà forgées.
- Pas d'indice qui donne la réponse (règle n°1 du cours) : un indice pose une question qui
  force à simuler la machine, rappelle le modèle mémoire ou renvoie au module — jamais une
  brique de la banque ni un ordre de pose. Le crash reste le professeur principal.
