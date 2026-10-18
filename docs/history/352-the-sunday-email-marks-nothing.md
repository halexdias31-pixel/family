## The Sunday email marks nothing: one trigger, 9pm on Sunday, and each answer's verdict as it was recorded

**The owner, 18 Oct**, about the Sunday parent email (`backend/digest.gs`):

> *"Marking? Why marking? It's already marked when they submit the questions? Don't be silly. The marking
> is already done on each question. 9pm on Sunday should be the only time trigger."*

**What was there (12–18 Oct, docs/history/348).** `installWeeklyDigest` booked three things: the email, an
AI marking pass (`digestMarkRun`) every night at 02:00, and the same pass on Sunday an hour before the
email, which booked itself again as one-offs while work was left. The email's own run marked for two more
minutes before it planned. Each pass fetched the library, asked Gemini for every `sent` answer and appended
the mark as a row. It was built because a `sent` answer would otherwise say "not marked" — but the marking
that matters happens when the child presses Check or Mark with AI, and the owner does not want a second,
server-side marker behind it.

**What it is now.**
- **One trigger.** `installWeeklyDigest` books the email, Sunday at `weekly_digest_hour` (21), and nothing
  else. `digestMarkRun` joins `sessionRecapRun` in `DIGEST_RETIRED_RUNS`, so `installWeeklyDigest` and
  `removeWeeklyDigest` delete any marking trigger still booked (nightly, run-up or one-off), with the
  Script Properties that pass kept (`DIGEST_RETIRED_PROPS`), and say how many.
- **No marking.** The pass, its claim, its run-up, its "room before the email" estimate and its constants are
  deleted. `weeklyDigestRun` plans straight from `submissions`: ✓, ✗ and the AI's "N of M marks" exactly as
  each press recorded them, and an answer recorded `sent` says "not marked". The library fetch stays,
  because the email prints each question as it is on the site (docs/history/351).
- **`weekly_digest_marking`** left `CONFIG_DEFAULTS`. A cell already on the live config tab is read by nothing.
- **`checkSundayEmail`** lost its marking lines (the key, the models, the live Gemini ask, the unmarked count,
  the room estimate). It says the mode, the one trigger (with a WARNING if an old marking trigger is still
  booked), the hour booked against the config cell, the mail quota, the library, and who will and will not
  be emailed.
- **`check/digest-dry.js`** simulates no marking. It renders what the 9pm run would send from the recorded
  verdicts and stops if anything asks Gemini.
- **`js/check-digest.js`** checks that `installWeeklyDigest` leaves exactly one trigger, that the old
  handlers are cleared by install and remove, and that the 9pm run prints recorded verdicts unchanged, makes
  no Gemini call and appends no row. The one-trigger rule and the no-Gemini rule were each shown to fail on
  a mutation and pass again once it was reverted.

The marks the pass appended between 12 and 18 Oct (`ai:N/M`, ids ending `-ai` and ten letters) stay on
the sheet and read like any other press.

**The owner's step after deploying:** run `installWeeklyDigest` once more. It removes the 02:00 and 20:00
marking triggers and leaves the 9pm email.
