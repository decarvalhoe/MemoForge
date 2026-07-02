# Development & release workflow (GitFlow)

**🌐 [Français](WORKFLOW.md) · English**

MemoForge follows a **lightweight GitFlow** with three long-lived branches, mandatory CI and
branch protection. The default branch is **`develop`**.

```
feature/*  ─▶  develop  ─▶  staging  ─▶  main  ─▶  (tag vX.Y.Z + Pages deploy)
   PR            PR           PR
```

## Long-lived branches

| Branch | Role | Deployment |
|---|---|---|
| **`develop`** (default) | Continuous integration. All features merge here. | — (CI) |
| **`staging`** | Release candidate. `develop` is promoted here when a release is prepared: last check before prod. | — (CI) |
| **`main`** | Production. Only advances via promotion from `staging`. Every merge is tagged and **deployed** to GitHub Pages. | ✅ Pages |

Golden rule: **code only flows one way** — `feature → develop → staging → main`. Never a
direct commit on those three branches (protection is active).

## "Feature" flow (day-to-day)

1. Start from an up-to-date `develop`:
   ```bash
   git checkout develop && git pull
   git checkout -b feature/<topic>        # or fix/<topic>, chore/<topic>
   ```
2. Develop. **One issue = one branch = one PR.** Conventional message
   (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `release:`).
3. Open the PR **into `develop`**. CI (lint · tests · coverage ≥ 90 % engine · build ·
   visual screens · perf budgets) must be **green**.
4. Squash-merge, then delete the branch.

## "Release" flow (promotion)

1. **`develop → staging`**: open a PR `staging ← develop`. CI validates the RC.
   - Version bump (`package.json`), `CHANGELOG.md` entry, README/description updates.
   - The **docs gate** (`docs-gate` check) enforces that a version bump comes with a matching
     CHANGELOG entry and a README badge in sync.
2. **`staging → main`**: open a PR `main ← staging`. On merge:
   - tag it: `git tag -a vX.Y.Z -m "…" && git push origin vX.Y.Z`;
   - the **Deploy** workflow publishes `dist/` to Pages automatically.
3. Re-sync `develop` on `main` if fixes were applied downstream (back-merge).

SemVer: `MAJOR.MINOR.PATCH` — `feat` → MINOR, `fix` → PATCH, breaking → MAJOR.

## Hotfix (urgent production fix)

`hotfix/<topic>` from **`main`** → PR into `main` (PATCH tag + deploy) → **back-merge** the
fix into `staging` then `develop` so it isn't lost.

## Branch protection (the process is enforced by GitHub)

On `develop`, `staging`, `main`:
- **PR required** (no direct push, admins included);
- **CI required**: the `Lint · Test · Build` check must pass before merge;
- **linear history** (squash/rebase); no force-push, no deletion.

## The docs gate (mandatory doc updates on release)

The `docs-gate` workflow blocks a PR that **bumps `package.json`'s version** unless:
- `CHANGELOG.md` has a matching `## [X.Y.Z]` entry;
- the README version badge (`version-X.Y.Z`) is in sync.

Maintainers also update the GitHub repo **description** when the product pitch changes — see
the release checklist in [`WORKFLOW.md`](WORKFLOW.md).

## CI / CD in brief

- `ci.yml`: on push to `develop`/`staging`/`main` **and** on every PR → lint, tests +
  coverage, visual screens + perf budgets, `dist/` build.
- `docs-gate.yml`: on PRs → enforces doc updates on version bumps.
- `deploy.yml`: on push to `main` only → build + GitHub Pages publish
  (<https://decarvalhoe.github.io/MemoForge/>).

See also: [`docs/COORDINATION.md`](COORDINATION.md), [`CHANGELOG.md`](../CHANGELOG.md),
[`docs/TESTING.md`](TESTING.md).
