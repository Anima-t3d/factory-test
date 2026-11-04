import { test } from "node:test";
import assert from "node:assert/strict";
import { truncate } from "../src/slugify.js";

test("returns text at most maxLength characters unchanged", () => {
  assert.equal(truncate("Hello", 10), "Hello");
  assert.equal(truncate("", 1), "");
});

test("returns a string of exactly maxLength characters unchanged", () => {
  assert.equal(truncate("Hello", 5), "Hello");
  assert.equal(truncate("Café", 4), "Café");
});

test("cuts at a word boundary and drops the trailing space", () => {
  const result = truncate("The quick brown fox", 10);
  assert.equal(result, "The quick…");
  assert.equal(result.length, 10);
  assert.ok(!/\s…$/.test(result));
});

test("rewinds to the last space instead of splitting a word", () => {
  const result = truncate("The quick brown fox", 12);
  assert.equal(result, "The quick…");
  assert.ok(result.length <= 12);
});

test("hard-cuts a single long word without spaces", () => {
  const result = truncate("Supercalifragilistic", 5);
  assert.equal(result, "Supe…");
  assert.equal(result.length, 5);
});

test("uses the whole budget for the ellipsis when maxLength is 1", () => {
  assert.equal(truncate("Hello", 1), "…");
});

test("throws a RangeError when maxLength is less than 1", () => {
  assert.throws(() => truncate("Hello", 0), RangeError);
  assert.throws(() => truncate("Hello", -3), RangeError);
});

test("throws a RangeError for a non-integer maxLength", () => {
  for (const maxLength of [1.5, NaN, Infinity, "5", null, undefined, true, {}]) {
    assert.throws(() => truncate("Hello", maxLength), RangeError);
  }
});

test("throws a TypeError for non-string text", () => {
  for (const text of [null, 42, ["a"], {}]) {
    assert.throws(() => truncate(text, 10), TypeError);
  }
});

test("never exceeds maxLength and never leaves whitespace before the ellipsis", () => {
  const texts = [
    "Hello world",
    "The quick brown fox",
    "Supercalifragilistic",
    "a  b   c",
    "  leading",
    "trailing  ",
    "😀 hi there",
    "",
  ];

  for (const text of texts) {
    for (let maxLength = 1; maxLength <= 20; maxLength += 1) {
      const result = truncate(text, maxLength);
      assert.ok(
        result.length <= maxLength,
        `"${text}" @ ${maxLength} produced "${result}" (${result.length})`,
      );
      assert.ok(
        !/\s…$/.test(result),
        `"${text}" @ ${maxLength} left whitespace before the ellipsis: "${result}"`,
      );
      if (text.length <= maxLength) {
        assert.equal(result, text);
      }
    }
  }
});

test("trims trailing punctuation before adding the ellipsis", () => {
  assert.equal(truncate("Hello, world", 7), "Hello…");
  assert.equal(truncate("Hello, world", 8), "Hello…");
  assert.equal(truncate("Wait; what; ok", 9), "Wait…");
  assert.equal(truncate("Really: yes indeed", 8), "Really…");
  assert.equal(truncate("Stop. Now please", 6), "Stop…");
  assert.equal(truncate("Okay..., fine", 8), "Okay…");
});

test("keeps punctuation on text that already fits", () => {
  assert.equal(truncate("Hello, world", 12), "Hello, world");
  assert.equal(truncate("Hello!", 6), "Hello!");
});
