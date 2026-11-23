# Executor summary — issue #12: add a `snakeCase` helper

## What was done

Implemented the architect plan exactly:

- Appended an exported `snakeCase(text)` (with JSDoc in the `titleCase` style) to
  the end of `src/case.js`. Lines 1–33 (`titleCase`, `capitalizeWord`) are
  untouched.
- Extended the test import in `test/case.test.js` to pull in `snakeCase`.
- Appended the 10 planned `snakeCase` test cases after the existing tests;
  existing `titleCase` tests are unchanged.

TDD followed: the new tests were added first and observed red (module import
failure), then the implementation was added and all went green.

Behaviour: splits on runs of whitespace, `-` and `_`, and at camelCase boundaries
(`[\p{Ll}\p{Nd}]` before `\p{Lu}`), lowercases each word, joins with `_`.
Non-string input throws `TypeError("text must be a string")`, matching
`titleCase`. Function is a single linear pipeline (no branches beyond the one
type guard), well under the ~15 cyclomatic-complexity budget.

## Files changed

- `src/case.js` — appended `snakeCase` + JSDoc.
- `test/case.test.js` — import + 10 new tests.
- `.lastlight/issue-12/executor-summary.md` — this file.
- `.lastlight/issue-12/status.md` — phase updated.

## Verification

Install:

```
$ npm install --no-package-lock
up to date, audited 1 package in 724ms
found 0 vulnerabilities
EXIT=0
```

Red step (tests before implementation):

```
$ npm test   → EXIT=1
✖ test/case.test.js  ('test failed' — import of `snakeCase` does not exist)
```

Full gate (test command from plan, ran once):

```
$ npm test > /tmp/gate.log 2>&1; echo EXIT=$?
EXIT=0
ℹ tests 44
ℹ suites 0
ℹ pass 44
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 510.648385
```

Targeted `snakeCase` output from the same run:

```
✔ snakeCase splits on spaces, dashes and camelCase boundaries
✔ snakeCase lowercases mixed-case and all-uppercase words
✔ snakeCase returns an empty string when there are no words
✔ snakeCase drops leading, trailing and repeated separators
✔ snakeCase leaves snake_case input unchanged
✔ snakeCase splits after a digit before an uppercase letter
✔ snakeCase splits non-ASCII camelCase
✔ snakeCase keeps a run of capitals together
✔ snakeCase keeps other characters inside words
✔ snakeCase throws a TypeError for non-string text
```

Lint: none configured in this repo — nothing to run.
Typecheck: none configured in this repo — nothing to run.
Build: no build script in `package.json` — nothing to run.

## Deviations / known issues

None. The implementation and tests match the plan; `snakeCase("-_ -")` from the
plan's test list is used verbatim and returns `""`.

Known limitation (documented in JSDoc and pinned by a test): a run of capitals is
not split, so `"parseHTTPResponse"` → `"parse_httpresponse"`. This is per plan
and out of scope per triage.
