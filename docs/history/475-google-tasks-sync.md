# 475 — Google Tasks sync

## What the owner said (26 Oct)

"give users the ability to sync to their own api key google tasks. make it then show me how to use it."

## What was built

An API key cannot read or write anyone's Google Tasks (private data), so "their own" became their own Google
account: OAuth consent per person, in the browser, no backend. `js/gtasks.js` (loaded after `layout`, before
`boot`) lazily loads `accounts.google.com/gsi/client` only when Connect is tapped (sign-in may already have it),
asks `initTokenClient` for the `tasks` scope with the site's one public Client ID (`DATA.googleClientId`, else
`brand('google_client_id', '')`), and calls `tasks.googleapis.com/tasks/v1` directly. The token is kept in memory
and sessionStorage for the tab; it never reaches our backend (the journey asserts it).

Synced, one way: the next four weeks of your sessions (`myJobs_` + `jobOn_`) and your exam dates
(`progressCountdownRows_`, exam rows only), into a list `@family.`. Idempotent by a `[family:<key>]` marker in
each task's notes: re-sync PATCHes title/notes/due and never status, so a tick in Google stays. Two-way was left
out: a session has no "done" on the site, so there is no natural place to show it; the card counts the ticks.

The card is `acct:gtasks` in Student settings (registered on `CARD_REG` from gtasks.js), hooked into
`studentSetPages_` by one guarded line. No client id: one line, and an admin also sees the key to fill.
Setup and use: docs/google-tasks.md.

## Checks

check-flow: "Google Tasks (475)" — mocked `google.accounts.oauth2` and Tasks API: no-client-id state; connect
asks the tasks scope; one list, tasks made once; re-sync updates, does not duplicate, keeps a tick; Disconnect
revokes and clears sessionStorage.
