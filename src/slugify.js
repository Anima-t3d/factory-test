/**
 * Turn a title into a URL slug: lowercase ASCII words joined by dashes.
 * Accents are stripped, everything else that is not a letter or digit splits words.
 */
export function slugify(text) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join("-");
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
