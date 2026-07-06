import Link from "next/link";
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
      <h2 style={{ marginBottom: 8, fontSize: 18 }}>Books we&apos;ve read</h2>
      {loadError ? (
        <div className="card" style={{ borderColor: "rgba(244,67,54,.4)" }}>
          {loadError}
        </div>
      ) : closedReads.length === 0 ? (
        <p className="muted">No finished reads yet. When the leader closes a book, it will appear here.</p>
      ) : (
        <ul className="clubBooksReadList">
          {closedReads.map((read) => (
            <li key={read.readId}>
              <Link
                href={`/app/clubs/${clubId}/reads/${read.readId}`}
                className="clubBooksReadItem"
              >
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
