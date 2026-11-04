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
