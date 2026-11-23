# Guardrails check — issue #12 (Add a snakeCase helper to src/case.js)

**Verdict: GATE_PENDING** — normal feature work, not a bootstrap task.

Issue #12 asks for a new `snakeCase(text)` export in the existing
`src/case.js`, plus additional cases in `test/case.test.js`. It does not ask
for tests, linting, type checking, CI or `AGENTS.md` to be created, so the
bootstrap escape hatch does not apply: the tooling it needs already exists.

## Install

| Command | Result |
| --- | --- |
| `npm install --no-package-lock` | Exit 0 — "up to date, audited 1 package; found 0 vulnerabilities" |

The repo declares no `dependencies`/`devDependencies` and ships no lockfile;
the only tooling it needs is Node's built-in test runner. `--no-package-lock`
was used so a generated `package-lock.json` does not pollute the executor's
working tree — the tree is clean after install (`git status --porcelain` empty).

Environment: Node v24.22.1 (repo requires `>=22`), npm 11.19.1.

## Checks

### 1. Test framework — PRESENT, must pass

- `package.json` declares `"test": "node --test"` (Node's built-in runner).
- Test files exist: `test/case.test.js`, `test/slugify.test.js`,
  `test/truncate.test.js`.
- CI (`.github/workflows/test.yml`) runs exactly `npm test`.
- Not run here per instructions; the harness runs the full suite.

Note for the executor: `src/case.js` already exists and exports `titleCase`
(landed with issue #11), so this change must be **additive** to that module and
to `test/case.test.js`, and must leave `titleCase` and its tests untouched.

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

✔ uppercases the first letter of each word and lowercases the rest (2.518248ms)
✔ returns an empty string for an empty string (0.389426ms)
✔ keeps multiple consecutive spaces (4.647583ms)
✔ keeps leading and trailing spaces (0.374482ms)
✔ only splits words on spaces (0.282944ms)
✔ leaves a non-letter first character as is (0.412601ms)
✔ does not split a surrogate pair (0.433782ms)
✔ throws a TypeError for non-string text (1.161322ms)
✔ joins words with dashes (6.80413ms)
✔ strips accents (0.468518ms)
✔ drops leading, trailing and repeated separators (0.317242ms)
✔ returns an empty string when nothing is left (0.303053ms)
✔ keeps behaviour unchanged without maxLength (0.383289ms)
✔ cuts at a word boundary (0.371935ms)
✔ does not cut a word in half when it can drop it (0.381793ms)
✔ cuts a single over-long word at maxLength (0.367227ms)
✔ throws a RangeError for a non-positive maxLength (0.818134ms)
✔ throws a RangeError for any invalid maxLength (0.867674ms)
✔ returns the full slug when maxLength is not binding (0.34618ms)
✔ returns the full slug unchanged when maxLength is longer than the slug (0.20432ms)
✔ keeps an exact fit (0.233301ms)
✔ never exceeds maxLength and never ends with a dash (0.626745ms)
✔ returns text at most maxLength characters unchanged (5.361545ms)
✔ returns a string of exactly maxLength characters unchanged (0.363005ms)
✔ cuts at a word boundary and drops the trailing space (0.643976ms)
✔ rewinds to the last space instead of splitting a word (0.409017ms)
✔ hard-cuts a single long word without spaces (0.508168ms)
✔ uses the whole budget for the ellipsis when maxLength is 1 (0.383525ms)
✔ throws a RangeError when maxLength is less than 1 (0.892582ms)
✔ throws a RangeError for a non-integer maxLength (0.352033ms)
✔ throws a TypeError for non-string text (0.370737ms)
✔ never exceeds maxLength and never leaves whitespace before the ellipsis (1.298888ms)
✔ trims trailing punctuation before adding the ellipsis (0.337875ms)
✔ keeps punctuation on text that already fits (0.209544ms)
ℹ tests 34
ℹ suites 0
ℹ pass 34
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 433.963589
```
