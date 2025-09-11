/**
 * Takes a string (text) and an index.
 * Substrings from the beginning of the string to the nearest space before or at the index.
 * @param text
 * @param index
 * @returns
 */
export function substringAtNearestSpace(text: string, index: number): string {
  if (index >= text.length) return text;

  if (text[index] === ' ') {
    return text.substring(0, index).trim();
  }

  const lastSpace = text.lastIndexOf(' ', index);

  if (lastSpace === -1) {
    return text.substring(0, index).trim();
  }

  return text.substring(0, lastSpace).trim();
}
