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

/**
 * Snake-case text: lowercase words joined by single underscores, so
 * "helloWorld-foo bar" becomes "hello_world_foo_bar".
 *
 * Words are split on runs of whitespace, dashes ("-") and underscores ("_"),
 * and at camelCase boundaries (a lowercase letter or digit followed by an
 * uppercase letter). Leading, trailing and repeated separators never produce
 * leading, trailing or doubled underscores, and input with no words returns "".
 * Already snake_cased input comes back unchanged.
 *
 * Any other character (punctuation, accented letters, emoji) is kept inside its
 * word as is. A run of capitals is not split, so "parseHTTPResponse" becomes
 * "parse_httpresponse".
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function snakeCase(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text
    .replace(/([\p{Ll}\p{Nd}])(\p{Lu})/gu, "$1 $2")
    .split(/[\s_-]+/u)
    .filter((word) => word !== "")
    .map((word) => word.toLowerCase())
    .join("_");
}

/**
 * Camel-case text: the first word lowercased and every later word capitalised,
 * joined with no separator, so "hello_world foo" becomes "helloWorldFoo" and
 * "HELLO_WORLD" becomes "helloWorld".
 *
 * Words are split on runs of whitespace, dashes ("-") and underscores ("_"), the
 * same separators `snakeCase` uses. Leading, trailing and repeated separators are
 * dropped, so they never produce a leading capital or a doubled capital, and
 * input with no words returns "".
 *
 * Existing camel humps are not split: each word is re-cased as a whole, so
 * "helloWorld foo" becomes "helloworldFoo". Any other character (punctuation,
 * digits, accented letters, emoji) is kept inside its word as is; a later word
 * that starts with a non-letter keeps that character and lowercases the rest
 * ("version 2nd" becomes "version2nd"). Case mapping uses
 * `String#toUpperCase`/`toLowerCase` and the first character is taken by code
 * point, as in `titleCase`.
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function camelCase(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text
    .split(/[\s_-]+/u)
    .filter((word) => word !== "")
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : capitalizeWord(word),
    )
    .join("");
}

/**
 * Swap-case text: every uppercase letter is lowercased and every other
 * character is uppercased, so "Hello World" becomes "hELLO wORLD".
 *
 * Characters with no case (digits, spaces, punctuation, emoji) come back
 * unchanged. Text is walked by code point, so a surrogate pair is never split.
 * Case mapping uses `String#toUpperCase`/`toLowerCase`, so a character can
 * change length ("ß" becomes "SS").
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function swapCase(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return Array.from(text, (char) => {
    const upper = char.toUpperCase();
    return char === upper ? char.toLowerCase() : upper;
  }).join("");
}
