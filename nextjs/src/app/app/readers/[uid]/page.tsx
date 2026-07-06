"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { formatClosedAtDate } from "@/lib/readStore";
import {
  loadReaderPublicProfile,
  type ReaderPublicProfile,
  type ReaderReviewItem,
} from "@/lib/readerProfileStore";
import { hrefWithReturnNav } from "@/lib/returnNav";
import BookCover from "../../../_components/BookCover";
import ReturnNavButton from "../../_components/ReturnNavButton";
import ProfileAvatar from "../../_components/ProfileAvatar";

const SECTION_CLUBS = "reader-section-clubs";
const SECTION_BOOKS = "reader-section-books";
const SECTION_REVIEWS = "reader-section-reviews";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function StatChip({
  label,
  sectionId,
}: {
  label: string;
  sectionId: string;
}) {
  return (
    <button
      type="button"
      className="clubStatChip clubStatChip--clickable readerStatChip"
      onClick={() => scrollToSection(sectionId)}
    >
      {label}
    </button>
  );
}

function reviewBadge(review: ReaderReviewItem) {
  if (review.kind === "leader") {
    return <span className="statusBadge statusBadge--reading">Leader review</span>;
  }
  if (review.status === "pending") {
    return <span className="statusBadge statusBadge--queued">Pending publish</span>;
  }
  return <span className="statusBadge statusBadge--library">Member review</span>;
}

function reviewDateLabel(review: ReaderReviewItem): string {
  const formatted = formatClosedAtDate(review.dateAt);
  if (review.status === "pending") return `Submitted ${formatted}`;
  if (review.kind === "leader") return `Published ${formatted}`;
  return `Closed ${formatted}`;
}

