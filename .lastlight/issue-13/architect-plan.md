# Architect plan — issue #13: Add a camelCase helper to `src/case.js`

## Problem Statement

`src/case.js` exports `titleCase` (`src/case.js:18`) and `snakeCase`
(`src/case.js:53`), but has no way to go back from snake/kebab/spaced words to
camelCase. Issue #13 asks for an additive `camelCase(text)` export that splits on
spaces, dashes and underscores, lowercases the first word and capitalises each
later word (`"hello_world foo"` → `"helloWorldFoo"`, `"HELLO_WORLD"` →
`"helloWorld"`), collapses separator runs, and returns `""` for empty input. Tests
go in `test/case.test.js`; no other files change.

## Summary of change

- Add one exported function, `camelCase`, at the end of `src/case.js`, reusing the
  existing private `capitalizeWord` helper (`src/case.js:27`) for the later words.
- Add `camelCase` tests at the end of `test/case.test.js` and add it to the import
  on `test/case.test.js:3`.
- `titleCase`, `capitalizeWord` and `snakeCase` are not modified.

## Files to modify (exhaustive manifest)

Only these two files. `src/slugify.js`, `test/slugify.test.js`,
`test/truncate.test.js`, `package.json`, `README.md`, `AGENTS.md` and
`.github/workflows/` are NOT touched.

### 1. `src/case.js`

Append after the end of `snakeCase` (after line 64), separated by a blank line:

```js
/**
 * Camel-case text: the first word lowercased and every later word capitalised,
 * joined with no separator, so "hello_world foo" becomes "helloWorldFoo" and
 * "HELLO_WORLD" becomes "helloWorld".
 *
 * Words are split on runs of whitespace, dashes ("-") and underscores ("_"), the
 * same separators `snakeCase` uses. Leading, trailing and repeated separators are
 * dropped, so they never produce a leading capital or a doubled capital, and
 * input with no words returns "".
 *
 * Existing camel humps are not split: each word is re-cased as a whole, so
 * "helloWorld foo" becomes "helloworldFoo". Any other character (punctuation,
 * digits, accented letters, emoji) is kept inside its word as is; a later word
 * that starts with a non-letter keeps that character and lowercases the rest
 * ("version 2nd" becomes "version2nd"). Case mapping uses
 * `String#toUpperCase`/`toLowerCase` and the first character is taken by code
 * point, as in `titleCase`.
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function camelCase(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text
    .split(/[\s_-]+/u)
    .filter((word) => word !== "")
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : capitalizeWord(word),
    )
    .join("");
}
```

Notes for the executor:
- `capitalizeWord` is module-private (not exported) and already does "first code
  point upper, rest lower"; reuse it, do not duplicate it, do not export it.
- Separator regex `/[\s_-]+/u` intentionally matches `snakeCase`'s split
  (`src/case.js:60`) so the two helpers agree on what a word boundary is. The
  issue says "spaces"; treating tabs/newlines as spaces too is the consistent
  choice and is documented in the JSDoc.

### 2. `test/case.test.js`

- Line 3: change the import to
  `import { camelCase, snakeCase, titleCase } from "../src/case.js";`
- Append after the last test (after line 151), prefixing names with `camelCase`
  to match the existing `snakeCase …` convention:

```js
test("camelCase joins words split on spaces, dashes and underscores", () => {
  assert.equal(camelCase("hello_world foo"), "helloWorldFoo");
  assert.equal(camelCase("foo-bar_baz qux"), "fooBarBazQux");
});

test("camelCase lowercases the first word and capitalises later words", () => {
  assert.equal(camelCase("HELLO_WORLD"), "helloWorld");
  assert.equal(camelCase("Hello wORLD"), "helloWorld");
});

test("camelCase returns an empty string when there are no words", () => {
  assert.equal(camelCase(""), "");
  assert.equal(camelCase("   "), "");
  assert.equal(camelCase("- _ -"), "");
});

