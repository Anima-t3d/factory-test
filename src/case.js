/**
 * Title-case text: uppercase the first character of each word and lowercase
 * the rest, so "hello WORLD" becomes "Hello World".
 *
 * Words are separated by spaces (U+0020) only, and spacing is preserved:
 * runs of spaces, and leading or trailing spaces, are kept as they are.
 * Tabs and newlines are ordinary characters, not word boundaries.
 * The first character is taken by code point, so astral letters are
 * upper-cased whole. Case mapping uses `String#toUpperCase` and
 * `String#toLowerCase`, so locale-specific rules (e.g. Turkish dotted I)
 * are not applied and a first letter like "ß" becomes "SS".
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function titleCase(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text.split(" ").map(capitalize).join(" ");
}

/** Uppercase the first code point of a word and lowercase the rest. */
function capitalize(word) {
  if (word === "") {
    return word;
  }
  const first = String.fromCodePoint(word.codePointAt(0));
  return first.toUpperCase() + word.slice(first.length).toLowerCase();
}
