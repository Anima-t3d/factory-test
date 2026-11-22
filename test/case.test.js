import { test } from "node:test";
import assert from "node:assert/strict";
import { titleCase } from "../src/case.js";

test("uppercases the first letter and lowercases the rest", () => {
  assert.equal(titleCase("hello WORLD"), "Hello World");
  assert.equal(titleCase("hELLO"), "Hello");
  assert.equal(titleCase("a"), "A");
});

test("returns an empty string for an empty string", () => {
  assert.equal(titleCase(""), "");
});

test("preserves multiple, leading and trailing spaces", () => {
  assert.equal(titleCase("hello   WORLD"), "Hello   World");
  assert.equal(titleCase("  hello world  "), "  Hello World  ");
  assert.equal(titleCase("   "), "   ");
});

test("only splits words on spaces", () => {
  assert.equal(titleCase("jean-luc PICARD"), "Jean-luc Picard");
  assert.equal(titleCase("a\tB"), "A\tb");
});

test("leaves a non-letter first character as is", () => {
  assert.equal(titleCase("1ST place"), "1st Place");
});

test("does not split a surrogate pair", () => {
  assert.equal(titleCase("\u{10428}\u{10428}"), "\u{10400}\u{10428}");
});

test("throws a TypeError for non-string text", () => {
  for (const text of [null, undefined, 42, ["a"], {}]) {
    assert.throws(() => titleCase(text), TypeError);
  }
});
