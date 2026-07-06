"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "./firebaseClient";
import { clubActiveReadId, generateNextReadId } from "./readIds";
import { getClub, resolveClubDocId } from "./clubStore";
import {
  syncCatalogAfterPublish,
  syncClubQueuedBook,
  syncClubReadingBook,
  removeBookClubLink,
  bookIdFromTitleAuthor,
} from "./bookStore";
import type { ClosedRead, Club, NextRead, StoryClose } from "./types";

function storyReviewDocId(clubId: string, uid: string): string {
  return `${clubId}_${uid}`;
}

function closedAtMs(closedAt: unknown): number {
  if (!closedAt) return 0;
  const t = closedAt as { toDate?: () => Date; seconds?: number };
  if (typeof t.toDate === "function") return t.toDate().getTime();
  if (typeof t.seconds === "number") return t.seconds * 1000;
  return 0;
}

function sortClosedReadsDesc(reads: ClosedRead[]): ClosedRead[] {
  return [...reads].sort((a, b) => closedAtMs(b.closedAt) - closedAtMs(a.closedAt));
}

export async function listClosedReads(clubId: string): Promise<ClosedRead[]> {
  if (!firestore) return [];
  // Single-field query — no composite index required; sort client-side.
  const q = query(collection(firestore, "closedReads"), where("clubId", "==", clubId));
  const snap = await getDocs(q);
  return sortClosedReadsDesc(
    snap.docs.map((d) => ({ readId: d.id, ...d.data() } as ClosedRead))
  );
}

export function formatClosedAtDate(closedAt: unknown): string {
  if (!closedAt) return "Date unknown";
  const t = closedAt as { toDate?: () => Date; seconds?: number };
  let date: Date;
  if (typeof t.toDate === "function") {
    date = t.toDate();
  } else if (typeof t.seconds === "number") {
    date = new Date(t.seconds * 1000);
  } else {
    return "Date unknown";
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function getClosedRead(readId: string): Promise<ClosedRead | null> {
  if (!firestore) return null;
  const snap = await getDoc(doc(firestore, "closedReads", readId));
  if (!snap.exists()) return null;
  return { readId: snap.id, ...snap.data() } as ClosedRead;
}

export async function getStoryClose(clubId: string): Promise<StoryClose | null> {
  if (!firestore) return null;
  const clubDocId = await resolveClubDocId(clubId);
  if (!clubDocId) return null;
  const snap = await getDoc(doc(firestore, "storyCloses", clubDocId));
  if (!snap.exists()) return null;
  return snap.data() as StoryClose;
}

export async function getStoryCloseReviewForMember(
  clubId: string,
  uid: string
): Promise<{ text: string; displayName: string; updatedAt: unknown } | null> {
  if (!firestore) return null;
  try {
    const snap = await getDoc(
      doc(firestore, "storyCloseReviews", storyReviewDocId(clubId, uid))
    );
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      text: data.text as string,
      displayName: data.displayName as string,
      updatedAt: data.updatedAt,
    };
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "permission-denied") return null;
    throw e;
  }
}

export async function listStoryCloseReviews(clubId: string): Promise<
  { uid: string; displayName: string; text: string }[]
> {
  if (!firestore) return [];
  try {
    const q = query(
      collection(firestore, "storyCloseReviews"),
      where("clubId", "==", clubId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: data.uid as string,
        displayName: data.displayName as string,
        text: data.text as string,
      };
    });
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "permission-denied") {
      console.warn("[readStore] listStoryCloseReviews skipped:", code);
      return [];
    }
    throw e;
  }
}

export async function setNextRead(
  clubId: string,
  input: NextRead
): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured.");
  const club = await getClub(clubId);
  if (!club) throw new Error("Club not found.");
  if (!club.bookTitle?.trim()) {
    throw new Error("Set the current book before queuing a next read.");
  }
  if (club.storyCloseStatus === "collecting") {
    throw new Error("Finish Close the Story before changing the next read.");
  }
  if (club.nextRead?.title) {
    throw new Error("A next read is already queued. Clear it first to change.");
  }
  const title = input.title.trim();
  const author = input.author.trim();
  if (!title || !author) throw new Error("Book title and author are required.");
  const nextRead: NextRead = {
    title,
    author,
    expectedStartDate: input.expectedStartDate?.trim() || null,
  };
  await updateDoc(doc(firestore, "clubs", club.clubId), { nextRead });
  const updated = await getClub(clubId);
  if (updated) await syncClubQueuedBook(updated);
}

/** When the club has no active book (between reads), start one directly. */
export async function startActiveRead(
  clubId: string,
  input: { title: string; author: string }
): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured.");
  const club = await getClub(clubId);
  if (!club) throw new Error("Club not found.");
  if (club.bookTitle?.trim()) {
    throw new Error("Close the current book before starting a new read.");
  }
  if (club.storyCloseStatus === "collecting") {
    throw new Error("Finish Close the Story first.");
  }
  const title = input.title.trim();
  const author = input.author.trim();
  if (!title || !author) throw new Error("Book title and author are required.");
  await updateDoc(doc(firestore, "clubs", club.clubId), {
    bookTitle: title,
    bookAuthor: author,
    activeReadId: generateNextReadId(club.clubId),
    storyCloseStatus: "none",
  });
  const updated = await getClub(clubId);
  if (updated) await syncClubReadingBook(updated);
}

