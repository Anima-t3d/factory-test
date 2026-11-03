# Architect plan — issue #1: `slugify` optional `maxLength` at a word boundary

Branch: `lastlight/1-slugify-optional-maxlength-that-cuts-at-`
Repo: `Anima-t3d/factory-test`

## Problem Statement

`src/slugify.js:5` declares `slugify(text)` with a single parameter and always returns
the full slug built at `src/slugify.js:6-12` (`normalize` → accent strip → lowercase →
split on non-alphanumerics → `filter(Boolean)` → `join("-")`). There is no way for a
caller to cap the result: passing a second options argument today is silently ignored
(`slugify("Hello Big World", { maxLength: 9 })` returns `"hello-big-world"`), so
long titles cannot be turned into bounded URLs. The issue asks for an optional
`{ maxLength }` that truncates at a **word boundary**, keeps the current behaviour
byte-for-byte when the option is absent, hard-cuts a single over-long first word, and
rejects any non-positive-integer `maxLength` with a `RangeError`. `test/slugify.test.js`
currently covers only the four pre-existing behaviours (lines 5-19) and the doc comment
at `src/slugify.js:1-4` does not mention any option.

## Summary of what needs to change

1. `src/slugify.js` — accept a second `options` parameter, validate `maxLength` before
   doing any work, build the unchanged full slug, and then truncate it: keep whole
   leading words joined by `-` while the candidate stays `<= maxLength`; if no word
   fits at all, hard-slice the first word to `maxLength`. Extend the doc comment.
2. `test/slugify.test.js` — add tests for the four examples in the issue plus
   "no option = unchanged", boundary/length-invariant cases, and `RangeError`
   coverage for every invalid `maxLength` shape.

No new dependencies, no CI/workflow changes, no lint/typecheck tooling (none exists).

## Files to modify — exhaustive manifest

This repo has exactly one source module and one test file; there are no sibling
variants (no adapters, providers, locales, or barrel/index files) to update. Verified by
`ls -la src test`:

```
src/  -> slugify.js            (the only module)
test/ -> slugify.test.js       (the only test file)
```

| # | File | Anchor | Change |
| - | ---- | ------ | ------ |
| 1 | `src/slugify.js` | lines 1-4 (doc comment) | Document the new `options.maxLength`: positive integer, caps slug length, cuts at a word boundary (never ends with `-`), hard-cuts a single over-long first word, throws `RangeError` otherwise. Mention it is optional and that omitting it keeps today's behaviour. |
| 2 | `src/slugify.js` | line 5, `export function slugify(text)` | Change the signature to `export function slugify(text, options = {})` and add `const { maxLength } = options;` as the first statement. Do **not** change the `options = {}` default to `null`-tolerant logic — a `null` options argument surfaces a `TypeError` (see Risks). |
| 3 | `src/slugify.js` | new statement immediately after `const { maxLength } = options;` (before the slug is built) | Validate: `if (maxLength !== undefined && (!Number.isInteger(maxLength) \|\| maxLength <= 0)) throw new RangeError("maxLength must be a positive integer");`. Validation must run **before** any string work so invalid input never half-produces a slug. |
| 4 | `src/slugify.js` | lines 6-12 (the existing chain) | Leave the slug-building chain **textually unchanged**, including the literal combining-mark regex `/[\u0300-\u036f]/g` currently written as raw characters. Bind it to `const slug = ...;` instead of returning it directly. |
| 5 | `src/slugify.js` | new code after the chain, replacing `}` at line 13 | Add the truncation tail (see Implementation approach, step 4) and keep a single `export function` — no new exported helpers. |
| 6 | `test/slugify.test.js` | after line 19 (`returns an empty string when nothing is left`) | Append the new `test(...)` blocks listed in Test strategy. Do **not** modify or delete the existing four tests (lines 5-19) — they are the regression proof that the no-option path is unchanged. |
| 7 | `test/slugify.test.js` | line 2 (`import assert from "node:assert/strict";`) | No change needed: `assert.throws` and `assert.ok` are already available from that import. Listed so the executor does not add an import or a dependency. |

