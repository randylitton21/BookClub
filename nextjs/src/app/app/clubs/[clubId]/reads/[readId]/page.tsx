"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getClub } from "@/lib/clubStore";
import { formatClosedAtDate, getClosedRead } from "@/lib/readStore";
import type { ClosedRead, Club } from "@/lib/types";
import PageTitleCard from "../../../../../_components/PageTitleCard";
import ReturnNavButton from "../../../../_components/ReturnNavButton";

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

  if (loading) return <p className="muted">Loading...</p>;

  if (!club || !read) {
    return (
      <div className="card">
        <p>{error || "Read not found."}</p>
        <ReturnNavButton
          fallbackHref={`/app/clubs/${clubId}`}
          fallbackLabel={club?.name || "club"}
        />
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
        <div className="card">
          <p className="muted" style={{ marginBottom: 16 }}>
            Closed {formatClosedAtDate(read.closedAt)} · {club.name}
          </p>
          <div className="clubLeaderReview">
            <p className="clubBookHeroLabel muted">Leader&apos;s final review</p>
            <p style={{ whiteSpace: "pre-wrap" }}>{read.leaderFinalReview}</p>
          </div>
        </div>

        {isMember && read.memberReviews.length > 0 && (
          <div className="card">
            <h2 style={{ marginBottom: 12, fontSize: 18 }}>Member reviews</h2>
            <ul className="memberList">
              {read.memberReviews.map((review) => (
                <li key={review.uid} className="card" style={{ marginBottom: 8 }}>
                  <strong>{review.displayName}</strong>
                  <p style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{review.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <div className="card" style={{ marginTop: 14, borderColor: "rgba(244,67,54,.4)" }}>
          {error}
        </div>
      )}
    </>
  );
}
