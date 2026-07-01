# MemoForge

[![CI](https://github.com/decarvalhoe/MemoForge/actions/workflows/ci.yml/badge.svg)](https://github.com/decarvalhoe/MemoForge/actions/workflows/ci.yml)

Jeu de puzzle de programmation pour comprendre **les pointeurs, `malloc`/`free` et les
grands principes de la mémoire en C** — en manipulant un mur de casiers.

Tu assembles un petit programme à partir de briques d'instructions, tu l'exécutes
(d'un coup ou en pas-à-pas), tu vois les casiers s'animer, et tu gagnes des étoiles si
tu atteins la cible sans bug.

## Lancer le jeu

Les modules ES exigent un serveur HTTP (le `file://` les bloque). Depuis ce dossier :

```bash
python -m http.server 8000
```

Puis ouvre http://localhost:8000 dans le navigateur.

## Architecture

Trois couches indépendantes — le moteur ne connaît pas l'UI.

```
forge-memoire/
├── index.html              point d'entrée
├── styles/main.css         thème (casiers, pupitre, contrôles)
├── src/
│   ├── main.js             bootstrap : monte le jeu dans #app
│   ├── engine/             LE CŒUR — testable sans navigateur
│   │   ├── memory.js       modèle mémoire : casiers, adresses, malloc/free, fuites
│   │   └── interpreter.js  exécute une liste d'instructions sur la mémoire (pas-à-pas)
│   ├── game/
│   │   ├── levels.js       données des niveaux (cible, palette, étoiles)
│   │   └── game.js         contrôleur : état, progression, run/step, verdict
│   └── ui/
│       ├── dom.js          mini-helper DOM
│       ├── memoryView.js   rend le mur de casiers
│       ├── programView.js  rend ton programme (slots)
│       ├── paletteView.js  rend la palette d'instructions
│       └── controls.js     boutons exécuter / pas-à-pas / réinitialiser + verdict
```

### Le modèle d'instruction (un C simplifié, piloté par les données)

Une instruction = une affectation `lhs = rhs`.

- `lhs` (cible) : `{t:'var', name}` ou `{t:'deref', name}` (= `*p`)
- `rhs` (expression) : `{t:'lit', v}` · `{t:'var', name}` · `{t:'addr', name}` (= `&x`) · `{t:'deref', name}`

Exemples : `tmp = a` · `p = &n` · `*p = 42`. Ajouter une instruction au jeu = ajouter une
entrée dans `levels.js`, sans toucher au moteur.

## Étendre

- **Nouveau niveau** : une entrée dans `src/game/levels.js`.
- **Nouvelle opération** (`malloc`, boucle, `->next`) : étendre `interpreter.js` (eval/exec)
  et `memory.js` (alloc/free déjà présents), puis l'exposer dans la palette d'un niveau.

## État — 7 niveaux, 4 mondes (sujets principaux de la Piscine)

| Monde | Sujet | Niveaux | Module |
|---|---|---|---|
| 1. Casiers & adresses | pointeurs, `&`, `*` | 42 dans n · via pointeur · échange a/b | C01 |
| 2. Tableaux & échange | swap, index miroir | inverser un tableau | C01 |
| 3. Mémoire dynamique | `malloc`/`free`/NULL/fuite/double free | réserve-écris-libère · un free par malloc | C07 |
| 4. Chaînes & fin | `'\0'` | écrire "Hi" | C02/C04 |

À venir (mécanique à ajouter) : récursion (C05), listes chaînées `->next` (C12), boucles.

Moteur vérifié par `node tests/smoke.mjs` (16 cas : solutions correctes, mauvais ordres,
fuites, double free, déréférencements de NULL).
