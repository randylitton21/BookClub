# Firebase Sync Troubleshooting — Book Club App

## Most common causes

### 1. Vercel environment variables missing

**Symptoms:** App loads but clubs/posts don't sync; console shows "Firebase not configured"

**Fix:** Vercel → Project → Settings → Environment Variables. Add all six `NEXT_PUBLIC_FIREBASE_*` values (All Environments), then redeploy.

### 2. Firestore security rules not deployed

**Symptoms:** Console shows `permission-denied`

**Fix:** Firebase Console → Firestore → Rules. Paste `nextjs/firestore.rules` and Publish.

### 3. Composite indexes missing

**Symptoms:** Console links to create an index for `weeks`, `posts`, or `joinRequests` queries

**Fix:** Click the link in the error, or import `nextjs/firestore.indexes.json`.

### 4. Wrong Firebase project

**Symptoms:** Data appears in a different project or auth fails

**Fix:** Book Club must use its **own** Firebase project — not the Strategic Planning app project. Update `.env.local` and Vercel env vars.

---

## Local checklist

1. Copy `.env.local.example` → `.env.local` with your **book-club-poc** project values
2. Enable Email/Password in Firebase Authentication
3. Deploy `firestore.rules`
4. Run `npm run dev` and sign in at `/app/login`
5. Visit `/firebase-status` or `/check-env` to verify config

---

## Acceptance test (two devices)

1. User A creates club → adds week + quiz
2. User B requests join with Club ID → A approves
3. A passes quiz → posts in discussion
4. B is locked until passing → then sees A's posts live
