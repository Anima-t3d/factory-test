# Architect plan — issue #7: Add a `capitalizeWords` helper

Branch: `lastlight/7-add-a-capitalizewords-helper`
Repo: `Anima-t3d/factory-test`
Issue: https://github.com/Anima-t3d/factory-test/issues/7

## Current branch state (re-run of the architect phase, 2026-11-23)

The work in this plan is **already on the branch** and must not be re-applied:

- `src/slugify.js:144-170` already holds the JSDoc block and `export function capitalizeWords(text)`
  exactly as specified under Implementation approach (lines 1-142 are unchanged).
- `test/capitalizeWords.test.js` (72 lines, 11 tests) already exists and covers every item in Test strategy.
- `npm test` on the branch head (`bf160b9`): **37 tests, 37 pass, 0 fail** (26 existing + 11 new).
- PR #8 is open for this branch (per `status.md`).

**Executor instruction:** do NOT append `capitalizeWords` again. A second `export function capitalizeWords`
is a duplicate declaration, so the module would fail to load and every test file would break. Instead:
1. Confirm `grep -c "export function capitalizeWords" src/slugify.js` prints `1`, and that the body matches the
   Implementation approach block below.
2. Confirm `test/capitalizeWords.test.js` matches Test strategy items 1-10.
3. Run `npm test` and record the result. If both checks match and the tests pass, make no code changes.
   If anything is different, edit it to match this plan. Do not rewrite it from scratch.

**Relation to `main`:** `origin/main` has since gained `src/case.js` (`titleCase`, `snakeCase`, `camelCase`)
and `test/case.test.js`. This branch does not touch those files, and `main`'s `src/slugify.js` still
matches this branch's lines 1-142, so the PR merges without conflicts and no rebase is needed. Keep
`capitalizeWords` in `src/slugify.js`, because the issue asks for it "next to `slugify`". Do not move it
into `src/case.js` or merge it with `titleCase`. The two behave differently: `titleCase` lower-cases the
rest of each word and splits only on U+0020, while `capitalizeWords` leaves the rest of each word as it is
and splits on any `\s`.

## Problem Statement

`src/slugify.js` exports two helpers, `slugify` (`src/slugify.js:15`) and `truncate`
(`src/slugify.js:85`), each as a JSDoc-documented `export function`. There is no helper
to capitalise display text. The issue asks for `capitalizeWords(text)` "next to
`slugify`, exported the same way", which upper-cases the first character of every word
(a word starts at the start of the string or right after whitespace), leaves the rest of
each word untouched (`iPhone` -> `IPhone`), preserves all whitespace exactly, and throws
`TypeError` for non-string input. Tests live in `test/*.test.js` and run under
`node --test` (`package.json:8`).

## Summary of what needs to change

1. `src/slugify.js` — append a JSDoc block and `export function capitalizeWords(text)`
   at the end of the file (after `splitsWord`, line 142). Nothing else in the file changes.
2. `test/capitalizeWords.test.js` — new test file, same style as `test/truncate.test.js`.
3. Nothing else.

## Files to modify — exhaustive manifest

`ls src test` on this branch → `src/slugify.js`, `test/capitalizeWords.test.js` (already added), `test/slugify.test.js`, `test/truncate.test.js`.
No barrels/index files, no locales, no adapters.

| # | File | Anchor | Change |
| - | ---- | ------ | ------ |
| 1 | `src/slugify.js` | end of file, after `function splitsWord` (ends line 142); **already present at lines 144-170**, verify only | Append JSDoc + `export function capitalizeWords(text)` exactly as in Implementation approach. Lines 1-142 stay byte-identical. |
| 2 | `test/capitalizeWords.test.js` | new file (**already present**, verify only) | Tests from Test strategy. Imports: `import { test } from "node:test";`, `import assert from "node:assert/strict";`, `import { capitalizeWords } from "../src/slugify.js";` |
| 3 | `test/slugify.test.js` | whole file | **NO CHANGE** (regression fence; out of scope per triage). |
| 4 | `test/truncate.test.js` | whole file | **NO CHANGE** (regression fence; out of scope per triage). |
| 5 | `package.json`, `.github/workflows/test.yml`, `README.md`, `AGENTS.md` | — | **NO CHANGE.** `node --test` auto-discovers the new test file. |

## Commands

From `.lastlight/issue-7/guardrails-report.md` (same as CI and `.git/lastlight-gate.sh`):

```sh
npm test
```

Lint: not configured (nothing to run). Typecheck: not configured (nothing to run).
Do not add either. Do not run `npm ci` (no lockfile); if an install is needed,
`npm install` and delete the generated `package-lock.json` before committing.

## Implementation approach

1. Append to `src/slugify.js`:

