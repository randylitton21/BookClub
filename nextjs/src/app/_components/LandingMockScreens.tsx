import BookCover from "./BookCover";

function MockFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="landingMockFrame" aria-hidden>
      <div className="landingMockChrome">
        <span />
        <span />
        <span />
        <span className="landingMockChromeLabel">{label}</span>
      </div>
      <div className="landingMockBody">{children}</div>
    </div>
  );
}

export function MockClubScreen() {
  return (
    <MockFrame label="synlego.app/clubs">
      <div className="landingMockClub">
        <div className="landingMockClubHero">
          <BookCover title="Dune" size="md" />
          <div>
            <p className="muted landingMockEyebrow">Now reading</p>
            <p className="landingMockTitle">Dune</p>
            <p className="muted">by Frank Herbert</p>
            <div className="landingMockBadges">
              <span className="statusBadge statusBadge--reading">Reading</span>
              <span className="statusBadge statusBadge--ready">4 members</span>
            </div>
          </div>
        </div>
        <div className="landingMockClubMeta">
          <span>Week 3 of 8</span>
          <span>·</span>
          <span>Quiz open</span>
        </div>
      </div>
    </MockFrame>
  );
}

export function MockQuizScreen() {
  return (
    <MockFrame label="synlego.app/quiz">
      <div className="landingMockQuiz">
        <p className="muted landingMockEyebrow">Week 3 · Dune</p>
        <p className="landingMockQuizQuestion">
          What gift does Paul receive from his father before leaving Caladan?
        </p>
        <ul className="landingMockChoices">
          <li>A hunting rifle</li>
          <li className="landingMockChoice--selected">A dagger with his family crest</li>
          <li>A stillsuit</li>
          <li>A copy of the Orange Catholic Bible</li>
        </ul>
        <span className="landingMockBtn">Submit quiz</span>
      </div>
    </MockFrame>
  );
}

export function MockDiscussionScreen() {
  return (
    <MockFrame label="synlego.app/discussion">
      <div className="landingMockDiscussion">
        <p className="muted landingMockEyebrow">Week 3 discussion · unlocked</p>
        <article className="landingMockPost">
          <div className="landingMockPostHeader">
            <span className="landingMockAvatar">M</span>
            <strong>Maya</strong>
            <span className="muted">2h ago</span>
          </div>
          <p>
            The way Herbert frames Paul&apos;s choice on Arrakis. It&apos;s not heroism yet,
            it&apos;s survival. That&apos;s what makes the politics feel real.
          </p>
        </article>
        <article className="landingMockPost">
          <div className="landingMockPostHeader">
            <span className="landingMockAvatar">J</span>
            <strong>Jordan</strong>
            <span className="muted">45m ago</span>
          </div>
          <p>
            Agreed. And everyone in this thread actually read to here. That&apos;s the whole
            point.
          </p>
        </article>
        <div className="landingMockComposer muted">Add to the discussion…</div>
      </div>
    </MockFrame>
  );
}
