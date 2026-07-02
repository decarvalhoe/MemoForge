# Coordination multi-agents — MemoForge

Deux agents travaillent en parallèle sur ce repo. Ce document fixe la **répartition des
lanes** et le **protocole anti-collision**. À lire avant toute PR.

## Répartition des lanes (ownership de fichiers)

### Agent A — Infra + Moteur
- `src/engine/**` (memory.js, interpreter.js, nouveaux modules moteur, ex. `ast.js`)
- `tests/engine/**`, `tests/helpers.mjs`
- `package.json` (scripts), config ESLint, `.github/**` (CI, templates)
- `docs/ARCHITECTURE.md`, `docs/adr/**`, `docs/TESTING.md`, `CONTRIBUTING.md`

### Agent B — Design-system + Contenu + Pédagogie + A11y
- `src/ui/**` (`components/`, `styleguide.js`, `theme.js`, `*View.js`)
- `src/game/{world,medals,tracker,pitfalls,questions}.js`, `src/util/**`
- `styles/**`, `index.html`, `styleguide.html`
- `tests/game/{world,medals,tracker,pitfalls,questions}.test.mjs`, `tests/ui/**`, `tests/a11y/**`
- `docs/{DESIGN_SYNC,A11Y,ROADMAP,BRIQUES}.md`, `design/**`

### Fichiers PARTAGÉS — coordination obligatoire
- **`src/game/levels.js`** : les constructeurs d'AST des nouvelles ops moteur (write, loop,
  malloc dimensionné, `->next`…) vivent dans un **module moteur dédié** (`src/engine/ast.js`,
  Agent A) ; **Agent B** importe ces constructeurs pour écrire les **données de niveaux**.
  → Agent A n'édite pas les données de niveaux ; Agent B n'édite pas les primitives moteur.
- **`src/game/game.js`** : contrôleur UI (Agent B). Si l'API moteur change, Agent A le
  **documente dans sa PR** et Agent B recâble.
- **`tests/game/`** : dossier partagé, fichiers à **noms distincts** (`levels.test.mjs` = A ;
  `world/medals/…` = B).

## Protocole

1. **Un worktree isolé par branche/PR** depuis `develop` (`git worktree add -b <lane>/<sujet> <dir> origin/develop`).
   Un dossier git = un seul HEAD ; ne jamais lancer `git` de deux agents dans le même dossier.
2. **Rebaser sur `origin/develop` avant d'ouvrir/mettre à jour une PR** — `develop` (la base) bouge. Le modèle de branches complet est dans [WORKFLOW.md](WORKFLOW.md).
3. **1 issue = 1 PR**, fichiers **disjoints**, **tests avant merge**.
4. **Ne pas éditer les fichiers de l'autre lane.** En cas de besoin transverse, ouvrir une
   issue de coordination ou le signaler dans la PR.
5. **Barre qualité AAA** (voir `docs/ROADMAP.md`) : couverture ≥ 90 % engine, lint vert,
   changements **additifs** (pas de régression des tests smoke ni des tests de contenu).

## Astuces partagées

- **Tests visuels (E0-6)** : un Chrome headless est déjà en cache
  (`~/.cache/puppeteer/chrome/linux-131.*/chrome`). `puppeteer-core` + `goto` d'une URL
  locale + `screenshot` suffit — pas besoin d'installer Chrome.
- **Screenshots de vérif** : servir sur un **port distinct par agent** (8000 vs 8001…) pour
  ne pas se marcher dessus.

## Historique

- 2026-07-01 : `main` @ `6ba8025` = 8 PRs contenu (Agent B) mergées (couche composant,
  world, médailles, tracker, pièges, questions, contraste/a11y, thème clair). Le doublon
  E2-1 (write/B1) a été tranché : la version moteur d'Agent A (#12) fait foi ; la PR
  concurrente d'Agent B (#51) a été fermée.
