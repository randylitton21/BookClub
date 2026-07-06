"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import BrandLogo from "../../_components/BrandLogo";

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

  if (user) {
    return (
      <div className="authCard card">
        <h1 className="pageHeaderTitle" style={{ marginBottom: 8 }}>
          Welcome back
        </h1>
        <p className="muted" style={{ marginBottom: 18 }}>
          Signed in as {user.email}
        </p>
        <div className="formGrid">
          <Link className="btnPrimary btnBlock" href="/app">
            Go to My Clubs
          </Link>
          <button className="btnGhost btnBlock" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="authCard card">
      <div className="authBrand">
        <BrandLogo variant="auth" />
      </div>
      <h1 className="pageHeaderTitle" style={{ marginBottom: 6 }}>
        {mode === "signin" ? "Welcome back" : "Join Synlego"}
      </h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        {mode === "signin"
          ? "Sign in to join clubs and sync across devices."
          : "Create an account and start reading with friends."}
      </p>

      <div className="segmentedControl" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          className={mode === "signin" ? "segmentedControlActive" : ""}
          onClick={() => setMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={mode === "signup" ? "segmentedControlActive" : ""}
          onClick={() => setMode("signup")}
        >
          Create account
        </button>
      </div>

      <div className="formGrid">
        <label className="formLabel">
          <span className="muted">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="inputField"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label className="formLabel">
          <span className="muted">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="inputField"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="At least 6 characters"
          />
        </label>

        {error && <div className="alertError">{error}</div>}

        <button
          className="btnPrimary btnBlock"
          type="button"
          disabled={isBusy || !email || !password}
          onClick={handleSubmit}
        >
          {isBusy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}
