const SERVER_BASE = 'https://pmss.runasp.net';

/**
 * Resolves an employee image URL from the backend.
 * The backend returns a relative path (e.g. /images/employees/uuid.webp).
 * This function prepends the server base to make it a full absolute URL.
 */
export function resolveImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || imageUrl.trim() === '') return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${SERVER_BASE}${path}`;
}
