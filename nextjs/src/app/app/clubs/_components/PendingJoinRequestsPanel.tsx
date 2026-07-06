"use client";

import type { JoinRequest } from "@/lib/types";
import ReaderProfileLink from "../../_components/ReaderProfileLink";

export default function PendingJoinRequestsPanel({
  requests,
  busy,
  onApprove,
  onReject,
  clubId,
  clubName,
}: {
  requests: JoinRequest[];
  busy: boolean;
  onApprove: (req: JoinRequest) => void;
  onReject: (req: JoinRequest) => void;
  clubId: string;
  clubName: string;
}) {
  return (
    <div className="card creatorPanel joinRequestsPanel">
      <h2 className="sectionHeading">Pending join requests</h2>
      {requests.length === 0 ? (
        <p className="emptyStateInline muted">No pending requests right now.</p>
      ) : (
        requests.map((req) => (
          <div key={req.requestId} className="joinRequestRow">
            <ReaderProfileLink
              uid={req.uid}
              returnTo={`/app/clubs/${clubId}`}
              returnLabel={clubName}
              className="joinRequestName"
            >
              {req.displayName}
            </ReaderProfileLink>
            <div className="joinRequestActions">
              <button
                type="button"
                className="btnPrimary btnSmall"
                disabled={busy}
                onClick={() => onApprove(req)}
              >
                Approve
              </button>
              <button
                type="button"
                className="btnGhost btnSmall"
                disabled={busy}
                onClick={() => onReject(req)}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
