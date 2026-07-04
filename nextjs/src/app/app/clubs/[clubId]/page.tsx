"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  approveJoinRequest,
  getClub,
  onPendingJoinRequestsChange,
  rejectJoinRequest,
} from "@/lib/clubStore";
import { addWeek, listWeeksForClub } from "@/lib/weekStore";
import { getQuizResultsForUser, saveQuizForWeek } from "@/lib/quizStore";
import type { Club, JoinRequest, QuizQuestion, QuizResult, Week } from "@/lib/types";
import PageTitleCard from "../../../_components/PageTitleCard";

const emptyQuestion = (): QuizQuestion => ({
  questionText: "",
  choices: ["", ""],
  correctIndex: 0,
});

export default function ClubPage() {
  const params = useParams();
  const clubId = String(params.clubId || "");
  const { user } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [results, setResults] = useState<Record<string, QuizResult>>({});
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [weekLabel, setWeekLabel] = useState("");
  const [setupWeekId, setSetupWeekId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);
  const [busy, setBusy] = useState(false);

  const isCreator = user && club && club.createdBy === user.uid;
  const isMember = user && club && club.memberUids.includes(user.uid);

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
      if (!c.memberUids.includes(user.uid)) {
        setError("You are not a member of this club yet.");
        setClub(c);
        return;
      }
      setClub(c);
      const w = await listWeeksForClub(c.clubId);
      setWeeks(w);
      const r = await getQuizResultsForUser(
        user.uid,
        w.map((wk) => wk.weekId)
      );
      setResults(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load club.");
    } finally {
      setLoading(false);
    }
  }, [clubId, user]);

  useEffect(() => {
    if (!club || !user || club.createdBy !== user.uid) {
    setPendingRequests([]);
    return;
  }
  return onPendingJoinRequestsChange(club.clubId, setPendingRequests);
  }, [club, user]);

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

  async function handleApprove(req: JoinRequest) {
    setBusy(true);
    try {
      await approveJoinRequest(req);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not approve request.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(req: JoinRequest) {
    setBusy(true);
    try {
      await rejectJoinRequest(req);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reject request.");
    } finally {
      setBusy(false);
    }
  }

  function weekStatus(weekId: string) {
    const r = results[weekId];
    if (r?.passed) return "passed";
    if (r && !r.passed) return "failed";
    return "locked";
  }

  if (loading) {
    return <p className="muted">Loading club...</p>;
  }

  if (!club) {
    return (
      <div className="card">
        <p>{error || "Club not found."}</p>
        <Link href="/app" className="btnSecondary" style={{ marginTop: 12, display: "inline-block" }}>
          Back to clubs
        </Link>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="card">
        <p>{error || "You need approval to access this club."}</p>
        <p className="muted" style={{ marginTop: 8 }}>
          Club ID: {club.clubId} — request to join from the clubs list.
        </p>
        <Link href="/app" className="btnSecondary" style={{ marginTop: 12, display: "inline-block" }}>
          Back to clubs
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageTitleCard
        title={club.name}
        subtitle={`${club.bookTitle} by ${club.bookAuthor}`}
        actions={
          <Link href="/app" className="btnSecondary">
            All clubs
          </Link>
        }
      />

      <div className="card" style={{ marginTop: 14 }}>
        <p className="muted">
          Share this Club ID so others can request to join:{" "}
          <strong style={{ letterSpacing: "0.06em" }}>{club.clubId}</strong>
        </p>
      </div>

      {isCreator && (
        <div className="card creatorPanel joinRequestsPanel" style={{ marginTop: 14 }}>
          <h2 style={{ marginBottom: 10 }}>Pending join requests</h2>
          {pendingRequests.length === 0 ? (
            <p className="muted">No pending requests right now.</p>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.requestId} className="joinRequestRow">
                <span className="joinRequestName">{req.displayName}</span>
                <div className="joinRequestActions">
                  <button
                    type="button"
                    className="btnPrimary btnSmall"
                    disabled={busy}
                    onClick={() => handleApprove(req)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btnSecondary btnSmall"
                    disabled={busy}
                    onClick={() => handleReject(req)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isCreator && (
        <div className="card creatorPanel" style={{ marginTop: 14 }}>
          <h2 style={{ marginBottom: 10 }}>Club setup (creator only)</h2>
          <div className="formGrid">
            <label style={{ display: "grid", gap: 6 }}>
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

          {setupWeekId && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <h3 style={{ marginBottom: 10 }}>
                Quiz for {weeks.find((w) => w.weekId === setupWeekId)?.label}
              </h3>
              {questions.map((q, qi) => (
                <div key={qi} className="card" style={{ marginBottom: 10 }}>
                  <label style={{ display: "grid", gap: 6, marginBottom: 8 }}>
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
                    <label key={ci} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correctIndex === ci}
                        onChange={() => {
                          const next = [...questions];
                          next[qi] = { ...next[qi], correctIndex: ci };
                          setQuestions(next);
                        }}
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
                    </label>
                  ))}
                  <button
                    type="button"
                    className="btnSecondary btnSmall"
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
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btnSecondary btnSmall"
                  onClick={() => setQuestions([...questions, emptyQuestion()])}
                >
                  Add question
                </button>
                <button type="button" className="btnPrimary btnSmall" disabled={busy} onClick={handleSaveQuiz}>
                  Save quiz
                </button>
                <button
                  type="button"
                  className="btnSecondary btnSmall"
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

      <div className="card" style={{ marginTop: 14 }}>
        <h2 style={{ marginBottom: 10 }}>Reading weeks</h2>
        {weeks.length === 0 ? (
          <p className="muted">
            {isCreator
              ? "Add a reading week above, then attach a quiz."
              : "The club creator has not added weeks yet."}
          </p>
        ) : (
          weeks.map((week) => {
            const status = weekStatus(week.weekId);
            return (
              <div key={week.weekId} className="weekRow">
                <div>
                  <strong>{week.label}</strong>
                  <div style={{ marginTop: 4 }}>
                    {status === "passed" && (
                      <span className="statusBadge statusBadge--passed">Discussion unlocked</span>
                    )}
                    {status === "failed" && (
                      <span className="statusBadge statusBadge--locked">Quiz failed — retry</span>
                    )}
                    {status === "locked" && (
                      <span className="statusBadge statusBadge--ready">Pass quiz to unlock</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link
                    href={`/app/clubs/${club.clubId}/weeks/${week.weekId}/quiz`}
                    className="btnSecondary btnSmall"
                  >
                    {status === "passed" ? "Retake quiz" : "Take quiz"}
                  </Link>
                  {status === "passed" ? (
                    <Link
                      href={`/app/clubs/${club.clubId}/weeks/${week.weekId}/discussion`}
                      className="btnPrimary btnSmall"
                    >
                      Discussion
                    </Link>
                  ) : (
                    <span className="btnSecondary btnSmall" style={{ opacity: 0.5, cursor: "not-allowed" }}>
                      Discussion locked
                    </span>
                  )}
                  {isCreator && (
                    <button
                      type="button"
                      className="btnSecondary btnSmall"
                      onClick={() => {
                        setSetupWeekId(week.weekId);
                        setQuestions([emptyQuestion()]);
                      }}
                    >
                      Edit quiz
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <div className="card" style={{ marginTop: 14, borderColor: "rgba(244,67,54,.4)" }}>
          {error}
        </div>
      )}
    </>
  );
}
