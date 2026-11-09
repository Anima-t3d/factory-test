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

✔ joins words with dashes (3.943904ms)
✔ strips accents (0.402471ms)
✔ drops leading, trailing and repeated separators (0.348171ms)
✔ returns an empty string when nothing is left (0.344177ms)
✔ keeps behaviour unchanged without maxLength (0.366262ms)
✔ cuts at a word boundary (0.410849ms)
✔ does not cut a word in half when it can drop it (0.333905ms)
✔ cuts a single over-long word at maxLength (0.288804ms)
✔ throws a RangeError for a non-positive maxLength (0.860375ms)
✔ throws a RangeError for any invalid maxLength (1.011119ms)
✔ returns the full slug when maxLength is not binding (0.559879ms)
✔ returns the full slug unchanged when maxLength is longer than the slug (0.412694ms)
✔ keeps an exact fit (0.419834ms)
✔ never exceeds maxLength and never ends with a dash (1.028342ms)
✔ returns text at most maxLength characters unchanged (6.746529ms)
✔ returns a string of exactly maxLength characters unchanged (0.334616ms)
✔ cuts at a word boundary and drops the trailing space (0.722786ms)
✔ rewinds to the last space instead of splitting a word (0.39621ms)
✔ hard-cuts a single long word without spaces (0.339323ms)
✔ uses the whole budget for the ellipsis when maxLength is 1 (0.247225ms)
✔ throws a RangeError when maxLength is less than 1 (1.248074ms)
✔ throws a RangeError for a non-integer maxLength (0.570494ms)
✔ throws a TypeError for non-string text (0.719718ms)
✔ never exceeds maxLength and never leaves whitespace before the ellipsis (1.926454ms)
✔ trims trailing punctuation before adding the ellipsis (0.476918ms)
✔ keeps punctuation on text that already fits (0.307801ms)
ℹ tests 26
ℹ suites 0
ℹ pass 26
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 335.59568
```
