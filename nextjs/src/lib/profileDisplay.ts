export function profileInitials(name: string, fallback = "?"): string {
  const n = name.trim();
  if (!n || n === "Reader") return fallback.slice(0, 2).toUpperCase();
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return n.slice(0, 2).toUpperCase();
}
