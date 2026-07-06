"use client";

import { useCallback, useEffect, useState } from "react";
import { listBooksForExplore, rebuildBookCatalog } from "@/lib/bookStore";
import type { Book } from "@/lib/types";
import PageTitleCard from "../../_components/PageTitleCard";
import ExploreBookCard from "./_components/ExploreBookCard";

export default function ExplorePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBooks(await listBooksForExplore());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load books.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRebuild() {
    setRebuilding(true);
    setError(null);
    try {
      await rebuildBookCatalog();
      setBooks(await listBooksForExplore());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not rebuild catalog.");
    } finally {
      setRebuilding(false);
    }
  }

  return (
    <>
      <PageTitleCard
        title="Browse books"
        subtitle="Books read by real clubs. Tap a book to see who's reading or queued."
      />

      {loading || rebuilding ? (
        <p className="muted" style={{ marginTop: 14 }}>
          {rebuilding ? "Building book catalog…" : "Loading…"}
        </p>
      ) : books.length === 0 ? (
        <div className="card" style={{ marginTop: 14 }}>
          <p className="muted" style={{ marginBottom: 12 }}>
            No books in the catalog yet. The list updates when clubs start, queue, or close a
            book. If something looks missing, use Rebuild catalog below.
          </p>
          <button type="button" className="btnSecondary" disabled={rebuilding} onClick={handleRebuild}>
            Rebuild catalog
          </button>
        </div>
      ) : (
        <div className="exploreBookList" style={{ marginTop: 14 }}>
          {books.map((book) => (
            <ExploreBookCard key={book.bookId} book={book} />
          ))}
        </div>
      )}

      {books.length > 0 && (
        <p className="muted" style={{ marginTop: 14, fontSize: 13 }}>
          <button
            type="button"
            className="btnSecondary btnSmall"
            disabled={rebuilding}
            onClick={handleRebuild}
          >
            Rebuild catalog
          </button>
          {" "}— repair tool: rescans all clubs and finished reads (use only if data looks wrong)
        </p>
      )}

      {error && (
        <div className="card" style={{ marginTop: 14, borderColor: "rgba(244,67,54,.4)" }}>
          {error}
        </div>
      )}
    </>
  );
}
