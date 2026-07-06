"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  approveJoinRequest,
  getClub,
  onPendingJoinRequestsChange,
  rejectJoinRequest,
} from "@/lib/clubStore";
import { clubActiveReadId } from "@/lib/readIds";
import { listClosedReads } from "@/lib/readStore";
import { listWeeksForClub } from "@/lib/weekStore";
import { getUserProfile, getUserProfiles } from "@/lib/userStore";
import type { Club, ClosedRead, JoinRequest, UserProfile, Week } from "@/lib/types";
import PageTitleCard from "../../../_components/PageTitleCard";
import ReturnNavButton from "../../_components/ReturnNavButton";
import ClubBookHero from "../_components/ClubBookHero";
import ClubStatsRow from "../_components/ClubStatsRow";
import ClubStorySection from "../_components/ClubStorySection";
import PendingJoinRequestsPanel from "../_components/PendingJoinRequestsPanel";
import ClubWeekDiscussionPanel from "../_components/ClubWeekDiscussionPanel";
import NonMemberClubView from "../_components/NonMemberClubView";
import ClubBooksReadSection from "../_components/ClubBooksReadSection";

export default function ClubHomePage() {
  const params = useParams();
  const pathname = usePathname();
  const clubId = String(params.clubId || "");
  const { user } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [closedReads, setClosedReads] = useState<ClosedRead[]>([]);
  const [closedReadsError, setClosedReadsError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [creatorName, setCreatorName] = useState("Club leader");
  const [displayName, setDisplayName] = useState("Reader");
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const isCreator = user && club && club.createdBy === user.uid;
  const isMember = user && club && club.memberUids.includes(user.uid);

  const loadClub = useCallback(async (options?: { silent?: boolean }) => {
    if (!clubId) return;
    if (!options?.silent) setLoading(true);
    setError(null);
    try {
      const c = await getClub(clubId);
      if (!c) {
        setError("Club not found.");
        setClub(null);
        return;
      }
      setClub(c);
      setClosedReadsError(null);
      try {
        setClosedReads(await listClosedReads(c.clubId));
      } catch (e) {
        setClosedReads([]);
        const msg = e instanceof Error ? e.message : "Could not load finished books.";
        setClosedReadsError(msg);
      }

      const creator = await getUserProfile(c.createdBy);
      setCreatorName(creator?.displayName || "Club leader");

      if (!user || !c.memberUids.includes(user.uid)) {
        return;
      }

      const profile = await getUserProfile(user.uid);
      setDisplayName(profile?.displayName || user.email?.split("@")[0] || "Reader");

      const w = await listWeeksForClub(c.clubId, clubActiveReadId(c));
      setWeeks(w);
      setProfiles(await getUserProfiles(c.memberUids));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load club.");
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [clubId, user]);

  useEffect(() => {
    loadClub();
  }, [loadClub, pathname]);

  useEffect(() => {
    if (!club || !user || club.createdBy !== user.uid) {
      setPendingRequests([]);
      return;
    }
    return onPendingJoinRequestsChange(club.clubId, setPendingRequests);
  }, [club, user]);

  async function handleApprove(req: JoinRequest) {
    setBusy(true);
    try {
      await approveJoinRequest(req);
      await loadClub();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not approve request.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(req: JoinRequest) {
    setBusy(true);
    try {
      await rejectJoinRequest(req);
      await loadClub();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reject request.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="muted">Loading club...</p>;
  }

  if (!club) {
    return (
      <div className="card">
        <p>{error || "Club not found."}</p>
        <div className="pageActionsRow">
          <Link href="/app" className="btnSecondary">
            Back to clubs
          </Link>
        </div>
      </div>
    );
  }

  if (!isMember && user) {
    return (
      <>
        <PageTitleCard
          title={club.name}
          subtitle="Request to join this club"
          actions={
            <ReturnNavButton fallbackHref="/app" fallbackLabel="My clubs" />
          }
        />
        <NonMemberClubView
          club={club}
          userUid={user.uid}
          creatorName={creatorName}
          closedReads={closedReads}
          closedReadsError={closedReadsError}
        />
      </>
    );
  }

  if (!isMember) {
    return (
      <>
        <PageTitleCard
          title={club.name}
          subtitle={`Led by ${creatorName}`}
          actions={
            <ReturnNavButton fallbackHref="/app/explore" fallbackLabel="Browse books" />
          }
        />
        <NonMemberClubView
          club={club}
          creatorName={creatorName}
          closedReads={closedReads}
          closedReadsError={closedReadsError}
        />
      </>
    );
  }

  return (
    <>
      <PageTitleCard
        title={club.name}
        subtitle={`Led by ${creatorName}`}
        actions={
          <ReturnNavButton fallbackHref="/app" fallbackLabel="My clubs" />
        }
      />

      <div className="clubHomeStack">
        <ClubBookHero club={club} />
        <ClubStatsRow club={club} profiles={profiles} closedReads={closedReads} />
        <ClubBooksReadSection
          clubId={club.clubId}
          closedReads={closedReads}
          loadError={closedReadsError}
        />

        <ClubWeekDiscussionPanel
          club={club}
          weeks={weeks}
          uid={user!.uid}
          displayName={displayName}
          isCreator={!!isCreator}
        />

        <ClubStorySection
          club={club}
          uid={user!.uid}
          displayName={displayName}
          isCreator={!!isCreator}
          onUpdated={() => loadClub({ silent: true })}
        />

        {isCreator && (
          <PendingJoinRequestsPanel
            requests={pendingRequests}
            busy={busy}
            onApprove={handleApprove}
            onReject={handleReject}
            clubId={club.clubId}
            clubName={club.name}
          />
        )}

        {isCreator && (
          <Link href={`/app/clubs/${club.clubId}/manage`} className="btnSecondary btnBlock">
            Manage club
          </Link>
        )}
      </div>

      {error && <div className="alertError" style={{ marginTop: 14 }}>{error}</div>}
    </>
  );
}
