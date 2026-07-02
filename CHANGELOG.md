# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) · versioning :
[SemVer](https://semver.org/lang/fr/). Démo : <https://decarvalhoe.github.io/MemoForge/>.

## [1.0.0] — 2026-07-02

Première release complète : **les 12 briques de la Piscine C sont jouables**.

### Ajouté
- **Moteur** : pile d'appels récursifs réelle (frames, `if`/`call`/`return`, débordement
  borné — E2-6) ; valeurs-fonction (`funcRef`/`apply` — E2-8) ; garde de non-régression de
  l'AST unifié sur tous les niveaux (E2-10). Couverture engine 100 %.
- **Contenu** : Monde 6 Récursivité (`rec-1`, `rec-2` — `ft_recursive_factorial`) et
  Monde 7 Pointeurs de fonction (`fn-1` `do_op`, `fn-2` `ft_foreach`) avec la mécanique
  « écris le corps de la fonction » (E3-4/E3-5) — 22 niveaux, 10 régions, carte complète.
- **Game design** : `docs/GAME-DESIGN.md` — « la machine est vraie », le geste du joueur =
  le geste du concept, contrat des niveaux-fonction.
- **Qualité** : harnais de tests visuels (4 écrans clés : structure + pixel par plateforme,
  E0-6) ; budget de perf défini et appliqué (`docs/PERF.md`, E5-3) ; build de prod statique
  `dist/` vérifié par le harnais (E5-4) ; déploiement GitHub Pages continu (E5-5).

### État antérieur (0.x, 2026-07-01)
Socle AAA (CI, lint, couverture ≥ 90 % engine), design-system en couche composant, moteur
briques B1–B8/B10/B12, 18 premiers niveaux, carte RAM, médailles, pièges pédagogiques,
bac à sable, mode examen, thème clair/sombre, a11y contraste.
