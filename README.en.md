<div align="center">

# MemoForge

**🌐 [Français](README.md) · English**

**Understand C pointers and memory — by assembling programs that actually run.**

[![CI](https://github.com/decarvalhoe/MemoForge/actions/workflows/ci.yml/badge.svg)](https://github.com/decarvalhoe/MemoForge/actions/workflows/ci.yml)
[![Deploy](https://github.com/decarvalhoe/MemoForge/actions/workflows/deploy.yml/badge.svg)](https://github.com/decarvalhoe/MemoForge/actions/workflows/deploy.yml)
![Version](https://img.shields.io/badge/version-1.3.1-46E08A)
![Engine coverage](https://img.shields.io/badge/engine_coverage-100%25-46E08A)
![Runtime dependencies](https://img.shields.io/badge/runtime_dependencies-0-46E08A)

### [▶ Play now / Jouer](https://decarvalhoe.github.io/MemoForge/) · EN / FR

*A web puzzle game for the École 42 C Piscine — vanilla JS · EN/FR · no install.*

<img src="docs/assets/carte-ram.png" alt="The RAM map: each region is a Piscine concept, unlocked in order" width="820">

</div>

---

## The idea

Pointers aren't learned by reading — they're learned by **watching memory react**. In
MemoForge, the game map *is* the RAM. You enter a room, assemble a program from C
instruction bricks, and run it **step by step**: cells change, the pointer thread is drawn,
the heap allocates and frees, **the call stack grows and unwinds before your eyes**.

The founding principle: **the machine is real**. The game doesn't simulate C — it runs it.
Every brick you drop is interpreted by a real memory engine; every pixel on screen is the
projection of a real state. And every *crash* is a teacher: dereferencing NULL, forgetting
`free`, a use-after-free, or recursing with no base case — the famous pitfall becomes a
moment of play, explained in cheat-sheet terms.

<div align="center">
<img src="docs/assets/salle-recursion.png" alt="The player writes the body of fact(n); the real call stack — fact(1), fact(2), fact(3), main — is on screen" width="820">

*World 6 — you write the body of `fact(n)`; the on-screen call stack is the real consequence
of your code. Forget the base case… and watch it overflow.*
</div>

## What you practice

MemoForge follows the **memory course M1→M12** and the **official 42 exercises**, in the
**libft spirit**: the `ft_` functions you use, you **write them yourself**. You never get a
ready-made `strcpy` brick — you assemble its body from primitives, and once forged, the
function joins **your libft** and gets reused (your `ft_strdup` calls **your** `ft_strlen`).
**44 levels** (FR / EN) across the RAM map ([`docs/BRIQUES.md`](docs/BRIQUES.md)):

| Concept (course) | What you write from scratch |
|---|---|
| M4 pointers | `ft_ft`, `ft_swap`, `ft_div_mod` — modify the caller **by address** (not by copy) |
| M5/M6 the stack | `ft_ultimate_ft` (peel the stars) · **dangling pointer**: `return &x` dies → why the heap exists |
| M10 strings | `ft_strlen → ft_strcpy → ft_strdup`, `ft_atoi` (forge chain, `c - '0'`) |
| M7/M9 the heap | `malloc`/`free`, `ft_range`, **`ft_split` N+1 free** — **valgrind-style** verdict |
| M11 arrays | `ft_rev_int_tab` (`tab[i] ≡ *(tab+i)`), dynamic `ft_range` |
| M12 lists | `->next`, the real **use-after-free** (free while saving `->next`) |
| M1/M2 the bytes | **byte explorer**: `1000 → e8 03 00 00` little-endian |

Around the levels: **optimization medals** (≤ N instructions · steps · cells), a **sandbox**
(trigger a leak, a double free, a NULL deref — freely), an **exam mode** (timed, no hints,
scored). Hints **never** give the answer (course rule, automated guard): they ask a question
or point back to the model. Light/dark theme, WCAG AA contrast verified by test.

## Play

**Online**: <https://decarvalhoe.github.io/MemoForge/> — continuously deployed from `main`.

**Locally** (ES modules require an HTTP server):

```bash
git clone https://github.com/decarvalhoe/MemoForge && cd MemoForge
npm run serve        # python -m http.server 8000
# → http://localhost:8000
```

No build needed to play: the game is **vanilla JS, zero runtime dependencies**.

## Architecture

Three independent layers — **the engine knows nothing of the UI**:

```
src/
├── engine/       THE CORE — testable without a browser, 100 % covered
│   ├── memory.js       cells, addresses, malloc/free, strings, files, nodes
│   ├── interpreter.js  step-by-step execution: call frames, loops, if/call/return
│   └── ast.js          the unified mini-language (single source of constructors)
├── game/         game logic, no DOM
│   ├── levels.js world.js medals.js pitfalls.js tracker.js questions.js i18n.js
│   └── game.js         controller: map / room / sandbox / exam
├── i18n/         language packs (en.js) — French is the source, English an overlay
└── ui/           views + "Phosphore" design system (components/, *View.js, theme.js)
```

The game-design choices (why each mechanic has this shape, the function-level contract) are
documented in [`docs/GAME-DESIGN.md`](docs/GAME-DESIGN.md).

## Quality

Every PR passes four gates in CI:

| Gate | Content |
|---|---|
| **Tests** | 621 `node:test` tests — engine, levels (each lure verified as *teaching*), world, medals, pitfalls, a11y · **engine coverage ≥ 90 % required (100 % effective)** |
| **Non-regression** | data-driven sweep: every level must stay solvable via its canonical path |
| **Key screens** | Puppeteer harness: 8 screens captured (incl. mobile and EN), structural invariants + pixel diff ([`docs/TESTING.md`](docs/TESTING.md)) |
| **Perf budgets** | weight ≤ 280 KB, render ≤ 16 ms — measured and enforced ([`docs/PERF.md`](docs/PERF.md)) |

The production artifact (`npm run build` → `dist/`) is re-verified by the same harness before
being deployed to Pages.

```bash
npm test              # tests + coverage (90 % threshold on src/engine)
npm run lint          # ESLint — rules inspired by the 42 Norm
npm run test:visual   # key screens + perf budgets (headless Chrome)
npm run build         # static artifact dist/
```

## Documentation

[`BRIQUES.md`](docs/BRIQUES.md) — pedagogical anchoring (the 12 bricks ↔ modules C00-C13) ·
[`GAME-DESIGN.md`](docs/GAME-DESIGN.md) — principles and mechanics ·
[`WORKFLOW.md`](docs/WORKFLOW.md) ([EN](docs/WORKFLOW.en.md)) — branches & releases ·
[`ROADMAP.md`](docs/ROADMAP.md) · [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) ·
[`TESTING.md`](docs/TESTING.md) · [`PERF.md`](docs/PERF.md) · [`CHANGELOG.md`](CHANGELOG.md)

> Note: the game UI is fully bilingual (FR/EN). The README, contributing guide and workflow
> are bilingual; the deeper design/pedagogy docs are French-first (audience: the 42 Piscine
> in France) and are being progressively translated.

## Contributing

**GitFlow**: the default branch is **`develop`**; feature PRs target it, then we promote
`develop → staging → main` (tagged, deployed releases). One issue = one branch = one PR,
green CI before merge, additive changes. Details: [`CONTRIBUTING.md`](CONTRIBUTING.md)
([EN](CONTRIBUTING.en.md)) and [`docs/WORKFLOW.md`](docs/WORKFLOW.md).

Extend the mini-language: a constructor in `ast.js` + its interpreter branch + a test. Add a
level: data in `levels.js` + its canonical solution in the non-regression test (the
completeness test will remind you) + its English strings in `src/i18n/en.js`.
