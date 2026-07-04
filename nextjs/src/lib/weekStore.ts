"use client";

import { collection, doc, getDoc, getDocs, query, setDoc, where, orderBy } from "firebase/firestore";
import { firestore } from "./firebaseClient";
import type { Week } from "./types";

export async function listWeeksForClub(clubId: string): Promise<Week[]> {
  if (!firestore) return [];
  const q = query(
    collection(firestore, "weeks"),
    where("clubId", "==", clubId),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ weekId: d.id, ...d.data() } as Week));
}

export async function addWeek(input: {
  clubId: string;
  label: string;
  order: number;
}): Promise<Week> {
  if (!firestore) throw new Error("Firebase not configured.");
  const ref = doc(collection(firestore, "weeks"));
  const week: Week = {
    weekId: ref.id,
    clubId: input.clubId,
    label: input.label.trim(),
    order: input.order,
  };
  await setDoc(ref, week);
  return week;
}

export async function getWeek(weekId: string): Promise<Week | null> {
  if (!firestore) return null;
  const snap = await getDoc(doc(firestore, "weeks", weekId));
  return snap.exists() ? ({ weekId: snap.id, ...snap.data() } as Week) : null;
}
