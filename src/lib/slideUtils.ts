/**
 * Utility function to parse "NS" (no show) syntax from prop values
 * If a string value ends with ", NS" or ",NS", it will be treated as hidden
 * 
 * @param value - The prop value (string, number, boolean, etc.)
 * @returns The cleaned value if it should be shown, undefined otherwise
 * 
 * @example
 * getShowValue("Title here, NS") // undefined (hidden)
 * getShowValue("Title here") // "Title here" (shown)
 * getShowValue(null) // undefined (hidden)
 * getShowValue(undefined) // undefined (hidden)
 */
export function getShowValue<T>(value: T | string | null | undefined): T | undefined {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return undefined;
  }

  // Only process strings
  if (typeof value !== 'string') {
    return value;
  }

  // Check for ", NS" or ",NS" suffix (case-insensitive, with optional whitespace)
  const nsPattern = /,\s*NS\s*$/i;
  if (nsPattern.test(value)) {
    // Hidden - return undefined
    return undefined;
  }

  return value as T;
}
