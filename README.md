# Book Club App (POC)

Quiz-gated book club discussions. Pass the weekly quiz to unlock that week's board.

Built from the Strategic Planning app template (Next.js + Firebase Auth + Firestore).

## Quick start

1. Copy `nextjs/.env.local.example` → `nextjs/.env.local` and add Firebase config
2. Deploy `firestore.rules` and indexes in Firebase Console (see `DEPLOY_VERCEL.md`)
3. `cd nextjs && npm install && npm run dev`

## LAUNCH scope

- Login / profile
- Create club, join via Club ID + request approval
- Weekly quizzes gate discussion per user
- Real-time shared posts via Firestore listeners

See `DEPLOY_VERCEL.md` for full deployment steps.
