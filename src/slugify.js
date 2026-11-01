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
