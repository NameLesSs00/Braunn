/**
 * Returns a consistent, visually distinct hex color for any department name.
 * Uses a hashing strategy against a hand-curated palette of 16 vivid colors,
 * so the same string always returns the same color.
 */

const PALETTE = [
  '#2563EB', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#F97316', // Orange
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#A855F7', // Purple
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#0EA5E9', // Sky
  '#DB2777', // Fuchsia
  '#D97706', // Yellow-600
  '#16A34A', // Green
];

export function getDeptColor(department: string): string {
  let hash = 0;
  for (let i = 0; i < department.length; i++) {
    hash = department.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // force 32-bit int
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
