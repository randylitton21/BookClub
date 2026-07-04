"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { firestore } from "./firebaseClient";
import { quizResultDocId } from "./ids";
import { DEFAULT_PASS_THRESHOLD, type Quiz, type QuizQuestion, type QuizResult } from "./types";

export async function getQuizForWeek(weekId: string): Promise<Quiz | null> {
  if (!firestore) return null;
  const q = query(collection(firestore, "quizzes"), where("weekId", "==", weekId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { quizId: d.id, ...d.data() } as Quiz;
}

export async function saveQuizForWeek(weekId: string, questions: QuizQuestion[]): Promise<Quiz> {
  if (!firestore) throw new Error("Firebase not configured.");
  const existing = await getQuizForWeek(weekId);
  if (existing) {
    await setDoc(doc(firestore, "quizzes", existing.quizId), { weekId, questions });
    return { ...existing, questions };
  }
  const ref = doc(collection(firestore, "quizzes"));
  const quiz: Quiz = { quizId: ref.id, weekId, questions };
  await setDoc(ref, { weekId, questions });
  return quiz;
}

export function scoreQuiz(questions: QuizQuestion[], answers: number[]): number {
  if (questions.length === 0) return 0;
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) correct++;
  });
  return Math.round((correct / questions.length) * 100);
}

export async function submitQuizResult(input: {
  weekId: string;
  uid: string;
  score: number;
  passThreshold?: number;
}): Promise<QuizResult> {
  if (!firestore) throw new Error("Firebase not configured.");
  const passThreshold = input.passThreshold ?? DEFAULT_PASS_THRESHOLD;
  const resultId = quizResultDocId(input.uid, input.weekId);
  const result: QuizResult = {
    resultId,
    weekId: input.weekId,
    uid: input.uid,
    score: input.score,
    passed: input.score >= passThreshold,
    passThreshold,
  };
  await setDoc(doc(firestore, "quizResults", resultId), result);
  return result;
}

export async function getQuizResult(uid: string, weekId: string): Promise<QuizResult | null> {
  if (!firestore) return null;
  const snap = await getDoc(doc(firestore, "quizResults", quizResultDocId(uid, weekId)));
  return snap.exists() ? (snap.data() as QuizResult) : null;
}

export async function getQuizResultsForUser(
  uid: string,
  weekIds: string[]
): Promise<Record<string, QuizResult>> {
  const out: Record<string, QuizResult> = {};
  await Promise.all(
    weekIds.map(async (weekId) => {
      const r = await getQuizResult(uid, weekId);
      if (r) out[weekId] = r;
    })
  );
  return out;
}
