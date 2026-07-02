# Workflow de développement & release (GitFlow)

MemoForge suit un **GitFlow léger** à trois branches longues, avec CI obligatoire et
protection de branche. La branche par défaut est **`develop`**.

```
feature/*  ─▶  develop  ─▶  staging  ─▶  main  ─▶  (tag vX.Y.Z + déploiement Pages)
   PR            PR           PR
```

## Les branches longues

| Branche | Rôle | Déploiement |
|---|---|---|
| **`develop`** (défaut) | Intégration continue. Toutes les features y sont fusionnées. | — (CI) |
| **`staging`** | Release candidate. On y promeut `develop` quand une release se prépare : dernière vérification avant prod. | — (CI) |
| **`main`** | Production. N'avance que par promotion depuis `staging`. Chaque merge est taggé et **déployé** sur GitHub Pages. | ✅ Pages |

Règle d'or : **le code ne remonte que dans un seul sens** — `feature → develop → staging → main`.
Jamais de commit direct sur ces trois branches (protection active).

## Flux « feature » (le quotidien)

1. Partir de `develop` à jour :
   ```bash
   git checkout develop && git pull
   git checkout -b feature/<sujet>        # ou fix/<sujet>, chore/<sujet>
   ```
2. Développer. **Une issue = une branche = une PR.** Message conventionnel
   (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `release:`).
3. Ouvrir la PR **vers `develop`**. La CI (lint · tests · couverture ≥ 90 % engine · build ·
   écrans visuels · budgets perf) doit être **verte**.
4. Squash-merge, puis élaguer la branche.

## Flux « release » (promotion)

1. **`develop → staging`** : ouvrir une PR `staging ← develop`. La CI valide la RC.
   - Bump de version (`package.json`), entrée `CHANGELOG.md`, éventuels ajustements README.
2. **`staging → main`** : ouvrir une PR `main ← staging`. Au merge :
   - poser le tag : `git tag -a vX.Y.Z -m "…" && git push origin vX.Y.Z` ;
   - le workflow **Deploy** publie `dist/` sur Pages automatiquement.
3. Re-synchroniser `develop` sur `main` si des correctifs ont été appliqués en aval
   (`git checkout develop && git merge --ff-only main` ou une PR de back-merge).

SemVer : `MAJOR.MINOR.PATCH` — `feat` → MINOR, `fix` → PATCH, rupture → MAJOR.

## Hotfix (correctif de prod urgent)

`hotfix/<sujet>` depuis **`main`** → PR vers `main` (tag PATCH + déploiement) → **back-merge**
la correction dans `staging` puis `develop` pour ne pas la perdre.

## Protection de branche (le process est appliqué par GitHub)

Sur `develop`, `staging`, `main` :
- **PR obligatoire** (pas de push direct) ;
- **CI obligatoire** : le check `Lint · Test · Build` doit passer avant merge ;
- les branches de PR mergées sont supprimées.

`main` et `staging` n'acceptent que des merges venant de la branche en amont (discipline de
promotion). Le détail exact des règles vit dans la config GitHub du dépôt (Settings →
Branches) ; ce document en est la source de vérité côté process.

## CI / CD en bref

- `ci.yml` : sur push `develop`/`staging`/`main` **et** sur chaque PR → lint, tests +
  couverture, écrans visuels + budgets perf, build de l'artefact `dist/`.
- `deploy.yml` : sur push `main` uniquement → build + publication GitHub Pages
  (<https://decarvalhoe.github.io/MemoForge/>).

Voir aussi : [`docs/COORDINATION.md`](COORDINATION.md) (conventions PR),
[`CHANGELOG.md`](../CHANGELOG.md), [`docs/TESTING.md`](TESTING.md).
