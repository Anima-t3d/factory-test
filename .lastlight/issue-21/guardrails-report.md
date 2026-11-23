# Guardrails check — issue #21

Branch: `lastlight/21-add-a-reversecase-helper-to-src-case-js`
Issue: add a `swapCase(text)` helper to `src/case.js`. Normal feature work,
not a bootstrap/tooling task.

## Environment / install

- Node `v24.22.1`, npm `11.19.1` (repo requires Node >= 22).
- No lockfile and no dependencies in `package.json`; `npm install --no-audit
  --no-fund` exited 0 ("up to date"). The generated `package-lock.json` was
  removed again to keep the tree clean. Install is effectively a no-op.

## Checks

| Check | Status | Detail |
| --- | --- | --- |
| Test framework | PRESENT, not run | `node --test` via `npm test`; tests exist in `test/` (`case.test.js`, `slugify.test.js`, `truncate.test.js`). Setup phase deliberately does not run the suite. |
| Linting | ABSENT | No eslint/biome/oxlint config and no `lint` script. Not a blocker. |
| Type checking | ABSENT | No `tsconfig.json`, no tsc/mypy (plain ESM JavaScript). Not a blocker. |
| CI pipeline | INFORMATIONAL | `.github/workflows/test.yml` runs `npm test` on Node 22 for `pull_request` and pushes to `main`; no lint/typecheck steps. |

## Gate script

`.git/lastlight-gate.sh` (never committed) contains only the full test suite,
exactly as CI and `AGENTS.md` run it:

```sh
#!/usr/bin/env bash
set -euo pipefail
npm test
```

## Verdict

No configured check is failing. The harness now runs `npm test` as the gate.

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
✔ returns an empty string for an empty string (0.760572ms)
✔ keeps multiple consecutive spaces (0.777051ms)
✔ keeps leading and trailing spaces (0.854013ms)
✔ only splits words on spaces (0.470797ms)
✔ leaves a non-letter first character as is (0.29223ms)
✔ does not split a surrogate pair (0.323363ms)
✔ throws a TypeError for non-string text (1.174837ms)
✔ snakeCase splits on spaces, dashes and camelCase boundaries (2.014719ms)
✔ snakeCase lowercases mixed-case and all-uppercase words (0.709644ms)
✔ snakeCase returns an empty string when there are no words (0.518313ms)
✔ snakeCase drops leading, trailing and repeated separators (0.384792ms)
✔ snakeCase leaves snake_case input unchanged (0.236228ms)
✔ snakeCase splits after a digit before an uppercase letter (0.263693ms)
✔ snakeCase splits non-ASCII camelCase (0.227724ms)
✔ snakeCase keeps a run of capitals together (0.210393ms)
✔ snakeCase keeps other characters inside words (2.6984ms)
✔ snakeCase throws a TypeError for non-string text (0.563473ms)
✔ camelCase joins words split on spaces, dashes and underscores (0.474645ms)
✔ camelCase lowercases the first word and capitalises later words (0.21597ms)
✔ camelCase returns an empty string when there are no words (0.17766ms)
✔ camelCase drops leading, trailing and repeated separators (0.270294ms)
✔ camelCase does not split existing camel humps (0.179573ms)
✔ camelCase is the inverse of snakeCase for snake_case input (0.210125ms)
✔ camelCase keeps other characters inside words (0.173333ms)
✔ camelCase does not split a surrogate pair (0.385792ms)
✔ camelCase throws a TypeError for non-string text (0.39325ms)
✔ joins words with dashes (5.135411ms)
✔ strips accents (0.61699ms)
✔ drops leading, trailing and repeated separators (0.3608ms)
✔ returns an empty string when nothing is left (0.304822ms)
✔ keeps behaviour unchanged without maxLength (0.466982ms)
✔ cuts at a word boundary (0.537994ms)
✔ does not cut a word in half when it can drop it (0.330386ms)
✔ cuts a single over-long word at maxLength (0.424086ms)
✔ throws a RangeError for a non-positive maxLength (0.9826ms)
✔ throws a RangeError for any invalid maxLength (0.664229ms)
✔ returns the full slug when maxLength is not binding (0.239098ms)
✔ returns the full slug unchanged when maxLength is longer than the slug (0.221507ms)
✔ keeps an exact fit (0.251195ms)
✔ never exceeds maxLength and never ends with a dash (0.568847ms)
✔ returns text at most maxLength characters unchanged (4.939463ms)
✔ returns a string of exactly maxLength characters unchanged (0.323915ms)
✔ cuts at a word boundary and drops the trailing space (0.856257ms)
✔ rewinds to the last space instead of splitting a word (0.528971ms)
✔ hard-cuts a single long word without spaces (0.448022ms)
✔ uses the whole budget for the ellipsis when maxLength is 1 (0.342545ms)
✔ throws a RangeError when maxLength is less than 1 (1.124771ms)
✔ throws a RangeError for a non-integer maxLength (0.567771ms)
✔ throws a TypeError for non-string text (0.608151ms)
✔ never exceeds maxLength and never leaves whitespace before the ellipsis (1.667902ms)
✔ trims trailing punctuation before adding the ellipsis (0.409316ms)
✔ keeps punctuation on text that already fits (0.283684ms)
ℹ tests 53
ℹ suites 0
ℹ pass 53
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 485.144967
```
