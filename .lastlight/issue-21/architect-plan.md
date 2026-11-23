# Architect plan — issue #21

## Problem Statement

`src/case.js` exports `titleCase` (src/case.js:18), `snakeCase` (src/case.js:56)
and `camelCase` (src/case.js:89) but has no helper that inverts letter case.
Issue #21 asks for `swapCase(text)` that flips the case of every letter
(`"Hello World"` -> `"hELLO wORLD"`), with tests in `test/case.test.js`, and
"No other files". Note: the issue *title* says "reverseCase" but the body and
triage notes both name the function `swapCase` — implement `swapCase` only.

## Summary

Append one exported function `swapCase` to the end of `src/case.js` and append
`swapCase` tests to the end of `test/case.test.js` (plus extend its import).
No other files change. Purely additive; existing exports untouched.

## Files to modify (exhaustive)

1. `src/case.js` — append after the end of `camelCase` (after line 100, EOF):

```js

/**
 * Swap-case text: every uppercase letter is lowercased and every other
 * character is uppercased, so "Hello World" becomes "hELLO wORLD".
 *
 * Characters with no case (digits, spaces, punctuation, emoji) come back
 * unchanged. Text is walked by code point, so a surrogate pair is never split.
 * Case mapping uses `String#toUpperCase`/`toLowerCase`, so a character can
 * change length ("ß" becomes "SS").
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function swapCase(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return Array.from(text, (char) => {
    const upper = char.toUpperCase();
    return char === upper ? char.toLowerCase() : upper;
  }).join("");
}
```

2. `test/case.test.js`
   - Line 3: change the import to
     `import { camelCase, snakeCase, swapCase, titleCase } from "../src/case.js";`
   - Append at EOF (after line 132):

```js

test("swapCase inverts the case of every letter", () => {
  assert.equal(swapCase("Hello World"), "hELLO wORLD");
  assert.equal(swapCase("hELLO wORLD"), "Hello World");
});

test("swapCase returns an empty string for an empty string", () => {
  assert.equal(swapCase(""), "");
});

test("swapCase leaves characters without case unchanged", () => {
  assert.equal(swapCase("a1-B_c! 🙂"), "A1-b_C! 🙂");
});

test("swapCase handles non-ASCII letters and surrogate pairs", () => {
  assert.equal(swapCase("Éa"), "éA");
  assert.equal(swapCase("\u{10428}\u{10400}"), "\u{10400}\u{10428}");
});

test("swapCase throws a TypeError for non-string text", () => {
  assert.throws(() => swapCase(null), TypeError);
  assert.throws(() => swapCase(undefined), TypeError);
  assert.throws(() => swapCase(42), TypeError);
});
```

No README, package.json, workflow or other file changes (issue says "No other files").

## Commands

- Test (gate): `npm test`
- Targeted: `node --test test/case.test.js`
- Lint: none configured. Typecheck: none configured.

## Implementation approach

1. Paste the `swapCase` block at the end of `src/case.js`.
2. Update the import on line 3 of `test/case.test.js` and append the five tests.
3. Run `npm test`; expect 58 passing (53 existing + 5 new), 0 failing.
4. Commit: `feat(case): add swapCase helper (#21)`.

## Risks and edge cases

- Non-string input: surfaced as `TypeError("text must be a string")`, matching siblings.
- Characters without case: returned unchanged by design (documented, tested).
- Length-changing mappings (`ß` -> `SS`, `İ` -> `i̇`): follow `String#toUpperCase`/
  `toLowerCase`, documented in the JSDoc like `titleCase`; so `swapCase` is not
  always its own inverse. Not tested further because it is engine-defined.
- Titlecase digraphs (e.g. `ǅ`): uppercased (`Ǆ`) because they are not equal to
  their uppercase form; covered by the JSDoc rule "every other character is uppercased".
- Surrogate pairs: `Array.from` iterates by code point; tested with Deseret.
- No input is silently dropped: every code point maps to an output string.

## Test strategy

Unit tests in `test/case.test.js` (above): basic inversion both ways, empty
string, uncased passthrough, non-ASCII + surrogate pair, TypeError. Full suite
via `npm test`.

## Estimated complexity

simple
