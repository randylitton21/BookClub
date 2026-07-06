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
    <div className="clubHomeStack">
      <ClubBookHero club={club} />
      <ClubStatsRow club={club} closedReads={closedReads} />
      <ClubBooksReadSection
        clubId={club.clubId}
        closedReads={closedReads}
        loadError={closedReadsError}
      />
      <p className="muted">
        Led by <strong>{creatorName}</strong>
      </p>
      <div className="card card--accent">
        {userUid ? (
          <>
            <p style={{ marginBottom: 14 }}>
              You&apos;re not a member yet. Request to join and the club leader will approve you.
            </p>
            <button
              type="button"
              className="btnAccent btnBlock"
              disabled={busy}
              onClick={handleRequestJoin}
            >
              {busy ? "Sending…" : "Request to join"}
            </button>
            {message && <p className="alertSuccess" style={{ marginTop: 12 }}>{message}</p>}
            {error && <div className="alertError" style={{ marginTop: 12 }}>{error}</div>}
          </>
        ) : (
          <>
            <p style={{ marginBottom: 14 }}>
              Sign in to request to join this club. The leader must approve new members.
            </p>
            <Link href="/app/login" className="btnAccent btnBlock">
              Sign in to join
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
