# Tests & couverture

MemoForge se teste avec le **runner intégré de Node** (`node:test`) — **zéro dépendance**,
fidèle au choix « vanilla, sans build ».

## Lancer

```bash
npm test          # tous les tests + rapport de couverture (échoue si engine < 90%)
npm run test:watch
```

## Organisation (par module)

```
tests/
  helpers.mjs               fabrique de programmes + vérification de cible
  engine/memory.test.mjs        unités : Memory (adresses, tas, erreurs)
  engine/interpreter.test.mjs   unités : Interpreter (eval/exec, erreurs)
  game/levels.test.mjs          intégration : les 16 cas de gameplay
```

- **Unités moteur** : couvrent chaque méthode de `memory.js`/`interpreter.js`, y compris
  les chemins d'erreur (NULL, adresse invalide, double free…).
- **Intégration niveaux** : rejoue chaque solution de niveau et vérifie la cible + les
  pièges (mauvais ordre → crash, oubli de `free` → fuite…).

## Gate de couverture

`npm test` applique des seuils **scopés à `src/engine`** (le cœur) :

| Métrique | Seuil |
|---|---|
| lignes | ≥ 90 % |
| branches | ≥ 90 % |
| fonctions | ≥ 90 % |

Implémenté via les drapeaux natifs `--experimental-test-coverage`
`--test-coverage-include`/`--test-coverage-lines|branches|functions`. En dessous du seuil,
`npm test` sort en erreur (code ≠ 0) → la CI passe au rouge.

## Ajouter un test

1. Créer `tests/<module>/<sujet>.test.mjs`.
2. `import { test, describe } from 'node:test'` et `assert` de `node:assert/strict`.
3. Pour du gameplay, réutiliser `helpers.mjs` (`runProgram`, `goalMet`, `solved`).

Le fichier est découvert automatiquement (motif `*.test.mjs`).

## Tests visuels (E0-6)

`npm run test:visual` — harnais Puppeteer (`tests/visual/run.mjs`) qui capture et vérifie
les **écrans clés** : carte, salle `1-1`, salle `rec-1` avec la pile d'appels au plus
profond de `fact(3)`, styleguide.

- **Capture** : toujours écrite dans `tests/visual/out/` (gitignoré ; artefact CI 14 j).
- **Invariants structurels** : chaque écran doit rendre ce qu'il prétend (salles sur la
  carte, mission + palette, frames `fact(3)…fact(1)` réelles) — violation = échec.
- **Références pixel** : `tests/visual/baseline/<plateforme>/` (le rendu des polices varie
  selon l'OS). Référence absente = créée (seed) ; dérive > 0,5 % de pixels = échec, avec
  un `<écran>.diff.png` dans `out/`. `npm run test:visual -- --update` régénère.
- **Chrome** : `PUPPETEER_EXECUTABLE_PATH` > cache Puppeteer > emplacements standards
  (Chrome/Edge Windows, google-chrome/chromium Linux). Préinstallé sur le runner CI.
- **Déterminisme** : écrans pilotés via `window.__memoforge` (exposé par `src/main.js`),
  animations neutralisées, viewport fixe 1280×900.
