# MemoForge — Roadmap produit (refonte « AAA »)

> **Vision.** Faire de MemoForge une traversée *jouable* de la structure transversale de la
> Piscine C : on maîtrise les [12 briques](BRIQUES.md) en manipulant la mémoire, pas en
> révisant 118 exercices isolés. Qualité produit : moteur testé strictement, design-system
> exploité à fond, documentation vivante, CI verte obligatoire.

Ce document est le **plan d'action** : 6 EPICs → milestones → issues avec critères
d'acceptation. Les libellés d'issues sont prêts à être créés sur GitHub (`decarvalhoe/MemoForge`).

---

## Barre qualité « AAA » (Definition of Done, globale)

Aucune issue n'est *Done* si elle ne respecte pas ces invariants :

- **Tests d'abord sur le moteur** : toute fonction publique de `src/engine/**` et
  `src/game/**` a des tests unitaires ; couverture **≥ 90 %** sur `engine/`, **≥ 80 %** global.
  Cas limites obligatoires (vide, négatif, `INT_MIN`, `NULL`, double-free, borne `'\0'`).
- **Lint propre** : ESLint (+ règles « Norme-lite » inspirées de la Norme 42 : fonctions
  courtes, pas de `var`, nommage explicite) → 0 warning.
- **CI verte** : lint + tests + build passent sur chaque PR (GitHub Actions). Pas de merge rouge.
- **Snapshot visuel** : tout composant UI a une capture de référence (harnais Puppeteer déjà
  en place, cf. `/tmp/mf-shot`) validée sur ses états.
- **Docs à jour** : tout changement d'archi met à jour `docs/ARCHITECTURE.md` ; toute
  décision structurante = un ADR (`docs/adr/NNNN-*.md`). JSDoc sur les API moteur.
- **Accessibilité** : WCAG AA (contraste, taille ≥ 14 px pour le corps, pas d'info par la
  couleur seule, `prefers-reduced-motion` respecté).
- **Séparation des couches** : le moteur ne connaît jamais le DOM ; l'UI ne contient pas de
  logique de jeu. (Invariant déjà tenu — à ne pas casser.)

---

## Milestones

| Jalon | Contenu | Objectif |
|---|---|---|
| **M1 — Socle AAA** | EPIC 0 + amorce EPIC 1 | infra de qualité : tests, lint, CI, docs, composants |
| **M2 — Moteur des 12 briques** | EPIC 2 | le moteur modélise les 9 capacités manquantes |
| **M3 — Carte de la piscine** | EPIC 3 | contenu : mondes, niveaux ancrés, médailles, bac à sable |
| **M4 — Boucle pédagogique** | EPIC 4 | exécution animée, mascotte, pièges, mode exam/chrono |
| **M5 — Release 1.0** | EPIC 5 | a11y, thème clair, perf, déploiement GitHub Pages |

---

## EPIC 0 — Fondations projet (infra AAA) · `M1`

*But : rendre la qualité mesurable et automatique avant d'ajouter des features.*

- **E0-1** — Runner de tests + couverture. Migrer `tests/smoke.mjs` vers une suite structurée
  (`node --test` ou Vitest), rapport de couverture, seuils qui **échouent** sous 90 % engine.
  *AC :* `npm test` rouge si couverture < seuil ; suite existante conservée (16 cas → répartis par module).
- **E0-2** — ESLint + Norme-lite. Config ESLint, règles longueur de fonction / nommage / pas
  de `var` / pas de `console` en prod. *AC :* `npm run lint` = 0 warning sur le code existant.
- **E0-3** — CI GitHub Actions. Workflow `ci.yml` : install → lint → test → build sur push/PR.
  *AC :* badge vert sur `main` ; PR bloquée si rouge.
- **E0-4** — Squelette de docs. `docs/ARCHITECTURE.md`, `docs/adr/0001-couches.md`,
  `CONTRIBUTING.md`, `docs/TESTING.md`. *AC :* archi actuelle décrite, ADR des 3 couches écrit.
- **E0-5** — Templates GitHub. Issue templates (epic/feature/bug), PR template, labels
  (`epic`, `engine`, `ui`, `design-system`, `content`, `a11y`, `test`, `docs`).
