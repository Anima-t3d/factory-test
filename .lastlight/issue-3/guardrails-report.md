# Guardrails check — issue #3 (Add a truncate helper)

**Verdict: GATE_PENDING** — normal feature work, not a bootstrap task.

Issue #3 asks for a `truncate(text, maxLength)` function next to `slugify`,
plus tests. It is not about adding tests, linting, type checking or CI, so the
escape hatch does not apply.

## Install

| Command | Result |
| --- | --- |
| `npm ci` | Exit 1 — no `package-lock.json`/`npm-shrinkwrap.json`; expected for this repo |
| `npm install` (fallback) | Exit 0 — "up to date, audited 1 package"; no dependencies declared |

The repo declares no `dependencies`/`devDependencies` and has no lockfile;
the only tooling it needs is Node's built-in test runner. The generated
`package-lock.json` from `npm install` was removed to keep the tree clean.

## Checks

### 1. Test framework — PRESENT, must pass

- `package.json` declares `"test": "node --test"` (Node's built-in runner).
- Test file exists: `test/slugify.test.js` (4 tests).
- CI (`.github/workflows/test.yml`) runs exactly `npm test`.
- Node in this environment: v24.22.1 (repo requires `>=22`).
- Not run here per instructions; the harness runs the full suite.

### 2. Linting — ABSENT (not a blocker)

No ESLint, Biome, Prettier, oxlint or equivalent config, and no `lint` script.
Nothing to run; noted only.

### 3. Type checking — ABSENT (not a blocker)

No `tsconfig.json`, no `.ts`/`.tsx` files, no `typecheck` script. Nothing to
run; noted only.

### 4. CI pipeline — PRESENT (informational)

`.github/workflows/test.yml` runs on `pull_request` and `push` to `main`
(Node 22) with a single step: `npm test`. No lint/typecheck steps.

## Gate script

` .git/lastlight-gate.sh` contains the full suite command exactly as CI runs it:

```sh
#!/usr/bin/env bash
set -euo pipefail
npm test
```

## Full test suite gate (run by the harness)

- Verdict: READY — full test suite passed (exit 0) in 1s
- Command (`.git/lastlight-gate.sh`):
```sh
#!/usr/bin/env bash
set -euo pipefail
npm test
```
- Exit code: 0 · duration: 1s · limit: gate.timeoutSeconds=900s

Last 60 lines of output:
```
npm warn Unknown env config "store-dir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> factory-test@0.1.0 test
> node --test

✔ joins words with dashes (1.963508ms)
✔ strips accents (0.441093ms)
✔ drops leading, trailing and repeated separators (0.297628ms)
✔ returns an empty string when nothing is left (0.22503ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 203.525354
```
