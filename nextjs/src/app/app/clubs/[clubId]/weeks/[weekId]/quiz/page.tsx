"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getClub } from "@/lib/clubStore";
import { getWeek } from "@/lib/weekStore";
import {
  getQuizForWeek,
  getQuizResult,
  scoreQuiz,
  submitQuizResult,
} from "@/lib/quizStore";
import type { Quiz, Week } from "@/lib/types";
import PageTitleCard from "../../../../../../_components/PageTitleCard";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const clubId = String(params.clubId || "");
  const weekId = String(params.weekId || "");
  const { user } = useAuth();

  const [week, setWeek] = useState<Week | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
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
        const q = await getQuizForWeek(weekId);
        if (!q || q.questions.length === 0) {
          setError("No quiz has been set up for this week yet.");
          return;
        }
        setQuiz(q);
        setAnswers(q.questions.map(() => -1));
        const existing = await getQuizResult(uid, weekId);
        if (existing?.passed) {
          setResultText(`You already passed with ${existing.score}%. Discussion is unlocked.`);
        } else if (existing) {
          setResultText(`Last score: ${existing.score}%. Need ${existing.passThreshold}% to pass.`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clubId, weekId, user]);

  async function handleSubmit() {
    if (!user || !quiz) return;
    if (answers.some((a) => a < 0)) {
      setError("Answer every question before submitting.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const score = scoreQuiz(quiz.questions, answers);
      const result = await submitQuizResult({ weekId, uid: user.uid, score });
      if (result.passed) {
        setResultText(`You passed with ${score}%! Opening discussion...`);
        setTimeout(() => {
          router.push(`/app/clubs/${clubId}/room/${weekId}`);
        }, 800);
      } else {
        setResultText(`Score: ${score}%. You need ${result.passThreshold}% to pass. Try again.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit quiz.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="muted">Loading quiz...</p>;

  if (error && !quiz) {
    return (
      <div className="card">
        <p>{error}</p>
        <Link href={`/app/clubs/${clubId}`} className="btnSecondary" style={{ marginTop: 12, display: "inline-block" }}>
          Back to club
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageTitleCard
        title={week ? `Quiz: ${week.label}` : "Quiz"}
        subtitle="Pass the quiz to unlock this week's discussion."
        actions={
          <Link href={`/app/clubs/${clubId}`} className="btnSecondary">
            Back to club
          </Link>
        }
      />

      {resultText && (
        <div className="card" style={{ marginTop: 14 }}>
          <p>{resultText}</p>
        </div>
      )}

      {quiz && (
        <div className="card" style={{ marginTop: 14 }}>
          {quiz.questions.map((q, qi) => (
            <div key={qi} style={{ marginBottom: 18 }}>
              <p style={{ marginBottom: 8 }}>
                <strong>{qi + 1}.</strong> {q.questionText}
              </p>
              <div className="formGrid">
                {q.choices.map((choice, ci) => (
                  <label key={ci} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      checked={answers[qi] === ci}
                      onChange={() => {
                        const next = [...answers];
                        next[qi] = ci;
                        setAnswers(next);
                      }}
                    />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {error && (
            <div className="card" style={{ marginBottom: 12, borderColor: "rgba(244,67,54,.4)" }}>
              {error}
            </div>
          )}
          <button type="button" className="btnPrimary" disabled={busy} onClick={handleSubmit}>
            {busy ? "Submitting..." : "Submit quiz"}
          </button>
        </div>
      )}
    </>
  );
}
