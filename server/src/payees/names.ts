export function normalizePayeeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}
