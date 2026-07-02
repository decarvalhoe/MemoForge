# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) · versioning :
[SemVer](https://semver.org/lang/fr/). Démo : <https://decarvalhoe.github.io/MemoForge/>.

## [1.2.0] — 2026-07-02

Expansion de contenu (EPIC 7) : **la libft se forge**. 27 → **44 niveaux**, 18 → **38
fonctions jouables**, **plus aucune brique magique**.

### Ajouté (20 fonctions « écris depuis zéro »)
- **Sortie** : `ft_putstr` (via ton `ft_strlen`), `ft_print_alphabet`, `ft_print_numbers`.
- **Conversion** : `ft_putnbr` et `ft_putnbr_base` **récursifs** (refonte des 2 derniers
  niveaux « magiques » — a-refondre = 0).
- **Caractères** : `ft_isdigit`/`ft_isalpha` (ET = produit, OU = somme), `ft_toupper`.
- **Chaînes** : `ft_strcmp`, `ft_strcat`, `ft_substr`, et **`ft_strjoin`** — le capstone qui
  compose `ft_strlen` + `ft_strcpy` + `ft_strcat` forgés.
- **Maths (C05)** : `ft_power`, **`ft_fibonacci`** (double récursion), `ft_is_prime`.
- **Listes/callbacks** : `ft_lstsize`, `ft_lstlast`, `ft_foreach`, `ft_lstiter`.

### Notes
Le budget de poids est relevé à 280 KB (croissance du contenu ; toujours 0 dépendance
runtime). Le catalogue reste le backlog vivant (56 fonctions restantes, surtout les tiers
octet/argv → EPIC 8).

## [1.1.0] — 2026-07-02

Réalignement complet sur le **cours mémoire (M1→M12)** et les **exercices officiels de 42**,
dans l'**esprit libft** : on écrit les `ft_` depuis zéro (EPIC 6).

### Ajouté
- **Mécanique « ta libft »** : chaque niveau « écris `ft_xxx` » résolu ajoute la fonction à
  un inventaire persistant ; les niveaux suivants la réutilisent (ex. `ft_strdup` appelle
  **tes** `ft_strlen` et `ft_strcpy`).
- **Catalogue du cursus** (`src/game/catalog.js`) : les 100 fonctions principales C00→C13 +
  la libft intégrale (43), avec garde de couverture en CI.
- **Verdict façon valgrind** sur les niveaux du tas (`definitely lost: 0 bytes`), **N+1 free**.
- **Explorateur d'octets** (M1/M2) : `1000 → e8 03 00 00` little-endian.
- Nouveaux niveaux : `ft_ft`/`ft_swap`/`ft_div_mod` (M4), `ft_ultimate_ft` (M5), **dangling
  pointer** (M6, « pourquoi le tas existe »), `ft_rev_int_tab`/`ft_range` (M11), `ft_split`
  N+1 (M9), `mem-1` octets (M1/M2). 27 niveaux, carte recentrée sur le cours.

### Modifié
- **Moteur** : un char est son code ASCII (`c - '0'`, `'a' - 32`) ; `deref` et `&` résolvent
  la portée locale (par adresse vs par copie) ; les locales meurent au return (dangling).
- Niveaux « brique magique » (`strcpy`/`atoi`/`putnbr` tout faits) → niveaux de
  **construction**. Indices réécrits : **jamais la réponse** (garde automatisée).

### Retiré
- Sémantique inventée « nœud encore chaîné » (le vrai piège M12 est le use-after-free).
- Niveaux hors-cursus (pointeurs de fonction C11, bonus days).

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
