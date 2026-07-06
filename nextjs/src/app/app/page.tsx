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
import BookCover from "../_components/BookCover";
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
    <>
      <PageTitleCard
        title="My Clubs"
        subtitle="Tap a club to open it, or join with a Club ID below."
        actions={
          <button
            type="button"
            className={showCreate ? "btnSecondary" : "btnAccent"}
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Cancel" : "+ Create club"}
          </button>
        }
      />

      {showCreate && (
        <div className="card card--accent" style={{ marginBottom: 14 }}>
          <h2 className="fontDisplay" style={{ marginBottom: 12, fontSize: "1.15rem" }}>
            New club
          </h2>
          <div className="formGrid">
            <label className="formLabel">
              <span className="muted">Club name</span>
              <input
                className="inputField"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="Tuesday Night Readers"
              />
            </label>
            <label className="formLabel">
              <span className="muted">Book title</span>
              <input
                className="inputField"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="The book you're reading"
              />
            </label>
            <label className="formLabel">
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
              className="btnPrimary btnBlock"
              disabled={joinBusy || !clubName || !bookTitle || !bookAuthor}
              onClick={handleCreate}
            >
              {joinBusy ? "Creating…" : "Create club"}
            </button>
            <p className="muted" style={{ fontSize: 13 }}>
              As club leader, closing the story for each book is your duty when the club finishes a read.
            </p>
          </div>
        </div>
      )}

      <div className="formGrid">
        {loading ? (
          <p className="muted">Loading your clubs…</p>
        ) : clubs.length === 0 ? (
          <div className="card card--section">
            <p className="muted">No clubs yet. Create one above or join with a Club ID below.</p>
          </div>
        ) : (
          clubs.map((club) => (
            <Link
              key={club.clubId}
              href={`/app/clubs/${club.clubId}`}
              className="card myClubsListItem"
            >
              <BookCover title={club.bookTitle || club.name} size="sm" />
              <div className="myClubsListItemBody">
                <div className="myClubsListItemTitle">{club.name}</div>
                <div className="myClubsListItemBook">
                  {club.bookTitle ? `${club.bookTitle} · ${club.bookAuthor}` : "No active book"}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="card myClubsDivider">
        <h2 className="fontDisplay" style={{ marginBottom: 12, fontSize: "1.15rem" }}>
          Join a club
        </h2>
        <div className="formGrid">
          <label className="formLabel">
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
            className="btnPrimary btnBlock"
            disabled={joinBusy || !joinClubId.trim()}
            onClick={handleLookupClub}
          >
            {joinBusy ? "Looking up…" : "View club"}
          </button>
          <p className="muted" style={{ fontSize: 13 }}>
            Opens the club homepage where you can see what they&apos;re reading and request to join.
          </p>
        </div>
      </div>

      {message && <p className="alertSuccess" style={{ marginTop: 12 }}>{message}</p>}
      {error && <div className="alertError" style={{ marginTop: 12 }}>{error}</div>}
    </>
  );
}
