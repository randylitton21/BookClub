# Book Club — Roadmap (the cage for my ideas)

Purpose: I generate ideas constantly (it's a strength — it produced the quiz gate,
Close the Story, the whole concept). The goal is not to stop having ideas. It's to
make sure every idea lands in THIS LIST, not in the build. List every idea, even
ones that never ship. Build almost none of them yet.

THE ONE RULE: a new idea goes in this file under the right phase. It does NOT go
into the build. Finishing the current phase and putting it in front of REAL
READERS beats every idea on this page.

Every feature is also judged by the DESIGN LAW (see the build brief):
3-minute/10-year-old discoverability, iPhone-simple, no complicated features,
no unsupervised AI, must deepen the read->prove->discuss loop.

----------------------------------------------------------------
## PHASE 0 — LAUNCH LOOP  [DONE]
Auth, minimal profile, create/join club by ID, request-to-join + approve,
reading weeks, quiz, PASS QUIZ -> UNLOCK discussion, real-time board (working),
rules enforce the gate, indexes, pushed to GitHub.
Proven on two devices. THIS IS THE MOAT.

----------------------------------------------------------------
## PHASE 1 — FINISH, THEN DEPLOY  [DOING NEXT — see build brief for full detail]
Everything that must be done before Vercel:
- Confirm creator approve/reject shows on mobile
- Keep real-time listener narrow (current week only) — cost control
- "New Read": creator types a book name to set current book (no catalog)
- Two core screens: Club Homepage + Inside-the-Club (discussion dominates)
- "Close the Story": members' short reviews -> leader writes final review,
  publishes with book title; it's the leader's stated duty
- Profile photo upload for early users (cheap at this scale; profile only)
- Choose + clear an OWNABLE name (domain, app store, trademark)
- Deploy to Vercel; run two-device acceptance test on the live URL
Done = a stranger opens a real URL, joins a club, hits the loop. Then: GET THE
FIRST REAL READER (e.g. someone from the Kurtherian Gambit community).

----------------------------------------------------------------
## PHASE 2 — ADMIN + ORGANIZATION (after Phase 1 has real users)
- Creator: delete tests/quizzes; remove members
- Reply directly to a comment (threaded); tag/@-mention an author
- Multiple books per club, ONE active in discussion at a time; a book must be
  "Closed" before the next opens; previous boards stay readable/returnable
- Facebook sign-in (needs a Facebook dev app + review)

----------------------------------------------------------------
## PHASE 3 — REVIEWS + REPUTATION
- Public book reviews (from Close the Story) published with the book title
- CLUB reviews: review a club you're in; prospective joiners read them to judge
  if a club is actually active before joining
- Leadership succession: next-most-active member auto-inherits creator role if
  the creator goes inactive / drops out

----------------------------------------------------------------
## PHASE 4 — LIVE MEETINGS (light) + next-book voting
- Creator sets a meeting time; the week's quiz stays locked until then; creator
  opens the board at meeting time (host-controlled; auto-open optional/NOT req'd)
- Formal "vote on the next book" (until then: handled informally in discussion)

----------------------------------------------------------------
## PHASE 5 — MESSENGER-STYLE POLISH (UX only; real-time already works)
- Restyle the working real-time board into an instant-messenger feel
  (multi-user, especially for live sessions)

----------------------------------------------------------------
## PHASE 6 — MONETIZATION LEVERS
- Create-a-club as a premium feature (or other paid tiers)
- Costs are tiny (~$0-30/mo at 1,000 users); break-even needs only a few paying
  users. Price is not the problem — demand is. Keep free early.

----------------------------------------------------------------
## PHASE 7 — PUBLISHER / MARKETPLACE VISION  [NORTH STAR]
Only if a partnership lands (e.g. LMBPN / Michael Anderle). Prove the loop first,
then pitch WITH a working product, permission-first, as a fan.
- Browsable book list -> see clubs per book
- Series get their own clubs starting from book one, inside a licensed world

----------------------------------------------------------------
## KILLED / REMOVED
- Anonymous vote-out of a member (messy social dynamics)
- AI-generated reviews (Fable's AI produced offensive content; authors quit).
  Replaced by the human "Close the Story."

## PARKED / SEPARATE PRODUCTS
- Cram IT modes (Mix/Group/Class/Head-to-Head) — different app, keep separate
- Fandom version (pop stars/YouTubers) — same code, different content; only if
  Book Club proves the loop and I want a second niche
- BUSINESS CLUB — its own product, built on the Strategic Planning app's existing
  architecture. See the separate BUSINESSCLUB_BUILD_BRIEF file. Tied to the SHP
  (Shareholder Partnership) framework. Do NOT chase it until Book Club has real
  users — two products at once is the trap that started this whole project.

----------------------------------------------------------------
## THE ORDER IS THE STRATEGY
Loop (done) -> finish + deploy -> admin/org -> reviews -> live meetings ->
messenger polish -> monetization -> publisher marketplace. Build each floor only
after the one below has real people standing on it. Ideas are cheap; a used
product is rare. THE NEXT MILESTONE IS NOT A FEATURE — IT'S THE FIRST READER.
