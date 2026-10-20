# 378 — "Send last week": an admin emails a parent last week's work by hand

The owner, 20 Oct (a Tuesday): "I need to have a button which I can manually press so I can send parents
their students work from last week. I need to send Ash the work Ernie did last week. Monday to Sunday. I
need to send it this morning."

**Where.** On the people column (`account`), under a parent's card, for an admin only: a tile **Send last
week** (the send mark, note "their child's work, Mon–Sun"), after Edit and Delete in `peopleTiles_`
(js/me.js). A parent's card is one whose `role` is `Client` (`mainRole` — a client who is also a tutor or
admin is drawn as that, and has no tile). Never on your own card, a student's or a tutor's.

**One press sends** — no sheet asking first: the owner's word was "a button which I can manually press".
The reply's sentence is the toast:
- `Sent to Ash — 32 questions (12–18 Oct)` (the parent's first name only; one email per child linked, the
  count summed);
- `Nothing to send: Ernie did no questions 12–18 Oct`;
- `Ash has no email address — add it with Edit`, `Ash has no child linked — add one with Edit`;
- not confirmed / opted out (`weekly_email` no, Settings → Notifications) / an address shared with
  another parent: said, nothing sent — the press does not overrule the parent's own no;
- mail quota used up (`weekly_digest_reserve` kept back), the log busy, or a failure: said.

**Server.** `digestSendNow {targetId}`, `admin` in `ACTION_ACCESS`, calls `digestSendNow_([id], now)` in
backend/digest.gs. Week = `digestWeekToSend_` (last Monday–Sunday; on a Sunday, the week ending today).
The plan is `digestEmailLibrary_` + `digestPlanNow_` exactly as `digestRun_` makes it, filtered to emails
whose `parent_id` is that parent, sent through `digestMail_` with `mode: 'send'` whatever `weekly_digest`
says (an admin pressing the button means send). `digestMail_` took two options: `again` (send over a
`sent` receipt — never over a `sending` one still in flight) and `note`. The digest_log row is written as
for Sunday — `status: sent`, `note: sent by hand` — so the Sunday run reads it as already sent and does not
send that week twice. `sent` stays the status word because it is the one the Sunday run's dedupe reads.

**The editor's fallback.** `sendLastWeekTo(handleOrEmail)` (a handle with or without @, an email or a
person id) and `sendLastWeekToAll()` (every person with role client and a child linked), both in
digest.gs, same code, each logs one line per parent. The Run dropdown passes no argument, so to send to
one parent write `function x() { sendLastWeekTo('@handle') }` and run that, or run sendLastWeekToAll.

**Checked.** check-digest §14 through the real doPost, with weekly_digest off: a parent's press refused
with nothing sent or logged; the admin's press for Pat sends one email, to Pat only, about the week
before, logged `sent` / `sent by hand`; a second press sends again over its own receipt (one row); the
Sunday run then reports it already sent; no address and a quiet week each say so; `sendLastWeekTo` sends.
check-flow: the tile on a client's card for an admin, not on a student's or the admin's own, not for a
tutor (whose press posts nothing); the press posts `digestSendNow` and toasts the reply. Mutations:
`digestSendNow` opened to `self`, and the tile without its Client test, each turned a check red.

Deploy: backend changed — all four stamps `2026-10-20-a-send-now`.
