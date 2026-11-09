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

✔ joins words with dashes (6.603824ms)
✔ strips accents (0.702697ms)
✔ drops leading, trailing and repeated separators (0.440749ms)
✔ returns an empty string when nothing is left (0.47538ms)
✔ keeps behaviour unchanged without maxLength (0.546023ms)
✔ cuts at a word boundary (0.586404ms)
✔ does not cut a word in half when it can drop it (0.523196ms)
✔ cuts a single over-long word at maxLength (0.551398ms)
✔ throws a RangeError for a non-positive maxLength (1.305881ms)
✔ throws a RangeError for any invalid maxLength (1.165757ms)
✔ returns the full slug when maxLength is not binding (0.667021ms)
✔ returns the full slug unchanged when maxLength is longer than the slug (0.390976ms)
✔ keeps an exact fit (0.48392ms)
✔ never exceeds maxLength and never ends with a dash (1.054898ms)
✔ returns text at most maxLength characters unchanged (4.108975ms)
✔ returns a string of exactly maxLength characters unchanged (0.32063ms)
✔ cuts at a word boundary and drops the trailing space (0.576271ms)
✔ rewinds to the last space instead of splitting a word (0.331153ms)
✔ hard-cuts a single long word without spaces (0.339361ms)
✔ uses the whole budget for the ellipsis when maxLength is 1 (0.242928ms)
✔ throws a RangeError when maxLength is less than 1 (0.856491ms)
✔ throws a RangeError for a non-integer maxLength (0.488517ms)
✔ throws a TypeError for non-string text (0.456891ms)
✔ never exceeds maxLength and never leaves whitespace before the ellipsis (1.651999ms)
✔ trims trailing punctuation before adding the ellipsis (0.319199ms)
✔ keeps punctuation on text that already fits (0.219118ms)
ℹ tests 26
ℹ suites 0
ℹ pass 26
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 367.852539
```