function ClubList({
  clubs,
  targetUid,
  profileName,
  showLeaderBadge,
}: {
  clubs: ReaderPublicProfile["ledClubs"];
  targetUid: string;
  profileName: string;
  showLeaderBadge?: boolean;
}) {
  if (clubs.length === 0) return null;
  return (
    <ul className="readerClubList">
      {clubs.map((club) => (
        <li key={club.clubId}>
          <Link
            href={hrefWithReturnNav(
              `/app/clubs/${club.clubId}`,
              `/app/readers/${targetUid}`,
              profileName
            )}
            className="readerClubRow"
          >
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <strong>{club.name}</strong>
                {showLeaderBadge && (
                  <span className="statusBadge statusBadge--ready">Leader</span>
                )}
              </div>
              {club.bookTitle?.trim() && (
                <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                  Now reading: {club.bookTitle}
                </p>
              )}
            </div>
            <span className="readerClubRowChevron" aria-hidden>
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function ReaderProfilePage() {
  const params = useParams();
  const targetUid = String(params.uid || "");
  const { user } = useAuth();

  const [data, setData] = useState<ReaderPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileReturn = `/app/readers/${targetUid}`;
  const profileName = data?.profile.displayName || "Reader";

  const load = useCallback(async () => {
    if (!targetUid) return;
    setLoading(true);
    setError(null);
    try {
      const result = await loadReaderPublicProfile(targetUid, user?.uid);
      if (!result) {
        setError("Reader not found.");
        setData(null);
        return;
      }
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load profile.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [targetUid, user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="muted">Loading reader profile…</p>;

  if (!data) {
    return (
      <div className="card">
        <p>{error || "Reader not found."}</p>
        <div className="pageActionsRow">
          <ReturnNavButton fallbackHref="/app" fallbackLabel="My clubs" />
        </div>
      </div>
    );
  }

  const {
    profile,
    isSelf,
    clubCount,
    booksFinishedCount,
    reviewCount,
    memberReviewCount,
    leaderReviewCount,
    ledClubs,
    memberClubs,
    reviews,
    finishedBooks,
    hasSharedContext,
  } = data;

  const mosaicTitles = finishedBooks.slice(0, 5).map((b) => b.title);
  const fallbackClub = ledClubs[0] ?? memberClubs[0];
  if (mosaicTitles.length === 0 && fallbackClub?.bookTitle) {
    mosaicTitles.push(fallbackClub.bookTitle);
  }

  const hasAnyClubs = ledClubs.length > 0 || memberClubs.length > 0;

  return (
    <>
      {isSelf && (
        <p className="readerSelfBanner">This is how other club members see you.</p>
      )}

      <header className="readerHero">
        <div className="readerHeroMosaic" aria-hidden>
          {mosaicTitles.length > 0 ? (
            mosaicTitles.map((title) => (
              <span key={title} className="readerHeroMosaicSpine">
                <BookCover title={title} size="sm" />
              </span>
            ))
          ) : (
            <span className="readerHeroMosaicFallback" />
          )}
        </div>
        <div className="readerHeroBody">
          <ProfileAvatar
            displayName={profile.displayName}
            photoURL={profile.photoURL}
            size="lg"
            className="readerHeroAvatar"
          />
          <h1 className="readerHeroName">{profile.displayName || "Reader"}</h1>
          <p className="readerHeroSubtitle muted">
            {ledClubs.length > 0 && (
              <span>
                Leader of {ledClubs.length} club{ledClubs.length === 1 ? "" : "s"}
                {clubCount > ledClubs.length ? " · " : ""}
              </span>
            )}
            {clubCount > 0
              ? `${clubCount} club${clubCount === 1 ? "" : "s"}${isSelf ? "" : " in common"}`
              : "Book club reader"}
          </p>
          <div className="pageActionsRow readerHeroActions">
            <ReturnNavButton fallbackHref="/app" fallbackLabel="My clubs" />
            {isSelf && (
              <Link href="/app/profile" className="btnSecondary btnSmall">
                Edit profile
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="readerStatRow">
        <StatChip
          label={`${clubCount} club${clubCount === 1 ? "" : "s"}`}
          sectionId={SECTION_CLUBS}
        />
        <StatChip
          label={`${booksFinishedCount} book${booksFinishedCount === 1 ? "" : "s"}`}
          sectionId={SECTION_BOOKS}
        />
        <StatChip
          label={`${reviewCount} review${reviewCount === 1 ? "" : "s"}`}
          sectionId={SECTION_REVIEWS}
        />
      </div>

      <section className="card readerSection">
        <h2 className="sectionHeading">About</h2>
        {profile.aboutMe?.trim() ? (
          <p className="readerAboutText">{profile.aboutMe}</p>
        ) : (
          <p className="emptyStateInline muted">
            {isSelf ? "Add a short intro on your edit profile page." : "No intro yet."}
          </p>
        )}
      </section>

      <section
        id={SECTION_CLUBS}
        className="card readerSection readerScrollTarget"
      >
        <h2 className="sectionHeading">Clubs</h2>
        {!hasAnyClubs ? (
          <p className="emptyStateInline muted">
            {isSelf ? "Join or create a club to get started." : "No shared clubs yet."}
          </p>
        ) : (
          <>
            {ledClubs.length > 0 && (
              <div style={{ marginBottom: memberClubs.length > 0 ? 18 : 0 }}>
                <p className="sectionLabel" style={{ marginBottom: 10 }}>
                  {isSelf ? "Clubs I lead" : "Clubs they lead"}
                </p>
                <ClubList
                  clubs={ledClubs}
                  targetUid={targetUid}
                  profileName={profileName}
                  showLeaderBadge
                />
              </div>
            )}
            {memberClubs.length > 0 && (
              <div>
                <p className="sectionLabel" style={{ marginBottom: 10 }}>
                  {isSelf ? "Member of" : "Clubs you share"}
                </p>
                <ClubList
                  clubs={memberClubs}
                  targetUid={targetUid}
                  profileName={profileName}
                />
              </div>
            )}
          </>
        )}
      </section>

      {!isSelf && !hasSharedContext && (
        <section className="card card--section readerSection">
          <p className="muted">
            You&apos;re not in a club together yet — join a shared club to see reading history and
            reviews here.
          </p>
        </section>
      )}

      <section
        id={SECTION_REVIEWS}
        className="card readerSection readerScrollTarget"
      >
        <h2 className="sectionHeading">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="emptyStateInline muted">
            {isSelf
              ? "Your reviews appear here when you submit one during Close the Story, or when you publish as club leader."
              : "No reviews yet from shared clubs."}
          </p>
        ) : (
          <>
            <p className="sectionHint muted">
              {memberReviewCount > 0 && `${memberReviewCount} member`}
              {memberReviewCount > 0 && leaderReviewCount > 0 && " · "}
              {leaderReviewCount > 0 && `${leaderReviewCount} leader`}
            </p>
            <ul className="readerReviewList">
              {reviews.map((review) => (
                <li key={review.id} className="readerReviewCard">
                  <div className="readerReviewCardHeader">
                    {reviewBadge(review)}
                    <BookCover title={review.bookTitle} size="sm" />
                  </div>
                  <p className="exploreReviewSnippet">{review.text}</p>
                  <p className="muted readerReviewMeta">
                    <strong>{review.bookTitle}</strong>
                    {review.bookAuthor?.trim() && (
                      <span> by {review.bookAuthor}</span>
                    )}
                  </p>
                  <p className="muted readerReviewMeta">
                    {review.clubName} · {reviewDateLabel(review)}
                  </p>
                  {review.status === "published" && review.readId ? (
                    <Link
                      href={hrefWithReturnNav(
                        `/app/clubs/${review.clubId}/reads/${review.readId}`,
                        profileReturn,
                        profileName
                      )}
                      className="btnGhost btnSmall"
                      style={{ marginTop: 8 }}
                    >
                      Read full story
                    </Link>
                  ) : (
                    <Link
                      href={hrefWithReturnNav(
                        `/app/clubs/${review.clubId}`,
                        profileReturn,
                        profileName
                      )}
                      className="btnGhost btnSmall"
                      style={{ marginTop: 8 }}
                    >
                      View club
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section
        id={SECTION_BOOKS}
        className={`card readerSection readerScrollTarget${finishedBooks.length === 0 ? " card--section" : ""}`}
      >
        <h2 className="sectionHeading">
          {isSelf ? "Books finished" : "Books finished together"}
        </h2>
        {finishedBooks.length === 0 ? (
          <p className="emptyStateInline muted">
            Finished books from shared clubs will show up here.
          </p>
        ) : (
          <div className="readerBookShelf">
            {finishedBooks.map((book) => (
              <Link
                key={book.readId}
                href={hrefWithReturnNav(
                  `/app/clubs/${book.clubId}/reads/${book.readId}`,
                  profileReturn,
                  profileName
                )}
                className="readerBookShelfItem"
              >
                <BookCover title={book.title} size="md" />
                <span className="readerBookShelfTitle">{book.title}</span>
                <span className="muted readerBookShelfMeta">{book.clubName}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {error && <div className="alertError" style={{ marginTop: 14 }}>{error}</div>}
    </>
  );
}
