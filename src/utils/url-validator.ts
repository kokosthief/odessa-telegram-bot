/**
 * URL validation utility
 * Validates URLs before using them in Telegram buttons or messages
 */

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize and validate a URL, returning a safe default if invalid
 */
export function sanitizeUrl(url: string | undefined, defaultUrl?: string): string {
  if (!url || !isValidUrl(url)) {
    return defaultUrl || 'https://hipsy.nl/odessa-amsterdam-ecstatic-dance';
  }
  return url;
}

