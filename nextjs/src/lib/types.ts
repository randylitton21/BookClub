export type UserProfile = {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  aboutMe?: string;
};

export type NextRead = {
  title: string;
  author: string;
  /** ISO date YYYY-MM-DD for display on the homepage */
  expectedStartDate?: string | null;
};

export type Club = {
  clubId: string;
  name: string;
  bookTitle: string;
  bookAuthor: string;
  createdBy: string;
  memberUids: string[];
  /** Identifies the current reading cycle; legacy clubs default to `{clubId}_read1`. */
  activeReadId?: string;
  /** At most one queued next read. */
  nextRead?: NextRead | null;
  storyCloseStatus?: "none" | "collecting";
  /** Set when a queued read is promoted; used for optional homepage banner. */
  newReadBannerAt?: unknown;
};

export type Week = {
  weekId: string;
  clubId: string;
  label: string;
  order: number;
  /** Scopes week to a read cycle; omitted on legacy weeks (treated as first read). */
  readId?: string;
};

export type ClosedRead = {
  readId: string;
  clubId: string;
  title: string;
  author: string;
  closedAt: unknown;
  memberReviews: { uid: string; displayName: string; text: string }[];
  leaderFinalReview: string;
};

export type StoryClose = {
  clubId: string;
  readId: string;
  bookTitle: string;
  bookAuthor: string;
  status: "collecting";
};

export type QuizQuestion = {
  questionText: string;
  choices: string[];
  correctIndex: number;
};

export type Quiz = {
  quizId: string;
  weekId: string;
  questions: QuizQuestion[];
};

export type QuizResult = {
  resultId: string;
  weekId: string;
  uid: string;
  score: number;
  passed: boolean;
  passThreshold: number;
};

export type Post = {
  postId: string;
  weekId: string;
  uid: string;
  text: string;
  timestamp: unknown;
  displayName?: string;
};

export type JoinRequest = {
  requestId: string;
  clubId: string;
  uid: string;
  displayName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: unknown;
};

export type BookClubStatus = "reading" | "queued" | "finished";

export type Book = {
  bookId: string;
  title: string;
  author: string;
  readingCount: number;
  queuedCount: number;
  finishedCount: number;
  updatedAt?: unknown;
};

export type BookClubLink = {
  linkId: string;
  bookId: string;
  clubId: string;
  clubName: string;
  memberCount: number;
  status: BookClubStatus;
  expectedStartDate?: string | null;
  readId?: string;
  leaderReviewSnippet?: string;
  updatedAt?: unknown;
};

export const DEFAULT_PASS_THRESHOLD = 70;
