import Link from "next/link";
import type { Book } from "@/lib/types";
import { BROWSE_BOOKS_RETURN, hrefWithReturnNav } from "@/lib/returnNav";
import BookCover from "../../../_components/BookCover";
import BookStatusBadge from "./BookStatusBadge";

export default function ExploreBookCard({ book }: { book: Book }) {
  const href = hrefWithReturnNav(
    `/app/explore/${book.bookId}`,
    BROWSE_BOOKS_RETURN.returnTo,
    BROWSE_BOOKS_RETURN.returnLabel
  );
  const clubHint =
    book.readingCount > 0
      ? `${book.readingCount} club${book.readingCount === 1 ? "" : "s"} reading`
      : book.queuedCount > 0
        ? `${book.queuedCount} queued`
        : `${book.finishedCount} finished`;

  return (
    <Link href={href} className="card exploreBookCard">
      <BookCover title={book.title} size="sm" />
      <div className="exploreBookCardMain">
        <strong className="exploreBookCardTitle">{book.title}</strong>
        <span className="muted exploreBookCardAuthor">by {book.author}</span>
        <span className="muted" style={{ fontSize: 12 }}>
          {clubHint}
        </span>
      </div>
      <BookStatusBadge book={book} />
    </Link>
  );
}
