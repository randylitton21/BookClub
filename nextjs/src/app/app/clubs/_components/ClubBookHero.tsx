import type { Club } from "@/lib/types";

function formatExpectedDate(iso: string | null | undefined): string {
  if (!iso) return "Date TBD";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "Date TBD";
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isRecentNewRead(club: Club): boolean {
  if (!club.newReadBannerAt || !club.bookTitle) return false;
  const t = club.newReadBannerAt as { toDate?: () => Date };
  if (typeof t.toDate !== "function") return false;
  const days = (Date.now() - t.toDate().getTime()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 7;
}

export default function ClubBookHero({ club }: { club: Club }) {
  const hasActiveBook = Boolean(club.bookTitle?.trim());
  const next = club.nextRead;

  return (
    <div className="card clubBookHero">
      {isRecentNewRead(club) && (
        <p className="clubNewReadBanner">New read started: {club.bookTitle}</p>
      )}

      {hasActiveBook ? (
        <>
          <p className="clubBookHeroLabel muted">Now reading</p>
          <h2 className="clubBookHeroTitle">{club.bookTitle}</h2>
          <p className="clubBookHeroAuthor muted">by {club.bookAuthor}</p>
        </>
      ) : (
        <>
          <p className="clubBookHeroLabel muted">Now reading</p>
          <p className="muted">No active book — the club leader will set the next read.</p>
        </>
      )}

      {next?.title && (
        <div className="clubNextReadBlock">
          <p className="clubBookHeroLabel muted">Coming next</p>
          <p className="clubNextReadTitle">
            <strong>{next.title}</strong>
            <span className="muted"> by {next.author}</span>
          </p>
          <p className="muted clubNextReadDate">
            Expected start: {formatExpectedDate(next.expectedStartDate)}
          </p>
        </div>
      )}
    </div>
  );
}
