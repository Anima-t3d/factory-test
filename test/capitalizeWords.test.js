import { test } from "node:test";
import assert from "node:assert/strict";
import { capitalizeWords } from "../src/slugify.js";

test("returns an empty string unchanged", () => {
  assert.equal(capitalizeWords(""), "");
});

test("upper-cases the first character of a single word", () => {
  assert.equal(capitalizeWords("hello"), "Hello");
  assert.equal(capitalizeWords("Hello"), "Hello");
});

test("upper-cases every word and keeps the whitespace exactly", () => {
  assert.equal(capitalizeWords("hello world"), "Hello World");
  assert.equal(
    capitalizeWords("  hello \t world\n\nfoo  "),
    "  Hello \t World\n\nFoo  ",
  );
});

test("leaves capitals inside a word untouched", () => {
  assert.equal(capitalizeWords("iPhone"), "IPhone");
  assert.equal(capitalizeWords("my iPhone and macOS"), "My IPhone And MacOS");
  assert.equal(capitalizeWords("hELLO"), "HELLO");
});

test("preserves the whitespace of the input", () => {
  const inputs = [
    " hello world ",
    "a  b\tc\nd\r\ne",
    "   ",
    "\t\n",
  ];

  for (const input of inputs) {
    const result = capitalizeWords(input);
    assert.equal(
      result.replace(/\S/gu, ""),
      input.replace(/\S/gu, ""),
      `whitespace changed for "${input}" -> "${result}"`,
    );
    assert.equal(result.toLowerCase(), input.toLowerCase());
    assert.equal(result.length, input.length);
  }
});

test("starts a new word only after whitespace", () => {
  assert.equal(capitalizeWords("foo-bar don't"), "Foo-bar Don't");
});

test("leaves a first character without an upper-case form alone", () => {
  assert.equal(capitalizeWords("(hello) 3d world"), "(hello) 3d World");
});

test("treats non-ASCII whitespace as a word boundary and keeps it", () => {
  assert.equal(capitalizeWords("a\u00a0b"), "A\u00a0B");
});

test("upper-cases an astral first character as a whole code point", () => {
  assert.equal(capitalizeWords("𐐨x"), "𐐀x");
});

test("documents that upper-casing can make the result longer", () => {
  assert.equal(capitalizeWords("ßtraße"), "SStraße");
});

test("throws a TypeError for non-string text", () => {
  for (const text of [null, undefined, 42, true, {}, ["a"], new String("a")]) {
    assert.throws(() => capitalizeWords(text), TypeError);
  }
});
