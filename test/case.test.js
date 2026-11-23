import { test } from "node:test";
import assert from "node:assert/strict";
import { titleCase } from "../src/case.js";

test("uppercases the first letter of each word and lowercases the rest", () => {
  assert.equal(titleCase("hello WORLD"), "Hello World");
  assert.equal(titleCase("hELLO"), "Hello");
});

test("returns an empty string for an empty string", () => {
  assert.equal(titleCase(""), "");
});

test("keeps multiple consecutive spaces", () => {
  assert.equal(titleCase("hello   WORLD"), "Hello   World");
});

test("keeps leading and trailing spaces", () => {
  assert.equal(titleCase("  hello world "), "  Hello World ");
  assert.equal(titleCase("   "), "   ");
});

test("only splits words on spaces", () => {
  assert.equal(titleCase("foo\tBAR"), "Foo\tbar");
  assert.equal(titleCase("jean-PAUL o'NEIL"), "Jean-paul O'neil");
});

test("leaves a non-letter first character as is", () => {
  assert.equal(titleCase("1ST place"), "1st Place");
});

test("does not split a surrogate pair", () => {
  assert.equal(titleCase("\u{10428}\u{10428}"), "\u{10400}\u{10428}");
});

test("throws a TypeError for non-string text", () => {
  assert.throws(() => titleCase(null), TypeError);
  assert.throws(() => titleCase(undefined), TypeError);
  assert.throws(() => titleCase(42), TypeError);
});
