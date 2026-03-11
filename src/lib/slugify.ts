/**
 * Convert string to URL-safe slug (for auto-generating from name)
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/[^\p{L}\p{N}-]/gu, "") // remove non-letters, non-numbers, keep hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}
