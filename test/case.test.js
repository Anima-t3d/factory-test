import { test } from "node:test";
import assert from "node:assert/strict";
import { titleCase } from "../src/case.js";

test("title-cases each space-separated word", () => {
  assert.equal(titleCase("hello WORLD"), "Hello World");
});

test("returns an empty string unchanged", () => {
  assert.equal(titleCase(""), "");
});

test("preserves runs of multiple consecutive spaces", () => {
  assert.equal(titleCase("hello   wORLD"), "Hello   World");
});

test("preserves leading and trailing spaces", () => {
  assert.equal(titleCase("  hello world  "), "  Hello World  ");
});

test("leaves already title-cased and single-letter words intact", () => {
  assert.equal(titleCase("Hello"), "Hello");
  assert.equal(titleCase("HELLO"), "Hello");
  assert.equal(titleCase("a"), "A");
});

test("lowercases the rest when the first character is not a letter", () => {
  assert.equal(titleCase("123ABC"), "123abc");
});

test("treats only U+0020 as a word boundary", () => {
  assert.equal(titleCase("hello\tWORLD"), "Hello\tworld");
});

test("throws a TypeError for non-string text", () => {
  assert.throws(() => titleCase(null), TypeError);
  assert.throws(() => titleCase(undefined), TypeError);
  assert.throws(() => titleCase(42), TypeError);
});
