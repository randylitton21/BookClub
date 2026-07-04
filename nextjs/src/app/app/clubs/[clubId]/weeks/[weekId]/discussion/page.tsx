"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getClub } from "@/lib/clubStore";
import { getWeek } from "@/lib/weekStore";
import { getQuizResult } from "@/lib/quizStore";
import { addPost, onPostsForWeek } from "@/lib/postStore";
import { getUserProfile } from "@/lib/userStore";
import type { Post, Week } from "@/lib/types";
import PageTitleCard from "../../../../../../_components/PageTitleCard";

function formatTime(ts: unknown): string {
  if (!ts || typeof ts !== "object") return "";
  const t = ts as { toDate?: () => Date };
  if (typeof t.toDate === "function") {
    return t.toDate().toLocaleString();
  }
  return "";
}

export default function DiscussionPage() {
  const params = useParams();
  const clubId = String(params.clubId || "");
  const weekId = String(params.weekId || "");
  const { user } = useAuth();

  const [week, setWeek] = useState<Week | null>(null);
  const [passed, setPassed] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Reader");

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const userEmail = user.email;
    let unsub: (() => void) | undefined;

    async function load() {
      setLoading(true);
      try {
        const club = await getClub(clubId);
        if (!club || !club.memberUids.includes(uid)) {
          setError("You do not have access to this club.");
          return;
        }
        const w = await getWeek(weekId);
        if (!w || w.clubId !== club.clubId) {
          setError("Week not found.");
          return;
        }
        setWeek(w);
        const result = await getQuizResult(uid, weekId);
        const ok = result?.passed === true;
        setPassed(ok);
        if (!ok) return;

        const profile = await getUserProfile(uid);
        setDisplayName(profile?.displayName || userEmail?.split("@")[0] || "Reader");

        unsub = onPostsForWeek(weekId, setPosts);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load discussion.");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => {
      if (unsub) unsub();
    };
  }, [clubId, weekId, user]);

  async function handlePost() {
    if (!user || !passed) return;
    setBusy(true);
    setError(null);
    try {
      await addPost({ weekId, uid: user.uid, text, displayName });
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post message.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="muted">Loading discussion...</p>;

  if (error) {
    return (
      <div className="card">
        <p>{error}</p>
        <Link href={`/app/clubs/${clubId}`} className="btnSecondary" style={{ marginTop: 12, display: "inline-block" }}>
          Back to club
        </Link>
      </div>
    );
  }

  if (!passed) {
    return (
      <>
        <PageTitleCard
          title={week ? `Discussion: ${week.label}` : "Discussion"}
          subtitle="This board is locked until you pass the quiz."
          actions={
            <Link href={`/app/clubs/${clubId}/weeks/${weekId}/quiz`} className="btnPrimary">
              Take quiz
            </Link>
          }
        />
        <div className="card lockedPanel" style={{ marginTop: 14 }}>
          <p className="muted">Pass the weekly quiz to read and post here.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitleCard
        title={week ? `Discussion: ${week.label}` : "Discussion"}
        subtitle="Live with your club — new posts appear automatically."
        actions={
          <Link href={`/app/clubs/${clubId}`} className="btnSecondary">
            Back to club
          </Link>
        }
      />

      <div className="card" style={{ marginTop: 14 }}>
        {posts.length === 0 ? (
          <p className="muted">No posts yet. Start the conversation.</p>
        ) : (
          posts.map((post) => (
            <div key={post.postId} className="postItem">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <strong>{post.displayName || "Reader"}</strong>
                <span className="muted" style={{ fontSize: 13 }}>
                  {formatTime(post.timestamp)}
                </span>
              </div>
              <p style={{ marginTop: 6 }}>{post.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted">Your message</span>
          <textarea
            className="inputField"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts on this week's reading..."
          />
        </label>
        {error && (
          <div className="card" style={{ marginTop: 10, borderColor: "rgba(244,67,54,.4)" }}>
            {error}
          </div>
        )}
        <button
          type="button"
          className="btnPrimary"
          style={{ marginTop: 10 }}
          disabled={busy || !text.trim()}
          onClick={handlePost}
        >
          {busy ? "Posting..." : "Post"}
        </button>
      </div>
    </>
  );
}
