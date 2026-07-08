import Link from "next/link";
import BrandLogo from "./_components/BrandLogo";
import LandingRedirect from "./_components/LandingRedirect";
import {
  MockClubScreen,
  MockDiscussionScreen,
  MockQuizScreen,
} from "./_components/LandingMockScreens";

export default function Home() {
  return (
    <>
      <LandingRedirect />
      <div className="container landingPage">
        <section className="landingSection landingHeroNew">
          <BrandLogo variant="nav" />
          <h1 className="landingHeroNewTitle">Synlego</h1>
          <p className="landingHeroNewTagline">Read Together.</p>
          <p className="landingHeroNewSubtitle">
            Prove you read it. Then discuss it with people who read it too.
          </p>
          <p className="landingHeroNewEtymology muted">
            Greek for &ldquo;read together,&rdquo; spelled backward.
          </p>
          <div className="landingHeroActions landingHeroActions--solo">
            <Link className="btnPrimary" href="/app/login">
              Get Started
            </Link>
          </div>
        </section>

        <section className="landingSection">
          <h2 className="sectionHeading">The problem every reader knows</h2>
          <div className="card landingProse">
            <p>
              Every book club app has the same problem. Half the people didn&apos;t read. The
              conversation fills up with folks who have no idea what happened. Spoilers from
              people ahead, noise from people who never opened the book. The real discussion
              dies.
            </p>
          </div>
        </section>

        <section className="landingSection">
          <h2 className="sectionHeading">How Synlego is different</h2>
          <div className="card card--accent landingProse">
            <p>
              <strong>Synlego is different.</strong> Pass a quick quiz to prove you read this
              week&apos;s chapters, and only then does the discussion unlock. So everyone in the
              conversation actually read the book. No spoilers, no noise. Just readers who did the
              reading, talking about what they read.
            </p>
          </div>
        </section>

        <section className="landingSection landingSection--steps">
          <h2 className="sectionHeading">How it works</h2>
          <ol className="landingSteps">
            <li className="landingStep">
              <div className="landingStepText">
                <span className="landingStepNum">1</span>
                <div>
                  <h3>Join a club</h3>
                  <p className="muted">Find a group reading a book you love, or start your own.</p>
                </div>
              </div>
              <MockClubScreen />
            </li>
            <li className="landingStep">
              <div className="landingStepText">
                <span className="landingStepNum">2</span>
                <div>
                  <h3>Pass the quiz</h3>
                  <p className="muted">A short check that you read this week&apos;s chapters.</p>
                </div>
              </div>
              <MockQuizScreen />
            </li>
            <li className="landingStep">
              <div className="landingStepText">
                <span className="landingStepNum">3</span>
                <div>
                  <h3>Unlock the discussion</h3>
                  <p className="muted">Talk live with your club, but only after you&apos;ve earned your seat.</p>
                </div>
              </div>
              <MockDiscussionScreen />
            </li>
          </ol>
        </section>

        <section className="landingSection">
          <h2 className="sectionHeading">Why Synlego</h2>
          <ul className="landingWhyList">
            <li>
              We don&apos;t sell books. Read however you want. We just give you people to read
              with.
            </li>
            <li>Small, real clubs, not a giant public feed of strangers.</li>
            <li>Built for serious readers who want serious discussion.</li>
          </ul>
        </section>

        <section className="landingSection">
          <h2 className="sectionHeading">From the founder</h2>
          <blockquote className="card landingFounder">
            <p>
              I&apos;m a reader. I got sucked into a series and wanted to talk about it with
              people who loved it too. So I joined the groups that were supposed to be for exactly
              that: readers discussing books. And they weren&apos;t. They&apos;d decayed into
              memes, people talking trash, and randoms who never read the book arguing about it
              anyway. The real discussion was dead.
            </p>
            <p>
              I tried the other apps. Same thing. Giant feeds where anyone can weigh in whether
              they read a word or not. So I built the thing I actually wanted: a place where the
              only people in the conversation are the ones who read the book. That&apos;s the whole
              idea.
            </p>
          </blockquote>
        </section>

        <section className="landingSection landingFinalCta">
          <p className="landingFinalCtaLine">Everyone here actually read the book.</p>
          <Link className="btnPrimary btnBlock" href="/app/login">
            Get Started
          </Link>
        </section>
      </div>
    </>
  );
}
