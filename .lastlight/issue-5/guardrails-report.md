# Guardrails check — issue #5: Add a wordCount helper

Branch: `lastlight/5-add-a-wordcount-helper`
Repo: `Anima-t3d/factory-test`
Mode: normal feature work (not a bootstrap task — the issue asks for a new
`wordCount` helper, not for tooling).

## Install

No lockfile was committed, so `npm ci` fails by design (npm requires a lockfile
for `ci`). Fell back to `npm install`, which succeeds — the package has no
dependencies (`audited 1 package`), so nothing is fetched.

```
$ npm ci        -> EXIT=1  (no package-lock.json in the repo)
$ npm install   -> EXIT=0  (up to date, audited 1 package, 0 vulnerabilities)
```

Note: `npm install` generated an untracked `package-lock.json` in the working
tree. It is a local side effect of the install and is not part of this commit
(only `.lastlight/` is published).

Toolchain present: node v24.22.1, npm 11.19.1 (`package.json` declares
`engines.node >= 22`; CI pins node 22).

## 1. Test Framework — PRESENT, must pass

`package.json` -> `"test": "node --test"` (built-in `node:test`, no deps).
Test files exist:

- `test/slugify.test.js`
- `test/truncate.test.js`

Full test command (exactly what CI runs, `.github/workflows/test.yml` ->
`run: npm test`):

```sh
npm test
```

Not run here, per the setup-only rule; the harness runs it once.

## 2. Linting — ABSENT (not a blocker)

No linter is configured: no `eslint*`, `biome.json`, `oxlint`, `prettier`,
`jshint` or `standard` config, and no lint script in `package.json`.
Nothing to run, so nothing to fail.

## 3. Type Checking — ABSENT (not a blocker)

No `tsconfig.json`, no `// @ts-check` / `checkJs` setup, no `tsc` or other
type-checker in `package.json` (sources are plain ESM `.js`). Nothing to run,
so nothing to fail.

## 4. CI Pipeline — PRESENT (informational)

`.github/workflows/test.yml` ("test") runs on `pull_request` and on pushes to
`main`: checkout -> setup-node 22 -> `npm test`. There is no lint, typecheck or
build step. `main` is protected and requires the `test` check.

## Gate script — `.git/lastlight-gate.sh`

Tests only (lint/typecheck were evaluated above and are absent):

```sh
#!/usr/bin/env bash
set -euo pipefail
npm test
```

## Verdict

All present checks are satisfiable and every absent check (lint, typecheck) is
allowed by the present-must-pass rule. Setup is complete; awaiting the
harness's single full-suite run.
