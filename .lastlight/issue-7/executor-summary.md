# Executor summary — issue #7: Add a `capitalizeWords` helper

## What was done

Implemented `capitalizeWords(text)` in `src/slugify.js`, next to the existing
`slugify`/`truncate` helpers, and added a dedicated test file. Followed TDD:
the new tests were written first and observed failing (module had no
`capitalizeWords` export), then the implementation was added and they went green.

## Files changed

| File | Change |
| ---- | ------ |
| `src/slugify.js` | Appended a JSDoc block and `export function capitalizeWords(text)` at end of file. Lines 1-142 unchanged. |
| `test/capitalizeWords.test.js` | New file, 11 tests covering empty input, single/multiple words, whitespace preservation (spaces, tabs, newlines, runs, leading/trailing), intra-word capitals (`iPhone` -> `IPhone`, `hELLO` -> `HELLO`), hyphen/apostrophe not being word boundaries, first char without an upper-case form (`(hello) 3d world`), NBSP as a word boundary, astral first character (`𐐨x` -> `𐐀x`), multi-char upper case (`ßtraße` -> `SStraße`), and `TypeError` for every non-string input. |

Untouched as required by the plan: `test/slugify.test.js`, `test/truncate.test.js`,
`package.json`, `.github/workflows/`, `README.md`, `AGENTS.md`.

## Implementation

```js
export function capitalizeWords(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text.replace(/(^|\s)(\S)/gu, (_, before, first) => `${before}${first.toUpperCase()}`);
}
```

The `u` flag keeps astral first characters intact; `(^|\s)` consumes and re-emits
the preceding whitespace so spacing is preserved exactly; `\b` was deliberately
not used so `don't`/`foo-bar` stay single words per the issue's whitespace-only
definition. Error message matches `truncate`'s.

## Test / lint / typecheck results

Install: none required — no dependencies and no lockfile; `node --test` runs
directly on Node v24.22.1. `npm ci` was not run, per the plan.

TDD red step (before implementation):

```
$ node --test test/capitalizeWords.test.js
SyntaxError: The requested module '../src/slugify.js' does not provide an export named 'capitalizeWords'
ℹ tests 1
ℹ pass 0
ℹ fail 1
EXIT=1
```

Targeted tests after implementation:

```
$ node --test test/capitalizeWords.test.js
✔ returns an empty string unchanged
✔ upper-cases the first character of a single word
✔ upper-cases every word and keeps the whitespace exactly
✔ leaves capitals inside a word untouched
✔ preserves the whitespace of the input
✔ starts a new word only after whitespace
✔ leaves a first character without an upper-case form alone
✔ treats non-ASCII whitespace as a word boundary and keeps it
✔ upper-cases an astral first character as a whole code point
✔ documents that upper-casing can make the result longer
✔ throws a TypeError for non-string text
ℹ tests 11
ℹ pass 11
ℹ fail 0
EXIT=0
```

Full suite (`npm test`, single run, 900s budget):

```
$ npm test
...
✔ throws a TypeError for non-string text (0.910789ms)
✔ never exceeds maxLength and never leaves whitespace before the ellipsis (1.746273ms)
✔ trims trailing punctuation before adding the ellipsis (0.41771ms)
✔ keeps punctuation on text that already fits (0.272703ms)
ℹ tests 37
ℹ suites 0
ℹ pass 37
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
EXIT=0
```

37 = 26 pre-existing (slugify + truncate) + 11 new. No regressions.

Lint: not configured in this repo — nothing to run (per plan, not added).
Typecheck: not configured (plain JavaScript, no `tsconfig.json`) — nothing to run.
Build: not configured — `package.json` has only a `test` script.

## Deviations from the plan

None. Implementation, test strategy and file manifest match the plan exactly.
The only addition is the invariant test asserting `result.length === input.length`
on ASCII inputs, which the plan's test strategy item 5 explicitly requested.

## Notes / known issues

- Behaviour is pinned as designed: a word whose first character has no upper-case
  form is left alone entirely, hyphen/apostrophe do not start a new word, and
  `ß`-style multi-character upper-casing can lengthen the result. All documented
  in the JSDoc so callers are warned.
- No dependency, workflow, or config changes.
