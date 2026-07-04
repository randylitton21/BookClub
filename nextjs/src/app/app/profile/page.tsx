"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authContext";
import { getUserProfile, saveUserProfile } from "@/lib/userStore";
import PageTitleCard from "../../_components/PageTitleCard";

export default function ProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((p) => {
      if (!p) return;
      setDisplayName(p.displayName || "");
      setPhotoURL(p.photoURL || "");
      setAboutMe(p.aboutMe || "");
    });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setError(null);
    setMessage(null);
    setIsBusy(true);
    try {
      await saveUserProfile(user.uid, {
        displayName: displayName.trim() || "Reader",
        photoURL: photoURL.trim() || null,
        aboutMe: aboutMe.trim(),
      });
      setMessage("Profile saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <PageTitleCard title="Profile" subtitle="Your name and photo show up in club discussions." />
      <div className="card" style={{ marginTop: 14 }}>
        <div className="formGrid">
          <label style={{ display: "grid", gap: 6 }}>
            <span className="muted">Display name</span>
            <input
              className="inputField"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others see you"
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="muted">Photo URL (optional)</span>
            <input
              className="inputField"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="muted">About me (optional)</span>
            <textarea
              className="inputField"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="A short intro for your clubmates"
            />
          </label>
          {message && <p className="muted">{message}</p>}
          {error && (
            <div className="card" style={{ borderColor: "rgba(244,67,54,.4)" }}>
              {error}
            </div>
          )}
          <button
            type="button"
            className="btnPrimary"
            disabled={isBusy}
            onClick={handleSave}
          >
            {isBusy ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </>
  );
}
