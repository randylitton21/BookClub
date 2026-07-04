"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "./firebaseClient";
import { ensureUserProfile } from "./userStore";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setIsLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(firebaseAuth, async (u) => {
      setUser(u);
      if (u) {
        try {
          await ensureUserProfile(u);
        } catch (err) {
          console.error("[auth] ensureUserProfile failed:", err);
        }
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      signIn: async (email, password) => {
        if (!firebaseAuth) throw new Error("Firebase not configured.");
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      signUp: async (email, password) => {
        if (!firebaseAuth) throw new Error("Firebase not configured.");
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await ensureUserProfile(cred.user);
      },
      signOut: async () => {
        if (!firebaseAuth) return;
        await signOut(firebaseAuth);
      },
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
