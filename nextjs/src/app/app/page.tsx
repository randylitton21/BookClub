"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  createClub,
  getClub,
  listClubsForUser,
  createJoinRequest,
} from "@/lib/clubStore";
import { getUserProfile } from "@/lib/userStore";
import type { Club } from "@/lib/types";
import PageTitleCard from "../_components/PageTitleCard";

export default function ClubsHomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [clubName, setClubName] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");

  const [joinClubId, setJoinClubId] = useState("");
  const [joinPreview, setJoinPreview] = useState<Club | null>(null);
  const [joinBusy, setJoinBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    listClubsForUser(user.uid)
      .then(setClubs)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load clubs"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCreate() {
    if (!user) return;
    setError(null);
    setJoinBusy(true);
    try {
      const club = await createClub({
        name: clubName,
        bookTitle,
        bookAuthor,
        creatorUid: user.uid,
      });
      router.push(`/app/clubs/${club.clubId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create club.");
    } finally {
      setJoinBusy(false);
    }
  }

  async function handleLookupClub() {
    setError(null);
    setMessage(null);
    setJoinPreview(null);
    if (!joinClubId.trim()) return;
    const club = await getClub(joinClubId.trim());
    if (!club) {
      setError("No club found with that ID.");
      return;
    }
    if (user && club.memberUids.includes(user.uid)) {
      router.push(`/app/clubs/${club.clubId}`);
      return;
    }
    setJoinPreview(club);
  }

  async function handleRequestJoin() {
    if (!user || !joinPreview) return;
    setError(null);
    setMessage(null);
    setJoinBusy(true);
    try {
      const profile = await getUserProfile(user.uid);
      await createJoinRequest({
        clubId: joinPreview.clubId,
        uid: user.uid,
        displayName: profile?.displayName || user.email?.split("@")[0] || "Reader",
      });
      setMessage(`Request sent to join "${joinPreview.name}". The creator must approve.`);
      setJoinPreview(null);
      setJoinClubId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send join request.");
    } finally {
      setJoinBusy(false);
    }
  }

  return (
    <>
      <PageTitleCard
        title="My Clubs"
        subtitle="Create a club or join one with a Club ID."
        actions={
          <button
            type="button"
            className="btnPrimary"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Cancel" : "Create Club"}
          </button>
        }
      />

      {showCreate && (
        <div className="card" style={{ marginTop: 14 }}>
          <h2 style={{ marginBottom: 10 }}>New club</h2>
          <div className="formGrid">
            <label style={{ display: "grid", gap: 6 }}>
              <span className="muted">Club name</span>
              <input
                className="inputField"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="Tuesday Night Readers"
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span className="muted">Book title</span>
              <input
                className="inputField"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="The book you're reading"
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span className="muted">Author</span>
              <input
                className="inputField"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                placeholder="Author name"
              />
            </label>
            <button
              type="button"
              className="btnPrimary"
              disabled={joinBusy || !clubName || !bookTitle || !bookAuthor}
              onClick={handleCreate}
            >
              {joinBusy ? "Creating..." : "Create Club"}
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <h2 style={{ marginBottom: 10 }}>Join a club</h2>
        <div className="formGrid">
          <label style={{ display: "grid", gap: 6 }}>
            <span className="muted">Club ID</span>
            <input
              className="inputField"
              value={joinClubId}
              onChange={(e) => setJoinClubId(e.target.value.toUpperCase())}
              placeholder="8-character ID from the club creator"
            />
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btnSecondary" onClick={handleLookupClub}>
              Look up club
            </button>
            {joinPreview && (
              <button
                type="button"
                className="btnPrimary"
                disabled={joinBusy}
                onClick={handleRequestJoin}
              >
                Request to Join
              </button>
            )}
          </div>
          {joinPreview && (
            <p className="muted">
              Found: <strong>{joinPreview.name}</strong> — {joinPreview.bookTitle} by{" "}
              {joinPreview.bookAuthor}
            </p>
          )}
        </div>
      </div>

      {message && <p className="muted" style={{ marginTop: 12 }}>{message}</p>}
      {error && (
        <div className="card" style={{ marginTop: 12, borderColor: "rgba(244,67,54,.4)" }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <h2 style={{ marginBottom: 10 }}>Clubs you&apos;re in</h2>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : clubs.length === 0 ? (
          <p className="muted">No clubs yet. Create one or request to join with a Club ID.</p>
        ) : (
          <div className="formGrid">
            {clubs.map((club) => (
              <Link
                key={club.clubId}
                href={`/app/clubs/${club.clubId}`}
                className="card"
                style={{ display: "block" }}
              >
                <strong>{club.name}</strong>
                <div className="muted" style={{ fontSize: 14 }}>
                  {club.bookTitle} by {club.bookAuthor}
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  Club ID: {club.clubId}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
