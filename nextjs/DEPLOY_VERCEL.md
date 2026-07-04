## What you're deploying

Book Club POC — Next.js app in `BookClubApp/nextjs`.

Routes:
- `/` — landing
- `/app/login` — sign in / sign up
- `/app` — clubs list, create, join
- `/app/profile` — profile
- `/app/clubs/[clubId]` — club view
- `/app/clubs/[clubId]/weeks/[weekId]/quiz` — quiz gate
- `/app/clubs/[clubId]/weeks/[weekId]/discussion` — gated discussion

Firebase Auth + Firestore for all shared data (clubs, quizzes, posts).

---

## 1) Create Firebase project

In [Firebase Console](https://console.firebase.google.com/):

1. Create project (e.g. `book-club-poc`)
2. **Authentication → Sign-in method** → enable **Email/Password**
3. **Firestore Database** → create database (production mode)
4. **Project settings → General → Your apps** → add **Web app** → copy config

---

## 2) Environment variables

Copy `.env.local.example` to `.env.local` and fill in all six values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Add the same six variables in **Vercel → Project Settings → Environment Variables** (All Environments).

---

## 3) Deploy Firestore rules and indexes

In Firebase Console → Firestore:

- **Rules** → paste contents of `nextjs/firestore.rules` → Publish
- **Indexes** → import `nextjs/firestore.indexes.json` or create when the console prompts on first query

Or with Firebase CLI:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 4) Local dev

```bash
cd nextjs
npm install
npm run dev
```

Open http://localhost:3000

---

## 5) Deploy to Vercel

1. Push `BookClubApp` to GitHub
2. Import in Vercel — set **Root Directory** to `nextjs`
3. Add all six `NEXT_PUBLIC_FIREBASE_*` env vars
4. Deploy

---

## Acceptance test (two devices)

1. User A: create account → create club → note Club ID
2. User A: add a week + quiz questions
3. User B: create account → enter Club ID → request to join
4. User A: approve request
5. User A: take quiz, pass → post in discussion
6. User B: still locked on discussion until passing quiz
7. User B: pass quiz → see User A's post in real time

---

## Troubleshooting

- **Firebase not configured** → missing env vars locally or on Vercel
- **permission-denied** → rules not deployed or user not a club member
- **Index required** → follow the link in the browser console to create the composite index
