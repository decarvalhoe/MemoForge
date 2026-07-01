# Brief de design — « MemoForge »
### À destination d'une IA de design (génération de pistes visuelles)

> Ce document est **autonome** : il contient tout le contexte nécessaire pour proposer des
> directions visuelles sans connaître l'historique du projet. Objectif : produire
> **3 pistes distinctes**, chacune complète (identité, palette, typo, traitement des
> éléments-clés, écrans). Voir « Livrables attendus » à la fin.

---

## 1. Le produit en une phrase
Un **jeu web de puzzle** qui apprend les **pointeurs et la mémoire du langage C** en
faisant assembler de petits programmes à des étudiants ; la mémoire y est représentée
comme un **mur de casiers numérotés**.

## 2. Public & ton
- **Public :** étudiants de l'école 42 (piscine C), grands débutants en programmation,
  francophones. Jeunes adultes, à l'aise avec le numérique.
- **Ton recherché :** clair avant tout, encourageant, un peu ludique — **jamais** infantilisant
  ni « corporate ». La **lisibilité prime sur la décoration**.

## 3. Le concept à habiller (3 couches de jeu)
1. **Aventure dans la RAM** — une carte de la mémoire découpée en régions (la Pile, le Tas,
   le Quartier des Chaînes, l'Allée des Listes). Un **personnage/mascotte** voyage de salle
   en salle en suivant des « fils » (les pointeurs).
2. **Puzzle d'assemblage** — dans chaque salle, on **glisse-dépose des briques de code** pour
   atteindre un état-cible ; on exécute, ça s'anime.
3. **Maîtrise / bac à sable** — médailles d'optimisation et mode libre d'expérimentation.

## 4. La métaphore centrale (à incarner visuellement)
- **Variable = casier numéroté** contenant une valeur.
- **Pointeur = un papier/une étiquette** portant le **numéro** d'un casier (une adresse).
- **`&`** = lire le numéro du casier ; **`*`** = ouvrir le casier ; **`malloc`** = emprunter un
  casier à une réserve ; **`free`** = le rendre ; **fuite** = casier jamais rendu.
- C'est l'image directrice : la piste visuelle doit rendre cette métaphore **immédiatement
  lisible**.

## 5. Éléments à designer (le périmètre)
- **Identité** : nom-logo « MemoForge », ambiance générale.
- **Palette** : couleurs (avec valeurs hex), en **mode sombre ET clair**.
- **Typographie** : un titrage + un corps + un **monospace** (pour le code/les adresses).
- **Le casier** : état normal / modifié (highlight) / pointeur / alloué / libéré.
- **La brique d'instruction** (ex. `*p = 42`, `free(p)`) : carte déplaçable, lisible.
- **La mascotte/personnage** : un « manutentionnaire de la mémoire » (proposition libre :
  robot, lutin, gardien…), expressif (réussite / réflexion / erreur).
- **La carte des régions** : représentation de la RAM explorable.
- **Les écrans-clés** : salle de puzzle (mur de casiers + programme + palette), carte,
  écran de fin de salle (médailles).
- **Les états de feedback** : réussite, crash (déréf. de NULL), fuite mémoire.

## 6. Contraintes techniques & UX
- **Plateforme :** application web (HTML/CSS/JS), responsive ; doit tenir sur ~860 px de large
  et passer sur mobile.
- **Mode sombre et clair** obligatoires ; tout doit rester lisible dans les deux.
- **Accessibilité :** contrastes suffisants (WCAG AA), pas d'information portée par la
  couleur seule, taille de texte ≥ 14 px.
- **Sobriété fonctionnelle :** pas d'effets qui nuisent à la lecture du code et des casiers.
- **Cohérence :** un même langage visuel pour les 3 couches.

## 7. Les 3 pistes attendues (graines de départ — à faire diverger)
Proposer **trois directions nettement différentes**. Pistes-amorces possibles (libre de les
réinterpréter ou d'en proposer d'autres) :
- **A — Terminal rétro / pixel :** phosphore sur noir, monospace, ASCII, vibe hacker 80s.
- **B — Flat moderne + mascotte :** coloré, arrondi, lumineux, mascotte chaleureuse, façon
  app éducative contemporaine.
- **C — Blueprint technique :** papier millimétré, traits fins, annotations et cotes, façon
  plan d'ingénieur qui « prend vie ».

Pour **chaque** piste, fournir : un **nom**, un **mood** (3-4 adjectifs), la **palette** (hex,
clair + sombre), les **polices**, le **traitement du casier + de la mascotte**, et **1 ou 2
références** visuelles.

## 8. Livrables attendus (format de réponse)
Pour chacune des 3 pistes :
1. **Fiche d'identité** : nom, mood, palette (hex), typo, principes.
2. **Casier & brique** : description (ou croquis/ASCII) des composants-clés et de leurs états.
3. **Mascotte** : concept + 3 expressions (réussite / réflexion / erreur).
4. **Maquette d'un écran de salle** : disposition mur de casiers / programme / palette / contrôles.
5. **Prompt image prêt à coller** (voir §9) pour générer un visuel témoin de la piste.

Terminer par une **recommandation argumentée** (1 piste) au regard du critère n°1 :
**la clarté pédagogique**.

## 9. Prompts image prêts à coller (un par piste-amorce)
À adapter selon la piste retenue ; en anglais pour les générateurs d'images.

- **A — Retro terminal :** "UI of an educational coding puzzle game called 'MemoForge', 80s phosphor-green-on-black CRT terminal aesthetic, monospace type, a grid of
  numbered memory lockers, scanlines subtle, clean and readable, flat, no clutter."
- **B — Flat + mascotte :** "UI of an educational coding puzzle game, friendly modern flat
  design, rounded shapes, warm bright palette, a cute robot 'memory keeper' mascot, a wall
  of numbered lockers holding values, draggable code-instruction cards, light and dark mode,
  highly legible, accessible."
- **C — Blueprint :** "UI of an educational coding puzzle game, engineering blueprint style,
  graph-paper background, thin precise lines, technical annotations and dimension marks,
  numbered memory lockers drawn as schematic boxes, monospace labels, elegant and minimal."

## 10. Contexte de référence (facultatif)
Le code et le moteur du jeu existent déjà (JS vanilla, modules ES). La métaphore du casier
et les 3 couches sont arrêtées ; **seul le visuel est ouvert**. Le design retenu devra
ensuite se traduire en CSS (variables de thème, mode clair/sombre).
