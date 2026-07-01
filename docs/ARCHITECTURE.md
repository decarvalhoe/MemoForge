# Architecture

MemoForge est une application web **vanilla (modules ES, sans build)**, structurée en
**trois couches indépendantes**. La règle d'or : **le moteur ne connaît pas l'UI**.

```
index.html ─ src/main.js
                 │ monte
                 ▼
            src/game/  ── contrôleur + données (niveaux)
              │  utilise                │ rend via
              ▼                         ▼
        src/engine/               src/ui/
     (modèle + interpréteur)   (vues, DOM)
```

## Les trois couches

### 1. `engine/` — le cœur, testable sans navigateur
- **`memory.js`** — modèle mémoire : casiers nommés + adresses, tas (`malloc`/`free`),
  suivi des fuites et des cases libérées, erreurs (`RuntimeError` : NULL, adresse
  invalide, double free…).
- **`interpreter.js`** — exécute une liste d'instructions sur une `Memory`, pas-à-pas
  (`step`) ou d'un trait (`run`). Aucune dépendance au DOM.

### 2. `game/` — contrôleur et contenu
- **`levels.js`** — données pures : chaque niveau (cible, palette de briques, critères).
  Ajouter du contenu = éditer ces données, pas le moteur.
- **`game.js`** — état de la partie, progression, `run`/`step`, calcul du verdict ;
  orchestre les vues.

### 3. `ui/` — rendu
- `memoryView`, `programView`, `paletteView`, `controls` + `dom.js` (helper).
- Les vues sont des fonctions de rendu ; elles reçoivent un état et produisent du DOM.

## Le modèle d'instruction (AST minimal, piloté par les données)

Une instruction = une affectation `lhs = rhs`.

- `lhs` (cible) : `{t:'var', name}` ou `{t:'deref', name}` (= `*p`)
- `rhs` (expression) : `{t:'lit', v}` · `{t:'var', name}` · `{t:'addr', name}` (= `&x`)
  · `{t:'deref', name}` · `{t:'malloc'}`
- cas spécial : `{op:'free', ptr}`

Ce format découple le moteur du contenu : une nouvelle mécanique s'ajoute en étendant
`evalExpr`/`writePlace` (moteur) puis en l'exposant dans la palette d'un niveau (données).

## Arborescence

```
index.html · styles/main.css
src/
  main.js
  engine/  memory.js · interpreter.js
  game/    game.js · levels.js
  ui/      dom.js · memoryView.js · programView.js · paletteView.js · controls.js
tests/     helpers.mjs · engine/*.test.mjs · game/*.test.mjs
docs/      ARCHITECTURE.md · TESTING.md · ROADMAP.md · BRIQUES.md · adr/
```

## Contraintes transverses
- Modules ES, **aucune étape de build** ; lancer via un serveur HTTP statique.
- Le moteur reste **pur** (aucun accès DOM) → testable en Node.
- Décision fondatrice : voir [ADR 0001](adr/0001-couches.md).
