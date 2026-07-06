# Book Club — Build Brief (v3)

Hand this to Cursor. It says what is DONE, what must be finished BEFORE deploying
to Vercel (Phase 1), and what is PLAN ONLY (do not build yet). The ROADMAP file
holds the full phased vision. The DESIGN LAW section below governs every feature
in both files.

================================================================
## DESIGN LAW (applies to every feature, forever)
================================================================
1. THE 3-MINUTE / 10-YEAR-OLD RULE (mandatory):
   A 10-year-old should be able to open the app and, within 3 minutes, TAP every
   feature and understand what it does. This is about DISCOVERABILITY, not speed.
   Features may be deep (writing a review takes longer than 3 minutes) — but no
   feature may be hidden or confusing. If you have to hunt for it, it fails.

2. iPhone-simple, not Android-confusing:
   Obvious like an iPhone is to an iPhone user (you just do the obvious thing and
   it works) — never confusing like an iPhone is to an Android user (the obvious
   thing is somewhere unexpected). Fable failed this: reviewers spent hours and
   still hadn't found all the features. Do not repeat that.

3. NO COMPLICATED FEATURES flag:
   Every proposed feature must pass two questions: (a) obvious in 3 minutes?
   (b) simple to use? If either is "no," it waits or dies. "Good feature" and
   "belongs in the app" are different questions; simplicity is the tiebreaker.

4. NO unsupervised AI generating text in the app's voice.
   (Fable's AI produced offensive summaries and authors quit the app. We are not
   using AI to write reviews. See "Close the Story" for the human replacement.)

5. Every feature must DEEPEN THE ENGAGED-READING LOOP (read -> prove it ->
   discuss). If it doesn't serve that loop, it waits. The loop is the whole moat.

================================================================
## WHY WE WIN (competitive edge — protect these, do not drift)
================================================================
Research on Fable/Goodreads/StoryGraph shows the market leaders' three most
common, most-repeated complaints — and we beat all three by design:
- CATALOG TRAP: users rage that books are missing / duplicated because Fable
  sells ebooks. WE DO NOT SELL BOOKS. Users add a book by typing its name. We
  are structurally immune to "book unavailable." NEVER become a bookstore.
- BLOAT: leaders are "slick but confusing," features buried, potential untapped.
  We stay lean. Simple is our weapon, not a limitation.
- DEAD CLUBS: the #1 shared weakness is hit-or-miss club engagement — people
  join and don't participate. OUR QUIZ GATE IS THE FIX. You must pass a quiz
  (prove you read) to enter the discussion. This is the entire moat. Protect it
  above everything.
- Users also want their own room, not a public firehose of strangers trashing
  books they love. Our gated clubs are that room.

================================================================
## STATUS: DONE (do not rebuild) — tested on 2 devices, pushed to GitHub
================================================================
Repo: randylitton21/BookClub  (.env.local excluded — keys stay local)
- [DONE] Firebase Auth (email/password): login, signup, session
- [DONE] Minimal profile: display name, photo URL, about me
- [DONE] Create club (name, book, author) -> 8-char Club ID
- [DONE] Look up club by Club ID
- [DONE] Request to join + creator approve/reject (works on desktop)
- [DONE] Reading weeks; create quiz on a week (manual questions)
- [DONE] Take quiz -> pass (70%) -> unlocks that week's discussion
- [DONE] Discussion board gated behind passing the quiz
- [DONE] REAL-TIME messaging (posts appear live across users/devices — WORKING)
- [DONE] Firestore rules enforce the gate; composite indexes created
- [DONE] Cross-device shared state proven (2 accounts, 2 devices, 1 club)

================================================================
## PHASE 1 — MUST BE DONE BEFORE DEPLOYING TO VERCEL
================================================================
(Comprehensive. This is the full list to finish first. Build ONLY this section.)

A. Fixes / confirmations on what's already built
   - Confirm the creator's approve/reject join-request section renders ON MOBILE
     (works on desktop; verify small screens show the creator-only controls).
   - Keep the real-time discussion listener NARROW: listen only to the CURRENT
     active week's posts, not all posts. This is the #1 cost-control decision —
     it's the difference between a cheap bill and an expensive one at scale.

