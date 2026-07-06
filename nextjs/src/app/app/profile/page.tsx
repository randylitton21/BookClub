"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { getUserProfile, saveUserProfile } from "@/lib/userStore";
import PageTitleCard from "../../_components/PageTitleCard";
import ProfileAvatar from "../_components/ProfileAvatar";

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
      <PageTitleCard
        title="Edit profile"
        subtitle="Your name and photo show up in club discussions."
        actions={
          user && (
            <Link href={`/app/readers/${user.uid}`} className="btnSecondary btnSmall">
              Preview reader page
            </Link>
          )
        }
      />
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <ProfileAvatar
            displayName={displayName}
            photoURL={photoURL}
            size="lg"
          />
          <div>
            <div className="fontDisplay" style={{ fontSize: "1.2rem" }}>
              {displayName || "Reader"}
            </div>
            <div className="muted" style={{ fontSize: 14 }}>{user?.email}</div>
          </div>
        </div>
        <div className="formGrid">
          <label className="formLabel">
            <span className="muted">Display name</span>
            <input
              className="inputField"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others see you"
            />
          </label>
          <label className="formLabel">
            <span className="muted">Photo URL (optional)</span>
            <input
              className="inputField"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <label className="formLabel">
            <span className="muted">About me (optional)</span>
            <textarea
              className="inputField"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="A short intro for your clubmates"
            />
          </label>
          {message && <p className="alertSuccess">{message}</p>}
          {error && <div className="alertError">{error}</div>}
          <button type="button" className="btnPrimary btnBlock" disabled={isBusy} onClick={handleSave}>
            {isBusy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>
    </>
  );
}
