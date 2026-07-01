# Contribuer à MemoForge

Merci de contribuer. Le projet est **vanilla (modules ES, sans build)** et vise une
qualité « AAA » : logique testée, UI découplée.

## Prérequis & lancement

- Node ≥ 22 (le runner de tests et la couverture natifs sont utilisés).
- Lancer le jeu : `npm run serve` puis http://localhost:8000 (les modules ES exigent HTTP).
- Tests : `npm test` (voir [docs/TESTING.md](docs/TESTING.md)).

## Architecture

Trois couches, dépendances vers le bas : `engine/` → `game/` → `ui/`. Le **moteur ne
touche jamais au DOM**. Détails : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) et
[ADR 0001](docs/adr/0001-couches.md).

## Style « Norme-lite » (inspiré de la Norme 42)

- `const`/`let`, **jamais `var`**.
- Fonctions **courtes** et à responsabilité unique.
- Nommage explicite (pas d'abréviations obscures).
- Pas de code mort ni de `console.log` oubliés.

Le lint (`npm run lint`, issue #2) formalisera ces règles.

## Git & PR

- Brancher depuis `main` : `git switch -c eX-Y-sujet`.
- Un commit raconte une intention ; référencer l'issue (`(#N)`).
- Ouvrir une PR avec le gabarit (`Closes #N`, AC cochés, tests verts).
- **La CI doit être verte** (lint · test · build) avant merge.

## Ajouter du contenu (niveaux)

Un niveau est **de la donnée** dans `src/game/levels.js` (cible, palette, critères).
Aucune modification du moteur n'est nécessaire pour un niveau utilisant les briques
existantes.

## Étendre le moteur

Nouvelle mécanique = étendre `evalExpr`/`writePlace` (`interpreter.js`) et, si besoin,
`memory.js` — **avec des tests unitaires** maintenant la couverture ≥ 90 %.
