# Guardrails report — issue #7

Issue intent: normal feature work ("Add a `capitalizeWords` helper"). Not a
bootstrap/tooling task, so the escape hatch does not apply.

Branch: `lastlight/7-add-a-capitalizewords-helper`

## Dependency install

- No lockfile, no dependencies (`package.json` has no `dependencies` /
  `devDependencies`).
- `npm ci` → exit 1: expected, it requires a lockfile that does not exist.
- `npm install` (documented fallback) → **exit 0**, "up to date, audited 1
  package", 0 vulnerabilities.
- Install artifacts (generated `package-lock.json`) were removed afterwards so
  the working tree is unchanged.

Result: **PASS**

## 1. Test framework — PRESENT, PASS (not executed here)

- Built-in Node test runner: `node --test` via the `test` script in
  `package.json`.
- Test files present: `test/slugify.test.js`, `test/truncate.test.js`.
- Node in this environment: v24.22.1 (`engines.node >= 22` satisfied).
- Full test command, exactly as CI runs it: `npm test`
- As instructed, the suite was NOT run here; the harness runs it once and
  judges it by exit code.

## 2. Linting — ABSENT (not configured)

No ESLint / Biome / oxlint / Prettier config, no lint script, no lint dev
dependencies. Absent tooling is not a blocker; nothing to run.

## 3. Type checking — ABSENT (not configured)

Plain JavaScript project with no `tsconfig.json` / `jsconfig.json`, no `tsc`
script or dev dependency. Absent tooling is not a blocker; nothing to run.

## 4. CI pipeline — informational

`.github/workflows/test.yml`: workflow `test`, triggered on `pull_request` and
`push` to `main`, Ubuntu + Node 22, single step `npm test`. No lint or
typecheck steps in CI, consistent with checks 2 and 3.

## Gate script

`git/lastlight-gate.sh` (inside `.git`, never committed):

```sh
#!/usr/bin/env bash
set -euo pipefail
npm test
```

Tests only. No lint, typecheck, build, or install step; no output filtering or
failure masking.

## Verdict

Every configured check exists and passes; absent lint/typecheck are noted, not
blocking. Status: **GATE_PENDING** — harness runs `npm test` next.
