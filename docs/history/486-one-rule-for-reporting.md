# 486 — One rule for reporting

Owner: "there should be a report button on content cards too like there is on questions. admin and students can
report, however it is only taken seriously when admin reports it. universal rule for questions and content
reporting. all reporting." Then: "you know how there's already a report button on questions widgets. have that be a
thing on ALL widgets. for admin and students. however admin reports are taken much more seriously."

## Before

- Questions (395): a `q-report` tile in the question's row (`reportTile_(x)`, submit.js) opened a sheet; `reportQuestion`
  wrote a row in the Ledger's `reports` tab (status blank, `fixed`, `not a problem`). An admin's report was the same as a child's.
- Messages (413): a `msg-report` tile beside a received bubble opened its own sheet; `flagMessage` set
  `messages.flagged`/`flag_reason` and emailed the admin (`reported`, essential).
- Posts, content cards, widgets, column cards: no report path.

## Now

- **One tile**: `reportTile_(kind, id, label)` (submit.js), drawn for Student rank and up (`rankAtLeast_('student')`),
  not signed out. Used by `cardTiles_` (every Find card: questions, content cards, practicals, projects, dafs, tutors…,
  through `reportTileFor_`), every widget's one row (`widgetOnColumn_`, `widgetMergedOn_`), every column card with an id
  (`cardAdminRow_` for an admin, `cardReportRow_` for anybody else), received messages, others' posts, every reel
  slide, your own profile card, and the cards with no row of their own (Camera, Daive, an empty Messages) through
  `reportRowIn_`. Owner, later: "practically everything should have a report button… everything should have a report
  button" and "does the booking widget have a report button?" — the journey "486: every top-level card and widget in
  every column has the one Report tile" walks every column for a student and an admin (empty and locked cards excepted).
  `check-reports` section 5 fails if any other file draws a Report tile.
- **One box, in place** under the tile row (as Note for Claude's, 484): a reason picker and a note, Send and Cancel. No sheet.
- **One action** `report` {kind, itemId, label, reason, note}. `reportQuestion` and `flagMessage` route into it for old phones.
- **One storage**: the existing `reports` tab, with four columns added at the end (`kind`, `item_id`, `reporter_rank`,
  `status_by`) — setup adds them. Old rows are read as they are: blank kind = question, `item_id` = `q:`+`question_id`,
  blank status = open, `not a problem` = dismissed. Messages flagged before 486 stay on `messages.flagged` and are still
  listed and closed there; new message reports are `reports` rows (the admin email still goes).
- **Weight**: an Admin's report is written `confirmed`: the item is marked (`reportedItems` in every payload — `kind|id`
  only, no names — and its Report tile says "flagged to fix") and a row goes into `claude_notes` and the Drive file
  "Notes for Claude", so "read my notes" reaches it. Anybody else's is `open`: recorded, changes nothing anybody sees,
  listed on Business → Reports under "To review" with Confirm (makes it confirmed, with the same note) and Dismiss.
  Confirmed ones sit under "To fix" with Fixed and Dismiss; fixed or dismissed unmarks the item.

Backend 2026-10-27-z8-one-report-rule; css 2026-10-27-z2-one-report-rule.
