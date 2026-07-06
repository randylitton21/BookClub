import Link from "next/link";
import type { Book } from "@/lib/types";
import { BROWSE_BOOKS_RETURN, hrefWithReturnNav } from "@/lib/returnNav";
import BookStatusBadge from "./BookStatusBadge";

export default function ExploreBookCard({ book }: { book: Book }) {
  const href = hrefWithReturnNav(
    `/app/explore/${book.bookId}`,
    BROWSE_BOOKS_RETURN.returnTo,
    BROWSE_BOOKS_RETURN.returnLabel
  );
  return (
    <Link href={href} className="card exploreBookCard">
      <div className="exploreBookCardMain">
        <strong className="exploreBookCardTitle">{book.title}</strong>
        <span className="muted exploreBookCardAuthor">by {book.author}</span>
      </div>
      <BookStatusBadge book={book} />
    </Link>
  );
}
