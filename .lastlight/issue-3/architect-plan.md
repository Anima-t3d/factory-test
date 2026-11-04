# Architect plan — issue #3: Add a `truncate` helper

Branch: `lastlight/3-add-a-truncate-helper`
Repo: `Anima-t3d/factory-test`
Issue: https://github.com/Anima-t3d/factory-test/issues/3

## Problem Statement

`src/slugify.js:5-13` exports a single function, `slugify(text)`, which always returns
the full slug built by the chain at `src/slugify.js:6-12`. There is no way to shorten
arbitrary display text, so callers must hand-roll truncation. The issue asks for a
named export `truncate(text, maxLength)` "next to `slugify`, exported the same way",
with a doc comment, that returns short text unchanged, marks a cut with one `…`
(U+2026), avoids splitting a word when a space precedes the cut, hard-cuts a single
over-long word, and throws `RangeError` when `maxLength < 1`. `test/slugify.test.js:1-19`
covers only the four existing `slugify` behaviours; `package.json:8` runs
`node --test`, and `.github/workflows/test.yml` runs exactly `npm test`.

## Summary of what needs to change

1. `src/slugify.js` — append a JSDoc comment and `export function truncate(text, maxLength)`
   after the existing `slugify` function. `slugify` itself is not touched.
2. `test/truncate.test.js` — new test file using the repo's existing runner
   (`node:test` + `node:assert/strict`), covering the five scenarios the issue names
   plus the edge cases/contract invariants this plan resolves.
3. No other source, test, config, dependency, README or CI changes.

**Contract resolution (important, read before implementing).** Two sentences in the
issue cannot both hold in the general case: "the result including `…` is exactly
`maxLength`" and "rewind to the last space and drop it" are mathematically
incompatible whenever the last space is before index `maxLength - 1`. Rewinding to a
space at index `s` yields `text.slice(0, s) + "…"`, whose length is `s + 1 ≤ maxLength - 1`.
Only a cut that is already at a word boundary (the cut lands exactly on the space) or a
hard cut (no space before the cut) can be exactly `maxLength`. This plan **prioritises
the word-boundary rule** (the issue states it explicitly and forbids mid-word cuts) and
guarantees:

- `result.length <= maxLength` always;
- `result.length === maxLength` for every hard cut and every boundary cut;
- the result is shorter than `maxLength` only when rewinding to a space (or trimming
  trailing whitespace) is required to avoid splitting a word or emitting a trailing
  space before `…`.

This is documented in the function's JSDoc and exercised by a test. The executor must
state this trade-off in the executor summary and PR body so the reviewer sees it was a
deliberate resolution, not an oversight. Do **not** silently drop the word-boundary
rule to make lengths exact.

## Files to modify — exhaustive manifest

There is exactly one source module and one pre-existing test file; there are no
barrels/indexes, adapters, providers, locales, or other sibling variants. Verified with
`ls src test`:

```
src/slugify.js
test/slugify.test.js
```

| # | File | Anchor | Change |
| - | ---- | ------ | ------ |
| 1 | `src/slugify.js` | after line 13 (`}` closing `slugify`), end of file | Append the module-private surrogate predicates, the JSDoc block, and `export function truncate(text, maxLength)` exactly as specified in Implementation approach. Leave lines 1-13 byte-identical. |
| 2 | `test/truncate.test.js` | new file | Create it with the tests listed in Test strategy. Imports: `import { test } from "node:test";`, `import assert from "node:assert/strict";`, `import { truncate } from "../src/slugify.js";`. No new dependencies. |
| 3 | `test/slugify.test.js` | whole file (lines 1-19) | **NO CHANGE.** Listed explicitly so the executor does not touch, rewrite, or "helpfully" extend it. It is the regression fence for `slugify`. |
| 4 | `package.json` | line 8 (`"test": "node --test"`) | **NO CHANGE.** Node's runner auto-discovers `test/truncate.test.js`; no script, dependency or engine edit is needed. |
| 5 | `.github/workflows/test.yml` | whole file | **NO CHANGE.** CI already runs `npm test`. |
| 6 | `README.md` | whole file | **NO CHANGE.** Documentation updates were not requested; keep the change focused. |

Explicitly out of scope: `package.json`, `.github/workflows/**`, `README.md`,
`AGENTS.md`, and `.lastlight/**` other than the harness's own status/summary files.
No lockfile, no new dependencies.

## Commands

Copied from `.lastlight/issue-3/guardrails-report.md`:

```sh
# Gate — exact command from .git/lastlight-gate.sh, .github/workflows/test.yml and AGENTS.md
npm test

# Optional install check (already verified; repo has zero dependencies)
npm install --no-audit --no-fund
```

- Linting: **ABSENT** (no eslint/biome/prettier/oxlint config or script) — do not add one.
- Type checking: **ABSENT** (plain JS, no `tsconfig.json`) — do not add one.

`npm test` must exit 0. Expected: the 4 existing `slugify` tests plus the new
`truncate` tests all pass.

## Implementation approach

### Step 1 — `src/slugify.js`: append after line 13

Add the two module-private helpers (do **not** export them):

