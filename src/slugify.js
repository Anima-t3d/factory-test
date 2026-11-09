/**
 * Turn a title into a URL slug: lowercase ASCII words joined by dashes.
 * Accents are stripped, everything else that is not a letter or digit splits words.
 *
 * When `options.maxLength` is given the slug is at most `maxLength` characters,
 * cut at a word boundary: whole trailing words are dropped and the result never
 * ends with a dash. If the first word alone is longer than `maxLength`, it is cut
 * at `maxLength`. `maxLength` must be a positive integer, otherwise a `RangeError`
 * is thrown. Omit the option for the unchanged, uncapped behaviour.
 *
 * @param {string} text
 * @param {{ maxLength?: number }} [options]
 * @returns {string}
 */
export function slugify(text, options = {}) {
  const { maxLength } = options;

  if (maxLength !== undefined && (!Number.isInteger(maxLength) || maxLength <= 0)) {
    throw new RangeError("maxLength must be a positive integer");
  }

  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join("-");

  if (maxLength === undefined || slug.length <= maxLength) {
    return slug;
  }

  return truncateAtWordBoundary(slug, maxLength);
}

function truncateAtWordBoundary(slug, maxLength) {
  const words = slug.split("-");
  let result = "";

  for (const word of words) {
    const candidate = result ? `${result}-${word}` : word;
    if (candidate.length > maxLength) {
      break;
    }
    result = candidate;
  }

  if (result) {
    return result;
  }

  // The first word alone is longer than maxLength: cut it.
  return words[0].slice(0, maxLength);
}

const isHighSurrogate = (codeUnit) => codeUnit >= 0xd800 && codeUnit <= 0xdbff;
const isLowSurrogate = (codeUnit) => codeUnit >= 0xdc00 && codeUnit <= 0xdfff;

/**
 * Shorten display text to at most `maxLength` characters, marking a cut with "…".
 *
 * Text that already fits is returned unchanged. Otherwise the result ends with
 * U+2026 ("…") and is exactly `maxLength` characters long when the cut is at a
 * word boundary or has no preceding space to rewind to. When the cut would split
 * a word, it moves back to the last space (U+0020) before the cut, that space is
 * dropped, and "…" is appended; the result can then be shorter than `maxLength`,
 * but is never longer and never ends with whitespace before the ellipsis.
 * Trailing punctuation (".", ",", ";", ":") left by the cut is removed before
 * the ellipsis, so "Hello, world" at 7 becomes "Hello…" rather than "Hello,…".
 *
 * `maxLength` is measured in UTF-16 code units, the same unit as `String#length`,
 * and must be a positive integer. A cut that would split a surrogate pair is moved
 * back one code unit, so a lone surrogate is never returned. Only U+0020 is
 * treated as a word boundary; tabs and newlines are ordinary characters.
 * Grapheme clusters (ZWJ emoji, flag pairs, combining marks) can still be split
 * between code points.
 *
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 * @throws {RangeError} when `maxLength` is not a positive integer
 */
export function truncate(text, maxLength) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }
  // The issue only mandates maxLength < 1; non-integers are rejected too so that
  // NaN, Infinity, "5", null and friends surface instead of silently misbehaving.
  if (!Number.isInteger(maxLength) || maxLength < 1) {
    throw new RangeError("maxLength must be a positive integer");
  }

  if (text.length <= maxLength) {
    return text;
  }

  const ellipsis = "…";
  const keep = cutIndex(text, maxLength - 1);
  const head = text.slice(0, keep);

  if (splitsWord(text, keep)) {
    const boundary = head.lastIndexOf(" ");
    const atSpace =
      boundary > 0
        ? trimTrailingPunctuation(head.slice(0, boundary).trimEnd())
        : "";
    if (atSpace !== "") {
      return `${atSpace}${ellipsis}`;
    }
  }

  return `${trimTrailingPunctuation(head.trimEnd())}${ellipsis}`;
}

/** Drop trailing sentence punctuation so the ellipsis does not follow it. */
function trimTrailingPunctuation(text) {
  return text.replace(/[.,;:]+$/, "");
}

/** Move a cut index back one code unit when it would split a surrogate pair. */
function cutIndex(text, keep) {
  if (
    keep > 0 &&
    isHighSurrogate(text.charCodeAt(keep - 1)) &&
    isLowSurrogate(text.charCodeAt(keep))
  ) {
    return keep - 1;
  }
  return keep;
}

/** True when the cut at `keep` falls inside a word rather than on a boundary. */
function splitsWord(text, keep) {
  if (keep === 0) {
    return false;
  }
  const next = text[keep];
  const last = text[keep - 1];
  return next !== " " && last !== " ";
}

/**
 * Upper-case the first character of every word, leaving everything else as is.
 *
 * A word starts at the beginning of the string or right after a whitespace
 * character (anything matched by the regex `\s`: spaces, tabs, newlines, NBSP,
 * ...). Only that first character is changed, with `String#toUpperCase`; the rest
 * of the word is not touched, so "iPhone" becomes "IPhone" and "hELLO" becomes
 * "HELLO". All whitespace is returned exactly as given: runs, tabs, newlines and
 * leading/trailing whitespace are kept.
 *
 * A word that starts with a character that has no upper case form (a digit,
 * punctuation such as "(" or a quote) is left unchanged; letters after it are not
 * capitalised. Casing is not locale-aware, and a few characters upper-case to more
 * than one character ("ß" -> "SS"), so the result can be longer than `text`.
 * Astral characters (outside the BMP) are handled as a whole code point.
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} when `text` is not a string
 */
export function capitalizeWords(text) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }

  return text.replace(/(^|\s)(\S)/gu, (_, before, first) => `${before}${first.toUpperCase()}`);
}
