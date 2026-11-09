# Architect plan — issue #9: Add a `reverseWords` helper

Branch: `lastlight/9-add-a-reversewords-helper`
Repo: `Anima-t3d/factory-test`
Issue: https://github.com/Anima-t3d/factory-test/issues/9

## Problem Statement

`src/slugify.js` is the library's only module and exports two named helpers:
`slugify` (`src/slugify.js:15`) and `truncate` (`src/slugify.js:85`). There is no
helper that reverses the order of the words in a string. The issue asks for
`reverseWords(text)` "next to `slugify`, exported the same way" — i.e. another
`export function` in `src/slugify.js` with a JSDoc comment — that splits on runs of
whitespace, returns the words reversed and joined by single spaces, returns `""` for
empty/whitespace-only input, and throws `TypeError` for non-string input (matching the
existing guard at `src/slugify.js:86-88`).

## Summary of what needs to change

1. `src/slugify.js` — append a JSDoc comment and `export function reverseWords(text)`
   at the end of the file (after `splitsWord`, `src/slugify.js:142`). Nothing existing
   is touched.
2. `test/reverseWords.test.js` — new test file using `node:test` +
   `node:assert/strict`, mirroring `test/truncate.test.js:1-3`.
3. No other source, test, config, dependency, README or CI changes.

## Files to modify — exhaustive manifest

Verified with `git ls-files`: one source module, two existing test files, no
barrel/index, no `exports` map in `package.json` (consumers import
`./src/slugify.js` directly, as both test files do).

| # | File | Anchor | Change |
|---|------|--------|--------|
| 1 | `src/slugify.js` | end of file, after `function splitsWord` (line 142) | Add JSDoc + `export function reverseWords(text)` (code below). |
| 2 | `test/reverseWords.test.js` | new file | Tests listed under *Test strategy*. |

Not modified (checked, intentionally untouched): `test/slugify.test.js`,
`test/truncate.test.js`, `package.json`, `README.md`, `AGENTS.md`,
`.github/workflows/test.yml`.

### Code for `src/slugify.js` (append)

```js
/**
 * Reverse the order of the words in `text`.
 *
 * A word is a maximal run of non-whitespace characters (anything not matched by
 * the regular-expression class `\s`, which includes spaces, tabs, newlines and
 * Unicode whitespace such as U+00A0 and U+3000). The words are returned in
 * reverse order joined by a single space; the original whitespace is not kept.
 * Characters within a word keep their order. Empty or whitespace-only text
 * returns an empty string.
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function reverseWords(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text.split(/\s+/).filter(Boolean).reverse().join(" ");
}
```

`filter(Boolean)` drops the empty strings `split` produces at leading/trailing
whitespace and for `""`, so `""`/whitespace-only input yields `[]` → `""`.

## Commands

From `.lastlight/issue-9/guardrails-report.md`:

- Install: `npm install` (`npm ci` fails — no lockfile, expected; delete any
  generated `package-lock.json` afterwards, do not commit it).
- Test (the gate, same as CI): `npm test` (→ `node --test`).
- Lint: none configured. Typecheck: none configured.

## Implementation approach

1. Append the function above to `src/slugify.js`.
2. Create `test/reverseWords.test.js` with the tests below.
3. Run `npm test`; all existing 26 tests plus the new ones must pass.
4. Commit with Conventional Commits, e.g. `feat(slugify): add a reverseWords helper (#9)`.

## Risks and edge cases

- **Non-string input** (`null`, `undefined`, numbers, arrays, plain objects,
  `String` objects via `new String("a b")`): surfaced as `TypeError("text must be a
  string")`. No coercion — consistent with `truncate`. `new String(...)` is
  deliberately rejected (typeof is `"object"`); this is documented by the
  `@throws` tag and is the same rule `truncate` applies.
- **Unicode whitespace** (NBSP, ideographic space, BOM U+FEFF, line/paragraph
  separators): treated as separators because `\s` matches them. Documented in the
  JSDoc so it is not a silent choice.
- **Zero-width characters** (U+200B ZWSP, ZWJ) are *not* `\s` and stay inside words.
  Documented implicitly by the definition "anything not matched by `\s`"; no
  special handling is in scope.
- **Surrogate pairs / emoji / combining marks**: never split, because splitting only
  happens on whitespace and characters inside a word are not reordered.
- **Punctuation** stays attached to its word (`"Hello, world!"` → `"world! Hello,"`);
  preserving layout is explicitly out of scope per the issue.
- No input is silently dropped or defaulted: every string returns a defined string,
  every non-string throws.

## Test strategy

New file `test/reverseWords.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { reverseWords } from "../src/slugify.js";
```

Tests (one `test(...)` each):

1. `returns an empty string for an empty string` — `reverseWords("") === ""`.
2. `returns an empty string for whitespace-only text` — `" "`, `"   "`, `" \t\n "` → `""`.
3. `returns a single word unchanged` — `"hello"` → `"hello"`; `"  hello \n"` → `"hello"`.
4. `reverses several words separated by mixed whitespace` —
   `"one \t two\n three"` → `"three two one"`; `"  a  b\r\nc  "` → `"c b a"`;
   also assert the result for a mixed input contains no `\t`, `\n` or double space.
5. `keeps characters within a word in order` — `"Hello, world!"` → `"world! Hello,"`.
6. `throws a TypeError for non-string text` — `assert.throws(() => reverseWords(x), TypeError)`
   for each of `null`, `undefined`, `42`, `["a", "b"]`, `{}`.

Verification: `npm test` passes; total test count rises from 26 by the new tests.

## Estimated complexity

Simple.
