# Guardrails — issue #11 (Add a titleCase helper in src/case.js)

Status: **GATE_PENDING** — setup verified, full suite left to the harness.

This is normal feature work, not a bootstrap/tooling issue (the issue asks for a
new `src/case.js` helper plus `test/case.test.js`; it explicitly puts test
tooling, dependencies and CI out of scope), so the present-must-pass rule applies.

## Environment

- Node v24.22.1, npm 11.19.1 (repo requires Node >= 22)
- No lockfile and no dependencies declared in `package.json`, so there is nothing
  to fetch. `npm ci` fails without a lockfile (expected), `npm install` succeeds
  (`EXIT=0`, "up to date, audited 1 package"). Install is therefore clean.
- Tests use the built-in `node:test` runner, so no test dependency needs
  installing for the suite to run.

## Checks

### 1. Test framework — PRESENT, passes responsibility to the harness

- Runner: Node's built-in `node:test` + `node:assert/strict`.
- Script: `"test": "node --test"` in `package.json`.
- Existing suites: `test/slugify.test.js`, `test/truncate.test.js`.
- CI (`.github/workflows/test.yml`) runs `npm test` on Node 22 for pull requests
  and pushes to `main`; `AGENTS.md` documents the same command, and `main`
  requires the `test` check.
- Full suite command (not run in this phase): `npm test`

### 2. Linting — ABSENT, not a blocker

No linter is configured: no `eslint.config.*`, `.eslintrc*`, `biome.json`,
`.oxlintrc*`, `prettier` config, lint script in `package.json`, or lint step in
CI. Nothing to run, so nothing to fail. Noted only.

### 3. Type checking — ABSENT, not a blocker

No `tsconfig.json`, no `typescript`/`tsc` dependency or script, no `check-types`
step in CI. The library is plain ESM JavaScript with JSDoc annotations; no
type checker is wired up. Nothing to run, so nothing to fail. Noted only.

### 4. CI pipeline — INFORMATIONAL

`.github/workflows/test.yml` exists: checkout, `actions/setup-node` on Node 22,
then `npm test`. It has a test step only — no lint, typecheck or build steps.
The working tree and `.github/workflows/` are unchanged by this phase.

## Gate script

Written to `.git/lastlight-gate.sh` (inside `.git`, never committed). Tests only —
lint and typecheck were already evaluated above and there are none configured.

```sh
#!/usr/bin/env bash
set -euo pipefail
npm test
```

The harness appends the suite result (exit code, duration, output tail) below.
