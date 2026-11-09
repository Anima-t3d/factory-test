import { test } from "node:test";
import assert from "node:assert/strict";
import { wordCount } from "../src/slugify.js";

test("returns 0 for an empty string", () => {
  assert.equal(wordCount(""), 0);
});

test("returns 0 for a string of only whitespace", () => {
  assert.equal(wordCount("   "), 0);
  assert.equal(wordCount(" \t\n\r\n  "), 0);
});

test("counts a single word", () => {
  assert.equal(wordCount("hello"), 1);
  assert.equal(wordCount("  hello\n"), 1);
});

test("counts several words separated by mixed whitespace", () => {
  assert.equal(wordCount("one two three"), 3);
  assert.equal(wordCount("one\ttwo\nthree   four\r\nfive"), 5);
  assert.equal(wordCount("\t  leading and trailing  \n"), 3);
});

test("treats punctuation as part of a word", () => {
  assert.equal(wordCount("Hello, world! it's-fine"), 3);
});

test("throws a TypeError for non-string text", () => {
  for (const value of [undefined, null, 42, true, {}, [], ["a b"], new String("a b")]) {
    assert.throws(() => wordCount(value), TypeError);
  }
});
