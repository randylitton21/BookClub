/** Stable id from title + author for catalog grouping. */
export function bookIdFromTitleAuthor(title: string, author: string): string {
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  const t = norm(title);
  const a = norm(author);
  if (!t && !a) return "unknown_book";
  return `${t || "book"}_${a || "author"}`;
}

export function bookClubLinkId(bookId: string, clubId: string): string {
  return `${bookId}_${clubId}`;
}