```js
const isHighSurrogate = (codeUnit) => codeUnit >= 0xd800 && codeUnit <= 0xdbff;
const isLowSurrogate = (codeUnit) => codeUnit >= 0xdc00 && codeUnit <= 0xdfff;
```

Then add the doc comment and function. This reference implementation satisfies every
invariant in this plan; implement it as written unless a genuine bug is found:

```js
/**
 * Shorten display text to at most `maxLength` characters, marking a cut with "…".
 *
 * Text that already fits is returned unchanged. Otherwise the result ends with
 * U+2026 ("…") and is exactly `maxLength` characters long when the cut is at a
 * word boundary or has no preceding space to rewind to. When the cut would split
 * a word, it moves back to the last space (U+0020) before the cut, that space is
 * dropped, and "…" is appended; the result can then be shorter than `maxLength`,
 * but is never longer and never ends with whitespace before the ellipsis.
 *
 * `maxLength` is measured in UTF-16 code units, the same unit as `String#length`,
 * and must be a positive integer. A cut that would split a surrogate pair is moved
 * back one code unit, so a lone surrogate is never returned. Only U+0020 is
 * treated as a word boundary; tabs and newlines are ordinary characters.
 *
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 * @throws {RangeError} when `maxLength` is not a positive integer
 */
export function truncate(text, maxLength) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }
  // The issue only mandates maxLength < 1; non-integers are rejected too so that
  // NaN, Infinity, "5", null and friends surface instead of silently misbehaving.
  if (!Number.isInteger(maxLength) || maxLength < 1) {
    throw new RangeError("maxLength must be a positive integer");
  }

  if (text.length <= maxLength) {
    return text;
  }

  const ellipsis = "…";
  let keep = maxLength - 1;

  // Never leave half of a surrogate pair at the cut.
  if (
    keep > 0 &&
    isHighSurrogate(text.charCodeAt(keep - 1)) &&
    isLowSurrogate(text.charCodeAt(keep))
  ) {
    keep -= 1;
  }

  const head = text.slice(0, keep);
  const next = text[keep];
  const last = keep > 0 ? text[keep - 1] : "";
  const splitsWord = keep > 0 && next !== " " && last !== " ";

  if (splitsWord) {
    const lastSpace = head.lastIndexOf(" ");
    const atSpace = lastSpace > 0 ? head.slice(0, lastSpace).trimEnd() : "";
    if (atSpace !== "") {
      return `${atSpace}${ellipsis}`;
    }
  }

  return `${head.trimEnd()}${ellipsis}`;
}
```

Why each guard exists:

- `typeof text` check: guarantees the return value is a string for every supported
  input; non-strings are surfaced with `TypeError` instead of returning an array or
  throwing an incidental error deep inside.
- `Number.isInteger(maxLength)` check: `maxLength < 1` alone lets `NaN`, a numeric
  string, `null`, `undefined` and `Infinity` through and produce nonsense. These are
  surfaced as `RangeError` (see Risks).
- `keep = maxLength - 1`: one code unit is reserved for `…`, so a hard cut is exactly
  `maxLength`. `maxLength === 1` gives `keep === 0` and the result `"…"`.
- surrogate backoff: prevents a lone high/low surrogate when the cut falls inside an
  astral character (e.g. an emoji).
- `splitsWord`: only rewind when the boundary actually cuts a word. If the first
  dropped character is a space, or the last kept character is a space, the cut is
  already at a boundary and is used as-is. This is what makes
  `truncate("The quick brown fox", 10) === "The quick…"` (exact length 10) rather
  than naively rewinding to the first space.
- `atSpace !== ""`: if the only space before the cut is at index 0 (leading
  whitespace) rewinding would erase all content; fall through to the hard cut instead.
- `trimEnd()` on every returned content fragment: never emit whitespace immediately
  before `…`, including runs of spaces and tabs/newlines.

### Step 2 — `test/truncate.test.js`: create the file

Use the test list in Test strategy. Keep the style of `test/slugify.test.js`:
`test("…", () => { … })`, `node:assert/strict`, no `describe`, no dependencies.

### Step 3 — run the gate

```sh
npm test
```

Confirm exit 0 and that the new tests appear in the output. Do not modify the four
existing tests to make anything pass.

## Risks and edge cases

- **Conflict between "exactly `maxLength`" and "rewind to the last space"** — the
  central risk; see Contract resolution above. Handling: word-boundary wins, length is
  `<= maxLength` always, exact whenever no rewind/trim is needed, and the JSDoc + a
  test say so. This is **warn-and-surface by documentation**: the executor must call it
  out in the summary/PR body; it must not be silently ignored.
- **`maxLength === 1`** — `keep === 0`, so any longer text becomes `"…"` (exactly one
  character). That is the only possible result that honours the contract. Tested.
- **`maxLength < 1` (`0`, negatives)** — `RangeError`, before any string work.
- **`maxLength` non-integer / wrong shape** (`1.5`, `NaN`, `Infinity`, `"5"`, `null`,
  `undefined`, `true`, `{}`) — `RangeError`. The issue only names `< 1`, but silently
  coercing these would produce garbage (`NaN` comparisons, string slicing) or return a
  non-string. **Warn-and-surface**: typed error, no silent clamp/coercion. Tested.
- **`text` not a string** (`null`, number, array, object) — `TypeError("text must be a
  string")`. **Warn-and-surface**; no coercion. Without this check a short array would
  be returned unchanged, silently violating the `=> string` contract. Tested.
- **`text` already fits** (`text.length <= maxLength`, including the empty string and
  an exact-length string) — returned unchanged, no ellipsis. Tested.
- **Cut lands exactly on a space** (`"The quick brown fox"`, `maxLength: 10`) — the
  space is not included; result `"The quick…"`, exact length 10. Tested.
- **Cut splits a word** (`"The quick brown fox"`, `maxLength: 12`) — rewind to the last
  space, drop it, append `…`: `"The quick…"` (10). Shorter than `maxLength` by
  necessity; tested with a `<= maxLength` invariant assertion.
- **Single long word, no spaces** (`"Supercalifragilistic"`, `5`) — hard cut
  `"Supe…"`, exactly 5. Tested.
- **Space only after the cut point** (`"Hello world"`, `5`) — no space *before* the
  cut, so hard cut `"Hell…"`; do not search past the cut. Tested via the sweep.
- **Leading whitespace / whitespace-only text** (`"  leading"`, `"   "`) — never
  rewind to index 0 (which would return `"…"` and discard visible text); fall back to
  the hard cut, then `trimEnd()`. `"  leading"` with `maxLength: 4` → `"  l…"`;
  whitespace-only long text → `"…"`. Documented in JSDoc; covered by the sweep.
- **Multiple spaces before the cut** (`"ab  cd ef"`, `6`) — rewind to the last space
  and `trimEnd()`, giving `"ab…"`; no trailing space before `…`.
- **Tabs/newlines** — not word boundaries (only U+0020 is). They never survive
  immediately before `…` because of `trimEnd()`. Documented limitation, no silent
  corruption.
- **Astral characters / emoji** — length is counted in UTF-16 code units; a cut that
  would split a surrogate pair is moved back one unit, so no lone surrogate is
  returned (the result may be `maxLength - 1`). Grapheme clusters (ZWJ emoji, flag
  pairs, combining marks) can still be split between code points; this is documented
  in the JSDoc. No warning channel exists in this library, so the doc comment is the
  surfaced contract.
- **Existing `slugify` behaviour** — untouched; the four tests in
  `test/slugify.test.js:5-19` are the regression proof.
- **No new dependencies, no CI changes, no lockfile** — out of scope; the new test
  file is auto-discovered by `node --test`.

## Test strategy

Create `test/truncate.test.js` with these tests (names and assertions may be copied
verbatim; adjust only if an assertion is demonstrably wrong):

1. `"returns text at most maxLength characters unchanged"` —
   `truncate("Hello", 10) === "Hello"`, `truncate("", 1) === ""`.
2. `"returns a string of exactly maxLength characters unchanged"` —
   `truncate("Hello", 5) === "Hello"`, `truncate("Café", 4) === "Café"` (no ellipsis).
3. `"cuts at a word boundary and drops the trailing space"` —
   `truncate("The quick brown fox", 10) === "The quick…"` and
   `assert.equal(result.length, 10)`, plus `!/\s…$/.test(result)`.
4. `"rewinds to the last space instead of splitting a word"` —
   `truncate("The quick brown fox", 12) === "The quick…"` and
   `assert.ok(result.length <= 12)` (documents the contract resolution).
5. `"hard-cuts a single long word without spaces"` —
   `truncate("Supercalifragilistic", 5) === "Supe…"` and `assert.equal(result.length, 5)`.
6. `"uses the whole budget for the ellipsis when maxLength is 1"` —
   `truncate("Hello", 1) === "…"`.
7. `"throws a RangeError when maxLength is less than 1"` —
   `assert.throws(() => truncate("Hello", 0), RangeError)` and same for `-3`.
8. `"throws a RangeError for a non-integer maxLength"` — loop over
   `[1.5, NaN, Infinity, "5", null, undefined, true, {}]` asserting `RangeError`.
9. `"throws a TypeError for non-string text"` — loop over `[null, 42, ["a"], {}]`
   asserting `TypeError`.
10. `"never exceeds maxLength and never leaves whitespace before the ellipsis"` — for
    each text in `["Hello world", "The quick brown fox", "Supercalifragilistic",
    "a  b   c", "  leading", "trailing  ", "😀 hi there", ""]` and each
    `maxLength` from 1 to 20: assert `result.length <= maxLength`,
    `!/\s…$/.test(result)`, and when `text.length <= maxLength` assert
    `result === text`.

All tests use only `node:test` and `node:assert/strict` (already available, no new
imports beyond those two plus `truncate`). No test may be skipped, deleted, or
weakened.

## Estimated complexity

**simple** — one function (~35 lines including JSDoc and two tiny predicates) added to
the existing module, plus one new test file (~90 lines). No new modules, dependencies,
configuration or CI changes; the only subtlety is the documented exact-length vs
word-boundary trade-off.
