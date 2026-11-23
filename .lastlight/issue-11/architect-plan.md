# Architect plan — issue #11: Add a titleCase helper in `src/case.js`

## Problem Statement

The library has no title-case conversion. Its only module is `src/slugify.js`
(exports `slugify` at `src/slugify.js:15` and `truncate` at `src/slugify.js:85`),
each covered by a `node:test` file under `test/` (`test/slugify.test.js`,
`test/truncate.test.js`) that `npm test` (`package.json` → `"test": "node --test"`)
picks up automatically. The issue asks for a new, self-contained `src/case.js`
exporting `titleCase(text)` plus `test/case.test.js`, and nothing else. Two sibling
issues will later add camel/snake-case helpers to the same file, so the module must
stay minimal and easy to extend.

## Summary of change

- New `src/case.js` with one named export, `titleCase(text)`.
- New `test/case.test.js` with `node:test` cases.
- No other file is touched (no README, package.json, CI, lockfile).

## Files to modify (exhaustive manifest)

| # | Path | Action | Anchor / symbol |
|---|------|--------|-----------------|
| 1 | `src/case.js` | **Create** | `export function titleCase(text)` |
| 2 | `test/case.test.js` | **Create** | tests importing `{ titleCase }` from `"../src/case.js"` |

Explicitly **not** to be touched / committed:
- `package-lock.json` — untracked artifact from the guardrails `npm install`. Do NOT
  `git add` it (the issue says "no other files"). Leave it untracked or delete it.
- `README.md`, `package.json`, `.github/workflows/test.yml`, `src/slugify.js`,
  `test/slugify.test.js`, `test/truncate.test.js` — unchanged.
- No camelCase/snakeCase stubs in `src/case.js` (out of scope, separate issues).

## Commands (from guardrails-report.md)

- Test (full suite, the only gate): `npm test`
- Lint: none configured — nothing to run.
- Typecheck: none configured — nothing to run.

## Implementation approach

1. Create `src/case.js` in the style of `src/slugify.js` (ESM, double quotes,
   semicolons, 2-space indent, JSDoc with `@param`/`@returns`/`@throws`):

   ```js
   /**
    * Title-case text: uppercase the first character of each word and lowercase
    * the rest, so "hello WORLD" becomes "Hello World".
    *
    * Words are separated by spaces (U+0020) only, and spacing is preserved:
    * runs of spaces, and leading or trailing spaces, are kept as they are.
    * Tabs and newlines are ordinary characters, not word boundaries.
    * The first character is taken by code point, so astral letters are
    * upper-cased whole. Case mapping uses `String#toUpperCase` and
    * `String#toLowerCase`, so locale-specific rules (e.g. Turkish dotted I)
    * are not applied and a first letter like "ß" becomes "SS".
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

   /** Uppercase the first code point of a word and lowercase the rest. */
   function capitalize(word) {
     if (word === "") {
       return word;
     }
     const first = String.fromCodePoint(word.codePointAt(0));
     return first.toUpperCase() + word.slice(first.length).toLowerCase();
   }
   ```

   Why `split(" ")` / `join(" ")`: splitting on a single space yields empty strings
   for each extra space, which `capitalize` returns unchanged, so joining restores
   the exact original spacing (multiple, leading, trailing). The empty string
   splits to `[""]` and joins back to `""`.

2. Create `test/case.test.js` mirroring `test/truncate.test.js` (imports
   `{ test }` from `"node:test"` and `assert` from `"node:assert/strict"`):
   - `"hello WORLD"` → `"Hello World"` (issue example).
   - `""` → `""`.
   - Multiple consecutive spaces preserved: `"hello   wORLD"` → `"Hello   World"`.
   - Leading/trailing spaces preserved: `"  hello world  "` → `"  Hello World  "`.
   - Already-title-cased and all-caps single words: `"Hello"` → `"Hello"`,
     `"HELLO"` → `"Hello"`, single letter `"a"` → `"A"`.
   - Non-letter first character left as is, rest lowercased: `"123ABC"` → `"123abc"`.
   - Only U+0020 splits words: `"hello\tWORLD"` → `"Hello\tworld"`.
   - Non-string input throws: `assert.throws(() => titleCase(null), TypeError)`
     and same for `undefined` and `42`.

3. Run `npm test`; all existing 26 tests plus the new ones must pass.

4. Commit only `src/case.js` and `test/case.test.js` (plus the harness-managed
   `.lastlight/issue-11/` artifacts) with a Conventional Commit, e.g.
   `feat(case): add titleCase helper (#11)`.

## Risks and edge cases

| Input | Behaviour | How it is surfaced |
|-------|-----------|--------------------|
| Non-string (`null`, `undefined`, numbers, objects) | Not supported | **warn-and-surface**: throws `TypeError("text must be a string")`, same contract as `truncate`; covered by tests. No silent coercion. |
| Empty string | Returns `""` | Tested. |
| Multiple / leading / trailing spaces | Preserved exactly | Tested. |
| Tabs, newlines, NBSP, hyphens | Not word boundaries; character after them is lowercased (`"hello\tWORLD"` → `"Hello\tworld"`) | Documented in JSDoc and pinned by a test, so the limitation is explicit, not silent. |
| Astral first letter (surrogate pair) | Upper-cased as a whole code point; never splits a pair | Documented in JSDoc. |
| Locale-sensitive / length-changing mappings (`"ß"` → `"SS"`, Turkish İ/ı) | Uses locale-independent `toUpperCase`/`toLowerCase` | Documented in JSDoc; no data is dropped, output may differ in length from input. |
| Words starting with a digit or punctuation | First char unchanged by `toUpperCase`; rest lowercased | Tested (`"123ABC"`). |

Other risks:
- **Stray lockfile**: `package-lock.json` is untracked in the working tree; committing
  it would violate "no other files". Executor must not stage it.
- **Prior run**: the issue thread references an earlier PR #15 for this issue, but
  this branch currently contains no `src/case.js`. Implement fresh on this branch;
  the PR phase should check whether #15 is still open and update it rather than
  opening a duplicate.
- **Future siblings**: keep `capitalize` private and avoid shared word-splitting
  abstractions now; sibling issues can add exports alongside `titleCase`.

## Test strategy

- New `test/case.test.js` as listed above; auto-discovered by `node --test`.
- Full gate: `npm test` must exit 0 with the existing 26 tests still passing.
- No lint/typecheck tooling exists, so nothing else to run.

## Estimated complexity

**simple** — two new files, ~30 lines of source, no changes to existing code.
