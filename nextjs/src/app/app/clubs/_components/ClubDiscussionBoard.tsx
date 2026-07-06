"use client";

import { useEffect, useState } from "react";
import { addPost, onPostsForWeek } from "@/lib/postStore";
import type { Post } from "@/lib/types";
import ReaderProfileLink from "../../_components/ReaderProfileLink";
import ProfileAvatar from "../../_components/ProfileAvatar";

function formatTime(ts: unknown): string {
  if (!ts || typeof ts !== "object") return "";
  const t = ts as { toDate?: () => Date };
  if (typeof t.toDate === "function") {
    return t.toDate().toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return "";
}

export default function ClubDiscussionBoard({
  weekId,
  uid,
  displayName,
  passed,
  embedded = false,
  profileReturnTo,
  profileReturnLabel,
}: {
  weekId: string;
  uid: string;
  displayName: string;
  passed: boolean;
  embedded?: boolean;
  profileReturnTo?: string;
  profileReturnLabel?: string;
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
        <div className="lockedPanelIcon" aria-hidden>
          🔒
        </div>
        <p className="muted">Pass the weekly quiz to read and post here.</p>
      </div>
    );
  }

  const boardClass = embedded ? "clubHomeBoard card card--flat" : "clubRoomBoard card card--flat";
  const composeClass = embedded ? "clubHomeCompose card" : "clubRoomCompose card";

  return (
    <>
      <div className={boardClass}>
        {posts.length === 0 ? (
          <p className="muted" style={{ padding: "8px 4px" }}>
            No posts yet — start the conversation.
          </p>
        ) : (
          posts.map((post) => {
            const name = post.displayName || "Reader";
            const authorUid = post.uid;
            return (
              <div key={post.postId} className="postItem">
                <div className="postItemHeader">
                  <ReaderProfileLink
                    uid={authorUid}
                    returnTo={profileReturnTo}
                    returnLabel={profileReturnLabel}
                    className="postItemAuthorLink"
                  >
                    <ProfileAvatar displayName={name} size="sm" />
                    <span>{name}</span>
                  </ReaderProfileLink>
                  <span className="postItemTime">{formatTime(post.timestamp)}</span>
                </div>
                <p className="postItemText postItemText--linked">{post.text}</p>
              </div>
            );
          })
        )}
      </div>

      <div className={composeClass}>
        <label className="formLabel">
          <span className="muted">Your message</span>
          <textarea
            className="inputField"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts on this week's reading…"
          />
        </label>
        {error && <div className="alertError" style={{ marginTop: 10 }}>{error}</div>}
        <button
          type="button"
          className="btnPrimary btnBlock"
          style={{ marginTop: 10 }}
          disabled={busy || !text.trim()}
          onClick={handlePost}
        >
          {busy ? "Posting…" : "Post to discussion"}
        </button>
      </div>
    </>
  );
}
