"use client";

import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "./firebaseClient";
import { generateClubId } from "./ids";
import { defaultActiveReadId } from "./readIds";
import { syncClubQueuedBook, syncClubReadingBook } from "./bookStore";
import type { Club, JoinRequest } from "./types";

export async function createClub(input: {
  name: string;
  bookTitle: string;
  bookAuthor: string;
  creatorUid: string;
}): Promise<Club> {
  if (!firestore) throw new Error("Firebase not configured.");
  const clubId = generateClubId();
  const club: Club = {
    clubId,
    name: input.name.trim(),
    bookTitle: input.bookTitle.trim(),
    bookAuthor: input.bookAuthor.trim(),
    createdBy: input.creatorUid,
    memberUids: [input.creatorUid],
    activeReadId: defaultActiveReadId(clubId),
    storyCloseStatus: "none",
    nextRead: null,
  };
  await setDoc(doc(firestore, "clubs", clubId), club);
  await syncClubReadingBook(club);
  return club;
}

export async function getClub(clubId: string): Promise<Club | null> {
  if (!firestore) return null;
  const snap = await getDoc(doc(firestore, "clubs", clubId.toUpperCase()));
  if (!snap.exists()) {
    const lower = await getDoc(doc(firestore, "clubs", clubId));
    return lower.exists() ? (lower.data() as Club) : null;
  }
  return snap.data() as Club;
}

/** Firestore document id for a club (handles ID casing). */
export async function resolveClubDocId(clubId: string): Promise<string | null> {
  if (!firestore) return null;
  const upperSnap = await getDoc(doc(firestore, "clubs", clubId.toUpperCase()));
  if (upperSnap.exists()) return upperSnap.id;
  const lowerSnap = await getDoc(doc(firestore, "clubs", clubId));
  return lowerSnap.exists() ? lowerSnap.id : null;
}

export async function listClubsForUser(uid: string): Promise<Club[]> {
  if (!firestore) return [];
  const q = query(collection(firestore, "clubs"), where("memberUids", "array-contains", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Club);
}

export async function createJoinRequest(input: {
  clubId: string;
  uid: string;
  displayName: string;
}): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured.");
  const club = await getClub(input.clubId);
  if (!club) throw new Error("Club not found. Check the Club ID.");
  if (club.memberUids.includes(input.uid)) {
    throw new Error("You are already a member of this club.");
  }
  const requestId = `${club.clubId}_${input.uid}`;
  const existing = await getDoc(doc(firestore, "joinRequests", requestId));
  if (existing.exists() && (existing.data() as JoinRequest).status === "pending") {
    throw new Error("You already have a pending request for this club.");
  }
  const req: JoinRequest = {
    requestId,
    clubId: club.clubId,
    uid: input.uid,
    displayName: input.displayName,
    status: "pending",
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(firestore, "joinRequests", requestId), req);
}

export async function listPendingJoinRequests(clubId: string): Promise<JoinRequest[]> {
  if (!firestore) return [];
  const q = query(
    collection(firestore, "joinRequests"),
    where("clubId", "==", clubId),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as JoinRequest);
}

/** Real-time pending join requests for club creators. */
export function onPendingJoinRequestsChange(
  clubId: string,
  callback: (requests: JoinRequest[]) => void
): () => void {
  if (!firestore) return () => {};
  const q = query(
    collection(firestore, "joinRequests"),
    where("clubId", "==", clubId),
    where("status", "==", "pending")
  );
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => d.data() as JoinRequest));
    },
    (err) => {
      console.error("[clubStore] pending join requests listener:", err);
      callback([]);
    }
  );
}

export async function approveJoinRequest(request: JoinRequest): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured.");
  await updateDoc(doc(firestore, "joinRequests", request.requestId), { status: "approved" });
  await updateDoc(doc(firestore, "clubs", request.clubId), {
    memberUids: arrayUnion(request.uid),
  });
}

export async function rejectJoinRequest(request: JoinRequest): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured.");
  await updateDoc(doc(firestore, "joinRequests", request.requestId), { status: "rejected" });
}
