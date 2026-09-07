/** Strip @ and validate X/Twitter handle: 1–15 alphanumeric or underscore. */
export function normalizeHandle(raw: string): string | null {
  const cleaned = raw.trim().replace(/^@+/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(cleaned)) return null;
  return cleaned;
}

export function normalizeHandles(input: unknown): string[] | null {
  if (!Array.isArray(input)) return null;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of input) {
    if (typeof item !== "string") return null;
    const h = normalizeHandle(item);
    if (!h) return null;
    const key = h.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
  }
  return out;
}
