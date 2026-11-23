# Guardrails check — issue #13 (Add a camelCase helper to src/case.js)

**Verdict: GATE_PENDING** — normal feature work, not a bootstrap task.

Issue #13 asks for a new `camelCase(text)` export in the existing
`src/case.js`, plus additional cases in `test/case.test.js`. It does not ask
for tests, linting, type checking, CI or `AGENTS.md` to be created, so the
bootstrap escape hatch does not apply: the tooling it needs already exists.

## Install

| Command | Result |
| --- | --- |
| `npm ci` | Exit 1 — no `package-lock.json` in the repo (expected) |
| `npm install` | Exit 0 — "up to date, audited 1 package; found 0 vulnerabilities" |

The repo declares no `dependencies`/`devDependencies` and ships no lockfile;
the only tooling it needs is Node's built-in test runner. `npm install`
generated a `package-lock.json` as a side effect; it was removed afterwards so
the executor's working tree stays clean (`git status --porcelain` empty).

Environment: Node v24.22.1 (repo requires `>=22`).

## Checks

### 1. Test framework — PRESENT, must pass

- `package.json` declares `"test": "node --test"` (Node's built-in runner).
- Test files exist: `test/case.test.js`, `test/slugify.test.js`,
  `test/truncate.test.js`.
- CI (`.github/workflows/test.yml`) runs exactly `npm test`.
- Not run here per instructions; the harness runs the full suite.

Note for the executor: `src/case.js` already exports `titleCase` (issue #11)
and `snakeCase` (issue #12), so `camelCase` must be **additive** and must leave
both existing helpers and their tests untouched.

### 2. Linting — ABSENT (not a blocker)

No ESLint, Biome, oxlint, Prettier or equivalent config file (checked repo
root), no `lint` script, and no lint step in CI. Nothing to run; noted only.

### 3. Type checking — ABSENT (not a blocker)

No `tsconfig.json`/`jsconfig.json`, no `.ts`/`.tsx` files and no `typecheck`
script. The codebase is plain ESM JavaScript with JSDoc annotations. Nothing
to run; noted only.

### 4. CI pipeline — PRESENT (informational)

`.github/workflows/test.yml` runs on `pull_request` and on `push` to `main`,
on Node 22, with a single step: `npm test`. No lint/typecheck steps. `main` is
protected and requires this `test` check, per `AGENTS.md`.

## Gate script

`.git/lastlight-gate.sh` (inside `.git`, never committed) contains the full
suite command exactly as CI runs it:

```sh
#!/usr/bin/env bash
set -euo pipefail
npm test
```

## Full test suite gate (run by the harness)

_Pending — the harness appends the result here._
