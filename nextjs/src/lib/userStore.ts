"use client";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile, type User } from "firebase/auth";
import { firebaseAuth, firestore } from "./firebaseClient";
import type { UserProfile } from "./types";

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  if (!firestore) throw new Error("Firebase not configured.");
  const ref = doc(firestore, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  const profile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName || user.email?.split("@")[0] || "Reader",
    photoURL: user.photoURL,
    aboutMe: "",
  };
  await setDoc(ref, profile);
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!firestore) return null;
  const snap = await getDoc(doc(firestore, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function getUserProfiles(uids: string[]): Promise<Record<string, UserProfile>> {
  const unique = [...new Set(uids)];
  const entries = await Promise.all(
    unique.map(async (uid) => {
      const profile = await getUserProfile(uid);
      return [uid, profile] as const;
    })
  );
  const out: Record<string, UserProfile> = {};
  for (const [uid, profile] of entries) {
    if (profile) out[uid] = profile;
  }
  return out;
}

export async function saveUserProfile(
  uid: string,
  updates: Pick<UserProfile, "displayName" | "photoURL" | "aboutMe">
): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured.");
  await setDoc(doc(firestore, "users", uid), { uid, ...updates }, { merge: true });
  if (firebaseAuth?.currentUser?.uid === uid) {
    await updateProfile(firebaseAuth.currentUser, {
      displayName: updates.displayName,
      photoURL: updates.photoURL || null,
    });
  }
}
