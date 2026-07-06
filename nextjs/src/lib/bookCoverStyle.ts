/** Deterministic cover colors + initials from a book title. */

const COVER_PALETTES = [
  { bg: "#2D4A3E", accent: "#8FB996" },
  { bg: "#3D2E4A", accent: "#B8A4D4" },
  { bg: "#4A3228", accent: "#D4A574" },
  { bg: "#1E3A4A", accent: "#7EB8DA" },
  { bg: "#4A2828", accent: "#D4847E" },
  { bg: "#2A4A38", accent: "#7EC4A0" },
  { bg: "#3A3A1E", accent: "#C4C47E" },
  { bg: "#2E2E4A", accent: "#9898D4" },
] as const;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function bookCoverInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function bookCoverPalette(title: string): { bg: string; accent: string } {
  const idx = hashString(title.trim().toLowerCase()) % COVER_PALETTES.length;
  return COVER_PALETTES[idx];
}
