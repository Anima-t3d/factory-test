# Architect plan — issue #11: Add a `titleCase` helper in `src/case.js`

## Problem Statement

The library only ships `slugify` and `truncate` (`src/slugify.js:15`, `src/slugify.js:84`); there is no
title-case conversion. Issue #11 asks for a new module `src/case.js` exporting `titleCase(text)` that
uppercases the first letter of each space-separated word and lowercases the rest
(`"hello WORLD"` → `"Hello World"`), returns `""` for `""`, and preserves runs of spaces (triage
comment). Tests go in a new `test/case.test.js` using `node:test`. The issue says "no other files", and
two sibling issues will later add camel/snake helpers to the same module, so it must stay minimal and
easy to extend.

## Summary of change

- New file `src/case.js` with one named export `titleCase(text)` plus JSDoc, in the style of `src/slugify.js`.
- New file `test/case.test.js` with `node:test` cases.
- Nothing else changes: no README, no `package.json`, no CI, no edits to `src/slugify.js` or existing tests.

## Files to modify (exhaustive manifest)

| # | Path | Action | Anchor / content |
|---|------|--------|------------------|
| 1 | `src/case.js` | **create** | `export function titleCase(text)` — see code below |
| 2 | `test/case.test.js` | **create** | `import { titleCase } from "../src/case.js";` + tests listed under Test strategy |

No other files. `node --test` auto-discovers `test/*.test.js`, so no runner config is needed
(existing siblings: `test/slugify.test.js`, `test/truncate.test.js` — leave untouched).
The `.lastlight/issue-11/` scratch files are published by the harness and are not part of the code change.

### `src/case.js` (implement as written)

```js
/**
 * Title-case text: the first character of each space-separated word is uppercased
 * and the rest of the word is lowercased, so "hello WORLD" becomes "Hello World".
 *
 * Only U+0020 separates words, and spacing is kept exactly as given: leading,
 * trailing and repeated spaces are preserved. Tabs, newlines, hyphens and other
 * punctuation are ordinary characters, so "jean-luc" becomes "Jean-luc". The first
 * character is taken by code point, so a surrogate pair is never split. Case
 * mapping uses `toUpperCase`/`toLowerCase`, which can change length ("ß" → "SS").
 * An empty string returns an empty string.
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function titleCase(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text.split(" ").map(capitalize).join(" ");
}

function capitalize(word) {
  if (word === "") {
    return word;
  }
  const first = String.fromCodePoint(word.codePointAt(0));
  return first.toUpperCase() + word.slice(first.length).toLowerCase();
}
```

Notes:
- `split(" ")` + `join(" ")` is what preserves spacing: consecutive/leading/trailing spaces produce
  empty segments that `capitalize` returns unchanged, and rejoining restores every space.
- `capitalize` is a private helper (not exported) so the module's public surface is just `titleCase`;
  future sibling helpers can be added as additional exports without restructuring.

## Commands (from guardrails-report.md)

- Install: `npm install` (`npm ci` fails — no lockfile, expected; no deps). Delete any generated
  `package-lock.json` before committing.
- Test (full gate, same as CI): `npm test` (runs `node --test`).
- Lint: none configured. Typecheck: none configured. Do not add either.

## Implementation approach

1. Create `src/case.js` with the code above.
2. Create `test/case.test.js` with the tests below (`import { test } from "node:test";`,
   `import assert from "node:assert/strict";`, matching existing test files).
3. Run `npm test`; all 26 existing tests plus the new ones must pass.
4. Remove any `package-lock.json` created by `npm install`; confirm `git status` shows only the two new
   files (plus `.lastlight/issue-11/`).
5. Commit message: `feat(case): add a titleCase helper (#11)`; publish with `github_publish` (no `git push`).

## Risks and edge cases

| Input | Behaviour | How it surfaces |
|-------|-----------|-----------------|
| `""` | returns `""` | spec'd; tested |
| Leading/trailing/repeated spaces | preserved exactly | spec'd; tested |
| Non-string (`null`, `undefined`, number, array, object) | **throws `TypeError("text must be a string")`** — warn-and-surface, matching `truncate` (`src/slugify.js:85-87`) rather than coercing `"null"` → `"Null"` or crashing with an opaque `split is not a function` | tested |
| Tabs / newlines / non-breaking spaces | not word boundaries; character after them is lowercased (`"a\tb"` → `"A\tb"`) | documented in JSDoc; tested so the behaviour is explicit, not accidental |
| Hyphen/apostrophe words | `"jean-luc"` → `"Jean-luc"`, `"o'neil"` → `"O'neil"` | documented in JSDoc; tested |
| Word starting with a digit/punctuation | first char unchanged by `toUpperCase`, rest lowercased: `"1ST"` → `"1st"` | follows spec literally; tested |
| Astral first character (e.g. `"𐐨𐐨"` Deseret) | first code point uppercased, pair never split | code-point handling; tested |
| Length-changing case maps (`"ßa"` → `"SSa"`) | output may be longer than input | documented in JSDoc; no test needed beyond doc |
| Locale-specific rules (Turkish dotted i) | not supported; uses locale-independent `toUpperCase` | documented implicitly by "uses toUpperCase/toLowerCase"; out of scope |
| Small-word rules ("of", "the") | not applied — every word capitalized | issue spec says "each word" |

No input is silently dropped: every character of the input appears (case-mapped) in the output, and
the only rejected input type throws.

## Test strategy

`test/case.test.js` cases (one `test(...)` each):

1. `"uppercases the first letter and lowercases the rest"` — `titleCase("hello WORLD") === "Hello World"`;
   also `"hELLO"` → `"Hello"`, `"a"` → `"A"`.
2. `"returns an empty string for an empty string"` — `titleCase("") === ""`.
3. `"preserves multiple, leading and trailing spaces"` — `"hello   WORLD"` → `"Hello   World"`,
   `"  hello world  "` → `"  Hello World  "`, `"   "` → `"   "`.
4. `"only splits words on spaces"` — `"jean-luc PICARD"` → `"Jean-luc Picard"`, `"a\tB"` → `"A\tb"`.
5. `"leaves a non-letter first character as is"` — `"1ST place"` → `"1st Place"`.
6. `"does not split a surrogate pair"` — `titleCase("𐐨𐐨")` equals `"𐐀𐐨"` (U+10428 → U+10400 upper,
   second stays lowercase). Verified on Node 24: `"\u{10428}".toUpperCase() === "\u{10400}"`.
   Write it with escapes: `assert.equal(titleCase("\u{10428}\u{10428}"), "\u{10400}\u{10428}")`.
7. `"throws a TypeError for non-string text"` — loop over `[null, undefined, 42, ["a"], {}]` with
   `assert.throws(..., TypeError)`.

Gate: `npm test` exits 0.

## Estimated complexity

simple
