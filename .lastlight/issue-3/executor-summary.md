# Executor summary — issue #3: Add a `truncate` helper

## What was done

Implemented the `truncate(text, maxLength)` named export next to `slugify` in
`src/slugify.js`, with a JSDoc contract comment, plus a new test file covering the
five scenarios the issue names and the plan's edge cases/invariants.

## Files changed

| File | Change |
| ---- | ------ |
| `src/slugify.js` | Appended module-private `isHighSurrogate`, `isLowSurrogate`, `cutIndex`, `splitsWord` helpers, the JSDoc block, and `export function truncate`. `slugify` (lines 1-13) byte-identical. |
| `test/truncate.test.js` | New file: 10 `node:test` tests using `node:assert/strict`, no new dependencies. |
| `test/slugify.test.js` | Unchanged (regression fence). |
| `package.json`, `.github/workflows/test.yml`, `README.md` | Unchanged, per plan. |

No lockfile, no new dependencies, no CI changes.

## Contract resolution (must be reviewed — deliberate trade-off)

The issue's "result including `…` is exactly `maxLength`" and "rewind to the last
space and drop it" cannot both hold whenever the last space precedes index
`maxLength - 1`. The plan prioritises the **word-boundary rule** (the issue states
it explicitly and forbids mid-word cuts). Implemented guarantee:

- `result.length <= maxLength` always;
- `result.length === maxLength` for every hard cut and every boundary cut;
- the result is shorter than `maxLength` only when rewinding to a space (or
  trimming trailing whitespace) is required to avoid splitting a word or emitting
  trailing whitespace before `…`.

This is stated in the function's JSDoc and exercised by test 4
(`truncate("The quick brown fox", 12) === "The quick…"`, `length <= 12`).

## Deviations from the plan

- **Decomposition only, behaviour identical.** The plan's reference body was lifted
  into two small helpers, `cutIndex(text, keep)` (surrogate backoff) and
  `splitsWord(text, keep)` (word-boundary test), so `truncate` stays well under the
  ~15 cyclomatic-complexity budget required by the building skill. Same inputs,
  same outputs as the reference; all plan tests pass unchanged.
- JSDoc adds one sentence noting grapheme clusters can still be split between code
  points (plan called for this to be documented in JSDoc).

No other deviations. No test was skipped, deleted or weakened.

## Gate results

No lint, typecheck or build step exists in this repo (no eslint/biome/prettier
config, no `tsconfig.json`, no build script) — none was added, per plan.

Install (zero-dependency repo, run with `--no-package-lock` to avoid an
unrequested lockfile):

```
$ npm install --no-audit --no-fund --no-package-lock
up to date in 607ms
EXIT=0
```

Red-before-green proof (before implementing):

```
$ npm test
✖ test/truncate.test.js (103.011044ms)
  'test failed'
ℹ pass 4
ℹ fail 1
EXIT=1
```

Targeted tests after implementing:

```
$ node --test test/truncate.test.js test/slugify.test.js
✔ joins words with dashes (2.784858ms)
✔ strips accents (0.703645ms)
✔ drops leading, trailing and repeated separators (0.442741ms)
✔ returns an empty string when nothing is left (4.361183ms)
✔ returns text at most maxLength characters unchanged (2.523813ms)
✔ returns a string of exactly maxLength characters unchanged (2.577066ms)
✔ cuts at a word boundary and drops the trailing space (0.770025ms)
✔ rewinds to the last space instead of splitting a word (0.407931ms)
✔ hard-cuts a single long word without spaces (0.418485ms)
✔ uses the whole budget for the ellipsis when maxLength is 1 (0.334775ms)
✔ throws a RangeError when maxLength is less than 1 (1.032529ms)
✔ throws a RangeError for a non-integer maxLength (0.598123ms)
✔ throws a TypeError for non-string text (1.40229ms)
✔ never exceeds maxLength and never leaves whitespace before the ellipsis (2.295598ms)
ℹ tests 14
ℹ pass 14
ℹ fail 0
EXIT=0
```

Full gate (single run, `timeout: 900`):

```
$ npm test > /tmp/gate.log 2>&1; echo EXIT=$?
EXIT=0
ℹ tests 14
ℹ pass 14
ℹ fail 0
ℹ duration_ms 339.1692
```

## Known issues

- Exact-length and word-boundary rules conflict as described above; word-boundary
  wins, by design, and the shorter result is documented and tested.
- Grapheme clusters (ZWJ emoji, flags, combining marks) can be split between code
  points; surrogate pairs are never split. Documented limitation.
- Only U+0020 is a word boundary; tabs/newlines are ordinary characters (trimmed
  away when they would sit immediately before `…`).
