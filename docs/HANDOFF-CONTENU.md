# Handoff → agent Design/Contenu + contrat d'API #20

Ce document sert (1) de **prompt de reprise** pour l'agent Design/Contenu/Pédagogie/A11y,
et (2) de **contrat d'API** figé pour le refactor moteur #20 (contrôle de flux). Rédigé
par l'agent Moteur/Infra après accord sur le contrat.

---

## Partie 1 — Prompt de reprise (agent Contenu)

```
Tu es l'agent DESIGN + CONTENU + PÉDAGOGIE + A11Y de MemoForge (decarvalhoe/MemoForge).
Reprise après veille.

1. git fetch origin && git switch main && git pull --ff-only ; npm test doit être vert.
2. Relis docs/COORDINATION.md (lanes) et ce fichier (contrat d'API #20).
3. Ta lane : src/ui/**, src/game/{world,medals,tracker,pitfalls,questions,sandbox,exam}.js,
   levels.js (DONNÉES uniquement), styles/**, index.html, tests/{game,ui,a11y}/**,
   docs/{DESIGN_SYNC,A11Y,ROADMAP,BRIQUES}.md, design/**. NE TOUCHE PAS src/engine/**.
   Importe les constructeurs depuis src/engine/ast.js.

Déjà livré (ne pas refaire) : MemoForge v1 + monde Fichiers (r10, display_file).
Briques moteur sur main : B1 write, B2 strlen, B3/4/5 conversions, B8 malloc/strcpy,
B10 nœuds ->next, B12 fichiers.

Ta tâche = livrer le contenu débloqué par les briques de contrôle de flux (#20), dès
qu'elles sont sur main (vérifie les constructeurs dans ast.js) :
- r7 : ft_recursive_factorial (cas de base + piège « stack overflow borné »).  [B9]
- r8 : ft_foreach / do-op (appliquer f).                                        [B11]
- + niveaux boucle (ex. ft_strncpy borné).                                      [B7]

Avant : recâble le pas-à-pas de game.js sur le nouveau contrat step()/frames()
(voir Partie 2). Pour les 13 niveaux à plat, rien ne change (pile = 1 frame).

Protocole : worktree isolé, rebase sur origin/main avant PR, 1 issue = 1 PR, fichiers
disjoints, npm test + npm run lint verts, screenshots sur le port 8001.
```

---

## Partie 2 — Contrat d'API #20 (contrôle de flux)

Le refactor #20 introduit boucle (B7), appel/récursion (B9) et valeurs-fonction (B11).
Il **étend** l'API sans casser l'existant. Garanties :

### Stable (inchangé — tes vues en dépendent)
- `mem.output`, `mem.snapshot()`, `mem.heap()` : **inchangés**.
- Les 13 niveaux à plat actuels : **comportement identique**, aucune régression (AC #20).
- `step()` continue de renvoyer `index` (= `instrIndex` de la frame du haut) → ton
  surlignage actuel marche tel quel tant que tu n'as pas recâblé.

### Ajouté (le nouveau contrat)
- `interp.step()` → `{ done, error, index, frameIndex, instrIndex }`
  - `index` : compat (frame du haut).
  - `frameIndex` : indice de la frame active (0 = base ; > 0 = appel imbriqué).
  - `instrIndex` : instruction active **dans la frame active** (surligne la bonne brique,
    même dans un corps de boucle ou un appel).
- `interp.frames()` → `[{ label, vars, loop? }]`, **de bas en haut** :
  - `label` : nom lisible de la frame (ex. `main`, `factorial(3)`).
  - `vars` : snapshot des variables **de cette frame** (même forme que `snapshot()`).
  - `loop?` : présent si la frame exécute une boucle → `{ i, n }` (itération courante /
    borne) pour afficher « tour i/n » et re-surligner le corps.
- Programme sans contrôle de flux → `frames()` = **une seule frame** ; `frames()[0].vars`
  == `snapshot()`. Ton rendu actuel continue donc de marcher sur `frames[0]`.

### Constructeurs level-facing (dans `src/engine/ast.js`, source unique)
Documentés à leur livraison, une brique à la fois :
- **B7** : `loop(count, body)` et/ou `while(guard, body)` — corps = liste d'instructions.
- **B11** : `func(param, body)` (valeur-fonction) + `apply(fn, arg)`.
- **B9** : `defun(name, param, body)` + `call(name, arg)` (récursion) ; garde de pile
  bornée → piège « stack overflow ».

### Anti-boucle-infinie
Une **garde globale de pas** (compteur borné) arrête l'exécution avec une erreur
pédagogique si un programme dépasse un plafond de pas — quel que soit `while`/récursion.

---

## Séquencement convenu
1. (fait) Moteur documente ce contrat.
2. Moteur livre #20 en gardant les 13 niveaux verts, une brique/PR (B7 → B11 → B9),
   en documentant chaque constructeur dans `ast.js`.
3. À son réveil, l'agent Contenu recâble le pas-à-pas de `game.js` sur `step()/frames()`,
   puis livre r7 / r8 / niveaux boucle.
