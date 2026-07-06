"use client";

import { useState } from "react";
import Link from "next/link";
import { createJoinRequest } from "@/lib/clubStore";
import { getUserProfile } from "@/lib/userStore";
import type { Club, ClosedRead } from "@/lib/types";
import ClubBookHero from "./ClubBookHero";
import ClubStatsRow from "./ClubStatsRow";
import ClubBooksReadSection from "./ClubBooksReadSection";

export default function NonMemberClubView({
  club,
  userUid,
  creatorName,
  closedReads = [],
  closedReadsError = null,
}: {
  club: Club;
  userUid?: string;
  creatorName: string;
  closedReads?: ClosedRead[];
  closedReadsError?: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestJoin() {
    if (!userUid) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const profile = await getUserProfile(userUid);
      await createJoinRequest({
        clubId: club.clubId,
        uid: userUid,
        displayName: profile?.displayName || "Reader",
      });
      setMessage(`Request sent to join "${club.name}". The club leader must approve.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send join request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="formGrid" style={{ marginTop: 14 }}>
      <ClubBookHero club={club} />
      <ClubStatsRow club={club} closedReads={closedReads} />
      <ClubBooksReadSection
        clubId={club.clubId}
        closedReads={closedReads}
        loadError={closedReadsError}
      />
      <p className="muted">Led by <strong>{creatorName}</strong></p>
      <div className="card">
        {userUid ? (
          <>
            <p style={{ marginBottom: 12 }}>
              You are not a member yet. Request to join and the club leader will approve you.
            </p>
            <button type="button" className="btnPrimary" disabled={busy} onClick={handleRequestJoin}>
              {busy ? "Sending..." : "Request to Join"}
            </button>
            {message && <p className="muted" style={{ marginTop: 10 }}>{message}</p>}
            {error && (
              <div className="card" style={{ marginTop: 10, borderColor: "rgba(244,67,54,.4)" }}>
                {error}
              </div>
            )}
          </>
        ) : (
          <>
            <p style={{ marginBottom: 12 }}>
              Sign in to request to join this club. The leader must approve new members.
            </p>
            <Link href="/app/login" className="btnPrimary" style={{ display: "inline-block" }}>
              Sign in to join
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
