/**
 * Resolves a media URL (e.g. imageUrl from the API) to an absolute URL
 * that the browser can fetch.
 *
 * Problem: Vite's dev proxy only forwards `/api/*` requests to the backend.
 * When `imageUrl` is a relative path like `/uploads/photo.jpg`, the browser
 * tries to fetch it from the dev server instead of the real backend and 404s.
 *
 * Solution: if the URL is relative, prepend the real backend origin.
 * We derive it from VITE_API_BASE_URL (if set as a full URL) or fall back
 * to VITE_MEDIA_BASE_URL, or the hardcoded proxy target for local dev.
 */

function getBackendOrigin(): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;

  if (apiBase) {
    try {
      // e.g. "https://pmss.runasp.net/api" → "https://pmss.runasp.net"
      const url = new URL(apiBase);
      return url.origin;
    } catch {
      // Not a full URL (e.g. "/api") — fall through
    }
  }

  // Fallback: explicit media base env var
  const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL as string | undefined;
  if (mediaBase) return mediaBase.replace(/\/$/, '');

  // Last resort: in dev the Vite proxy target is the real backend
  // Return the backend base so relative paths resolve correctly
  return import.meta.env.DEV ? 'https://pmss.runasp.net' : '';
}

const BACKEND_ORIGIN = getBackendOrigin();

/**
 * Converts a potentially-relative `imageUrl` from the API into a fully
 * qualified URL the browser can load.
 *
 * - Already absolute URLs are returned unchanged.
 * - Relative paths get the backend origin prepended.
 * - Empty / null / undefined returns ''.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Relative path — prepend backend origin
  return `${BACKEND_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}