test("camelCase drops leading, trailing and repeated separators", () => {
  assert.equal(camelCase("__hello--world  "), "helloWorld");
  assert.equal(camelCase(" -_foo _- bar_ "), "fooBar");
  assert.equal(camelCase("foo\tbar\nbaz"), "fooBarBaz");
});

test("camelCase does not split existing camel humps", () => {
  assert.equal(camelCase("helloWorld foo"), "helloworldFoo");
});

test("camelCase is the inverse of snakeCase for snake_case input", () => {
  assert.equal(camelCase(snakeCase("helloWorld-foo bar")), "helloWorldFooBar");
});

test("camelCase keeps other characters inside words", () => {
  assert.equal(camelCase("don't stop"), "don'tStop");
  assert.equal(camelCase("version 2nd"), "version2nd");
});

test("camelCase does not split a surrogate pair", () => {
  assert.equal(camelCase("a \u{10428}\u{10428}"), "a\u{10400}\u{10428}");
});

test("camelCase throws a TypeError for non-string text", () => {
  assert.throws(() => camelCase(null), TypeError);
  assert.throws(() => camelCase(undefined), TypeError);
  assert.throws(() => camelCase(42), TypeError);
});
```

## Commands

From `.lastlight/issue-13/guardrails-report.md`:

- Install: `npm install` (no lockfile; `npm ci` fails by design). Delete any
  generated `package-lock.json` before committing — it must not be committed.
- Test (the gate, same as CI): `npm test` (runs `node --test`)
- Lint: none configured.
- Typecheck: none configured.

## Implementation approach

1. Edit `src/case.js`: append the `camelCase` function and JSDoc above after
   `snakeCase`. Do not edit lines 1–64.
2. Edit `test/case.test.js`: update the import on line 3; append the tests above.
3. Run `npm test`; all 44 existing tests plus the 9 new ones must pass.
4. `git status` should show only `src/case.js` and `test/case.test.js` (plus the
   harness's `.lastlight/` files). Remove any `package-lock.json`.
5. Commit as `feat(case): add camelCase helper (#13)`.

## Risks and edge cases

- **Non-string input** — not supported; surfaced as a thrown
  `TypeError("text must be a string")`, matching `titleCase`/`snakeCase`. Never
  coerced or silently returned.
- **Input with no words** (`""`, only separators) — returns `""`. This is the
  specified result for empty input, not a dropped output; tested.
- **Existing camel humps / acronyms** (`"helloWorld"`, `"parseHTTP"`) — out of
  scope per the issue: the word is re-cased as a whole (`"helloworld"`). This is
  not silent: it is stated in the JSDoc and pinned by a test, so callers can see
  the contract. Splitting humps would contradict the issue.
- **Digits / punctuation / non-letter first character** — kept inside the word;
  `toUpperCase` on a digit is a no-op, so `"version 2nd"` → `"version2nd"`.
  Digits are not separators (out of scope); documented and tested.
- **Case-mapping length changes** (`"ß"` → `"SS"` when it leads a later word) —
  inherited from `String#toUpperCase`, same as `titleCase`; documented.
- **Surrogate pairs** — `capitalizeWord` takes the first code point, so astral
  characters are not split; tested.
- **Other whitespace** (tabs, newlines) — treated as separators, consistent with
  `snakeCase`; documented and tested.
- **Regression risk to existing helpers** — none if lines 1–64 of `src/case.js`
  are left untouched; the existing 18 case tests guard this.

No input path drops data silently: every unsupported input either throws or has
documented, tested behaviour.

## Test strategy

- Unit tests via `node:test` in `test/case.test.js` (listed above) covering: the
  issue's example, each separator and mixed runs, first-word lowercasing and
  later-word capitalisation of all-caps/mixed input, empty and separator-only
  input, leading/trailing/repeated separators, whitespace other than U+0020, the
  no-hump-splitting contract, round-trip with `snakeCase`, non-letter characters,
  surrogate pairs, and `TypeError` on non-strings.
- Full suite via `npm test` must stay green (existing 44 tests unchanged).

## Estimated complexity

simple
