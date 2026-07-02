# Budget de performance (E5-3)

> Le budget est **appliqué par le harnais** (`npm run test:visual`, section « budget de
> perf ») : dépassement = échec, en local comme en CI. Réf. : docs/TESTING.md.

## Le budget

| Métrique | Budget | Mesure |
|---|---|---|
| **Poids de l'app servie** (index.html + `src/**` + `styles/**`) | ≤ 200 KB non minifié, zéro dépendance runtime | somme des tailles fichiers (harnais) |
| **Rendu d'une salle** — la plus chargée : `rec-1`, pile de `fact(3)` déployée | médiane ≤ 16 ms · p95 ≤ 32 ms (60 rendus) | `performance.now()` autour de `game.render()` dans Chrome headless |
| **Rendu de la carte** (10 régions, 22 salles) | médiane ≤ 16 ms | idem, autour de `game.renderMap()` |
| **Pas-à-pas** | 1 step = exactement 1 render (cadence 480 ms ≫ budget) | par construction (`_animate`) |

16 ms = un frame à 60 fps : n'importe quelle interaction (pose de bloc, step, navigation)
tient dans un frame, sans jank perceptible.

## Pourquoi c'est tenu (règles d'architecture à préserver)

- **Rendu à la demande, une vue à la fois** : `render()` ne reconstruit que la salle
  courante ; la carte n'est re-rendue que par `showMap()`. Carte et salle sont permutées
  par `display`, jamais reconstruites en tandem.
- **Écrans lourds hors du chemin critique** : le styleguide est une **page séparée**
  (`styleguide.html`) — jamais chargé par le jeu. Zéro dépendance runtime, pas de
  framework : le coût de rendu est celui du DOM que l'on crée, rien d'autre.
- **Pas de lecture layout dans les boucles de rendu** : l'unique usage de
  `getBoundingClientRect` (fils pointeurs, `memoryView.drawThreads`) est différé
  **après layout** via `requestAnimationFrame` — pas de reflow forcé au milieu d'une
  construction DOM. Toute nouvelle lecture layout doit suivre ce pattern.
- **Construction en bloc** : les vues assemblent leurs nœuds via `el()` puis les
  attachent en une passe (`clear` + `append`) — pas de mutations incrémentales du DOM
  vivant dans les boucles.

## Faire évoluer le budget

Le budget vit ici et dans `tests/visual/run.mjs` (`PERF_BUDGET`). Le durcir : baisser les
seuils. L'assouplir : justifier dans la PR (nouvel écran réellement plus riche) — jamais
pour absorber une régression.
