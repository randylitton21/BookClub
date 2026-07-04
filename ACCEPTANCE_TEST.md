# Two-device acceptance test

Run after Firebase is configured, rules deployed, and the app is live (local or Vercel).

## Setup

1. Create Firebase project `book-club-poc` (see `nextjs/DEPLOY_VERCEL.md`)
2. Fill `nextjs/.env.local` with your six `NEXT_PUBLIC_FIREBASE_*` values
3. Deploy `nextjs/firestore.rules` in Firebase Console
4. `cd nextjs && npm run dev` (or use your Vercel URL)

## Test accounts

- **User A** (creator): e.g. `creator@test.com`
- **User B** (joiner): e.g. `joiner@test.com`

Use two browsers or one normal + one incognito window to simulate two devices.

## Steps

| Step | User A | User B | Expected |
|------|--------|--------|----------|
| 1 | Sign up, create club | — | Club created; Club ID shown |
| 2 | Add week "Chapters 1–4" + quiz (2+ questions) | — | Week appears on club page |
| 3 | Share Club ID | Enter Club ID → Request to Join | Pending request on A's club page |
| 4 | Approve request | — | B sees club in "Clubs you're in" |
| 5 | Take quiz, pass (≥70%) | Open discussion for same week | A: discussion unlocked. B: locked screen |
| 6 | Post "Hello from A" | — | Post visible to A |
| 7 | — | Take quiz, pass | B sees A's post in real time |
| 8 | — | Post "Hello from B" | A sees B's post without refresh |

## Security check (optional)

With B signed in but **before** passing the quiz, open browser devtools and attempt to write a post directly to Firestore. Rules should return `permission-denied`.

## Deploy to Vercel

```bash
cd nextjs
vercel login
vercel
```

Add the six Firebase env vars in the Vercel dashboard, then redeploy.
