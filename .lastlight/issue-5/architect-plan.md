# Architect plan — issue #5: Add a wordCount helper

Branch: `lastlight/5-add-a-wordcount-helper`

## Problem Statement

The library's only module, `src/slugify.js`, exports two named helpers: `slugify`
(`src/slugify.js:15`) and `truncate` (`src/slugify.js:85`). Issue #5 asks for a third
named export, `wordCount(text)`, living alongside them and exported the same way
(`export function …` in `src/slugify.js`). A word is a run of non-whitespace characters;
whitespace (spaces, tabs, newlines, …) separates words; empty / whitespace-only input
returns `0`; non-string input throws `TypeError` — mirroring the existing guard in
`truncate` at `src/slugify.js:86-88`.

## Summary of changes

1. Add `export function wordCount(text)` with JSDoc at the end of `src/slugify.js`.
2. Add a new test file `test/wordCount.test.js` covering the five cases the issue lists
   (plus a couple of edge cases below).

No other files change. No dependencies, no CI changes (per `AGENTS.md`). README does not
list individual functions, so it needs no update.

## Files to modify (exhaustive manifest)

| # | Path | Anchor | Change |
|---|------|--------|--------|
| 1 | `src/slugify.js` | after `splitsWord` (end of file, after line 142) | Append the new exported `wordCount` function with JSDoc (code below). |
| 2 | `test/wordCount.test.js` | new file | Tests, same style as `test/truncate.test.js` (`node:test` + `node:assert/strict`, import from `../src/slugify.js`). |

Full set of test files for the module (for reference; only #2 is new, the others stay
untouched): `test/slugify.test.js`, `test/truncate.test.js`, `test/wordCount.test.js`.

### 1. `src/slugify.js` — append

```js
/**
 * Count the words in `text`. A word is a run of non-whitespace characters; any
 * whitespace (spaces, tabs, newlines and the other characters matched by the
 * JavaScript `\s` class, such as U+00A0 no-break space) separates words.
 * An empty or whitespace-only string has 0 words.
 *
 * Zero-width characters such as U+200B are not whitespace in `\s`, so they do
 * not split words.
 *
 * @param {string} text
 * @returns {number}
 * @throws {TypeError} when `text` is not a string
 */
export function wordCount(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }
  return text.match(/\S+/g)?.length ?? 0;
}
```

Notes:
- Error message `"text must be a string"` matches `truncate` (`src/slugify.js:87`) exactly.
- `text.match(/\S+/g)` returns `null` when there are no words → `?? 0`. Node 22+ supports
  optional chaining / nullish coalescing.

### 2. `test/wordCount.test.js` — new file

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { wordCount } from "../src/slugify.js";

test("returns 0 for an empty string", () => {
  assert.equal(wordCount(""), 0);
});

test("returns 0 for a string of only whitespace", () => {
  assert.equal(wordCount("   "), 0);
  assert.equal(wordCount(" \t\n\r\n  "), 0);
});

test("counts a single word", () => {
  assert.equal(wordCount("hello"), 1);
  assert.equal(wordCount("  hello\n"), 1);
});

test("counts several words separated by mixed whitespace", () => {
  assert.equal(wordCount("one two three"), 3);
  assert.equal(wordCount("one\ttwo\nthree   four\r\nfive"), 5);
  assert.equal(wordCount("\t  leading and trailing  \n"), 3);
});

test("treats punctuation as part of a word", () => {
  assert.equal(wordCount("Hello, world! it's-fine"), 3);
});

test("throws a TypeError for non-string text", () => {
  for (const value of [undefined, null, 42, true, {}, [], ["a b"], new String("a b")]) {
    assert.throws(() => wordCount(value), TypeError);
  }
});
```

## Commands (from guardrails-report.md)

- Install: `npm install` (`npm ci` fails by design — no committed lockfile; do **not**
  commit the generated `package-lock.json`).
- Test (what CI runs): `npm test`  (= `node --test`)
- Gate script: `.git/lastlight-gate.sh` (runs `npm test`)
- Lint: none configured. Typecheck: none configured.

## Implementation approach

1. Append the `wordCount` block above to the end of `src/slugify.js`.
2. Create `test/wordCount.test.js` with the content above.
3. Run `npm test`; all existing 26 tests plus the new ones must pass.
4. Commit with Conventional Commits, e.g. `feat(slugify): add a wordCount helper (#5)`.
   Do not commit `package-lock.json`.

## Risks and edge cases

- **Non-string input** (`undefined`, `null`, numbers, arrays, objects, boxed
  `new String(...)`): surfaced as `TypeError("text must be a string")` — never coerced.
  Boxed strings are rejected deliberately for consistency with `truncate`; documented by
  the `@throws` tag and covered by the test.
- **Unicode whitespace** (NBSP U+00A0, U+2028/2029, ideographic space U+3000, BOM U+FEFF):
  treated as separators because `\s` includes them. This matches "any whitespace" in the
  issue; documented in JSDoc.
- **Zero-width characters** (U+200B, U+200C/D, U+2060): not whitespace in `\s`, so they
  do not split words. This is a known, documented limitation in the JSDoc (surfaced to
  callers via docs rather than silently diverging); no code-level handling is required by
  the issue.
- **Punctuation / hyphens / emoji**: part of a word (only whitespace separates). Covered
  by a test so the behaviour is explicit.
- **Languages without spaces** (CJK, Thai): a whole unspaced sentence counts as one word.
  That follows directly from the issue's definition; documented implicitly by "a word is a
  run of non-whitespace characters". No warning needed — it is the specified behaviour.
- No silent defaults: every input is either counted per the definition or rejected with a
  `TypeError`.

## Test strategy

- New `test/wordCount.test.js` with: empty string, only whitespace, single word, several
  words with tabs/newlines/repeated spaces (+ leading/trailing whitespace), punctuation
  inside words, and `TypeError` for a range of non-string values.
- Run the full suite with `npm test`; existing `slugify` and `truncate` tests must stay
  green.

## Estimated complexity

simple
