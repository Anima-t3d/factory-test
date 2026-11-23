# Architect plan — issue #11: Add a `titleCase` helper in `src/case.js`

## Problem Statement

The library currently ships only `src/slugify.js` (`slugify` at `src/slugify.js:15`,
`truncate` at `src/slugify.js:85`); there is no title-case conversion. Issue #11 asks
for a new module `src/case.js` exporting `titleCase(text)` that uppercases the first
letter of each space-separated word and lowercases the rest (`"hello WORLD"` →
`"Hello World"`), returns `""` for `""`, and preserves runs of spaces. It must ship
with `test/case.test.js` using `node:test`, and touch no other files. Two sibling
issues (camel/snake case) will add more exports to the same file later, so the module
must stay minimal and easy to extend.

## Summary of changes

- **Create** `src/case.js` with one named export, `titleCase(text)`.
- **Create** `test/case.test.js` with `node:test` + `node:assert/strict` cases.
- Nothing else: no `package.json`, `README.md`, `AGENTS.md`, `.github/workflows/`, or
  `src/slugify.js` changes. No dependencies.

## Files to modify (exhaustive manifest)

| # | Path | Action | Anchor / symbol | What |
|---|------|--------|-----------------|------|
| 1 | `src/case.js` | create | `export function titleCase(text)` | Implementation + JSDoc (see below) |
| 2 | `test/case.test.js` | create | top-level `test(...)` calls | Tests (see Test strategy) |

Existing sibling files, for reference only — **do not modify**:
`src/slugify.js`, `test/slugify.test.js`, `test/truncate.test.js`.

`npm test` runs `node --test`, which auto-discovers `test/*.test.js`, so the new test
file needs no registration anywhere.

## Commands (from guardrails-report.md)

- Install: `npm install` (`npm ci` fails — no lockfile, expected). Delete any
  generated `package-lock.json` afterwards; it must not be committed.
- Test (full gate, same as CI): `npm test`  (equivalently `.git/lastlight-gate.sh`)
- Single file while iterating: `node --test test/case.test.js`
- Lint: none configured. Typecheck: none configured. Do not add either.

## Implementation approach

### 1. `src/case.js`

Match the style of `src/slugify.js`: ESM, named export, double quotes, semicolons,
2-space indent, JSDoc with `@param`/`@returns`/`@throws`, and the same
`TypeError("text must be a string")` guard `truncate` uses (`src/slugify.js:86-88`).

```js
/**
 * Title-case text: the first character of each space-separated word is
 * uppercased and the rest of the word is lowercased, so "hello WORLD" becomes
 * "Hello World".
 *
 * Only U+0020 separates words, and every space is kept: leading, trailing and
 * repeated spaces come back exactly as given. Tabs, newlines, hyphens and
 * apostrophes are ordinary characters inside a word, so "o'NEIL" becomes
 * "O'neil" and "foo\tBAR" becomes "Foo\tbar". Case mapping uses
 * `String#toUpperCase`/`toLowerCase`, so a character can change length
 * ("ß" uppercases to "SS"). The first character is taken by code point, so a
 * surrogate pair is never split.
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function titleCase(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text.split(" ").map(capitalizeWord).join(" ");
}

/** Uppercase the first code point of a word and lowercase the rest. */
function capitalizeWord(word) {
  if (word === "") {
    return word;
  }
  const first = String.fromCodePoint(word.codePointAt(0));
  return first.toUpperCase() + word.slice(first.length).toLowerCase();
}
```

Notes:
- `split(" ")` / `join(" ")` round-trips spacing exactly: consecutive, leading and
  trailing spaces become empty strings in the array and are restored on join.
- `""` → `[""]` → `""`, so the empty-string case needs no special branch.
- `capitalizeWord` is a private (non-exported) helper; the sibling camel/snake issues
  can add their own exports beside `titleCase` without touching it.
- Do **not** export anything else and do not pre-add camelCase/snakeCase (out of scope).

### 2. `test/case.test.js`

Header mirrors `test/slugify.test.js:1-3`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { titleCase } from "../src/case.js";
```

Then the tests listed under Test strategy.

### 3. Verify

Run `npm test`; all 26 existing tests plus the new ones must pass. Remove any
`package-lock.json` created by `npm install`. Commit message (Conventional Commits,
per `AGENTS.md`): `feat(case): add a titleCase helper (#11)`.

## Risks and edge cases

| Input | Behaviour | How the caller learns |
|-------|-----------|------------------------|
| `""` | returns `""` | specified; tested |
| Multiple / leading / trailing spaces | preserved verbatim | specified; tested |
| Non-string (`null`, `undefined`, number, object) | **surfaced**: throws `TypeError("text must be a string")` — never coerced or silently returned | thrown error; documented `@throws`; tested |
| Tabs, newlines, NBSP, other whitespace | not word separators; treated as ordinary characters (e.g. `"foo\tBAR"` → `"Foo\tbar"`) | **surfaced** in JSDoc (issue specifies space-separated words); tested so it can't drift silently |
| Hyphens / apostrophes (`"o'NEIL"`, `"jean-PAUL"`) | inner part lowercased (`"O'neil"`, `"Jean-paul"`) | documented in JSDoc; tested |
| Word starting with a digit/punctuation (`"1ST place"`) | first char unchanged by `toUpperCase`, rest lowercased → `"1st Place"` | natural result; tested |
| Astral first character (surrogate pair, e.g. `"𐐨𐐨"`) | taken by code point, so the pair is not split and is uppercased correctly | documented; tested |
| Length-changing case maps (`"ßa"` → `"SSa"`, Turkish dotted I) | follows JS default (locale-independent) mappings; output length may differ from input | documented in JSDoc; no locale parameter (out of scope) |
| Combining marks / grapheme clusters | first code point only is uppercased; combining marks are unaffected by case anyway | acceptable; no special handling |

No input is silently dropped: every character of the input appears in the output
(case-mapped), and the only unsupported inputs (non-strings) throw.

Process risk: previous runs of this workflow opened PRs #15 and #16 from this branch,
but the branch currently contains no `src/case.js`. Implement fresh from this plan;
do not try to cherry-pick from those PRs.

## Test strategy

`test/case.test.js`, one `test()` per behaviour, using `assert.equal` / `assert.throws`:

1. `"uppercases the first letter of each word and lowercases the rest"` —
   `titleCase("hello WORLD")` → `"Hello World"`; `titleCase("hELLO")` → `"Hello"`.
2. `"returns an empty string for an empty string"` — `titleCase("")` → `""`.
3. `"keeps multiple consecutive spaces"` — `titleCase("hello   WORLD")` → `"Hello   World"`.
4. `"keeps leading and trailing spaces"` — `titleCase("  hello world ")` → `"  Hello World "`;
   `titleCase("   ")` → `"   "`.
5. `"only splits words on spaces"` — `titleCase("foo\tBAR")` → `"Foo\tbar"`;
   `titleCase("jean-PAUL o'NEIL")` → `"Jean-paul O'neil"`.
6. `"leaves a non-letter first character as is"` — `titleCase("1ST place")` → `"1st Place"`.
7. `"does not split a surrogate pair"` — `titleCase("\u{10428}\u{10428}")` →
   `"\u{10400}\u{10428}"` (Deseret small → capital long I).
8. `"throws a TypeError for non-string text"` — `assert.throws(() => titleCase(null), TypeError)`,
   same for `undefined` and `42`.

Gate: `npm test` exits 0 (existing 26 tests + 8 new).

## Estimated complexity

**Simple** — two new files, ~30 lines of source, no changes to existing code or tooling.
