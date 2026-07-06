"use client";

import { useState } from "react";
import Link from "next/link";
import { formatClosedAtDate } from "@/lib/readStore";
import { hrefWithReturnNav } from "@/lib/returnNav";
import type { Club, ClosedRead, UserProfile } from "@/lib/types";
import ReaderProfileLink from "../../_components/ReaderProfileLink";

type Popover = "members" | "books" | null;

export default function ClubStatsRow({
  club,
  profiles = {},
  closedReads = [],
}: {
  club: Club;
  profiles?: Record<string, UserProfile>;
  closedReads?: ClosedRead[];
}) {
  const [open, setOpen] = useState<Popover>(null);
  const memberCount = club.memberUids.length;
  const hasActive = Boolean(club.bookTitle?.trim());
  const booksRead = closedReads.length + (hasActive ? 1 : 0);
  const clubReturnTo = `/app/clubs/${club.clubId}`;
  const clubReturnLabel = club.name;

  function toggle(which: Popover) {
    setOpen((prev) => (prev === which ? null : which));
  }

  return (
    <div className="clubStatsBlock">
      <div className="clubStatsRow">
        <button
          type="button"
          className="clubStatChip clubStatChip--clickable"
          onClick={() => toggle("members")}
          aria-expanded={open === "members"}
        >
          {memberCount} member{memberCount === 1 ? "" : "s"}
        </button>
        <button
          type="button"
          className="clubStatChip clubStatChip--clickable"
          onClick={() => toggle("books")}
          aria-expanded={open === "books"}
          disabled={booksRead === 0}
        >
          {booksRead} book{booksRead === 1 ? "" : "s"} read
        </button>
        <span className="clubStatChip clubStatChip--id">ID: {club.clubId}</span>
      </div>

      {open === "members" && (
        <ul className="statPopover memberList">
          {club.memberUids.map((uid) => {
            const profile = profiles[uid];
            const name = profile?.displayName || "Reader";
            const isCreator = uid === club.createdBy;
            return (
              <li key={uid}>
                <ReaderProfileLink
                  uid={uid}
                  returnTo={clubReturnTo}
                  returnLabel={clubReturnLabel}
                >
                  <strong>{name}</strong>
                </ReaderProfileLink>
                {isCreator && <span className="muted"> — Club leader</span>}
              </li>
            );
          })}
        </ul>
      )}

      {open === "books" && (
        <ul className="statPopover memberList">
          {hasActive && (
            <li>
              <strong>{club.bookTitle}</strong>
              <span className="muted"> — {club.bookAuthor}</span>
              <span className="statusBadge statusBadge--ready" style={{ marginLeft: 8 }}>
                Current
              </span>
            </li>
          )}
          {closedReads.map((read) => (
            <li key={read.readId}>
              <Link
                href={hrefWithReturnNav(
                  `/app/clubs/${club.clubId}/reads/${read.readId}`,
                  clubReturnTo,
                  clubReturnLabel
                )}
              >
                <strong>{read.title}</strong>
                <span className="muted"> — {read.author}</span>
                <span className="muted" style={{ marginLeft: 8, fontSize: 13 }}>
                  Closed {formatClosedAtDate(read.closedAt)}
                </span>
              </Link>
            </li>
          ))}
          {!hasActive && closedReads.length === 0 && (
            <li className="muted">No books yet.</li>
          )}
        </ul>
      )}
    </div>
  );
}
