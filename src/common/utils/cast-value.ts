/**
 * cast a string into its natural type
 * @param value
 * @returns string | number | boolean
 */
export function castValue(value: string): string | number | boolean {
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  if (!isNaN(Number(value)) && value.trim() !== '') {
    return Number(value);
  }
  try {
    return JSON.parse(value);
  } catch {
    // not valid JSON, fallback to string
  }

  return value;
}
