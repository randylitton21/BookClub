"use client";

import { clubActiveReadId } from "./readIds";
import { listClubsForUser } from "./clubStore";
import {
  getStoryClose,
  getStoryCloseReviewForMember,
  listClosedReads,
} from "./readStore";
import { getUserProfile } from "./userStore";
import type { Club, UserProfile } from "./types";

export type ReaderReviewKind = "member" | "leader";
export type ReaderReviewStatus = "published" | "pending";

export type ReaderReviewItem = {
  id: string;
  kind: ReaderReviewKind;
  status: ReaderReviewStatus;
  readId?: string;
  clubId: string;
  clubName: string;
  bookTitle: string;
  bookAuthor: string;
  text: string;
  dateAt: unknown;
};

export type ReaderFinishedBook = {
  readId: string;
  clubId: string;
  clubName: string;
  title: string;
  author: string;
  closedAt: unknown;
};

export type ReaderPublicProfile = {
  profile: UserProfile;
  isSelf: boolean;
  clubCount: number;
  booksFinishedCount: number;
  reviewCount: number;
  memberReviewCount: number;
  leaderReviewCount: number;
  ledClubs: Club[];
  memberClubs: Club[];
  reviews: ReaderReviewItem[];
  finishedBooks: ReaderFinishedBook[];
  hasSharedContext: boolean;
};

function timestampMs(ts: unknown): number {
  if (!ts) return 0;
  const t = ts as { toDate?: () => Date; seconds?: number };
  if (typeof t.toDate === "function") return t.toDate().getTime();
  if (typeof t.seconds === "number") return t.seconds * 1000;
  return 0;
}

export async function loadReaderPublicProfile(
  targetUid: string,
  viewerUid: string | undefined
): Promise<ReaderPublicProfile | null> {
  if (!targetUid) return null;

  const stored = await getUserProfile(targetUid);
  const profile: UserProfile = stored ?? {
    uid: targetUid,
    displayName: "Reader",
    photoURL: null,
    aboutMe: "",
  };

  const isSelf = Boolean(viewerUid && viewerUid === targetUid);
  const targetClubs = await listClubsForUser(targetUid);

  let visibleClubs: Club[] = targetClubs;
  if (!isSelf && viewerUid) {
    const viewerClubs = await listClubsForUser(viewerUid);
    const viewerIds = new Set(viewerClubs.map((c) => c.clubId));
    visibleClubs = targetClubs.filter((c) => viewerIds.has(c.clubId));
  } else if (!isSelf) {
    visibleClubs = [];
  }

  const ledClubs = visibleClubs.filter((c) => c.createdBy === targetUid);
  const memberClubs = visibleClubs.filter((c) => c.createdBy !== targetUid);

  const reviews: ReaderReviewItem[] = [];
  const finishedBooks: ReaderFinishedBook[] = [];
  const seenReadIds = new Set<string>();
  const publishedMemberKeys = new Set<string>();

  for (const club of visibleClubs) {
    const isLeader = club.createdBy === targetUid;
    const reads = await listClosedReads(club.clubId);

    for (const read of reads) {
      if (!seenReadIds.has(read.readId)) {
        seenReadIds.add(read.readId);
        finishedBooks.push({
          readId: read.readId,
          clubId: club.clubId,
          clubName: club.name,
          title: read.title,
          author: read.author,
          closedAt: read.closedAt,
        });
      }

      if (isLeader && read.leaderFinalReview?.trim()) {
        reviews.push({
          id: `leader-${read.readId}`,
          kind: "leader",
          status: "published",
          readId: read.readId,
          clubId: club.clubId,
          clubName: club.name,
          bookTitle: read.title,
          bookAuthor: read.author,
          text: read.leaderFinalReview.trim(),
          dateAt: read.closedAt,
        });
      }

      const memberReview = read.memberReviews.find((r) => r.uid === targetUid);
      if (memberReview) {
        publishedMemberKeys.add(`${club.clubId}:${read.readId}`);
        reviews.push({
          id: `member-${read.readId}`,
          kind: "member",
          status: "published",
          readId: read.readId,
          clubId: club.clubId,
          clubName: club.name,
          bookTitle: read.title,
          bookAuthor: read.author,
          text: memberReview.text,
          dateAt: read.closedAt,
        });
      }
    }

    if (club.storyCloseStatus === "collecting") {
      const pending = await getStoryCloseReviewForMember(club.clubId, targetUid);
      if (pending?.text?.trim()) {
        const story = await getStoryClose(club.clubId);
        const cycleReadId = story?.readId ?? clubActiveReadId(club);
        const pendingKey = `${club.clubId}:${cycleReadId}`;
        if (!publishedMemberKeys.has(pendingKey)) {
          reviews.push({
            id: `member-pending-${club.clubId}`,
            kind: "member",
            status: "pending",
            clubId: club.clubId,
            clubName: club.name,
            bookTitle: story?.bookTitle ?? club.bookTitle,
            bookAuthor: story?.bookAuthor ?? club.bookAuthor,
            text: pending.text.trim(),
            dateAt: pending.updatedAt,
          });
        }
      }
    }
  }

  reviews.sort((a, b) => timestampMs(b.dateAt) - timestampMs(a.dateAt));
  finishedBooks.sort((a, b) => timestampMs(b.closedAt) - timestampMs(a.closedAt));

  const memberReviewCount = reviews.filter((r) => r.kind === "member").length;
  const leaderReviewCount = reviews.filter((r) => r.kind === "leader").length;

  return {
    profile,
    isSelf,
    clubCount: isSelf ? targetClubs.length : visibleClubs.length,
    booksFinishedCount: finishedBooks.length,
    reviewCount: reviews.length,
    memberReviewCount,
    leaderReviewCount,
    ledClubs,
    memberClubs,
    reviews,
    finishedBooks,
    hasSharedContext: isSelf || visibleClubs.length > 0,
  };
}
