"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getClub } from "@/lib/clubStore";
import { getWeek } from "@/lib/weekStore";
import { getQuizResult } from "@/lib/quizStore";
import { getUserProfile } from "@/lib/userStore";
import type { Club, Week } from "@/lib/types";
import ClubDiscussionBoard from "../../../_components/ClubDiscussionBoard";
import ReturnNavButton from "../../../../_components/ReturnNavButton";

export default function ClubRoomPage() {
  const params = useParams();
  const clubId = String(params.clubId || "");
  const weekId = String(params.weekId || "");
  const { user } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [week, setWeek] = useState<Week | null>(null);
  const [passed, setPassed] = useState(false);
  const [displayName, setDisplayName] = useState("Reader");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const userEmail = user.email;

    async function load() {
      setLoading(true);
      try {
        const c = await getClub(clubId);
        if (!c || !c.memberUids.includes(uid)) {
          setError("You do not have access to this club.");
          return;
        }
        setClub(c);
        const w = await getWeek(weekId);
        if (!w || w.clubId !== c.clubId) {
          setError("Week not found.");
          return;
        }
        setWeek(w);
        const result = await getQuizResult(uid, weekId);
        setPassed(result?.passed === true);
        const profile = await getUserProfile(uid);
        setDisplayName(profile?.displayName || userEmail?.split("@")[0] || "Reader");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load discussion.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [clubId, weekId, user]);

  if (loading) return <p className="muted">Loading discussion…</p>;

  if (error || !club) {
    return (
      <div className="card">
        <p>{error || "Could not load club room."}</p>
        <div className="pageActionsRow">
          <ReturnNavButton fallbackHref={`/app/clubs/${clubId}`} fallbackLabel="club" />
        </div>
      </div>
    );
  }

  return (
    <div className="clubRoomLayout">
      <div className="clubRoomStrip card">
        <div className="clubRoomStripTop">
          <ReturnNavButton fallbackHref={`/app/clubs/${club.clubId}`} fallbackLabel={club.name} />
          <span className="clubStatChip">{club.memberUids.length} members</span>
        </div>
        <h1 className="clubRoomClubName">{club.name}</h1>
        <p className="muted clubRoomBookLine">
          {club.bookTitle} · {club.bookAuthor}
        </p>
        {week && (
          <p className="clubRoomWeekLabel">
            <span className="statusBadge statusBadge--ready">{week.label}</span>
          </p>
        )}
      </div>

      {!passed && week && (
        <div className="card roomLockedCard">
          <div className="lockedPanelIcon" aria-hidden>
            🔒
          </div>
          <p className="muted" style={{ marginBottom: 14 }}>
            Discussion is locked until you pass the quiz for this week.
          </p>
          <Link
            href={`/app/clubs/${club.clubId}/weeks/${week.weekId}/quiz`}
            className="btnAccent"
          >
            Take quiz to unlock
          </Link>
        </div>
      )}

      <ClubDiscussionBoard
        weekId={weekId}
        uid={user!.uid}
        displayName={displayName}
        passed={passed}
        profileReturnTo={`/app/clubs/${club.clubId}/room/${weekId}`}
        profileReturnLabel={week?.label || "Discussion"}
      />
    </div>
  );
}