export async function clearNextRead(clubId: string): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured.");
  const club = await getClub(clubId);
  if (!club) throw new Error("Club not found.");
  if (club.storyCloseStatus === "collecting") {
    throw new Error("Cannot change the next read while Close the Story is in progress.");
  }
  if (club.nextRead?.title && club.nextRead.author) {
    const bookId = bookIdFromTitleAuthor(club.nextRead.title, club.nextRead.author);
    await removeBookClubLink(bookId, club.clubId);
  }
  await updateDoc(doc(firestore, "clubs", club.clubId), { nextRead: null });
}

export async function beginCloseStory(clubId: string): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured.");
  const club = await getClub(clubId);
  if (!club) throw new Error("Club not found.");
  const clubDocId = await resolveClubDocId(clubId);
  if (!clubDocId) throw new Error("Club not found.");
  if (!club.bookTitle?.trim()) {
    throw new Error("There is no active book to close.");
  }
  if (club.storyCloseStatus === "collecting") {
    throw new Error("Close the Story is already in progress.");
  }
  const readId = clubActiveReadId(club);
  const storyClose: StoryClose = {
    clubId: club.clubId,
    readId,
    bookTitle: club.bookTitle,
    bookAuthor: club.bookAuthor,
    status: "collecting",
  };
  await setDoc(doc(firestore, "storyCloses", clubDocId), storyClose);
  await updateDoc(doc(firestore, "clubs", clubDocId), {
    storyCloseStatus: "collecting",
  });
}

export async function submitMemberReview(input: {
  clubId: string;
  uid: string;
  displayName: string;
  text: string;
}): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured.");
  const trimmed = input.text.trim();
  if (!trimmed) throw new Error("Review cannot be empty.");
  if (trimmed.length > 2000) throw new Error("Review must be 2000 characters or less.");
  const session = await getStoryClose(input.clubId);
  if (!session || session.status !== "collecting") {
    throw new Error("Close the Story is not open for reviews right now.");
  }
  await setDoc(doc(firestore, "storyCloseReviews", storyReviewDocId(input.clubId, input.uid)), {
    clubId: input.clubId,
    uid: input.uid,
    displayName: input.displayName,
    text: trimmed,
    updatedAt: serverTimestamp(),
  });
}

export async function publishCloseStory(input: {
  clubId: string;
  leaderFinalReview: string;
}): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured.");
  const db = firestore;
  const finalText = input.leaderFinalReview.trim();
  if (!finalText) throw new Error("Leader final review is required.");
  if (finalText.length > 8000) {
    throw new Error("Final review must be 8000 characters or less.");
  }

  const club = await getClub(input.clubId);
  if (!club) throw new Error("Club not found.");
  const clubDocId = await resolveClubDocId(input.clubId);
  if (!clubDocId) throw new Error("Club not found.");

  const clubRef = doc(db, "clubs", clubDocId);
  const storyRef = doc(db, "storyCloses", clubDocId);

  const reviewSnap = await getDocs(
    query(
      collection(db, "storyCloseReviews"),
      where("clubId", "==", club.clubId)
    )
  );

  const clubBefore = club;
  const storySession = await getStoryClose(input.clubId);
  const closedReadId = storySession?.readId ?? clubActiveReadId(clubBefore);

  await runTransaction(db, async (tx) => {
    const clubSnap = await tx.get(clubRef);
    const storySnap = await tx.get(storyRef);
    if (!clubSnap.exists()) throw new Error("Club not found.");
    if (!storySnap.exists()) throw new Error("Close the Story session not found.");
    const club = clubSnap.data() as Club;
    const story = storySnap.data() as StoryClose;
    if (story.status !== "collecting") {
      throw new Error("Close the Story is not in progress.");
    }

    const memberReviews = reviewSnap.docs.map((d) => {
      const data = d.data();
      return {
        uid: data.uid as string,
        displayName: data.displayName as string,
        text: data.text as string,
      };
    });

    const closedRead: ClosedRead = {
      readId: story.readId,
      clubId: club.clubId,
      title: story.bookTitle,
      author: story.bookAuthor,
      closedAt: serverTimestamp(),
      memberReviews,
      leaderFinalReview: finalText,
    };
    tx.set(doc(db, "closedReads", story.readId), closedRead);

    const next = club.nextRead;
    if (next?.title?.trim()) {
      const newReadId = generateNextReadId(club.clubId);
      tx.update(clubRef, {
        bookTitle: next.title.trim(),
        bookAuthor: next.author.trim(),
        activeReadId: newReadId,
        nextRead: null,
        storyCloseStatus: "none",
        newReadBannerAt: serverTimestamp(),
      });
    } else {
      tx.update(clubRef, {
        bookTitle: "",
        bookAuthor: "",
        storyCloseStatus: "none",
        nextRead: null,
      });
    }

    tx.delete(storyRef);
  });

  for (const d of reviewSnap.docs) {
    await deleteDoc(d.ref);
  }

  const clubAfter = await getClub(input.clubId);
  if (clubAfter) {
    await syncCatalogAfterPublish({
      clubBefore,
      closedRead: {
        readId: closedReadId,
        title: clubBefore.bookTitle,
        author: clubBefore.bookAuthor,
        leaderFinalReview: finalText,
      },
      clubAfter,
    });
  }
}
