"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getClub } from "@/lib/clubStore";
import { clubActiveReadId } from "@/lib/readIds";
import {
  beginCloseStory,
  clearNextRead,
  listStoryCloseReviews,
  publishCloseStory,
  setNextRead,
  startActiveRead,
} from "@/lib/readStore";
import { addWeek, listWeeksForClub } from "@/lib/weekStore";
import { saveQuizForWeek } from "@/lib/quizStore";
import type { Club, QuizQuestion, Week } from "@/lib/types";
import PageTitleCard from "../../../../_components/PageTitleCard";

const emptyQuestion = (): QuizQuestion => ({
  questionText: "",
  choices: ["", ""],
  correctIndex: 0,
});

export default function ClubManagePage() {
  const params = useParams();
  const router = useRouter();
  const clubId = String(params.clubId || "");
  const { user } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekLabel, setWeekLabel] = useState("");
  const [setupWeekId, setSetupWeekId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);
  const [busy, setBusy] = useState(false);

  const [nextTitle, setNextTitle] = useState("");
  const [nextAuthor, setNextAuthor] = useState("");
  const [nextExpectedDate, setNextExpectedDate] = useState("");
  const [leaderFinalReview, setLeaderFinalReview] = useState("");
  const [closeReviews, setCloseReviews] = useState<
    { uid: string; displayName: string; text: string }[]
  >([]);

  const loadAll = useCallback(async () => {
    if (!user || !clubId) return;
    setLoading(true);
    setError(null);
    try {
      const c = await getClub(clubId);
      if (!c) {
        setError("Club not found.");
        setClub(null);
        return;
      }
      if (c.createdBy !== user.uid) {
        router.replace(`/app/clubs/${c.clubId}`);
        return;
      }
      setClub(c);
      const readId = clubActiveReadId(c);
      setWeeks(await listWeeksForClub(c.clubId, readId));
      if (c.storyCloseStatus === "collecting") {
        setCloseReviews(await listStoryCloseReviews(c.clubId));
      } else {
        setCloseReviews([]);
      }
      if (c.nextRead) {
        setNextTitle(c.nextRead.title);
        setNextAuthor(c.nextRead.author);
        setNextExpectedDate(c.nextRead.expectedStartDate || "");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load club.");
    } finally {
      setLoading(false);
    }
  }, [clubId, user, router]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleAddWeek() {
    if (!club || !weekLabel.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await addWeek({
        clubId: club.clubId,
        label: weekLabel.trim(),
        order: weeks.length + 1,
        readId: clubActiveReadId(club),
      });
      setWeekLabel("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add week.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveQuiz() {
    if (!setupWeekId) return;
    setBusy(true);
    setError(null);
    try {
      const cleaned = questions
        .map((q) => ({
          ...q,
          questionText: q.questionText.trim(),
          choices: q.choices.map((c) => c.trim()).filter(Boolean),
        }))
        .filter((q) => q.questionText && q.choices.length >= 2);
      if (cleaned.length === 0) {
        throw new Error("Add at least one question with two choices.");
      }
      await saveQuizForWeek(setupWeekId, cleaned);
      setSetupWeekId(null);
      setQuestions([emptyQuestion()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save quiz.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStartActiveRead() {
    if (!club) return;
    setBusy(true);
    setError(null);
    try {
      await startActiveRead(club.clubId, {
        title: nextTitle,
        author: nextAuthor,
      });
      setNextTitle("");
      setNextAuthor("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start read.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveNextRead() {
    if (!club) return;
    setBusy(true);
    setError(null);
    try {
      await setNextRead(club.clubId, {
        title: nextTitle,
        author: nextAuthor,
        expectedStartDate: nextExpectedDate || null,
      });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save next read.");
    } finally {
      setBusy(false);
    }
  }

  async function handleClearNextRead() {
    if (!club) return;
    setBusy(true);
    setError(null);
    try {
      await clearNextRead(club.clubId);
      setNextTitle("");
      setNextAuthor("");
      setNextExpectedDate("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not clear next read.");
    } finally {
      setBusy(false);
    }
  }

  async function handleBeginClose() {
    if (!club) return;
    setBusy(true);
    setError(null);
    try {
      await beginCloseStory(club.clubId);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not begin Close the Story.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePublishClose() {
    if (!club) return;
    setBusy(true);
    setError(null);
    try {
      await publishCloseStory({
        clubId: club.clubId,
        leaderFinalReview,
      });
      setLeaderFinalReview("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not publish.");
    } finally {
      setBusy(false);
    }
  }

  const collecting = club?.storyCloseStatus === "collecting";
  const hasQueuedNext = Boolean(club?.nextRead?.title);
  const hasActiveBook = Boolean(club?.bookTitle?.trim());

  if (loading) return <p className="muted">Loading…</p>;

  if (!club) {
    return (
      <div className="card">
        <p>{error || "Club not found."}</p>
        <div className="pageActionsRow">
          <Link href="/app" className="btnSecondary">
            Back to clubs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitleCard
        title="Manage club"
        subtitle={club.name}
        actions={
          <Link href={`/app/clubs/${club.clubId}`} className="btnGhost btnSmall">
            ← Back to club
          </Link>
        }
      />

      <div className="managePageStack">
        <div className="card manageSection card--section">
          <p className="muted">
            As club leader, closing the story for each book is your duty — members share short
            reviews, then you publish the final piece with the book title.
          </p>
        </div>

        {hasActiveBook && !collecting && (
          <div className="card manageSection">
            <h2 className="sectionHeading">Next read</h2>
            <p className="sectionHint muted">
              Queue one book at a time. It starts automatically when you publish Close the Story.
              Expected start date is shown on the club homepage.
            </p>
            {hasQueuedNext ? (
              <>
                <p>
                  <strong>{club.nextRead!.title}</strong>
                  <span className="muted"> by {club.nextRead!.author}</span>
                </p>
                {club.nextRead!.expectedStartDate && (
                  <p className="muted">Expected start: {club.nextRead!.expectedStartDate}</p>
                )}
                <button
                  type="button"
                  className="btnGhost btnSmall"
                  style={{ marginTop: 12 }}
                  disabled={busy}
                  onClick={handleClearNextRead}
                >
                  Clear next read
                </button>
              </>
            ) : (
              <div className="formGrid">
                <label className="formLabel">
                  <span className="muted">Book title</span>
                  <input
                    className="inputField"
                    value={nextTitle}
                    onChange={(e) => setNextTitle(e.target.value)}
                    placeholder="Next book title"
                  />
                </label>
                <label className="formLabel">
                  <span className="muted">Author</span>
                  <input
                    className="inputField"
                    value={nextAuthor}
                    onChange={(e) => setNextAuthor(e.target.value)}
                    placeholder="Author name"
                  />
                </label>
                <label className="formLabel">
                  <span className="muted">Expected start date (optional)</span>
                  <input
                    type="date"
                    className="inputField"
                    value={nextExpectedDate}
                    onChange={(e) => setNextExpectedDate(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="btnPrimary btnBlock"
                  disabled={busy || !nextTitle.trim() || !nextAuthor.trim()}
                  onClick={handleSaveNextRead}
                >
                  Save next read
                </button>
              </div>
            )}
          </div>
        )}

        {hasActiveBook && (
          <div className={`card manageSection${collecting ? " clubStorySection--active" : ""}`}>
            <h2 className="sectionHeading">Close the Story</h2>
            {collecting ? (
              <>
                <p className="sectionHint muted">
                  Closing <strong>{club.bookTitle}</strong>. Member reviews ({closeReviews.length}):
                </p>
                {closeReviews.length === 0 ? (
                  <p className="emptyStateInline muted">No member reviews yet.</p>
                ) : (
                  <ul className="memberList" style={{ marginBottom: 14 }}>
                    {closeReviews.map((r) => (
                      <li key={r.uid} className="memberReviewCard">
                        <strong>{r.displayName}</strong>
                        <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{r.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <label className="formLabel">
                  <span className="muted">Your final review (publishes with book title)</span>
                  <textarea
                    className="inputField"
                    rows={6}
                    value={leaderFinalReview}
                    onChange={(e) => setLeaderFinalReview(e.target.value)}
                    placeholder="Tie the club's experience together…"
                  />
                </label>
                <button
                  type="button"
                  className="btnAccent btnBlock"
                  style={{ marginTop: 12 }}
                  disabled={busy || !leaderFinalReview.trim()}
                  onClick={handlePublishClose}
                >
                  {busy ? "Publishing…" : "Publish and start next read"}
                </button>
              </>
            ) : (
              <>
                <p className="sectionHint muted">
                  Current book: <strong>{club.bookTitle}</strong> by {club.bookAuthor}
                  {!hasQueuedNext && (
                    <span> — queue a next read first if you want a seamless handoff.</span>
                  )}
                </p>
                <button
                  type="button"
                  className="btnAccent"
                  disabled={busy}
                  onClick={handleBeginClose}
                >
                  Begin Close the Story
                </button>
              </>
            )}
          </div>
        )}

        {!hasActiveBook && (
          <div className="card manageSection">
            <h2 className="sectionHeading">Start a read</h2>
            <p className="sectionHint muted">
              No active book. Add the club&apos;s current read below.
            </p>
            <div className="formGrid">
              <label className="formLabel">
                <span className="muted">Book title</span>
                <input
                  className="inputField"
                  value={nextTitle}
                  onChange={(e) => setNextTitle(e.target.value)}
                />
              </label>
              <label className="formLabel">
                <span className="muted">Author</span>
                <input
                  className="inputField"
                  value={nextAuthor}
                  onChange={(e) => setNextAuthor(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btnPrimary btnBlock"
                disabled={busy || !nextTitle.trim() || !nextAuthor.trim()}
                onClick={handleStartActiveRead}
              >
                Start this read
              </button>
            </div>
          </div>
        )}

        {hasActiveBook && !collecting && (
          <div className="card manageSection">
            <h2 className="sectionHeading">Weeks &amp; quizzes</h2>
            <div className="formGrid">
              <label className="formLabel">
                <span className="muted">New reading week</span>
                <input
                  className="inputField"
                  value={weekLabel}
                  onChange={(e) => setWeekLabel(e.target.value)}
                  placeholder='e.g. "Chapters 1–4"'
                />
              </label>
              <button
                type="button"
                className="btnPrimary"
                disabled={busy || !weekLabel.trim()}
                onClick={handleAddWeek}
              >
                Add week
              </button>
            </div>

            {weeks.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p className="sectionLabel">Edit quiz for a week</p>
                <div className="weekPickerRow">
                  {weeks.map((week) => (
                    <button
                      key={week.weekId}
                      type="button"
                      className={
                        setupWeekId === week.weekId ? "btnPrimary btnSmall" : "btnSecondary btnSmall"
                      }
                      onClick={() => {
                        setSetupWeekId(week.weekId);
                        setQuestions([emptyQuestion()]);
                      }}
                    >
                      {week.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {setupWeekId && (
              <div className="quizEditorBlock">
                <h3 className="sectionHeading" style={{ fontSize: "1rem" }}>
                  Quiz for {weeks.find((w) => w.weekId === setupWeekId)?.label}
                </h3>
                {questions.map((q, qi) => (
                  <div key={qi} className="card quizEditorQuestion">
                    <label className="formLabel" style={{ marginBottom: 10 }}>
                      <span className="muted">Question {qi + 1}</span>
                      <input
                        className="inputField"
                        value={q.questionText}
                        onChange={(e) => {
                          const next = [...questions];
                          next[qi] = { ...next[qi], questionText: e.target.value };
                          setQuestions(next);
                        }}
                      />
                    </label>
                    {q.choices.map((choice, ci) => (
                      <div key={ci} className="choiceEditorRow">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={q.correctIndex === ci}
                          onChange={() => {
                            const next = [...questions];
                            next[qi] = { ...next[qi], correctIndex: ci };
                            setQuestions(next);
                          }}
                          aria-label={`Mark choice ${ci + 1} as correct`}
                        />
                        <input
                          className="inputField"
                          value={choice}
                          placeholder={`Choice ${ci + 1}`}
                          onChange={(e) => {
                            const next = [...questions];
                            const choices = [...next[qi].choices];
                            choices[ci] = e.target.value;
                            next[qi] = { ...next[qi], choices };
                            setQuestions(next);
                          }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btnGhost btnSmall"
                      onClick={() => {
                        const next = [...questions];
                        next[qi] = { ...next[qi], choices: [...next[qi].choices, ""] };
                        setQuestions(next);
                      }}
                    >
                      Add choice
                    </button>
                  </div>
                ))}
                <div className="pageActionsRow">
                  <button
                    type="button"
                    className="btnSecondary btnSmall"
                    onClick={() => setQuestions([...questions, emptyQuestion()])}
                  >
                    Add question
                  </button>
                  <button
                    type="button"
                    className="btnPrimary btnSmall"
                    disabled={busy}
                    onClick={handleSaveQuiz}
                  >
                    Save quiz
                  </button>
                  <button
                    type="button"
                    className="btnGhost btnSmall"
                    onClick={() => {
                      setSetupWeekId(null);
                      setQuestions([emptyQuestion()]);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <div className="alertError">{error}</div>}
      </div>
    </>
  );
}
