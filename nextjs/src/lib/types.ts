export type UserProfile = {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  aboutMe?: string;
};

export type Club = {
  clubId: string;
  name: string;
  bookTitle: string;
  bookAuthor: string;
  createdBy: string;
  memberUids: string[];
};

export type Week = {
  weekId: string;
  clubId: string;
  label: string;
  order: number;
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

export const DEFAULT_PASS_THRESHOLD = 70;
