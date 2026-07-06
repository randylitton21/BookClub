"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getClub } from "@/lib/clubStore";
import { formatClosedAtDate, getClosedRead } from "@/lib/readStore";
import type { ClosedRead, Club } from "@/lib/types";
import BookCover from "../../../../../_components/BookCover";
import PageTitleCard from "../../../../../_components/PageTitleCard";
import ReturnNavButton from "../../../../_components/ReturnNavButton";
import ReaderProfileLink from "../../../../_components/ReaderProfileLink";
import ProfileAvatar from "../../../../_components/ProfileAvatar";

export default function ClosedReadPage() {
  const params = useParams();
  const clubId = String(params.clubId || "");
  const readId = String(params.readId || "");
  const { user } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [read, setRead] = useState<ClosedRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMember = user && club && club.memberUids.includes(user.uid);

  const load = useCallback(async () => {
    if (!clubId || !readId) return;
    setLoading(true);
    setError(null);
    try {
      const [c, r] = await Promise.all([getClub(clubId), getClosedRead(readId)]);
      if (!c) {
        setError("Club not found.");
        return;
      }
      if (!r || r.clubId !== c.clubId) {
        setError("This read was not found for this club.");
        return;
      }
      setClub(c);
      setRead(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load read.");
    } finally {
      setLoading(false);
    }
  }, [clubId, readId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="muted">Loading…</p>;

  if (!club || !read) {
    return (
      <div className="card">
        <p>{error || "Read not found."}</p>
        <div className="pageActionsRow">
          <ReturnNavButton
            fallbackHref={`/app/clubs/${clubId}`}
            fallbackLabel={club?.name || "club"}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitleCard
        title={read.title}
        subtitle={`by ${read.author}`}
        actions={
          <ReturnNavButton
            fallbackHref={`/app/clubs/${club.clubId}`}
            fallbackLabel={club.name}
          />
        }
      />

      <div className="clubHomeStack">
        <div className="card readDetailHero">
          <BookCover title={read.title} size="lg" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <p className="readDetailMeta muted">
              Closed {formatClosedAtDate(read.closedAt)} · {club.name}
            </p>
            <div className="clubLeaderReview">
              <p className="sectionLabel">Leader&apos;s final review</p>
              <p style={{ whiteSpace: "pre-wrap", marginTop: 8, lineHeight: 1.55 }}>
                {read.leaderFinalReview}
              </p>
            </div>
          </div>
        </div>

        {isMember && read.memberReviews.length > 0 && (
          <div className="card card--section">
            <h2 className="sectionHeading">Member reviews</h2>
            <p className="sectionHint muted">
              {read.memberReviews.length} club member
              {read.memberReviews.length === 1 ? "" : "s"} shared their take.
            </p>
            <ul className="memberList">
              {read.memberReviews.map((review) => (
                <li key={review.uid} className="memberReviewCard">
                  <ReaderProfileLink
                    uid={review.uid}
                    returnTo={`/app/clubs/${club.clubId}/reads/${read.readId}`}
                    returnLabel={read.title}
                    className="postItemAuthorLink"
                  >
                    <ProfileAvatar displayName={review.displayName} size="sm" />
                    <strong>{review.displayName}</strong>
                  </ReaderProfileLink>
                  <p style={{ marginTop: 8, whiteSpace: "pre-wrap", lineHeight: 1.5, paddingLeft: 40 }}>
                    {review.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && <div className="alertError" style={{ marginTop: 14 }}>{error}</div>}
    </>
  );
}
