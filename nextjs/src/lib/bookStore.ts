"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "./firebaseClient";
import { bookClubLinkId, bookIdFromTitleAuthor } from "./bookIds";
import { getClub } from "./clubStore";
import type { Book, BookClubLink, BookClubStatus, Club, ClosedRead } from "./types";

function reviewSnippet(text: string, maxLen = 120): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trim()}…`;
}

async function ensureBookDoc(bookId: string, title: string, author: string): Promise<void> {
  if (!firestore) return;
  const ref = doc(firestore, "books", bookId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      bookId,
      title: title.trim(),
      author: author.trim(),
      readingCount: 0,
      queuedCount: 0,
      finishedCount: 0,
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, {
      title: title.trim(),
      author: author.trim(),
      updatedAt: serverTimestamp(),
    });
  }
}

async function recomputeBookCounts(bookId: string): Promise<void> {
  if (!firestore) return;
  const snap = await getDocs(
    query(collection(firestore, "bookClubs"), where("bookId", "==", bookId))
  );
  let readingCount = 0;
  let queuedCount = 0;
  let finishedCount = 0;
  for (const d of snap.docs) {
    const status = d.data().status as BookClubStatus;
    if (status === "reading") readingCount++;
    else if (status === "queued") queuedCount++;
    else if (status === "finished") finishedCount++;
  }
  await updateDoc(doc(firestore, "books", bookId), {
    readingCount,
    queuedCount,
    finishedCount,
    updatedAt: serverTimestamp(),
  });
}

export async function upsertBookClubLink(input: {
  bookId: string;
  title: string;
  author: string;
  club: Club;
  status: BookClubStatus;
  expectedStartDate?: string | null;
  readId?: string;
  leaderReviewSnippet?: string;
}): Promise<void> {
  if (!firestore) return;
  await ensureBookDoc(input.bookId, input.title, input.author);
  const linkId = bookClubLinkId(input.bookId, input.club.clubId);
  const link: BookClubLink = {
    linkId,
    bookId: input.bookId,
    clubId: input.club.clubId,
    clubName: input.club.name,
    memberCount: input.club.memberUids.length,
    status: input.status,
    expectedStartDate: input.expectedStartDate ?? null,
    readId: input.readId,
    leaderReviewSnippet: input.leaderReviewSnippet,
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(firestore, "bookClubs", linkId), link);
  await recomputeBookCounts(input.bookId);
}

export async function removeBookClubLink(bookId: string, clubId: string): Promise<void> {
  if (!firestore) return;
  const linkId = bookClubLinkId(bookId, clubId);
  const ref = doc(firestore, "bookClubs", linkId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  await deleteDoc(ref);
  await recomputeBookCounts(bookId);
}

export async function removeClubLinksByStatus(
  clubId: string,
  status: BookClubStatus
): Promise<void> {
  if (!firestore) return;
  const snap = await getDocs(
    query(collection(firestore, "bookClubs"), where("clubId", "==", clubId))
  );
  for (const d of snap.docs) {
    const data = d.data() as BookClubLink;
    if (data.status === status) {
      await deleteDoc(d.ref);
      await recomputeBookCounts(data.bookId);
    }
  }
}

export async function syncClubReadingBook(club: Club): Promise<void> {
  const title = club.bookTitle?.trim();
  const author = club.bookAuthor?.trim();
  if (!title || !author) {
    await removeClubLinksByStatus(club.clubId, "reading");
    return;
  }
  const bookId = bookIdFromTitleAuthor(title, author);
  // Remove other reading links for this club (different book)
  const snap = await getDocs(
    query(collection(firestore!, "bookClubs"), where("clubId", "==", club.clubId))
  );
  for (const d of snap.docs) {
    const data = d.data() as BookClubLink;
    if (data.status === "reading" && data.bookId !== bookId) {
      await deleteDoc(d.ref);
      await recomputeBookCounts(data.bookId);
    }
  }
  await upsertBookClubLink({
    bookId,
    title,
    author,
    club,
    status: "reading",
  });
}

export async function syncClubQueuedBook(club: Club): Promise<void> {
  const next = club.nextRead;
  if (!next?.title?.trim() || !next.author?.trim()) {
    await removeClubLinksByStatus(club.clubId, "queued");
    return;
  }
  const bookId = bookIdFromTitleAuthor(next.title, next.author);
  const snap = await getDocs(
    query(collection(firestore!, "bookClubs"), where("clubId", "==", club.clubId))
  );
  for (const d of snap.docs) {
    const data = d.data() as BookClubLink;
    if (data.status === "queued" && data.bookId !== bookId) {
      await deleteDoc(d.ref);
      await recomputeBookCounts(data.bookId);
    }
  }
  await upsertBookClubLink({
    bookId,
    title: next.title,
    author: next.author,
    club,
    status: "queued",
    expectedStartDate: next.expectedStartDate,
  });
}

export async function markBookFinishedForClub(
  club: Club,
  closedRead: Pick<ClosedRead, "readId" | "title" | "author" | "leaderFinalReview">
): Promise<void> {
  const bookId = bookIdFromTitleAuthor(closedRead.title, closedRead.author);
  // Remove reading link for this book (will be replaced by finished)
  const snap = await getDocs(
    query(collection(firestore!, "bookClubs"), where("clubId", "==", club.clubId))
  );
  for (const d of snap.docs) {
    const data = d.data() as BookClubLink;
    if (data.status === "reading" && data.bookId === bookId) {
      await deleteDoc(d.ref);
      await recomputeBookCounts(data.bookId);
    }
  }
  await upsertBookClubLink({
    bookId,
    title: closedRead.title,
    author: closedRead.author,
    club,
    status: "finished",
    readId: closedRead.readId,
    leaderReviewSnippet: reviewSnippet(closedRead.leaderFinalReview),
  });
}

export async function syncCatalogAfterPublish(input: {
  clubBefore: Club;
  closedRead: Pick<ClosedRead, "readId" | "title" | "author" | "leaderFinalReview">;
  clubAfter: Club;
}): Promise<void> {
  await markBookFinishedForClub(input.clubBefore, input.closedRead);
  await syncClubReadingBook(input.clubAfter);
  await syncClubQueuedBook(input.clubAfter);
}

export async function getBook(bookId: string): Promise<Book | null> {
  if (!firestore) return null;
  const snap = await getDoc(doc(firestore, "books", bookId));
  if (!snap.exists()) return null;
  return snap.data() as Book;
}

export type ExploreBookSort = Book & { sortPriority: number };

export function exploreSortPriority(book: Book): number {
  if (book.readingCount > 0) return 0;
  if (book.queuedCount > 0) return 1;
  return 2;
}

export function primaryBookStatus(book: Book): "reading" | "queued" | "library" {
  if (book.readingCount > 0) return "reading";
  if (book.queuedCount > 0) return "queued";
  return "library";
}

export async function listBooksForExplore(): Promise<ExploreBookSort[]> {
  if (!firestore) return [];
  const snap = await getDocs(collection(firestore, "books"));
  const books = snap.docs.map((d) => d.data() as Book);
  return books
    .map((b) => ({ ...b, sortPriority: exploreSortPriority(b) }))
    .sort((a, b) => {
      if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority;
      const au = (a.updatedAt as { seconds?: number })?.seconds ?? 0;
      const bu = (b.updatedAt as { seconds?: number })?.seconds ?? 0;
      return bu - au;
    });
}

export type BookClubsGrouped = {
  queued: BookClubLink[];
  reading: BookClubLink[];
  finished: BookClubLink[];
};

export type ExploreBookReview = {
  clubId: string;
  clubName: string;
  readId: string;
  leaderReviewSnippet: string;
  memberCount: number;
  closedAt?: unknown;
};

function closedAtMs(closedAt: unknown): number {
  if (!closedAt) return 0;
  const t = closedAt as { toDate?: () => Date; seconds?: number };
  if (typeof t.toDate === "function") return t.toDate().getTime();
  if (typeof t.seconds === "number") return t.seconds * 1000;
  return 0;
}

/** Leader reviews for browse — merges bookClubs finished links + closedReads fallback. */
export async function listBookReviewsForExplore(book: Book): Promise<ExploreBookReview[]> {
  if (!firestore) return [];
  const byReadId = new Map<string, ExploreBookReview>();

  const grouped = await listClubsForBook(book.bookId);
  for (const link of grouped.finished) {
    if (!link.readId) continue;
    byReadId.set(link.readId, {
      clubId: link.clubId,
      clubName: link.clubName,
      readId: link.readId,
      leaderReviewSnippet:
        link.leaderReviewSnippet?.trim() || "Leader review available — tap to read.",
      memberCount: link.memberCount,
    });
  }

  const closedSnap = await getDocs(collection(firestore, "closedReads"));
  for (const d of closedSnap.docs) {
    const read = { readId: d.id, ...d.data() } as ClosedRead;
    if (bookIdFromTitleAuthor(read.title, read.author) !== book.bookId) continue;

    const existing = byReadId.get(read.readId);
    if (existing) {
      if (
        !existing.leaderReviewSnippet ||
        existing.leaderReviewSnippet === "Leader review available — tap to read."
      ) {
        existing.leaderReviewSnippet = reviewSnippet(read.leaderFinalReview);
      }
      existing.closedAt = read.closedAt;
      continue;
    }

    const club = await getClub(read.clubId);
    byReadId.set(read.readId, {
      clubId: read.clubId,
      clubName: club?.name || "Book club",
      readId: read.readId,
      leaderReviewSnippet: reviewSnippet(read.leaderFinalReview),
      memberCount: club?.memberUids.length ?? 0,
      closedAt: read.closedAt,
    });
  }

  return [...byReadId.values()].sort(
    (a, b) => closedAtMs(b.closedAt) - closedAtMs(a.closedAt)
  );
}

export async function listClubsForBook(bookId: string): Promise<BookClubsGrouped> {
  if (!firestore) return { queued: [], reading: [], finished: [] };
  const snap = await getDocs(
    query(collection(firestore, "bookClubs"), where("bookId", "==", bookId))
  );
  const links = snap.docs.map((d) => d.data() as BookClubLink);
  const queued = links.filter((l) => l.status === "queued");
  const reading = links.filter((l) => l.status === "reading");
  const finished = links.filter((l) => l.status === "finished");
  queued.sort((a, b) => (a.expectedStartDate || "").localeCompare(b.expectedStartDate || ""));
  finished.sort((a, b) => {
    const au = (a.updatedAt as { seconds?: number })?.seconds ?? 0;
    const bu = (b.updatedAt as { seconds?: number })?.seconds ?? 0;
    return bu - au;
  });
  return { queued, reading, finished };
}

export async function rebuildBookCatalog(): Promise<{ books: number; links: number }> {
  if (!firestore) return { books: 0, links: 0 };
  const db = firestore;

  // Clear existing catalog
  const existingBooks = await getDocs(collection(db, "books"));
  const existingLinks = await getDocs(collection(db, "bookClubs"));
  for (const d of existingLinks.docs) await deleteDoc(d.ref);
  for (const d of existingBooks.docs) await deleteDoc(d.ref);

  const clubsSnap = await getDocs(collection(db, "clubs"));
  const closedSnap = await getDocs(collection(db, "closedReads"));

  let linkCount = 0;

  for (const d of clubsSnap.docs) {
    const club = d.data() as Club;
    if (club.bookTitle?.trim() && club.bookAuthor?.trim()) {
      await syncClubReadingBook(club);
      linkCount++;
    }
    if (club.nextRead?.title?.trim() && club.nextRead.author?.trim()) {
      await syncClubQueuedBook(club);
      linkCount++;
    }
  }

  for (const d of closedSnap.docs) {
    const read = { readId: d.id, ...d.data() } as ClosedRead;
    const club = await getClub(read.clubId);
    if (!club) continue;
    await markBookFinishedForClub(club, read);
    linkCount++;
  }

  const booksSnap = await getDocs(collection(db, "books"));
  return { books: booksSnap.size, links: linkCount };
}

export { bookIdFromTitleAuthor };
