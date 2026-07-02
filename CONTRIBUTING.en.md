# Contributing to MemoForge

**🌐 [Français](CONTRIBUTING.md) · English**

Thanks for contributing! The full process (branches, releases, protection) is in
[`docs/WORKFLOW.md`](docs/WORKFLOW.md) ([EN](docs/WORKFLOW.en.md)). The essentials:

## In short

1. **Default branch: `develop`.** All feature PRs target `develop`.
   ```bash
   git checkout develop && git pull
   git checkout -b feature/<topic>
   ```
2. **One issue = one branch = one PR**, conventional message (`feat:`, `fix:`, `test:`,
   `docs:`, `chore:`).
3. **Green CI is mandatory** before merge: lint, tests + coverage ≥ 90 % (engine), visual
   screens, perf budgets, build — enforced by branch protection. Run it locally:
   ```bash
   npm test          # tests + coverage
   npm run lint      # ESLint (42 Norm)
   npm run test:visual   # key screens + perf budgets (Chrome required)
   ```
4. **Squash-merge** into `develop`, then delete the branch.

## Quality bar (AAA)

- Engine semantics = real C; content anchored on the official 42 exercises and the memory
  course (see [`docs/BRIQUES.md`](docs/BRIQUES.md), [`docs/GAME-DESIGN.md`](docs/GAME-DESIGN.md)).
- A hint **never** gives the answer (guard: `tests/game/hints.test.mjs`).
- Add a function to the catalog → handle it (guard: `tests/game/catalog.test.mjs`).
- **Bilingual UI**: any player-facing string goes through `t()`/`localize()` and gets its
  English entry in `src/i18n/en.js`.
- Additive changes: no regression of tests or visual screens.

## Releases

Reserved for maintainers: promotion `develop → staging → main`, SemVer tag, automatic Pages
deploy. On any version bump, the **docs gate** requires the README, CHANGELOG and repo
description to be updated. Details in [`docs/WORKFLOW.md`](docs/WORKFLOW.md).
