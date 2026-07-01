# MemoForge

[![CI](https://github.com/decarvalhoe/MemoForge/actions/workflows/ci.yml/badge.svg)](https://github.com/decarvalhoe/MemoForge/actions/workflows/ci.yml)

Jeu web de puzzle pour comprendre **les pointeurs, `malloc`/`free`, les chaînes et la
mémoire du langage C** — en assemblant de petits programmes sur un **mur de casiers**.
Support d'entraînement pour la **Piscine C de l'École 42**.

Tu explores une **carte de la RAM**, tu entres dans une salle, tu assembles un programme
par briques d'instructions, tu l'exécutes **pas à pas** (les casiers s'animent, le fil
pointeur se trace), et tu gagnes des **médailles** si tu atteins la cible proprement.

## Lancer le jeu

Les modules ES exigent un serveur HTTP (`file://` les bloque) :

```bash
npm run serve      # = python3 -m http.server 8000
```

Puis ouvre <http://localhost:8000>. Un accès réseau est requis (polices Google Fonts).

## Ce que le jeu propose

- **Aventure « carte RAM »** : 7 régions = concepts de la Piscine, à progression
  verrouillée (une région se débloque quand la précédente est résolue).
- **12 niveaux** ancrés sur de vrais `ft_*` : `Casiers & adresses`, `Tableaux`,
  `Sortie & ASCII` (`write`/`ft_putstr`), `Chaînes` (`strcpy`, sentinelle `'\0'`),
  `Conversion` (`atoi`, `putnbr_base`), `Mémoire dynamique` (`malloc`/`free`/fuite),
  `Listes` (nœuds `->next`).
- **Exécution animée** pas à pas + **fil pointeur** `p → n`.
- **Pédagogie active** : mascotte réactive, **feedback qui explique le piège**
  (déréf. NULL, use-after-free, double free, fuite, maillon encore chaîné), indice après
  deux échecs.
- **Médailles** d'optimisation, **réordonnancement** des briques (glisser-déposer + ▲/▼),
  **bac à sable** (expérimentation libre), **mode examen** (chrono, sans indice, score).
- **Thème clair/sombre**, **responsive** mobile, **accessibilité** (contraste WCAG AA
  vérifié par test).

## Architecture

Trois couches indépendantes — **le moteur ne connaît pas l'UI**.

```
src/
├── engine/        LE CŒUR — testable sans navigateur
│   ├── memory.js       casiers, adresses, malloc/free, chaînes, sortie, nœuds
│   ├── interpreter.js  exécute un programme (pas-à-pas)
│   └── ast.js          constructeurs d'instructions (data-driven)
├── game/          logique de jeu (sans DOM)
│   ├── levels.js  world.js  medals.js  tracker.js  pitfalls.js
│   ├── questions.js  sandbox.js  exam.js
│   └── game.js         contrôleur : modes carte/salle/bac-à-sable/examen
├── ui/            vues + design-system
│   ├── components/     Locker, CodeBrick, Button, Mascot, FeedbackBanner, Medal…
│   ├── memoryView / programView / paletteView / controls / regionMapView
│   └── theme.js        bascule clair/sombre
└── util/contrast.js    contraste WCAG (a11y)
styles/tokens/     design-system « Phosphore » (couleurs, typo, effets)
```

Le design-system provient d'un projet **Claude Design** (voir `docs/DESIGN_SYNC.md`) ; le
prototype de référence est dans `design/ui-kit/`.

## Base pédagogique

Le contenu n'imite pas 118 exercices : il rend jouables les **12 « briques »** qui les
composent tous (voir [`docs/BRIQUES.md`](docs/BRIQUES.md), d'après l'analyse transversale
de la Piscine). La feuille de route produit est dans [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Tests & qualité

```bash
npm test      # node --test + couverture (seuil 90 % sur src/engine)
npm run lint  # ESLint (règles inspirées de la Norme 42)
```

La suite couvre le moteur (mémoire, interpréteur), les niveaux, le modèle de monde, les
médailles, le tracker, les pièges, les questions, le contraste a11y — **exécutée en CI sur
chaque PR**.

## Contribuer

Deux lanes (moteur/infra et design/contenu) coordonnées via
[`docs/COORDINATION.md`](docs/COORDINATION.md) : worktrees isolés, une PR par sujet en
fichiers disjoints, tests avant merge.
