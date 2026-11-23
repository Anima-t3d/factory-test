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

## Full test suite gate (run by the harness)

- Verdict: READY — full test suite passed (exit 0) in 0s
- Command (`.git/lastlight-gate.sh`):
```sh
#!/usr/bin/env bash
set -euo pipefail
npm test
```
- Exit code: 0 · duration: 0s · limit: gate.timeoutSeconds=900s

Last 60 lines of output:
```
npm warn Unknown env config "store-dir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> factory-test@0.1.0 test
> node --test

✔ joins words with dashes (4.07428ms)
✔ strips accents (0.457509ms)
✔ drops leading, trailing and repeated separators (0.255039ms)
✔ returns an empty string when nothing is left (0.229945ms)
✔ keeps behaviour unchanged without maxLength (0.275305ms)
✔ cuts at a word boundary (0.327426ms)
✔ does not cut a word in half when it can drop it (0.278466ms)
✔ cuts a single over-long word at maxLength (0.366727ms)
✔ throws a RangeError for a non-positive maxLength (0.792786ms)
✔ throws a RangeError for any invalid maxLength (0.871528ms)
✔ returns the full slug when maxLength is not binding (0.375127ms)
✔ returns the full slug unchanged when maxLength is longer than the slug (0.224695ms)
✔ keeps an exact fit (0.224851ms)
✔ never exceeds maxLength and never ends with a dash (0.716522ms)
✔ returns text at most maxLength characters unchanged (4.48551ms)
✔ returns a string of exactly maxLength characters unchanged (0.395543ms)
✔ cuts at a word boundary and drops the trailing space (0.833361ms)
✔ rewinds to the last space instead of splitting a word (0.452483ms)
✔ hard-cuts a single long word without spaces (0.435712ms)
✔ uses the whole budget for the ellipsis when maxLength is 1 (0.343593ms)
✔ throws a RangeError when maxLength is less than 1 (1.088573ms)
✔ throws a RangeError for a non-integer maxLength (0.483679ms)
✔ throws a TypeError for non-string text (0.385844ms)
✔ never exceeds maxLength and never leaves whitespace before the ellipsis (1.280746ms)
✔ trims trailing punctuation before adding the ellipsis (0.363165ms)
✔ keeps punctuation on text that already fits (0.245445ms)
ℹ tests 26
ℹ suites 0
ℹ pass 26
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 331.323998
```
