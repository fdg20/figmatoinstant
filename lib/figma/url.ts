/**
 * Extract file key from Figma URL
 * e.g. https://www.figma.com/design/ABC123/... → ABC123
 */
export function extractFileKeyFromUrl(url: string): string | null {
  const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Extract node id from Figma URL (as in URL: hyphenated)
 * e.g. ...?node-id=1-2-3 → "1-2-3"
 */
export function extractNodeIdFromUrl(url: string): string | null {
  const match = url.match(/[?&]node-id=([^&]+)/);
  return match ? decodeURIComponent(match[1].trim()) : null;
}

/**
 * Convert URL node-id (hyphens) to Figma API format (colons)
 * e.g. "1-2-3" → "1:2:3"
 */
export function nodeIdForApi(nodeIdFromUrl: string): string {
  return nodeIdFromUrl.replace(/-/g, ':');
}

/**
 * Safe cache key segment: use hyphenated id so filenames are valid
 * e.g. "1:2:3" → "1-2-3"
 */
export function nodeIdForCache(apiNodeId: string): string {
  return apiNodeId.replace(/:/g, '-');
}
