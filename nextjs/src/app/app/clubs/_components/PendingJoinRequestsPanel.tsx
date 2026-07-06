"use client";

import type { JoinRequest } from "@/lib/types";

export default function PendingJoinRequestsPanel({
  requests,
  busy,
  onApprove,
  onReject,
}: {
  requests: JoinRequest[];
  busy: boolean;
  onApprove: (req: JoinRequest) => void;
  onReject: (req: JoinRequest) => void;
}) {
  return (
    <div className="card creatorPanel joinRequestsPanel">
      <h2 style={{ marginBottom: 10 }}>Pending join requests</h2>
      {requests.length === 0 ? (
        <p className="muted">No pending requests right now.</p>
      ) : (
        requests.map((req) => (
          <div key={req.requestId} className="joinRequestRow">
            <span className="joinRequestName">{req.displayName}</span>
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
                className="btnSecondary btnSmall"
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
