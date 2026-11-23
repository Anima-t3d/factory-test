/**
 * Title-case text: the first character of each space-separated word is
 * uppercased and the rest of the word is lowercased, so "hello WORLD" becomes
 * "Hello World".
 *
 * Only U+0020 separates words, and every space is kept: leading, trailing and
 * repeated spaces come back exactly as given. Tabs, newlines, hyphens and
 * apostrophes are ordinary characters inside a word, so "o'NEIL" becomes
 * "O'neil" and "foo\tBAR" becomes "Foo\tbar". Case mapping uses
 * `String#toUpperCase`/`toLowerCase`, so a character can change length
 * ("ß" uppercases to "SS"). The first character is taken by code point, so a
 * surrogate pair is never split.
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function titleCase(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text.split(" ").map(capitalizeWord).join(" ");
}

/** Uppercase the first code point of a word and lowercase the rest. */
function capitalizeWord(word) {
  if (word === "") {
    return word;
  }
  const first = String.fromCodePoint(word.codePointAt(0));
  return first.toUpperCase() + word.slice(first.length).toLowerCase();
}
