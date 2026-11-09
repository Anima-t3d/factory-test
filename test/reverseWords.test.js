import { test } from "node:test";
import assert from "node:assert/strict";
import { reverseWords } from "../src/slugify.js";

test("returns an empty string for an empty string", () => {
  assert.equal(reverseWords(""), "");
});

test("returns an empty string for whitespace-only text", () => {
  assert.equal(reverseWords(" "), "");
  assert.equal(reverseWords("   "), "");
  assert.equal(reverseWords(" \t\n "), "");
});

test("returns a single word unchanged", () => {
  assert.equal(reverseWords("hello"), "hello");
  assert.equal(reverseWords("  hello \n"), "hello");
});

test("reverses several words separated by mixed whitespace", () => {
  assert.equal(reverseWords("one \t two\n three"), "three two one");
  assert.equal(reverseWords("  a  b\r\nc  "), "c b a");

  const mixed = reverseWords("  a  b\r\nc  ");
  assert.ok(!mixed.includes("\t"));
  assert.ok(!mixed.includes("\n"));
  assert.ok(!mixed.includes("  "));
});

test("keeps characters within a word in order", () => {
  assert.equal(reverseWords("Hello, world!"), "world! Hello,");
});

test("throws a TypeError for non-string text", () => {
  for (const value of [null, undefined, 42, ["a", "b"], {}]) {
    assert.throws(() => reverseWords(value), TypeError);
  }
});
