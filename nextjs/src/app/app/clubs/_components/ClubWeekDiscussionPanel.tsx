"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getQuizResult } from "@/lib/quizStore";
import type { Club, Week } from "@/lib/types";
import ClubDiscussionBoard from "./ClubDiscussionBoard";

type WeekStatus = "passed" | "failed" | "locked";

export default function ClubWeekDiscussionPanel({
  club,
  weeks,
  uid,
  displayName,
  isCreator,
}: {
  club: Club;
  weeks: Week[];
  uid: string;
  displayName: string;
  isCreator: boolean;
}) {
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [status, setStatus] = useState<WeekStatus>("locked");
  const [checkingPass, setCheckingPass] = useState(false);
  /** Week id that `status` was verified for — prevents stale pass state on switch. */
  const [verifiedWeekId, setVerifiedWeekId] = useState("");

  function handleWeekChange(nextWeekId: string) {
    setStatus("locked");
    setCheckingPass(true);
    setVerifiedWeekId("");
    setSelectedWeekId(nextWeekId);
  }

  useEffect(() => {
    if (weeks.length === 0) {
      setSelectedWeekId("");
      return;
    }
    if (!selectedWeekId || !weeks.some((w) => w.weekId === selectedWeekId)) {
      setSelectedWeekId(weeks[weeks.length - 1].weekId);
    }
  }, [weeks, selectedWeekId]);

  const refreshPassStatus = useCallback(async () => {
    if (!selectedWeekId || !uid) {
      setStatus("locked");
      setVerifiedWeekId("");
      return;
    }
    const weekIdForCheck = selectedWeekId;
    setCheckingPass(true);
    try {
      const r = await getQuizResult(uid, weekIdForCheck);
      if (weekIdForCheck !== selectedWeekId) return;
      if (r?.passed) setStatus("passed");
      else if (r) setStatus("failed");
      else setStatus("locked");
      setVerifiedWeekId(weekIdForCheck);
    } catch (e) {
      console.error("[ClubWeekDiscussionPanel] pass check failed:", e);
      if (weekIdForCheck === selectedWeekId) {
        setStatus("locked");
        setVerifiedWeekId(weekIdForCheck);
      }
    } finally {
      if (weekIdForCheck === selectedWeekId) setCheckingPass(false);
    }
  }, [selectedWeekId, uid]);

  useEffect(() => {
    refreshPassStatus();
  }, [refreshPassStatus]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshPassStatus();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refreshPassStatus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refreshPassStatus);
    };
  }, [refreshPassStatus]);

  const passed =
    status === "passed" &&
    !checkingPass &&
    verifiedWeekId === selectedWeekId &&
    selectedWeekId !== "";

  if (weeks.length === 0) {
    return (
      <div className="card clubHomeDiscussion">
        <p className="muted">
          {isCreator
            ? "Add a reading week in Manage weeks & quizzes."
            : "The club leader has not added weeks yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="card clubHomeDiscussion">
      <div className="clubWeekToolbar">
        <label className="clubWeekSelectWrap">
          <span className="muted clubWeekSelectLabel">Reading week</span>
          <select
            className="inputField clubWeekSelect"
            value={selectedWeekId}
            onChange={(e) => handleWeekChange(e.target.value)}
          >
            {weeks.map((week) => (
              <option key={week.weekId} value={week.weekId}>
                {week.label}
              </option>
            ))}
          </select>
        </label>
        <div className="clubWeekToolbarActions">
          {checkingPass ? (
            <span className="muted" style={{ fontSize: 13 }}>Checking...</span>
          ) : (
            <>
              {status === "passed" && (
                <span className="statusBadge statusBadge--passed">Unlocked</span>
              )}
              {status === "failed" && (
                <span className="statusBadge statusBadge--locked">Retry quiz</span>
              )}
              {status === "locked" && (
                <span className="statusBadge statusBadge--ready">Pass quiz to unlock</span>
              )}
            </>
          )}
          <Link
            href={`/app/clubs/${club.clubId}/weeks/${selectedWeekId}/quiz`}
            className="btnSecondary btnSmall"
          >
            {passed ? "Retake quiz" : "Take quiz"}
          </Link>
        </div>
      </div>

      <div className="clubHomeDiscussionBody">
        {checkingPass ? (
          <p className="muted lockedPanel">Checking quiz status...</p>
        ) : !passed ? (
          <div className="lockedPanel">
            <p className="muted">Pass the quiz for this week to join the discussion.</p>
            <Link
              href={`/app/clubs/${club.clubId}/weeks/${selectedWeekId}/quiz`}
              className="btnPrimary"
              style={{ marginTop: 12, display: "inline-block" }}
            >
              Take quiz
            </Link>
          </div>
        ) : (
          <ClubDiscussionBoard
            key={selectedWeekId}
            weekId={selectedWeekId}
            uid={uid}
            displayName={displayName}
            passed={passed}
            embedded
          />
        )}
      </div>
    </div>
  );
}
