# Guardrails check — issue #14 (Run the tests on Node 22 and 24 in CI)

**Verdict: GATE_PENDING** — normal CI configuration work, not a bootstrap task.

The issue asks for one edit to an existing workflow file: turn the `test` job in
`.github/workflows/test.yml` into a matrix over Node 22 and 24
(`strategy.matrix.node` / `node-version: ${{ matrix.node }}`), with no other
changes. It does not ask for tests, linting, type checking, CI or `AGENTS.md`
to be created — the workflow already exists and the test suite is already in
place. The bootstrap escape hatch therefore does not apply.

## Install

| Command | Result |
| --- | --- |
| `npm ci` | Not attempted — no `package-lock.json`, which `npm ci` requires |
| `npm install` | Exit 0 — "up to date, audited 1 package in 581ms; found 0 vulnerabilities" |

The repo declares no `dependencies`/`devDependencies` and ships no lockfile
(checking in a lockfile is out of scope for this issue); the only tooling it
needs is Node's built-in test runner. `npm install` generated a
`package-lock.json` as a side effect; it was removed afterwards so the
executor starts from a clean tree (`git status --porcelain` empty).

Environment: Node v24.22.1, npm 11.19.1 (repo requires `>=22`).

## Checks

### 1. Test framework — PRESENT, must pass

- `package.json` declares `"test": "node --test"` (Node's built-in runner).
- Test files exist: `test/case.test.js`, `test/slugify.test.js`,
  `test/truncate.test.js`.
- CI (`.github/workflows/test.yml`) runs exactly `npm test`.
- Not run here per instructions; the harness runs the full suite.

Note for the executor: the issue is workflow-only. Do not touch `src/` or
`test/`, and do not change the test command. The matrix must keep both legs
running the existing `npm test` step.

### 2. Linting — ABSENT (not a blocker)

No ESLint/Biome/oxlint/Prettier config, no `lint` script and no lint step in
CI. Nothing to run; noted only.

### 3. Type checking — ABSENT (not a blocker)

No `tsconfig.json`/`jsconfig.json`, no `.ts` files and no `typecheck` script.
Plain ESM JavaScript; nothing to run, noted only.

### 4. CI pipeline — PRESENT (informational)

`.github/workflows/test.yml` runs on `pull_request` and on `push` to `main`
with `permissions: contents: read`, one `ubuntu-latest` job, checkout +
`actions/setup-node@v4` (`node-version: 22`) + `npm test`. That is the file
this issue targets. Per `AGENTS.md`, touching `.github/workflows/` is allowed
here because the issue explicitly asks for it, and `main` is protected by the
required `test` check.

Two things the executor should preserve:

- `AGENTS.md` also says not to add dependencies — none are needed.
- `main` requires the `test` check. `AGENTS.md` notes the check is named
  `test`; a matrix job's visible check names become `test (22)` / `test (24)`,
  so if the branch protection rule is set to the plain job name this may need
  a maintainer decision. That is outside this repo's code, so just flag it in
  the PR rather than adding unrelated workflow changes.

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
✔ returns an empty string for an empty string (0.360782ms)
✔ keeps multiple consecutive spaces (0.372274ms)
✔ keeps leading and trailing spaces (0.483995ms)
✔ only splits words on spaces (0.432086ms)
✔ leaves a non-letter first character as is (0.345594ms)
✔ does not split a surrogate pair (0.349264ms)
✔ throws a TypeError for non-string text (1.046087ms)
✔ snakeCase splits on spaces, dashes and camelCase boundaries (1.364532ms)
✔ snakeCase lowercases mixed-case and all-uppercase words (0.59879ms)
✔ snakeCase returns an empty string when there are no words (0.356131ms)
✔ snakeCase drops leading, trailing and repeated separators (0.30065ms)
✔ snakeCase leaves snake_case input unchanged (0.273583ms)
✔ snakeCase splits after a digit before an uppercase letter (0.233044ms)
✔ snakeCase splits non-ASCII camelCase (0.262785ms)
✔ snakeCase keeps a run of capitals together (2.156952ms)
✔ snakeCase keeps other characters inside words (0.250749ms)
✔ snakeCase throws a TypeError for non-string text (0.339616ms)
✔ camelCase joins words split on spaces, dashes and underscores (0.256794ms)
✔ camelCase lowercases the first word and capitalises later words (0.142064ms)
✔ camelCase returns an empty string when there are no words (0.129448ms)
✔ camelCase drops leading, trailing and repeated separators (0.159973ms)
✔ camelCase does not split existing camel humps (0.133204ms)
✔ camelCase is the inverse of snakeCase for snake_case input (0.136105ms)
✔ camelCase keeps other characters inside words (0.123036ms)
✔ camelCase does not split a surrogate pair (0.205192ms)
✔ camelCase throws a TypeError for non-string text (0.326482ms)
✔ joins words with dashes (8.246198ms)
✔ strips accents (0.559543ms)
✔ drops leading, trailing and repeated separators (0.434796ms)
✔ returns an empty string when nothing is left (0.396723ms)
✔ keeps behaviour unchanged without maxLength (0.489103ms)
✔ cuts at a word boundary (0.534052ms)
✔ does not cut a word in half when it can drop it (0.403454ms)
✔ cuts a single over-long word at maxLength (0.496775ms)
✔ throws a RangeError for a non-positive maxLength (1.208254ms)
✔ throws a RangeError for any invalid maxLength (0.945376ms)
✔ returns the full slug when maxLength is not binding (0.387384ms)
✔ returns the full slug unchanged when maxLength is longer than the slug (0.399835ms)
✔ keeps an exact fit (0.374817ms)
✔ never exceeds maxLength and never ends with a dash (1.008104ms)
✔ returns text at most maxLength characters unchanged (3.491927ms)
✔ returns a string of exactly maxLength characters unchanged (0.265584ms)
✔ cuts at a word boundary and drops the trailing space (0.675223ms)
✔ rewinds to the last space instead of splitting a word (0.337645ms)
✔ hard-cuts a single long word without spaces (0.302838ms)
✔ uses the whole budget for the ellipsis when maxLength is 1 (0.262104ms)
✔ throws a RangeError when maxLength is less than 1 (0.877158ms)
✔ throws a RangeError for a non-integer maxLength (0.41591ms)
✔ throws a TypeError for non-string text (0.411025ms)
✔ never exceeds maxLength and never leaves whitespace before the ellipsis (1.072745ms)
✔ trims trailing punctuation before adding the ellipsis (0.32772ms)
✔ keeps punctuation on text that already fits (0.24234ms)
ℹ tests 53
ℹ suites 0
ℹ pass 53
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 468.17784
```
