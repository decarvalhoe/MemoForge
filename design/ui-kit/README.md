# MemoForge — UI kit (direction « Phosphore »)

Prototype visuel interactif importé depuis Claude Design
(projet « Design basé sur prototype jeu », `ui_kits/memoforge/`), le
2026-07-01 via le MCP DesignSync. C'est la **cible visuelle** du jeu, pas
encore le jeu lui-même (le jeu tournant vit dans `../../src` + `../../styles`).

## Lancer

Les fonts et React/Babel sont chargés par CDN ; il faut donc un accès réseau
et un serveur HTTP (les `@import` CSS relatifs échouent en `file://`). Depuis
la racine du repo :

```bash
python -m http.server 8000
# puis http://localhost:8000/design/ui-kit/
```

## Contenu

- `index.html` — le prototype : flux cliquable **carte RAM → salle 1-2 → RUN
  animé → médailles**. Autonome (React + Babel compilé dans le navigateur ;
  composants de secours embarqués). Seule dépendance locale : `styles.css`.
- `styles.css` — point d'entrée du design-system ; `@import` les tokens.
- `tokens/` — `fonts` · `colors` (thème sombre + `.theme-light` WCAG-AA) ·
  `typography` · `spacing` · `effects` (glow phosphore, scanlines, keyframes).

## Écart vs la source

Un seul : le lien feuille de style est passé de `../../styles.css` (structure
Claude Design) à `styles.css` (co-localisé ici). Tout le reste est identique
à la source.

## Prochaine étape

Traduire ces tokens dans le vrai jeu : remplacer les variables de
`../../styles/main.css` par ce système (alias sémantiques), puis re-styler les
vues `../../src/ui/` pour incarner casiers/briques/mascotte de cette direction.
