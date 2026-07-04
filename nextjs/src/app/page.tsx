import Link from "next/link";
import PageTitleCard from "./_components/PageTitleCard";

export default function Home() {
  return (
    <div className="container">
      <PageTitleCard
        title="Read together. Prove you read. Then discuss."
        subtitle="Join a book club, pass the weekly quiz, and unlock that week's discussion board. The quiz is the gate."
        actions={
          <Link className="btnPrimary" href="/app/login">
            Get started
          </Link>
        }
      />

      <section style={{ marginTop: 14 }} className="grid3">
        <div className="card">
          <h3 style={{ marginBottom: 6 }}>Join a club</h3>
          <p className="muted">
            Enter a Club ID, request to join, and read the same book with others.
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 6 }}>Pass the quiz</h3>
          <p className="muted">
            Each week has a quiz. Pass it to prove you read before you can talk.
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 6 }}>Unlock discussion</h3>
          <p className="muted">
            Once you pass, the board opens for you immediately — live with your club.
          </p>
        </div>
      </section>
    </div>
  );
}
