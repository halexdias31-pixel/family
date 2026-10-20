# 379 — `tidy-old-tabs`: a backup copy of the Ledger, then the tabs and columns nothing reads go

The owner, 20 Oct: "delete any old bullshit we don't need anymore. like what about old 'attempts' tab. i
feel like that's bullshit now."

## What was looked at

Every tab in the live Ledger against `TAB`, `SCHEMA` and `WHERE` (backend/constants.gs), every `TAB.<x>`
reference in backend/, `node js/check-payload.js -v` ("the backend sends it and nothing reads it"), and
every `SCHEMA` column grepped across backend/ and js/ (outside the checks). `FILES` names one spreadsheet
now — the Ledger — so there is one file to tidy; the Settings and Library files left long ago.

| Verdict | Tabs |
|---|---|
| Not in `TAB` at all | `attempts` (replaced by `submissions`, 308; kept then "as an unread archive… or delete it by hand"), `_README` (the owner's own legend of tab colours and rules — kept, it is a note, not data) |
| In `TAB`, read by nothing | `post_likes` (only `migrateLikes_` and a setup warning read it since likes became reactions), `widgets` (doGet sent `widgets`; nothing on the site reads it — the tools and games are `WIDGETS` in js/map.js), `orders` (doGet sent `orders`, nothing reads it, and nothing has made an order since `redeem` went; `orderPosted` had no caller) |
| In `TAB`, read | everything else. `herd`, `exams`, `terms`, `invites`, `promo_codes`, `landmark_parts`, `map` are thin or empty but read. `options` is read by the backend (dropdowns, `seedOptions`); its copy in the payload is unread weight, left for another day. |

Columns nothing reads, all blank on the live sheet:
- `people.account_number`, `people.sort_code` — bank details nobody reads; better never filled.
- `terms.relative_name`, `terms.weeks_left` — both worked out from the dates now (`relativeName`).
- `jobs.client_1…4`, `client_N_status`, `tutor_a…c`, `tutor_x_status` — the seat columns from before
  bookings had their own rows; on the sheet, not in `SCHEMA`, read by nothing.
- `venues.focus`, the SECOND one. `SCHEMA.venues` named `focus` twice, so `ensureSchema` made two. `read`
  keeps the last header of a name and `setCell` writes the first, so a focus typed in one column was never
  seen through the other. One entry now; the later column goes.

Kept though nothing reads them: `venues.venue_id` (filled — an id is identity), `invites.declined_on`
(beside `accepted_on` in a feature still half there). When unsure, keep.

## The migration

`{ id: 'tidy-old-tabs', retry: true }` in `MIGRATIONS`, run by `autoMigrate_` on the next admin page load
after Deploy → New version (361). `tidyOldTabs_` (backend/setup.gs):

1. **A whole copy of each file in `FILES` first** — `Spreadsheet.copy("<name> — backup before tidy
   <yyyy-mm-dd>")`, in the owner's Drive. Its URL is kept in `TIDY_BACKUP_<file>` before anything is
   removed, so a retry after a half-run reuses that copy instead of making another. If the copy throws,
   nothing is removed and the job retries in two minutes (`retry: true` marks it done only on success).
2. **Tabs** (`TIDY_TABS`): `attempts` always (the backup holds its rows); `post_likes` after any like not
   yet a reaction becomes a 👍 dated as liked (`migrateLikes_`, now handed the rows); `widgets` and `orders`
   only while they hold no typed row — otherwise kept and said.
3. **Columns** (`TIDY_COLUMNS`, `TIDY_TWICE`): each deleted only while every cell under its header is
   blank; one with a value is kept and said. Right to left, so the indexes hold.
4. **Said on the Setup card**: `SAID_tidy-old-tabs` holds `{link, said}`; `setupStatus_` puts them on that
   job, and `setupCard_` (js/me.js) prints the sentence and an "Open the backup" link under it.

The four tabs are out of `TAB`, `SCHEMA` and `WHERE`, so `ensureSchema` never makes them again. Gone with
them: doGet's `orders` and `widgets` blocks, `orderPosted` and its `ACTION_ACCESS` line, `orders` in
`HANDLE_ACTIVITY`, the "likes stranded" warning, `post_likes` in `checkEverything`'s activity count, the
`migrateLikes` console job and the `likes-to-reactions` migration (its id stays spent). The checks lost
their lines for them (check-prefs, check-surnames, check-flow, check-dead, the fixture).

Stamps: all four `2026-10-20-b-tidy`.

## The count the owner asked about

The owner asked why a learner's week read as "N/M" when he had done far fewer questions. M was his
submission ROWS for the week — one per press of Check, never rewritten (308) — and N the presses marked
wrong. Most were the same few questions pressed again and again, often with the same answer, until right.
The Sunday email counts QUESTIONS, not presses: `digestPlan_` folds every press of one question key
(before `#`) into one line and prints the week's latest verdict. Rows are not questions; never quote a row
count as work done.
