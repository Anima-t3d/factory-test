# Executor summary — issue #9: Add a `reverseWords` helper

## What was done

Implemented `reverseWords(text)` exactly as specified in the architect plan: a new
JSDoc-documented `export function` appended to `src/slugify.js` after
`function splitsWord`. It splits on runs of whitespace (`/\s+/`), drops the empty
strings produced by leading/trailing whitespace with `filter(Boolean)`, reverses
the words and joins them with a single space. Empty and whitespace-only input
returns `""`; non-string input throws `TypeError("text must be a string")`,
matching the existing `truncate` guard.

Nothing existing was modified — no signature or behaviour changes to `slugify`
or `truncate`.

## Files changed

| File | Change |
|------|--------|
| `src/slugify.js` | +22 lines: JSDoc + `export function reverseWords(text)` (append only) |
| `test/reverseWords.test.js` | new file, 6 `node:test` tests covering the plan's cases |

Not touched (as planned): `test/slugify.test.js`, `test/truncate.test.js`,
`package.json`, `README.md`, `AGENTS.md`, `.github/workflows/test.yml`.

## TDD

1. Wrote `test/reverseWords.test.js` first and ran it: **red** (import of a
   non-existent export failed the module).
2. Implemented `reverseWords`; re-ran the new file: **green**, 6/6.
3. No refactor was needed: the function is 2 branches, far under the
   complexity budget, and has one responsibility (validate, then transform).

## Install

`npm install` → `EXIT=0` ("up to date, audited 1 package"; no dependencies
declared). Generated `package-lock.json` deleted, not committed.

## Test results

Targeted:

```
$ node --test test/reverseWords.test.js
✔ returns an empty string for an empty string
✔ returns an empty string for whitespace-only text
✔ returns a single word unchanged
✔ reverses several words separated by mixed whitespace
✔ keeps characters within a word in order
✔ throws a TypeError for non-string text
ℹ tests 6
ℹ pass 6
ℹ fail 0
EXIT=0
```

Full gate (`npm test`, run once, bash timeout 900):

```
$ npm test > /tmp/gate.log 2>&1; echo EXIT=$?
EXIT=0
ℹ tests 32
ℹ suites 0
ℹ pass 32
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 652.514747
```

Previous baseline was 26 tests; 26 + 6 new = 32 passing.

Lint: none configured. Typecheck: none configured. Build: no build script.

## Deviations from the plan

None. The plan's code and test list were followed verbatim (extra assertions on
the mixed-whitespace output — no `\t`, `\n`, or double space — were included, as
the plan requested).

## Known issues / notes

- Unicode whitespace (NBSP, U+3000, BOM U+FEFF) is treated as a separator because
  `\s` matches it; zero-width characters (U+200B/ZWJ) stay inside words. Both are
  documented in the JSDoc.
- `new String("a b")` is rejected (`typeof` is `"object"`), consistent with
  `truncate`.
