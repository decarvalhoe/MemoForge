# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) · versioning :
[SemVer](https://semver.org/lang/fr/). Démo : <https://decarvalhoe.github.io/MemoForge/>.

## [1.4.0] — 2026-07-02

Sanification & meilleurs standards du web (EPIC 10) : le code de la couche UI/jeu rejoint la
barre de qualité du moteur.

### Ajouté
- **Garde i18n** (E10-1) : un test échoue si une chaîne visible par le joueur est en dur —
  soit non enregistrée dans le pack EN, soit une clé `t()` orpheline. A révélé et corrigé des
  fuites invisibles à l'audit précédent (carte EN « tu es ici / verrouillé », `title`/
  `aria-label` du réordonnancement). Nouvel écran visuel **carte EN**.
- **A11y WCAG 2.2 AA outillée** (E10-4) : **axe-core** exécuté en CI sur 3 vues (0 violation) ;
  focus visible sur tous les interactifs ; lien d'évitement bilingue ; hiérarchie de titres
  `h1→h2→h3` réelle ; `prefers-contrast`. Contraste du label d'adresse corrigé. Voir
  [`docs/A11Y.md`](docs/A11Y.md).
- **CSP stricte** (E10-5) sans `'unsafe-inline'`, vérifiée en CI (écoute
  `securitypolicyviolation`) ; en-têtes serveur recommandés. Voir
  [`docs/SECURITY.md`](docs/SECURITY.md).

### Modifié
- **Styles inline → classes** (E10-2) : plus aucun `style=""` statique dans les vues (nouveau
  `styles/views.css`) ; états dynamiques via classes modificatrices. Rendu pixel-identique.
- **Lint étendu à tout `src/` et `tests/`** (E10-3) — cause racine des fuites — avec refactors
  sous 50 lignes/fonction et `eqeqeq` (idiome `== null` préservé).

## [1.3.1] — 2026-07-02

Finition bilingue et durcissement du process.

### Corrigé
- **UI 100 % anglaise** : les derniers textes en français (bac à sable, résumé d'examen,
  stats, tas/sortie, libellés de casiers, carte, adresses de régions) sont traduits. Audit
  automatisé : 0 français résiduel.
- A11y : l'attribut `<html lang>` suit la langue choisie (lecteurs d'écran).

### Ajouté
- **Documentation bilingue** : `README.en.md`, `CONTRIBUTING.en.md`, `docs/WORKFLOW.en.md`
  avec sélecteurs de langue ; README FR remis à jour (badges, chiffres).
- **Gate de release** (`docs-gate.yml`) : tout bump de version exige une entrée CHANGELOG et
  des badges README (FR + EN) à jour — check requis par la protection de branche.
- Description GitHub du dépôt réécrite (bilingue).

## [1.3.0] — 2026-07-02

Deltas moteur restants (EPIC 8) + progression/UX/portée (EPIC 9). Notamment : **le jeu
existe maintenant en anglais**.

### Ajouté
- **Version anglaise complète** (E9-3, #149) : bascule FR/EN persistée, pack de surcharge
  traduisant les 48 niveaux, les régions, l'UI et les pièges — le français reste la source.
- **Modèle argc/argv** (E8-1) : `ft_print_params`, `ft_rev_params` (argv = char**).
- **Mémoire brute** (E8-2) : `ft_memset`, `ft_memcpy` (modèle cellule-unité documenté).
- **Dépendances de forge visibles** (E9-1) : chaque niveau montre les `ft_` qu'il réutilise
  (✓ forgée / ○ référence).
- **Stats d'apprentissage locales & privées** (E9-4) : nombre d'essais par niveau, jamais
  envoyé nulle part ; rappel discret du niveau le plus retravaillé.
- **Garde mobile** (E9-2) : écran 375 px verrouillé + `prefers-reduced-motion`.

### Reporté (décisions documentées)
Granularité fine des briques (E8-3), son (E9-2). Le catalogue reste le backlog vivant.

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
