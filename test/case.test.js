import { test } from "node:test";
import assert from "node:assert/strict";
import { snakeCase, titleCase } from "../src/case.js";

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
  assert.equal(snakeCase("- _ -"), "");
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
  assert.equal(snakeCase("gr\u00f6\u00dfeWert"), "gr\u00f6\u00dfe_wert");
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
