# 492 — Phone notifications (push)

**Asked:** free lock-screen notifications for the site, like texts, tapping opens the item. Explained to
the owner: free (Firebase Cloud Messaging), iPhone needs Add to Home Screen (iOS 16.4+ only delivers web
push to home-screen apps), everybody opts in once, and a ten-minute Firebase setup for the owner.
The owner: **"Yeah sure"**.

**Built:**
- `manifest.webmanifest` replaces the `data:` manifest in `index.html`. A `data:` URL has no base for
  `start_url`/`scope`, so Add to Home Screen could not be relied on to open full-screen at the site.
- `sw.js` gains `push` (draws title/body/icon; FCM's `data` is unwrapped) and `notificationclick`
  (an open window is focused and told `pushOpen`; otherwise the site opens at the link). Caching untouched.
- `js/push.js`: the Notifications card in Student settings (the lowest column every account has; one home).
  Firebase compat 10.12.2 from gstatic.com is loaded only when Turn on is tapped — it is the only place
  Google publishes the FCM web SDK, so the pinned version is the guard. The token is kept in
  `localStorage` (`pushToken`) so this device knows it is on; the server holds the real list.
  Per-kind ticks (messages, bookings, posts) are a `pushSet` the moment they change (check-drafts EXEMPT).
  `?push=dm:<id>|job:<id>|post:<id>` lands on Messages, the session, or the post (`pushLanding_`, hooked
  beside `openSharedTutor` in shell.js).
- `backend/push.gs`: `pushTo_(person, kind, title, body, link)` — FCM HTTP v1, OAuth token from a JWT
  signed with `Utilities.computeRsaSha256Signature`, cached 50 minutes. Data-only messages, so sw.js
  draws every notification the same way. A 404/UNREGISTERED reply deletes that device's row. Never throws.
  Hooked into `sendMessage`, `createJob` (the named tutor), `answerRequest` (each client), `addComment`
  (the post's author). New Ledger tab `push_tokens` (TAB/SCHEMA/WHERE); never sent by `doGet`.
- No Script Properties → every send returns 0 without touching the network; `pushState` says
  `ready: false`, and only an admin is told which property names are empty.
- Version stamps bumped together to `2026-10-27-zc-push`.

**Why toggles live on the token rows (`off`)** rather than people columns: the push data is one tab of its
own, and a person with no device has nothing to toggle.

Checks: `js/check-push.js` (backend, UrlFetchApp stubbed), the "phone notifications (492)" journey.
