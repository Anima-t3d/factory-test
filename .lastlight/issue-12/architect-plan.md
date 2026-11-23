# Architect plan — issue #12: Add a `snakeCase` helper to `src/case.js`

## Problem Statement

`src/case.js` (landed with #11) exports only `titleCase` (`src/case.js:18`) and a
private `capitalizeWord` helper (`src/case.js:27`). There is no snake_case
conversion. Issue #12 asks for `snakeCase(text)` that lowercases words and joins
them with `_`, splitting on spaces, dashes and camelCase boundaries
(`"helloWorld-foo bar"` → `"hello_world_foo_bar"`), with cases added to
`test/case.test.js` (currently ends at line 40). The change must be additive:
`titleCase` and its tests stay byte-for-byte unchanged, and a sibling camelCase
helper may later land in the same module.

## Summary

- Append an exported `snakeCase(text)` to the end of `src/case.js`, with JSDoc in
  the same style as `titleCase`.
- Extend the import in `test/case.test.js` and append `node:test` cases.
- No other files change (no `package.json`, no CI, no README).

## Files to modify (exhaustive)

| # | Path | Anchor | Change |
|---|------|--------|--------|
| 1 | `src/case.js` | after `capitalizeWord` (end of file, after line 33) | Append a blank line, JSDoc block, and `export function snakeCase(text)`. Do NOT touch lines 1–33. |
| 2 | `test/case.test.js` | line 3: `import { titleCase } from "../src/case.js";` | Change to `import { snakeCase, titleCase } from "../src/case.js";` |
| 3 | `test/case.test.js` | after the last test (end of file, after line 40) | Append the `snakeCase` tests listed under *Test strategy*. Do NOT modify existing `titleCase` tests. |

Set membership check: `src/` contains `case.js`, `slugify.js`; `test/` contains
`case.test.js`, `slugify.test.js`, `truncate.test.js`. Only `case.js` and
`case.test.js` belong to the touched module — no other members to update.
No sibling `camelCase` branch exists on the remote yet, so there is nothing to
merge with; keep the new code self-contained (no refactor of `titleCase`).

## Commands (from guardrails-report.md)

- Install: `npm install --no-package-lock` (no deps; keeps tree clean)
- Test (also the CI/gate command): `npm test`  (runs `node --test`)
- Lint: none configured — nothing to run
- Typecheck: none configured — nothing to run

## Implementation approach

1. In `src/case.js`, append:

```js
/**
 * Snake-case text: lowercase words joined by single underscores, so
 * "helloWorld-foo bar" becomes "hello_world_foo_bar".
 *
 * Words are split on runs of whitespace, dashes ("-") and underscores ("_"),
 * and at camelCase boundaries (a lowercase letter or digit followed by an
 * uppercase letter). Leading, trailing and repeated separators never produce
 * leading, trailing or doubled underscores, and input with no words returns "".
 * Already snake_cased input comes back unchanged.
 *
 * Any other character (punctuation, accented letters, emoji) is kept inside its
 * word as is. A run of capitals is not split, so "parseHTTPResponse" becomes
 * "parse_httpresponse".
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function snakeCase(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text
    .replace(/([\p{Ll}\p{Nd}])(\p{Lu})/gu, "$1 $2")
    .split(/[\s_-]+/u)
    .filter((word) => word !== "")
    .map((word) => word.toLowerCase())
    .join("_");
}
```

   Notes:
   - Boundary regex uses Unicode property escapes with the `u` flag, so
     non-ASCII camelCase (`"größeWert"` → `"größe_wert"`) works and surrogate
     pairs are never split.
   - Lowercasing happens after the camelCase split (the split needs the
     original case).
   - `-` is last in the character class so it is literal.
   - TypeError message matches `titleCase` exactly for consistency.
2. Update the test import and append the tests below.
3. Run `npm test`; all 34 existing tests plus the new ones must pass.
4. Commit as `feat(case): add a snakeCase helper (#12)`.

## Risks and edge cases

| Input | Behaviour | How the user is told |
|-------|-----------|----------------------|
| Non-string (`null`, `undefined`, number) | Throws `TypeError("text must be a string")` | Surfaced error (same as `titleCase`) |
| `""`, `"   "`, `"--__"` | Returns `""` | Documented in JSDoc; tested |
| Leading/trailing/repeated separators | Collapsed, no stray `_` | Documented; tested |
| Tabs/newlines | Treated as separators (`\s`) | Documented; tested |
| Underscores in input | Treated as separators → idempotent | Documented; tested |
| Acronym runs (`"parseHTTPResponse"`) | Not split: `"parse_httpresponse"` (out of scope per triage) | **Warn-and-surface**: limitation stated explicitly in JSDoc and pinned by a test, so any change is visible rather than silent |
| Other punctuation / accents / emoji | Kept verbatim inside the word (`"don't stop"` → `"don't_stop"`) — never dropped | Documented in JSDoc; tested, so no character silently disappears |
| Digit→uppercase (`"version2Beta"`) | Split: `"version2_beta"` | Tested |
| Uppercase→digit / letter→digit (`"html5"`) | Not split: `"html5"` | Tested implicitly by behaviour doc |

No input is silently dropped: every non-separator character appears in the
output, and the only failure mode (non-string) throws.

Landing-order risk: a future camelCase helper will also append to
`src/case.js`/`test/case.test.js`. Keeping this change purely appended (no edits
to existing lines except the one import line) minimises merge conflicts.

## Test strategy

Append to `test/case.test.js` (names prefixed with `snakeCase` to distinguish
from existing `titleCase` tests in the runner output):

```js
test("snakeCase splits on spaces, dashes and camelCase boundaries", () => {
  assert.equal(snakeCase("helloWorld-foo bar"), "hello_world_foo_bar");
});

test("snakeCase lowercases mixed-case and all-uppercase words", () => {
  assert.equal(snakeCase("Hello WORLD"), "hello_world");
  assert.equal(snakeCase("FOO-Bar"), "foo_bar");
});

test("snakeCase returns an empty string when there are no words", () => {
  assert.equal(snakeCase(""), "");
  assert.equal(snakeCase("   "), "");
  assert.equal(snakeCase("-_ -"), "");
});

test("snakeCase drops leading, trailing and repeated separators", () => {
  assert.equal(snakeCase("  hello -- world  "), "hello_world");
  assert.equal(snakeCase("-foo__bar-"), "foo_bar");
  assert.equal(snakeCase("foo\tbar\nbaz"), "foo_bar_baz");
});

test("snakeCase leaves snake_case input unchanged", () => {
  assert.equal(snakeCase("hello_world_foo"), "hello_world_foo");
});

test("snakeCase splits after a digit before an uppercase letter", () => {
  assert.equal(snakeCase("version2Beta"), "version2_beta");
});

test("snakeCase splits non-ASCII camelCase", () => {
  assert.equal(snakeCase("größeWert"), "größe_wert");
});

test("snakeCase keeps a run of capitals together", () => {
  assert.equal(snakeCase("parseHTTPResponse"), "parse_httpresponse");
});

test("snakeCase keeps other characters inside words", () => {
  assert.equal(snakeCase("don't Stop"), "don't_stop");
});

test("snakeCase throws a TypeError for non-string text", () => {
  assert.throws(() => snakeCase(null), TypeError);
  assert.throws(() => snakeCase(undefined), TypeError);
  assert.throws(() => snakeCase(42), TypeError);
});
```

Existing `titleCase` tests (lines 5–40) remain untouched and must still pass,
covering the "titleCase unchanged" acceptance criterion.

## Estimated complexity

simple