```js
/**
 * Upper-case the first character of every word, leaving everything else as is.
 *
 * A word starts at the beginning of the string or right after a whitespace
 * character (anything matched by the regex `\s`: spaces, tabs, newlines, NBSP,
 * ...). Only that first character is changed, with `String#toUpperCase`; the rest
 * of the word is not touched, so "iPhone" becomes "IPhone" and "hELLO" becomes
 * "HELLO". All whitespace is returned exactly as given: runs, tabs, newlines and
 * leading/trailing whitespace are kept.
 *
 * A word that starts with a character that has no upper case form (a digit,
 * punctuation such as "(" or a quote) is left unchanged; letters after it are not
 * capitalised. Casing is not locale-aware, and a few characters upper-case to more
 * than one character ("ß" -> "SS"), so the result can be longer than `text`.
 * Astral characters (outside the BMP) are handled as a whole code point.
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function capitalizeWords(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text.replace(/(^|\s)(\S)/gu, (_, before, first) => `${before}${first.toUpperCase()}`);
}
```

   Notes for the executor:
   - Keep the `u` flag: without it, `\S` would match only the high surrogate of an
     astral first character (e.g. `𐐨` U+10428, which upper-cases to `𐐀` U+10400) and
     `toUpperCase` would be a no-op on the lone half.
   - `(^|\s)` consumes the preceding whitespace char and re-emits it unchanged, so
     whitespace is preserved; consecutive whitespace works because the match needs a
     `\S` after the whitespace char, so each word is matched once by the whitespace
     char immediately before it.
   - Do not use `split`/`join` (would lose the exact whitespace) and do not use `\b`
     (would treat `don't` / `foo-bar` as two words, contrary to the issue's
     whitespace-only definition).
   - Error message `"text must be a string"` matches `truncate` (`src/slugify.js:87`).

2. Create `test/capitalizeWords.test.js` (see Test strategy).
3. Run `npm test`; all 26 existing tests plus the new ones must pass.
4. Commit: `feat(slugify): add a capitalizeWords helper` (Conventional Commits per AGENTS.md).

## Risks and edge cases

| Input | Behaviour | How it is surfaced |
| ----- | --------- | ------------------ |
| Non-string (`null`, `undefined`, number, object, array, boolean) | Throws `TypeError("text must be a string")` | Error (issue requirement). No coercion, `String` objects (`new String("x")`) are rejected too — `typeof` is `"object"`; documented by the `@throws`. |
| Empty / whitespace-only string | Returned unchanged | Tested. |
| Word starting with digit/punctuation (`"(hello"`, `"3d models"`, `"'quoted'"`) | First char unchanged, rest unchanged — `"(hello"` stays `"(hello"` | Literal reading of "uppercase the first letter … word starts after whitespace". Documented in JSDoc (warn-and-surface via docs) and pinned by a test so it is a decided behaviour, not an accident. |
| Hyphen/apostrophe inside a word (`"foo-bar"`, `"don't"`) | Only the char after whitespace changes: `"Foo-bar"`, `"Don't"` | Whitespace-only word definition per issue; tested. |
| Characters whose upper case is multi-char (`"ßtraße"` -> `"SStraße"`) or locale-specific (Turkish `i`) | Default `toUpperCase`; result may be longer than input | Out of scope per triage; documented in JSDoc so callers are told. Tested for `ß` so the length change is explicit. |
| Astral first char (`"𐐨x"`) | Upper-cased as a full code point (`"𐐀x"`) via `u` flag | Tested. |
| Non-ASCII whitespace (NBSP `\u00a0`, `\u2028`, `\u3000`) | Counts as a word boundary (JS `\s`) and is preserved | Documented ("anything matched by `\s`"); tested with NBSP. |
| Combining sequences / emoji first char | `toUpperCase` no-op on symbols; text unchanged | Covered by the "no upper-case form" JSDoc sentence. |

No input is silently dropped: every non-string throws, every string is returned with
only first-of-word characters potentially changed.

## Test strategy

`test/capitalizeWords.test.js`, one `test(...)` per behaviour:

1. **empty string** — `capitalizeWords("") === ""`.
2. **one word** — `"hello"` -> `"Hello"`; already-capitalised `"Hello"` -> `"Hello"`.
3. **several words with mixed whitespace** — `"hello world"` -> `"Hello World"`;
   `"  hello \t world\n\nfoo  "` -> `"  Hello \t World\n\nFoo  "` (leading, trailing,
   runs, tab, newlines preserved).
4. **capitals inside a word are kept** — `"iPhone"` -> `"IPhone"`;
   `"my iPhone and macOS"` -> `"My IPhone And MacOS"`; `"hELLO"` -> `"HELLO"` (rest not lower-cased).
5. **whitespace preserved exactly (invariant)** — for a handful of inputs, assert
   `result.replace(/\S/gu, "")` equals `input.replace(/\S/gu, "")` and, for ASCII
   inputs, `result.toLowerCase() === input.toLowerCase()` and `result.length === input.length`.
6. **word starts only after whitespace** — `"foo-bar don't"` -> `"Foo-bar Don't"`.
7. **first char without an upper-case form is left alone** — `"(hello) 3d world"` -> `"(hello) 3d World"`.
8. **non-ASCII whitespace and astral chars** — `"a\u00a0b"` -> `"A\u00a0B"` (write the NBSP as the `\u00a0` escape, not a literal); `"𐐨x"` -> `"𐐀x"`.
9. **multi-char upper case is documented behaviour** — `"ßtraße"` -> `"SStraße"`.
10. **TypeError for non-string** — for `[null, undefined, 42, true, {}, ["a"], new String("a")]`,
    `assert.throws(() => capitalizeWords(v), TypeError)`.

Existing `test/slugify.test.js` and `test/truncate.test.js` remain untouched and must still pass.

## Estimated complexity

simple
