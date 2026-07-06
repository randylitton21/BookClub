import type { Book } from "@/lib/types";
import { primaryBookStatus } from "@/lib/bookStore";

export default function BookStatusBadge({ book }: { book: Book }) {
  const status = primaryBookStatus(book);
  if (status === "reading") {
    return (
      <span className="statusBadge statusBadge--reading">
        Reading now · {book.readingCount} club{book.readingCount === 1 ? "" : "s"}
      </span>
    );
  }
  if (status === "queued") {
    return (
      <span className="statusBadge statusBadge--queued">
        Queued · {book.queuedCount} club{book.queuedCount === 1 ? "" : "s"}
      </span>
    );
  }
  return (
    <span className="statusBadge statusBadge--library">
      In library · {book.finishedCount} club{book.finishedCount === 1 ? "" : "s"}
    </span>
  );
}

export function BookStatusLabel({ status }: { status: "reading" | "queued" | "finished" }) {
  if (status === "reading") {
    return <span className="statusBadge statusBadge--reading">Reading now</span>;
  }
  if (status === "queued") {
    return <span className="statusBadge statusBadge--queued">Queued</span>;
  }
  return <span className="statusBadge statusBadge--library">Finished</span>;
}
