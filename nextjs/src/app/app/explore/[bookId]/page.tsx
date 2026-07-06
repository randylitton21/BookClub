"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getBook,
  listBookReviewsForExplore,
  listClubsForBook,
  type ExploreBookReview,
} from "@/lib/bookStore";
import type { Book, BookClubLink } from "@/lib/types";
import { BROWSE_BOOKS_RETURN, hrefWithReturnNav } from "@/lib/returnNav";
import PageTitleCard from "../../../_components/PageTitleCard";
import BookCover from "../../../_components/BookCover";
import ReturnNavButton from "../../_components/ReturnNavButton";
import BookStatusBadge, { BookStatusLabel } from "../_components/BookStatusBadge";

function formatExpectedDate(iso: string | null | undefined): string {
  if (!iso) return "Date TBD";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "Date TBD";
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ClubJoinRow({
  link,
  bookReturnTo,
  bookReturnLabel,
}: {
  link: BookClubLink;
  bookReturnTo: string;
  bookReturnLabel: string;
}) {
  const clubHref = hrefWithReturnNav(
    `/app/clubs/${link.clubId}`,
    bookReturnTo,
    bookReturnLabel
  );
  return (
    <li className="card exploreClubRow">
      <div className="exploreClubRowMain">
        <strong>{link.clubName}</strong>
        <span className="muted" style={{ fontSize: 14 }}>
          {link.memberCount} member{link.memberCount === 1 ? "" : "s"}
        </span>
        {link.status === "queued" && link.expectedStartDate && (
          <span className="muted" style={{ fontSize: 13 }}>
            Expected start: {formatExpectedDate(link.expectedStartDate)}
          </span>
        )}
      </div>
      <Link href={clubHref} className="btnPrimary btnSmall">
        View club
      </Link>
    </li>
  );
}

function ReviewRow({
  review,
  bookReturnTo,
  bookReturnLabel,
}: {
  review: ExploreBookReview;
  bookReturnTo: string;
  bookReturnLabel: string;
}) {
  const reviewHref = hrefWithReturnNav(
    `/app/clubs/${review.clubId}/reads/${review.readId}`,
    bookReturnTo,
    bookReturnLabel
  );
  const clubHref = hrefWithReturnNav(
    `/app/clubs/${review.clubId}`,
    bookReturnTo,
    bookReturnLabel
  );
  return (
    <li className="card exploreReviewRow">
      <div className="exploreReviewRowMain">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <strong>{review.clubName}</strong>
          <BookStatusLabel status="finished" />
        </div>
        <p className="muted exploreReviewSnippet">{review.leaderReviewSnippet}</p>
      </div>
      <div className="exploreReviewRowActions">
        <Link href={reviewHref} className="btnPrimary btnSmall">
          Read review
        </Link>
        <Link href={clubHref} className="btnSecondary btnSmall">
          View club
        </Link>
      </div>
    </li>
  );
}

export default function ExploreBookDetailPage() {
  const params = useParams();
  const bookId = String(params.bookId || "");

  const [book, setBook] = useState<Book | null>(null);
  const [queued, setQueued] = useState<BookClubLink[]>([]);
  const [reading, setReading] = useState<BookClubLink[]>([]);
  const [reviews, setReviews] = useState<ExploreBookReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    setError(null);
    try {
      const b = await getBook(bookId);
      if (!b) {
        setBook(null);
        setError("Book not found.");
        return;
      }
      setBook(b);
      const [grouped, reviewList] = await Promise.all([
        listClubsForBook(bookId),
        listBookReviewsForExplore(b),
      ]);
      setQueued(grouped.queued);
      setReading(grouped.reading);
      setReviews(reviewList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load book.");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="muted">Loading…</p>;

  if (!book) {
    return (
      <div className="card">
        <p>{error || "Book not found."}</p>
        <Link href="/app/explore" className="btnSecondary" style={{ marginTop: 12, display: "inline-block" }}>
          Back to browse
        </Link>
      </div>
    );
  }

  const hasJoinable = queued.length > 0 || reading.length > 0;
  const hasReviews = reviews.length > 0;
  const bookReturnTo = `/app/explore/${bookId}`;
  const bookReturnLabel = book.title;

  return (
    <>
      <PageTitleCard
        title={book.title}
        subtitle={`by ${book.author}`}
        actions={
          <ReturnNavButton
            fallbackHref={BROWSE_BOOKS_RETURN.returnTo}
            fallbackLabel={BROWSE_BOOKS_RETURN.returnLabel}
          />
        }
      />

      <div className="card exploreBookDetailHero">
        <BookCover title={book.title} size="lg" />
        <div>
          <BookStatusBadge book={book} />
          <p className="muted" style={{ marginTop: 10, fontSize: 14 }}>
            {book.readingCount > 0 && `${book.readingCount} club${book.readingCount === 1 ? "" : "s"} reading`}
            {book.readingCount > 0 && book.queuedCount > 0 && " · "}
            {book.queuedCount > 0 && `${book.queuedCount} queued`}
            {(book.readingCount > 0 || book.queuedCount > 0) && book.finishedCount > 0 && " · "}
            {book.finishedCount > 0 && `${book.finishedCount} finished`}
          </p>
        </div>
      </div>

      <div className="clubHomeStack">
        {!hasJoinable && !hasReviews && (
          <div className="card">
            <p className="muted">No club activity for this book yet.</p>
          </div>
        )}

        {!hasJoinable && hasReviews && (
          <div className="card">
            <p className="muted">
              No clubs are reading or queued for this book right now. See club reviews below.
            </p>
          </div>
        )}

        {queued.length > 0 && (
          <section className="card card--section">
            <h2 className="fontDisplay sectionLabel" style={{ marginBottom: 4, fontSize: "1.1rem", textTransform: "none", letterSpacing: "-0.01em" }}>
              Queued
            </h2>
            <p className="muted" style={{ marginBottom: 12, fontSize: 14 }}>
              These clubs have this book up next — a good time to join.
            </p>
            <ul className="exploreClubList">
              {queued.map((link) => (
                <ClubJoinRow
                  key={link.linkId}
                  link={link}
                  bookReturnTo={bookReturnTo}
                  bookReturnLabel={bookReturnLabel}
                />
              ))}
            </ul>
          </section>
        )}

        {reading.length > 0 && (
          <section className="card card--section">
            <h2 className="fontDisplay" style={{ marginBottom: 12, fontSize: "1.1rem" }}>
              Reading now
            </h2>
            <ul className="exploreClubList">
              {reading.map((link) => (
                <ClubJoinRow
                  key={link.linkId}
                  link={link}
                  bookReturnTo={bookReturnTo}
                  bookReturnLabel={bookReturnLabel}
                />
              ))}
            </ul>
          </section>
        )}

        {hasReviews && (
          <section className="card">
            <h2 className="fontDisplay" style={{ marginBottom: 12, fontSize: "1.1rem" }}>
              Club reviews
            </h2>
            <p className="muted" style={{ marginBottom: 12, fontSize: 14 }}>
              Leader reviews from clubs that finished this book — read the full review or visit the
              club.
            </p>
            <ul className="exploreReviewList">
              {reviews.map((review) => (
                <ReviewRow
                  key={review.readId}
                  review={review}
                  bookReturnTo={bookReturnTo}
                  bookReturnLabel={bookReturnLabel}
                />
              ))}
            </ul>
          </section>
        )}
      </div>

      {error && <div className="alertError" style={{ marginTop: 14 }}>{error}</div>}
    </>
  );
}
