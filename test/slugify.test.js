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
