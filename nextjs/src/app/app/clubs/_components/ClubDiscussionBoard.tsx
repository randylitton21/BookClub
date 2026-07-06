"use client";

import { useEffect, useState } from "react";
import { addPost, onPostsForWeek } from "@/lib/postStore";
import type { Post } from "@/lib/types";

function formatTime(ts: unknown): string {
  if (!ts || typeof ts !== "object") return "";
  const t = ts as { toDate?: () => Date };
  if (typeof t.toDate === "function") {
    return t.toDate().toLocaleString();
  }
  return "";
}

export default function ClubDiscussionBoard({
  weekId,
  uid,
  displayName,
  passed,
  embedded = false,
}: {
  weekId: string;
  uid: string;
  displayName: string;
  passed: boolean;
  embedded?: boolean;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!passed) return;
    return onPostsForWeek(weekId, setPosts);
  }, [weekId, passed]);

  async function handlePost() {
    if (!passed) return;
    setBusy(true);
    setError(null);
    try {
      await addPost({ weekId, uid, text, displayName });
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post message.");
    } finally {
      setBusy(false);
    }
  }

  if (!passed) {
    return (
      <div className={`card lockedPanel clubRoomLocked${embedded ? " clubRoomLocked--embedded" : ""}`}>
        <p className="muted">Pass the weekly quiz to read and post here.</p>
      </div>
    );
  }

  const boardClass = embedded ? "clubHomeBoard card" : "clubRoomBoard card";
  const composeClass = embedded ? "clubHomeCompose card" : "clubRoomCompose card";

  return (
    <>
      <div className={boardClass}>
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

      <div className={composeClass}>
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
          style={{ marginTop: 10, width: "100%" }}
          disabled={busy || !text.trim()}
          onClick={handlePost}
        >
          {busy ? "Posting..." : "Post"}
        </button>
      </div>
    </>
  );
}
