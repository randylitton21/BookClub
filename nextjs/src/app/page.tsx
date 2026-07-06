import Link from "next/link";
import BrandLogo from "./_components/BrandLogo";

export default function Home() {
  return (
    <div className="container">
      <section className="landingHero">
        <div className="landingHeroBrand">
          <BrandLogo variant="hero" />
        </div>
        <h1 className="landingHeroTitle">Read together. Prove you read. Then discuss.</h1>
        <p className="landingHeroSubtitle">
          Join a book club, pass the weekly quiz, and unlock that week&apos;s discussion board.
          The quiz is the gate — and the conversation is the reward.
        </p>
        <div className="landingHeroActions">
          <Link className="btnPrimary" href="/app/login">
            Get started
          </Link>
          <Link className="btnSecondary" href="/app/explore">
            Browse books
          </Link>
        </div>
      </section>

      <section className="featureGrid">
        <div className="featureCard">
          <div className="featureIcon featureIcon--join" aria-hidden>
            📚
          </div>
          <h3>Join a club</h3>
          <p className="muted">
            Enter a Club ID, request to join, and read the same book with others.
          </p>
        </div>
        <div className="featureCard">
          <div className="featureIcon featureIcon--quiz" aria-hidden>
            ✓
          </div>
          <h3>Pass the quiz</h3>
          <p className="muted">
            Each week has a quiz. Pass it to prove you read before you can talk.
          </p>
        </div>
        <div className="featureCard">
          <div className="featureIcon featureIcon--discuss" aria-hidden>
            💬
          </div>
          <h3>Unlock discussion</h3>
          <p className="muted">
            Once you pass, the board opens for you immediately — live with your club.
          </p>
        </div>
      </section>
    </div>
  );
}
