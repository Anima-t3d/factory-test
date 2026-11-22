/**
 * Title-case text: the first character of each space-separated word is uppercased
 * and the rest of the word is lowercased, so "hello WORLD" becomes "Hello World".
 *
 * Only U+0020 separates words, and spacing is kept exactly as given: leading,
 * trailing and repeated spaces are preserved. Tabs, newlines, hyphens and other
 * punctuation are ordinary characters, so "jean-luc" becomes "Jean-luc". The first
 * character is taken by code point, so a surrogate pair is never split. Case
 * mapping uses `toUpperCase`/`toLowerCase`, which can change length ("ß" → "SS").
 * An empty string returns an empty string.
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

function capitalize(word) {
  if (word === "") {
    return word;
  }
  const first = String.fromCodePoint(word.codePointAt(0));
  return first.toUpperCase() + word.slice(first.length).toLowerCase();
}
