import Link from "next/link";
import BookCover from "../../../_components/BookCover";
import { formatClosedAtDate } from "@/lib/readStore";
import type { ClosedRead } from "@/lib/types";

export default function ClubBooksReadSection({
  clubId,
  closedReads,
  loadError = null,
}: {
  clubId: string;
  closedReads: ClosedRead[];
  loadError?: string | null;
}) {
  return (
    <div className="card clubBooksReadSection">
      <h2 className="sectionHeading">Books we&apos;ve read</h2>
      {loadError ? (
        <div className="alertError">{loadError}</div>
      ) : closedReads.length === 0 ? (
        <p className="emptyStateInline muted">
          No finished reads yet. When the leader closes a book, it will appear here.
        </p>
      ) : (
        <ul className="clubBooksReadList">
          {closedReads.map((read) => (
            <li key={read.readId}>
              <Link
                href={`/app/clubs/${clubId}/reads/${read.readId}`}
                className="clubBooksReadItem"
              >
                <BookCover title={read.title} size="sm" />
                <span className="clubBooksReadItemMain">
                  <strong>{read.title}</strong>
                  <span className="muted"> by {read.author}</span>
                </span>
                <span className="clubBooksReadItemMeta muted">
                  Closed {formatClosedAtDate(read.closedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
