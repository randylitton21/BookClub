"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import PageTitleCard from "../../_components/PageTitleCard";

export default function LoginPage() {
  const { signIn, signUp, user, signOut } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push("/app");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="container">
      <PageTitleCard
        title="Sign In"
        subtitle={
          user
            ? `You're signed in as ${user.email}.`
            : "Create an account or sign in to join clubs and sync across devices."
        }
        actions={
          user ? (
            <>
              <Link className="btnSecondary" href="/app">
                My Clubs
              </Link>
              <button className="btnPrimary" type="button" onClick={signOut}>
                Sign Out
              </button>
            </>
          ) : null
        }
      />
      {!user && (
        <div className="card" style={{ marginTop: 14 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <button
              type="button"
              className={mode === "signin" ? "btnPrimary" : "btnSecondary"}
              onClick={() => setMode("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={mode === "signup" ? "btnPrimary" : "btnSecondary"}
              onClick={() => setMode("signup")}
            >
              Create Account
            </button>
          </div>

          <div className="formGrid">
            <label style={{ display: "grid", gap: 6 }}>
              <span className="muted">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="inputField"
                type="email"
                placeholder="you@example.com"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span className="muted">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="inputField"
                type="password"
                placeholder="At least 6 characters"
              />
            </label>

            {error ? (
              <div className="card" style={{ borderColor: "rgba(244,67,54,.4)" }}>
                <strong>Login problem:</strong> {error}
              </div>
            ) : null}

            <button
              className="btnPrimary"
              type="button"
              disabled={isBusy || !email || !password}
              onClick={handleSubmit}
            >
              {isBusy
                ? "Working..."
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
