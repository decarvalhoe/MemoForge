# ADR 0001 — Architecture en trois couches (engine / game / ui)

- Statut : accepté
- Date : 2026-07-01
- Portée : structure du code source

## Contexte

MemoForge est un jeu pédagogique dont la valeur tient à un **modèle mémoire correct**
(pointeurs, `malloc`/`free`, fuites, déréférencement de NULL). Ce modèle doit être
**vérifiable automatiquement** et **réutilisable** par plusieurs surfaces (puzzle, mode
pas-à-pas, futur bac à sable, futures animations). En parallèle, l'habillage visuel
évolue vite (design-system, thèmes) et ne doit pas fragiliser la logique.

Deux forces s'opposent donc : la **stabilité/testabilité de la logique** et la
**volatilité de l'UI**.

## Décision

Séparer le code en trois couches à dépendances orientées **du haut vers le bas**, sans
cycle :

1. **`engine/`** — modèle mémoire + interpréteur. **Aucune dépendance au DOM.** C'est la
   source de vérité, testée en isolation sous Node.
2. **`game/`** — contrôleur d'état et **données de niveaux**. Dépend de `engine`.
3. **`ui/`** — vues de rendu. Dépend de `game`/`engine` pour l'état, jamais l'inverse.

Le contenu (niveaux) est **piloté par les données** via un AST d'instruction minimal,
pour qu'ajouter un niveau ne touche pas le moteur.

## Conséquences

**Positif**
- Le moteur se teste sans navigateur → gate de couverture ≥ 90 % (voir [TESTING](../TESTING.md)).
- L'UI peut être re-thémée ou refondue sans risque pour la logique.
- Plusieurs surfaces réutilisent le même moteur.
- Travail en parallèle possible (UI et moteur n'entrent pas en collision).

**Négatif / coûts**
- Un peu de cérémonie (passer par des données/événements plutôt que coder en dur).
- Le moteur ne peut pas s'appuyer sur des API navigateur (par conception).

## Alternatives écartées
- **Tout dans les vues** (logique dans l'UI) : rejeté — logique non testable, couplée au DOM.
- **Framework composant** (React…) : rejeté pour l'instant — surcoût d'outillage contraire
  au choix « vanilla, sans build ».