B. "New Read" (add a book — simple, no catalog)
   - On the creator screen, a "New Read" action: creator types the book name +
     author to set the club's current book. No catalog, no store — users add
     books by typing. (This is also our catalog-trap immunity, made concrete.)
   - For now: only ONE active book per club. Do not build the multi-book gate yet;
     just don't allow a second active book. (Formal multi-book handling = later.)

C. The two core screens (simple, discoverable — see DESIGN LAW)
   - CLUB HOMEPAGE screen: one screen showing everything or one tap away.
     Current book PROMINENT (front and center). Members count, books read,
     club review(s), book list (tap "books" to expand the full list), and
     join / request-to-join right there. Nothing buried.
   - INSIDE-THE-CLUB screen: same familiar info (members, current book) so it's
     recognizable, but the DISCUSSION BOARD dominates the screen. Same mental
     model as the homepage, different emphasis.

D. "Close the Story" (finishing a book — human, no AI)
   - When a club finishes a book, the club "Closes the Story":
     members each write a SHORT paragraph review, then the LEADER writes the
     full/final review that ties them together (a review OR a narrative of the
     whole reading experience — arguments, mixed opinions, etc.).
   - The final piece publishes WITH THE BOOK TITLE.
   - At club creation, tell the creator that closing the story for each book is
     their duty (it's a role, not a chore).

E. Profile photo for early users (allowed — cost is negligible at this size)
   - Let users upload a profile photo from device (Firebase Storage). Confirmed
     cheap for the first ~100+ users (small avatars, not an image feed). Keep it
     to profile photos only — do NOT open image posting in discussions yet.

F. Name (do before public launch)
   - Choose and CLEAR an ownable name: check domain, app-store name, and
     trademark conflict. "Book Club" is generic/unownable. Candidates so far:
     Novel, Let's Read, Book Review, Novel Review, Fiction, Just Novel.
     NOTE: dictionary words (esp. "Fiction") are HARD to own — favor an invented
     or unexpected word. This is real research, not a snap pick.

G. Deploy to Vercel (only after A–F)
   - Import randylitton21/BookClub, set Root Directory = nextjs, add the six
     NEXT_PUBLIC_FIREBASE_* env vars, deploy.
   - Run the two-device acceptance test against the LIVE url.

================================================================
## PLAN ONLY — do NOT build yet (listed so nothing is lost)
================================================================
Every idea gets listed even if it never ships. Sorted into phases in ROADMAP.
- Multiple books per club, only ONE active in discussion at a time; a book must
  finish (Close the Story) before the next opens; old discussion boards stay
  readable/returnable.
- Formal "vote on the next book" (for now: handle informally in the discussion).
- Club creator: delete tests/quizzes; remove members.
- Reply directly to a comment (threaded); tag/@-mention an author in a comment.
- Leadership succession if the creator goes inactive (simplest version: the
  next-most-active member auto-inherits creator role/responsibilities).
- Public book reviews and CLUB reviews (so a prospective joiner can see whether a
  club is actually active, and read the book's review before joining).
- Scheduled live meetings (light version): creator sets a time; quiz stays locked
  until then; creator opens the board at meeting time (host-controlled, no timer).
- Messenger-style polish on the ALREADY-WORKING real-time board (UX only).
- Facebook sign-in (requires a Facebook developer app + review — Phase 2, not 1).
- Create-a-club could become a premium-only feature (monetization lever).
- Publisher/marketplace vision (depends on a partnership like LMBPN): browsable
  book list -> clubs per book; series get their own clubs from book one.

KILLED / removed: anonymous vote-out feature; AI-generated reviews.

================================================================
## GUARDRAILS FOR CURSOR
================================================================
- Build ONLY Phase 1. Everything else is PLAN ONLY.
- Never loosen the quiz gate in Firestore rules (passing the quiz is the ONLY way
  into a week's discussion).
- Keep the real-time listener narrow (current week only) for cost control.
- Never store or reproduce copyrighted book text. Original quiz questions about
  facts only; title/author names only.
- When a query needs an index, add it to the project's index config and deploy it.
- Judge every change against the DESIGN LAW above.