Explicitly **out of scope** (do not touch): `package.json`, `.github/workflows/test.yml`,
`README.md`, `AGENTS.md`, `.lastlight/**` (other than the harness's own status file).

## Commands

Copied from `.lastlight/issue-1/guardrails-report.md`:

```sh
# Install (already verified up to date; zero dependencies)
npm install --no-audit --no-fund

# Test — the only gate (CI `.github/workflows/test.yml` and AGENTS.md use this)
npm test
```

Linting: **ABSENT** (no eslint/biome/oxlint config or script) — do not add one.
Type checking: **ABSENT** (plain JS, no `tsconfig.json`) — do not add one.

## Implementation approach

Step-by-step, in `src/slugify.js`:

1. Extend the doc comment (lines 1-4) to describe the option, e.g. add lines stating:
   `@param {string} text`, `@param {{ maxLength?: number }} [options]`,
   `@returns {string}`, plus prose: "When `maxLength` is given the slug is at most
   `maxLength` characters, cut at a word boundary (whole trailing words are dropped and
   the result never ends with a dash). If the first word alone is longer than
   `maxLength`, it is cut at `maxLength`. `maxLength` must be a positive integer, else a
   `RangeError` is thrown. Omit it for the unchanged, uncapped behaviour."
2. `export function slugify(text, options = {}) {`
3. `const { maxLength } = options;`
4. Validation guard (exact code):
   ```js
   if (maxLength !== undefined && (!Number.isInteger(maxLength) || maxLength <= 0)) {
     throw new RangeError("maxLength must be a positive integer");
   }
   ```
5. Build the slug exactly as today, assigned to `const slug`:
   ```js
   const slug = text
     .normalize("NFKD")
     .replace(/[\u0300-\u036f]/g, "")
     .toLowerCase()
     .split(/[^a-z0-9]+/)
     .filter(Boolean)
     .join("-");
   ```
   (Keep the existing raw-character form of the combining-mark regex in the file if it
   is already there; do not "fix" the regex — it is out of scope.)
6. Early return for the uncapped or already-short case:
   ```js
   if (maxLength === undefined || slug.length <= maxLength) {
     return slug;
   }
   ```
7. Word-boundary truncation (exact code — greedy from the front, break at first miss):
   ```js
   const words = slug.split("-");
   let result = "";

   for (const word of words) {
     const candidate = result ? `${result}-${word}` : word;
     if (candidate.length > maxLength) {
       break;
     }
     result = candidate;
   }

   if (result) {
     return result;
   }

   // The first word alone is longer than maxLength: cut it.
   return words[0].slice(0, maxLength);
   ```
   Properties this guarantees: result length `<= maxLength`; never a trailing dash
   (words are alphanumeric, and a hard slice of an alphanumeric word cannot end in `-`);
   first word always kept when it fits; non-empty whenever the full slug is non-empty.

## Risks and edge cases

- **`maxLength` absent (`undefined`)** — must be *exactly* today's output. Guarded by
  the `maxLength !== undefined` check plus the early return; the four existing tests are
  the regression fence. Also accept an omitted `options` argument (`options = {}`).
- **`maxLength: null`** → `Number.isInteger(null)` is `false` → `RangeError` (surfaced,
  not silently treated as "no cap"). This is intentional: `null` is not `undefined`.
- **`maxLength` invalid shapes** — `0`, negative, fractional (`9.5`), `NaN`,
  `Infinity`, numeric string (`"9"`), `true`, `{}`: all throw `RangeError`. This is the
  **warn-and-surface** path: the caller gets an immediate, typed error before any string
  processing, never a silently clamped or ignored value.
- **`options` not an object (`null`, a number, a string)** — destructuring surfaces a
  `TypeError`. Surfaced, not swallowed; do not add a coercion or a silent fallback.
  Long strings as options are not "supported"; the thrown error is how the user is told.
- **Empty slug** (`slugify("!!!", { maxLength: 5 })`) — full slug is `""`, so the early
  return gives `""`. Correct: the issue only guarantees non-empty output when the full
  slug isn't empty. Do not invent a placeholder.
- **`maxLength >= slug.length`** — returns the full slug unchanged (no truncation, no
  extra dash).
- **Single over-long first word** (`"Supercalifragilistic"`, `maxLength: 5`) —
  `words = ["supercalifragilistic"]`, loop breaks immediately, `result` is `""`, so the
  hard-slice returns `"super"`.
- **Hard slice cannot split a UTF-16 surrogate pair or a dash** — the slug is ASCII
  `[a-z0-9-]` by construction, so `slice` is safe and dash-free at the tail.
- **Boundary off-by-one** (`maxLength: 9` vs `11` on `"hello-big-world"`) — candidate
  length is compared with `>` (not `>=`), so an exact fit is kept: `maxLength: 9` →
  `"hello-big"`, `maxLength: 11` → `"hello-big"` (adding `-world` would be 15).
- **Non-string `text`** — unchanged behaviour: `.normalize` throws `TypeError`. Out of
  scope, do not add coercion.
- **Dropped words are silent by design** — truncation is the requested feature, not a
  skipped input, so no warning is emitted; the length cap in the doc comment is the
  documented contract.

## Test strategy

Append to `test/slugify.test.js` (after line 19), keeping the existing four tests intact:

1. `"keeps behaviour unchanged without maxLength"` —
   `assert.equal(slugify("Hello Big World"), "hello-big-world")` and
   `assert.equal(slugify("Hello Big World", {}), "hello-big-world")` and
   `assert.equal(slugify("Hello Big World", { maxLength: undefined }), "hello-big-world")`.
2. `"cuts at a word boundary"` — `slugify("Hello Big World", { maxLength: 9 }) === "hello-big"`.
3. `"does not cut a word in half when it can drop it"` —
   `slugify("Hello Big World", { maxLength: 11 }) === "hello-big"`.
4. `"cuts a single over-long word at maxLength"` —
   `slugify("Supercalifragilistic", { maxLength: 5 }) === "super"`.
5. `"throws a RangeError for a non-positive maxLength"` —
   `assert.throws(() => slugify("Hello", { maxLength: 0 }), RangeError)`.
6. `"throws a RangeError for any invalid maxLength"` — loop/subtests over
   `-1, 1.5, NaN, Infinity, "9", null, true, {}` asserting `RangeError`.
7. `"returns the full slug when maxLength is not binding"` —
   `slugify("Hello Big World", { maxLength: 15 }) === "hello-big-world"` and a
   much larger value (e.g. `100`).
8. `"keeps an exact fit"` — `slugify("Hello Big World", { maxLength: 5 }) === "hello"`.
9. `"never exceeds maxLength and never ends with a dash"` — loop a few
   `(text, maxLength)` pairs (`"Hello Big World"` × `1,2,3,5,9,14,15`) asserting
   `result.length <= maxLength` and `!/^-|-$/.test(result)`.

Implementation detail: tests use only `node:test` and `node:assert/strict` (already
imported at lines 1-2); no new files, imports, or dependencies.

## Estimated complexity

**simple** — one small function plus its test file; ~20 lines of new source, ~60 lines of
tests, no new modules, no dependency or config changes.