- **E0-6** — Harnais de tests visuels. Formaliser le script Puppeteer (screenshots
  déterministes d'états) en `tests/visual/` réutilisable en CI (Chrome du cache Puppeteer).
  *AC :* `npm run test:visual` produit/vérifie les captures des écrans clés.

## EPIC 1 — Design-system en couche composant (vanilla) · `M1`→`M2`

*But : exploiter le design-system au maximum — transformer les tokens en une vraie
bibliothèque de composants réutilisables, miroir du prototype `design/ui-kit/`.*

- **E1-1** — Primitives token-driven en JS vanilla : `TerminalWindow`, `Locker`, `CodeBrick`,
  `Button`, `Badge`, `StatChip`. API identique au prototype (mêmes props/états). *AC :* chaque
  primitive rend tous ses états ; snapshot visuel.
- **E1-2** — Composants pédagogiques : `Mascot` (win/think/err), `Medal`, `FeedbackBanner`
  (success/crash/leak), `RegionCard`. *AC :* états couverts + a11y (label/glyphe, pas couleur seule).
- **E1-3** — Migrer les vues existantes (`memoryView`, `programView`, `paletteView`,
  `controls`) sur ces composants. *AC :* rendu identique au thème actuel, zéro régression visuelle.
- **E1-4** — Styleguide vivant : page `styleguide.html` listant tous les composants et états
  (l'équivalent local de la Design System pane). *AC :* servie en local, snapshotée.
- **E1-5** — Thème clair : brancher `.theme-light` (déjà dans les tokens) + toggle persistant.
  *AC :* bascule sombre/clair sans perte de lisibilité (WCAG AA vérifié).
- **E1-6** — Boucle de re-sync design : documenter le flux DesignSync (import/`get_file`) pour
  ré-importer le design quand `design/ui-kit/` évolue côté Claude Design. *AC :* `docs/DESIGN_SYNC.md`.

## EPIC 2 — Moteur v2 : modéliser les 12 briques · `M2`

*But : étendre `Memory`/`Interpreter` pour couvrir les 9 capacités manquantes
(cf. [BRIQUES.md](BRIQUES.md)). Chaque capacité = tests avant UI.*

- **E2-1** — Flux de sortie (**B1**) : `write(fd,&c,1)` + ruban console observable. *AC :*
  `ft_putchar`/`ft_putstr` reproductibles ; test sur l'ordre des octets émis.
- **E2-2** — Chaînes & sentinelle (**B2**) : type chaîne = casiers contigus + `'\0'`, curseur.
  *AC :* `ft_strlen` s'arrête sur `'\0'` ; chaîne sans borne = erreur pédagogique.
- **E2-3** — Boucle bornée (**B7**) : construct `while`/`for` avec garde + compteur de pas.
  *AC :* garde anti-boucle-infinie ; `ft_strncpy` borné testé.
- **E2-4** — Char & conversions (**B3/B4/B5**) : `char` typé, `%`/`/`, accumulateur.
  *AC :* `ft_atoi` (dont `INT_MIN`) et `ft_putnbr_base` testés, débordement détecté.
- **E2-5** — `malloc` dimensionné + `NULL` (**B8**) : taille explicite, retour NULL possible,
  copie avec `'\0'`. *AC :* `ft_strdup` ; oubli du `+1` et NULL non testé = échecs pédagogiques.
- **E2-6** — Pile d'appels (**B9**) : frames récursives visualisables, cas de base.
  *AC :* `ft_recursive_factorial` ; récursion sans base = « stack overflow » borné.
- **E2-7** — Nœuds chaînés (**B10**) : `{data, next}`, traversée `->next`, listes/arbres.
  *AC :* push_back/traversée ; free d'un nœud encore chaîné = piège détecté.
- **E2-8** — Valeurs-fonction (**B11**) : passer `f` et l'appliquer. *AC :* `ft_foreach`/`do-op`.
- **E2-9** — Modèle fichier (**B12**) : descripteur + buffer, `open`/`read`/`close`.
  *AC :* `display_file` ; oubli de `close` / lecture après close = pièges.
- **E2-10** — Refactor AST unifié : étendre le mini-langage piloté par données sans casser
  les niveaux existants. *AC :* les 7 niveaux actuels passent toujours (non-régression).

## EPIC 3 — Contenu : la carte de la piscine · `M3`

*But : l'aventure RAM — mondes = concepts, niveaux ancrés sur de vrais `ft_*`, médailles,
bac à sable.*

- **E3-1** — Modèle de monde/région (`game/world.js`) : régions, déblocages, position, champ
  `region`/`brique` sur les niveaux. *AC :* progression None→write→malloc→structures encodée.
- **E3-2** — Écran carte RAM (`RegionMap`) : régions, verrous, alerte fuite, entrée en salle.
- **E3-3** — Niveaux Monde 2–4 (sortie/ASCII, chaînes, conversion) ancrés B1–B5/B7.
- **E3-4** — Niveaux Monde 5–6 (tas, récursivité) ancrés B8/B9.
- **E3-5** — Niveaux Monde 7–9 (ptr de fonction, listes/arbres, fichiers) ancrés B10–B12.
- **E3-6** — Médailles d'optimisation (étend les étoiles) : résolu · ≤ N instr · ≤ N pas ·
  ≤ N casiers. *AC :* calcul dans `evaluate()`, écran `RoomComplete`.
- **E3-7** — Mode bac à sable : palette complète, sans cible — expérimenter (fuite, double free…).
- **E3-8** — Glisser-déposer réordonnable des briques (vs ajout/retrait actuel). *AC :* clavier-accessible.

## EPIC 4 — Boucle de jeu & pédagogie · `M4`

*But : rendre l'apprentissage actif et ancré sur l'anti-sèche de l'analyse.*

- **E4-1** — Exécution pas-à-pas animée + fil pointeur `p → n` (déjà prototypé). *AC :* respecte `reduced-motion`.
- **E4-2** — Mascotte réactive (GLIF) : indice après 2 échecs, réactions win/think/err.
- **E4-3** — États de feedback pédagogiques = les pièges §7 de l'analyse (cf. BRIQUES.md).
  *AC :* chaque piège a un déclencheur moteur + message.
- **E4-4** — Intégration tracker : marquer une brique « comprise / refaite / sous chrono »,
  répétition espacée J+1/J+3/J+7 (miroir de `TRACKER_PROGRESSION.md`). *AC :* état persistant local.
- **E4-5** — Mode exam / chrono : sélection de briques critiques, minuteur, sans indice.
- **E4-6** — Fiches « questions à se poser » contextualisées par niveau.

## EPIC 5 — Polish, a11y, perf, release · `M5`

- **E5-1** — Audit WCAG AA complet (contrastes des deux thèmes, focus visibles, ARIA).
- **E5-2** — Responsive < 680 px + tenue mobile (le produit doit passer sur ~860 px et en dessous).
- **E5-3** — Perf : budget de rendu, pas de reflow inutile, lazy des écrans lourds.
- **E5-4** — Build/bundle de prod (sans CDN pour React côté prototype ; le jeu reste vanilla).
- **E5-5** — Déploiement GitHub Pages + versioning sémantique + CHANGELOG.
- **E5-6** — README produit + captures + lien démo.

---

## Séquencement conseillé

1. **M1 d'abord** (EPIC 0) — sans filet de test/CI, la refonte moteur est risquée.
2. **EPIC 1 en parallèle** — la couche composant débloque tout le contenu visuel.
3. **EPIC 2 avant EPIC 3** — pas de niveau sans la capacité moteur correspondante.
4. EPIC 4 et 5 se nourrissent du contenu ; à traiter en dernier.

## Dépendances

```
EPIC 0 ──> EPIC 1 ──┐
        └─> EPIC 2 ──┴─> EPIC 3 ──> EPIC 4 ──> EPIC 5
```

## Suivi

Chaque EPIC = un *milestone* GitHub ; chaque `Ex-y` = une *issue* liée, étiquetée par domaine.
Voir `docs/BRIQUES.md` pour l'ancrage pédagogique de chaque mécanique.

---

# Roadmap post-1.1.0 (au-delà du réalignement cursus)

Après l'EPIC 6 (réalignement sur le cours M1→M12 et les exos officiels, esprit libft), la
suite est du **contenu incrémental** piloté par le catalogue (`src/game/catalog.js`) et
quelques **deltas moteur** ciblés. Le catalogue est le backlog vivant : chaque fonction y
porte son statut (jouable / à forger / à refondre) et son tier de faisabilité moteur ; la
garde de couverture (`tests/game/catalog.test.mjs`) empêche toute dérive.

**État 1.1.0** : 18 fonctions jouables (l'épine M1→M12) · 72 à forger · 2 à refondre.

## EPIC 7 — Compléter la libft & les exos (sans delta moteur)

67 fonctions constructibles **dès maintenant** (tiers `ready` + `char`, char↔code déjà
livré). Toutes suivent la mécanique « écris le corps + ta libft ».

- **E7-1** — Sortie & I/O de base (C00) : `ft_putchar`, `print_alphabet`, `print_numbers`,
  `is_negative`, `ft_putstr`, `put{char,str,endl,nbr}_fd`.
- **E7-2** — Conversion nombre↔texte (C04) : `ft_putnbr` (récursif), `ft_putnbr_base`,
  `ft_itoa`, `ft_atoi_base`, `ft_convert_base` — **finit `conv-2`/`conv-3` (à refondre)**.
- **E7-3** — Caractères & casse (C02/libft) : `is{alpha,digit,alnum,ascii,print}`,
  `to{upper,lower}`, `str_is_*`, `str{up,low}case`, `strcapitalize`.
- **E7-4** — Comparaison & recherche (C03/libft) : `strcmp`, `strncmp`, `strcat`, `strncat`,
  `strstr`, `strchr`, `strrchr`, `strnstr`.
- **E7-5** — Chaînes allouées (libft-2) : `substr`, `strjoin`, `strtrim`, `split`, `strlcpy`.
- **E7-6** — Récursivité & maths (C05) : factorial/power itératifs & récursifs, `fibonacci`,
  `sqrt`, `is_prime`, `find_next_prime`.
- **E7-7** — Listes chaînées bonus (libft) : `lstnew`, `lstadd_{front,back}`, `lstsize`,
  `lstlast`, `lstdelone`, `lstclear`, `lstiter`, `lstmap`.
- **E7-8** — Callbacks (`strmapi`, `striteri`, `ft_foreach`) — réutilise `apply`/`funcRef`.

## EPIC 8 — Deltas moteur restants

- **E8-1** — Modèle `argc`/`argv` (C06) : `print_program_name`, `print_params`, `rev_params`,
  `sort_params`. Injecter les arguments du programme dans `main`.
- **E8-2** — Mémoire adressée à l'octet (tier `octet`) : `memset`, `bzero`, `memcpy`,
  `memmove`, `memchr`, `memcmp`, `calloc`, `strlcat`, `putstr_non_printable`. *Design d'abord*
  (vraie adresse-octet vs copie de casiers).
- **E8-3** — Granularité fine des briques : assembler le **corps d'une boucle** (aujourd'hui
  un `while`/`loop` est une seule brique). Rendrait le « depuis zéro » encore plus profond.

## EPIC 9 — Progression, UX & portée

- **E9-1** — Déblocage par dépendances de forge : verrouiller `ft_strdup` tant que
  `ft_strlen` + `ft_strcpy` ne sont pas dans ta libft (les `deps` du catalogue le décrivent).
- **E9-2** — Polish mobile (< 680 px), micro-animations, son optionnel.
- **E9-3** — Internationalisation (EN) — le contenu est en français aujourd'hui.
- **E9-4** — Télémétrie d'apprentissage (respect vie privée) : quels niveaux/pièges bloquent,
  pour ajuster la difficulté.

## Séquencement conseillé

EPIC 7 en continu (contenu à faible risque, une famille par PR). EPIC 8 en parallèle quand
un tier bloque une famille (argv, octet). EPIC 9 après une masse critique de niveaux.
