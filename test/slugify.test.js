import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../src/slugify.js";

test("joins words with dashes", () => {
  assert.equal(slugify("Hello World"), "hello-world");
});

test("strips accents", () => {
  assert.equal(slugify("Café Crème"), "cafe-creme");
});

test("drops leading, trailing and repeated separators", () => {
  assert.equal(slugify("  --Agent   Factory!! "), "agent-factory");
});

test("returns an empty string when nothing is left", () => {
  assert.equal(slugify("!!!"), "");
});

test("keeps behaviour unchanged without maxLength", () => {
  assert.equal(slugify("Hello Big World"), "hello-big-world");
  assert.equal(slugify("Hello Big World", {}), "hello-big-world");
  assert.equal(slugify("Hello Big World", { maxLength: undefined }), "hello-big-world");
});

test("cuts at a word boundary", () => {
  assert.equal(slugify("Hello Big World", { maxLength: 9 }), "hello-big");
});

test("does not cut a word in half when it can drop it", () => {
  assert.equal(slugify("Hello Big World", { maxLength: 11 }), "hello-big");
});

test("cuts a single over-long word at maxLength", () => {
  assert.equal(slugify("Supercalifragilistic", { maxLength: 5 }), "super");
});

test("throws a RangeError for a non-positive maxLength", () => {
  assert.throws(() => slugify("Hello", { maxLength: 0 }), RangeError);
});

test("throws a RangeError for any invalid maxLength", () => {
  for (const maxLength of [-1, 1.5, NaN, Infinity, "9", null, true, {}]) {
    assert.throws(
      () => slugify("Hello", { maxLength }),
      RangeError,
      `expected RangeError for maxLength ${String(maxLength)}`,
    );
  }
});

test("returns the full slug when maxLength is not binding", () => {
  assert.equal(slugify("Hello Big World", { maxLength: 15 }), "hello-big-world");
  assert.equal(slugify("Hello Big World", { maxLength: 100 }), "hello-big-world");
});

test("returns the full slug unchanged when maxLength is longer than the slug", () => {
  assert.equal(slugify("Hello Big World", { maxLength: 16 }), "hello-big-world");
  assert.equal(slugify("Hello Big World", { maxLength: 50 }), "hello-big-world");
});

test("keeps an exact fit", () => {
  assert.equal(slugify("Hello Big World", { maxLength: 5 }), "hello");
});

test("never exceeds maxLength and never ends with a dash", () => {
  for (const maxLength of [1, 2, 3, 5, 9, 14, 15]) {
    const result = slugify("Hello Big World", { maxLength });
    assert.ok(
      result.length <= maxLength,
      `expected length <= ${maxLength}, got ${result.length} for ${JSON.stringify(result)}`,
    );
    assert.ok(!/^-|-$/.test(result), `expected no leading/trailing dash in ${JSON.stringify(result)}`);
  }
});

