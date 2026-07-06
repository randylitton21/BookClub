"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  createClub,
  getClub,
  listClubsForUser,
} from "@/lib/clubStore";
import type { Club } from "@/lib/types";

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
    if (!joinClubId.trim()) return;
    setJoinBusy(true);
    try {
      const club = await getClub(joinClubId.trim());
      if (!club) {
        setError("No club found with that ID.");
        return;
      }
      router.push(`/app/clubs/${club.clubId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not look up club.");
    } finally {
      setJoinBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <div className="myClubsHeader">
        <div>
          <h1 style={{ marginBottom: 4 }}>My Clubs</h1>
          <p className="muted">Tap a club to open it, or join with a Club ID below.</p>
        </div>
        <button
          type="button"
          className="btnPrimary"
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "Cancel" : "Create Club"}
        </button>
      </div>

      {showCreate && (
        <div className="myClubsCreate" style={{ marginTop: 14 }}>
          <h2 style={{ marginBottom: 10, fontSize: 18 }}>New club</h2>
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
            <p className="muted" style={{ fontSize: 13 }}>
              As club leader, closing the story for each book is your duty when the club finishes a read.
            </p>
          </div>
        </div>
      )}

      <div className="myClubsList" style={{ marginTop: 14 }}>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : clubs.length === 0 ? (
          <p className="muted">No clubs yet. Create one or join with a Club ID below.</p>
        ) : (
          <div className="formGrid">
            {clubs.map((club) => (
              <Link
                key={club.clubId}
                href={`/app/clubs/${club.clubId}`}
                className="card myClubsListItem"
              >
                <strong>{club.name}</strong>
                <div className="muted" style={{ fontSize: 14 }}>
                  {club.bookTitle} by {club.bookAuthor}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="myClubsJoin" style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
        <h2 style={{ marginBottom: 10, fontSize: 18 }}>Join a club</h2>
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
          <button
            type="button"
            className="btnPrimary"
            disabled={joinBusy || !joinClubId.trim()}
            onClick={handleLookupClub}
          >
            {joinBusy ? "Looking up..." : "View club"}
          </button>
          <p className="muted" style={{ fontSize: 13 }}>
            Opens the club homepage where you can see what they&apos;re reading and request to join.
          </p>
        </div>
      </div>

      {message && <p className="muted" style={{ marginTop: 12 }}>{message}</p>}
      {error && (
        <div className="card" style={{ marginTop: 12, borderColor: "rgba(244,67,54,.4)" }}>
          {error}
        </div>
      )}
    </div>
  );
}
