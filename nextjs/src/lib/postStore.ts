"use client";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { firestore } from "./firebaseClient";
import type { Post } from "./types";

export async function addPost(input: {
  weekId: string;
  uid: string;
  text: string;
  displayName?: string;
}): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured.");
  const trimmed = input.text.trim();
  if (!trimmed) throw new Error("Post cannot be empty.");
  await addDoc(collection(firestore, "posts"), {
    weekId: input.weekId,
    uid: input.uid,
    text: trimmed,
    displayName: input.displayName || "",
    timestamp: serverTimestamp(),
  });
}

export function onPostsForWeek(
  weekId: string,
  callback: (posts: Post[]) => void
): () => void {
  if (!firestore) return () => {};
  const q = query(
    collection(firestore, "posts"),
    where("weekId", "==", weekId),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(
    q,
    (snap) => {
      const posts = snap.docs.map(
        (d) => ({ postId: d.id, ...d.data() } as Post)
      );
      callback(posts);
    },
    (err) => {
      console.error("[postStore] listener error:", err);
      callback([]);
    }
  );
}
