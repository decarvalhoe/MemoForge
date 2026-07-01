# MemoForge — game design (3 directions intégrées)

Un seul jeu, trois couches qui s'emboîtent. Chacune répond à un besoin différent et
nourrit les autres.

```
        AVENTURE  (où tu vas, pourquoi)        ← la coquille / progression
            │  tu entres dans une salle
            ▼
        PUZZLE D'ASSEMBLAGE  (ce que tu fais)  ← le cœur de jeu
            │  salle résolue
            ▼
        MAÎTRISE / BAC À SABLE  (rejouer mieux) ← la profondeur
            └─ médailles d'optimisation · mode libre
```

## Couche 1 — Aventure dans la RAM (la progression)

- **La carte = la mémoire.** Des régions : la Pile, le Tas, le Quartier des Chaînes,
  l'Allée des Listes… (= nos mondes/modules C01, C07, C02/04, C12).
- **Un personnage** (le Manutentionnaire) voyage de salle en salle.
- **On se déplace en suivant les pointeurs.** Pour passer d'une salle à l'autre, il faut
  établir le bon pointeur (une adresse, un `->next`). Le déplacement **est** une mécanique
  pointeur — l'aventure enseigne en bougeant.
- **Fil narratif léger :** des fuites menacent la RAM ; remettre de l'ordre dans une région
  débloque la suivante.

## Couche 2 — Puzzle d'assemblage ++ (le cœur)

- Dans chaque salle : un **état-cible** ; tu assembles un programme par **glisser-déposer**
  de briques d'instructions (réordonnable, pas seulement ajout/retrait comme aujourd'hui).
- **Juice :** exécution pas-à-pas animée, le perso agit physiquement sur les casiers ;
  réussite et crash visibles ; **mascotte** qui réagit et donne un indice après deux échecs.
- C'est le moteur actuel (`engine/`), enrichi côté UI.

## Couche 3 — Maîtrise & bac à sable (la profondeur)

- **Médailles d'optimisation** par salle (étend nos étoiles) :
  résolu · ≤ N instructions · ≤ N pas d'exécution · ≤ N casiers utilisés.
- **Mode bac à sable :** un éditeur libre, toute la palette débloquée, sans cible imposée —
  pour expérimenter (construire une liste, provoquer une fuite et la voir, tester un
  double free…).
- **Défis ouverts** avec contraintes (« sans variable temporaire », « en 2 instructions »).

## Comment les couches se nourrissent

Aventure → donne une raison d'entrer dans la salle.
Puzzle → la salle se résout en assemblant.
Maîtrise → on y revient pour les médailles, ou on explore librement en bac à sable.

## Cartographie sur l'architecture existante (donc constructible)

| Brique | Aujourd'hui | Évolution |
|---|---|---|
| `engine/memory.js`, `interpreter.js` | moteur du puzzle | + compteur de pas (déjà `pc`), + mesure mémoire utilisée |
| `game/levels.js` | niveaux à plat | + champ `region` ; niveaux = salles d'une région |
| `game/game.js` | contrôleur | + médailles dans `evaluate()` ; gère le mode (campagne / bac à sable) |
| **`game/world.js`** (nouveau) | — | la carte : régions, déblocages, position du perso |
| `ui/` | vues du puzzle | + `worldMap`, + écran médailles, + mascotte, + drag-drop |

## Nouvelles mécaniques moteur à ajouter

- **Déplacement = pointeur** : modéliser des salles liées (réutilise le concept liste `->next`).
- **Médaille « pas »** : compter les `step()` (trivial, `pc`).
- **Bac à sable** : un type de niveau sans `goal`, palette complète.

## Ordre de construction proposé

1. **Scoring → médailles** (3-4 paliers). Petit, immédiat, visible.
2. **Drag-drop + juice** sur le puzzle existant (couche 2).
3. **Carte des régions + progression + perso** (couche 1).
4. **Mode bac à sable** (couche 3).

## Choix encore ouvert : le visuel

Terminal rétro / flat moderne + mascotte / blueprint technique. Le design ci-dessus
fonctionne avec les trois ; le style change l'ambiance, pas les mécaniques.
