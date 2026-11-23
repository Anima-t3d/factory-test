# Executor summary — issue #21

## What was done

Implemented `swapCase(text)` in `src/case.js` exactly as the architect plan
specifies, plus its tests in `test/case.test.js`. Purely additive; no existing
export or behaviour changed.

Files changed (2, matching the plan's exhaustive manifest):

- `src/case.js` — appended the exported `swapCase` helper after `camelCase`:
  walks text by code point with `Array.from`, throws
  `TypeError("text must be a string")` for non-strings, lowercases characters
  that are already their own uppercase form, uppercases everything else.
  JSDoc documents surrogate pairs, uncased characters and length-changing case
  mappings.
- `test/case.test.js` — extended the import to
  `{ camelCase, snakeCase, swapCase, titleCase }` and appended 5 tests:
  inversion both ways, empty string, uncased passthrough, non-ASCII letters +
  Deseret surrogate pair, TypeError for `null`/`undefined`/`42`.

No README, package.json, workflow or other files touched.

## TDD

Wrote the tests first and confirmed they were red for the right reason:
`node --test test/case.test.js` failed because `swapCase` was not exported
(`SyntaxError: ... does not provide an export named 'swapCase'`), then
implemented until green.

## Gate results

Targeted test — `node --test test/case.test.js`:

```
✔ swapCase inverts the case of every letter (0.392333ms)
✔ swapCase returns an empty string for an empty string (0.195158ms)
✔ swapCase leaves characters without case unchanged (0.310304ms)
✔ swapCase handles non-ASCII letters and surrogate pairs (0.289353ms)
✔ swapCase throws a TypeError for non-string text (0.388215ms)
ℹ tests 32
ℹ pass 32
ℹ fail 0
```

Full suite — `npm test > /tmp/gate.log 2>&1; echo EXIT=$?` → `EXIT=0`
(timeout 900s, single run, no re-runs):

```
ℹ tests 58
ℹ suites 0
ℹ pass 58
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 485.294191
```

- Build: none configured (`package.json` has only `"test": "node --test"`).
- Lint: none configured (no linter dependency, config or script).
- Typecheck: none configured (plain JS, no `tsconfig.json` / `checkJs` step).

So the gate is the test command from `AGENTS.md`, plus the targeted run above.
Both green; CI (`.github/workflows/ci.yml` equivalent, job `test`) runs the same
`npm test` with no extra steps this change could break.

## Decomposition / type safety

`swapCase` is a single guard plus one map/join: complexity 2, well under the
~15 budget, one responsibility. No assertions or suppressions are used
anywhere; the non-string check is a real throw.

## Deviations from the plan

None. Plan snippet was pasted verbatim; the test count matches the predicted
58 (53 existing + 5 new). Working tree contains only the two planned files
(`git status --short`: `M src/case.js`, `M test/case.test.js`).

## Known issues

None. The documented consequence that length-changing mappings (`ß` -> `SS`)
mean `swapCase` is not always its own inverse is intentional and covered by the
JSDoc, per the plan.
