import { test } from "node:test";
import assert from "node:assert/strict";
import { camelCase, snakeCase, swapCase, titleCase } from "../src/case.js";

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

test("camelCase joins words split on spaces, dashes and underscores", () => {
  assert.equal(camelCase("hello_world foo"), "helloWorldFoo");
  assert.equal(camelCase("foo-bar_baz qux"), "fooBarBazQux");
});

test("camelCase lowercases the first word and capitalises later words", () => {
  assert.equal(camelCase("HELLO_WORLD"), "helloWorld");
  assert.equal(camelCase("Hello wORLD"), "helloWorld");
});

test("camelCase returns an empty string when there are no words", () => {
  assert.equal(camelCase(""), "");
  assert.equal(camelCase("   "), "");
  assert.equal(camelCase("- _ -"), "");
});

test("camelCase drops leading, trailing and repeated separators", () => {
  assert.equal(camelCase("__hello--world  "), "helloWorld");
  assert.equal(camelCase(" -_foo _- bar_ "), "fooBar");
  assert.equal(camelCase("foo\tbar\nbaz"), "fooBarBaz");
});

test("camelCase does not split existing camel humps", () => {
  assert.equal(camelCase("helloWorld foo"), "helloworldFoo");
});

test("camelCase is the inverse of snakeCase for snake_case input", () => {
  assert.equal(camelCase(snakeCase("helloWorld-foo bar")), "helloWorldFooBar");
});

test("camelCase keeps other characters inside words", () => {
  assert.equal(camelCase("don't stop"), "don'tStop");
  assert.equal(camelCase("version 2nd"), "version2nd");
});

test("camelCase does not split a surrogate pair", () => {
  assert.equal(camelCase("a \u{10428}\u{10428}"), "a\u{10400}\u{10428}");
});

test("camelCase throws a TypeError for non-string text", () => {
  assert.throws(() => camelCase(null), TypeError);
  assert.throws(() => camelCase(undefined), TypeError);
  assert.throws(() => camelCase(42), TypeError);
});

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
