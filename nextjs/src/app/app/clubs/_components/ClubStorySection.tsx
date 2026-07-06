"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listStoryCloseReviews,
  submitMemberReview,
} from "@/lib/readStore";
import type { Club } from "@/lib/types";

export default function ClubStorySection({
  club,
  uid,
  displayName,
  isCreator,
  onUpdated,
}: {
  club: Club;
  uid: string;
  displayName: string;
  isCreator: boolean;
  onUpdated: () => void;
}) {
  const [reviewText, setReviewText] = useState("");
  const [memberReviewCount, setMemberReviewCount] = useState(0);
  const [myReviewSubmitted, setMyReviewSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const collecting = club.storyCloseStatus === "collecting";

  useEffect(() => {
    if (!collecting) {
      setMemberReviewCount(0);
      setMyReviewSubmitted(false);
      return;
    }
    listStoryCloseReviews(club.clubId).then((reviews) => {
      setMemberReviewCount(reviews.length);
      setMyReviewSubmitted(reviews.some((r) => r.uid === uid));
    });
  }, [club.clubId, collecting, uid]);

  async function handleSubmitReview() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await submitMemberReview({
        clubId: club.clubId,
        uid,
        displayName,
        text: reviewText,
      });
      setReviewText("");
      setMyReviewSubmitted(true);
      setMessage("Your review was submitted.");
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card clubStorySection">
      <h2 style={{ marginBottom: 6, fontSize: 18 }}>Close the Story</h2>

      {collecting ? (
        <>
          <p className="muted" style={{ marginBottom: 12 }}>
            The club is closing <strong>{club.bookTitle}</strong>. Share a short paragraph
            about your reading experience.
          </p>
          {isCreator ? (
            <p className="muted" style={{ marginBottom: 12 }}>
              {memberReviewCount} member review{memberReviewCount === 1 ? "" : "s"} submitted.
              Finish and publish the final review in{" "}
              <Link href={`/app/clubs/${club.clubId}/manage`}>Manage</Link>.
            </p>
          ) : myReviewSubmitted ? (
            <p className="muted">Thanks — your review is in. The leader will publish the final story.</p>
          ) : (
            <>
              <label style={{ display: "grid", gap: 6 }}>
                <span className="muted">Your short review</span>
                <textarea
                  className="inputField"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you think of this book?"
                  rows={4}
                />
              </label>
              <button
                type="button"
                className="btnPrimary"
                style={{ marginTop: 10 }}
                disabled={busy || !reviewText.trim()}
                onClick={handleSubmitReview}
              >
                {busy ? "Submitting..." : "Submit review"}
              </button>
            </>
          )}
        </>
      ) : (
        <p className="muted">
          When the club finishes a book, the leader closes the story — members share short
          reviews, then the leader publishes the final piece. Finished books appear in{" "}
          <strong>Books we&apos;ve read</strong> above.
        </p>
      )}

      {isCreator && !collecting && club.bookTitle && (
        <Link
          href={`/app/clubs/${club.clubId}/manage`}
          className="btnSecondary"
          style={{ marginTop: 12, display: "inline-block" }}
        >
          Queue next read or close this book
        </Link>
      )}

      {message && <p className="muted" style={{ marginTop: 10 }}>{message}</p>}
      {error && (
        <div className="card" style={{ marginTop: 10, borderColor: "rgba(244,67,54,.4)" }}>
          {error}
        </div>
      )}
    </div>
  );
}
