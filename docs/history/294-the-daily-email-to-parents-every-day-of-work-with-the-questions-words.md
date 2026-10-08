Removed on 8 Oct — see [295](295-one-email-to-parents-at-the-end-of-the-week.md).

## The daily email to parents: every day of work, with each question's own words

**Asked for as** *"Finish setting up the email thing so it emails all parents on work their child has
done with the exact questions for each. Set that all up."* It builds on 291 (the email after a
session) and keeps its engine, receipts and switch.

### What changed

| Before | Now |
|---|---|
| Only a day with a booked, paid session was emailed. Homework on any other day was in nobody's email but Sunday's. | **Every day a child did questions is emailed.** A session day still goes `session_recap_delay` (2) hours after the last session; any other day goes the **next morning** at `session_recap_morning` (7, London, 0–9). |
| Homework done after the session email went was lost. | **A session day has a next-morning follow-up** listing only what was marked after its email: the first email's receipt now keeps `question_keys`, and the follow-up's own receipt is `job_ids` = `later`. |
| The list was `Q3, Q7 (again)` under each paper. | **Each question with its own words**: the stem a question's parts share, once, then `Q5a: <the ask>`, cut to what reads on a phone; "(picture on the site)" where there is one. A paper whose rows have no words yet keeps the old line. |
| The phone sent a question's name. | It also sends its **words** (`doneWords_`): question- and letter-scope stems, a `---` line, then the lead and the ask, with fractions as `3/4`, powers as `x²` / `x^5`, subscripts as `x₁` / `x_(n + 1)`, tables as rows of cells. |

**One switch for all of it**, `session_recap` (off / preview / send), still arriving off. One child,
one day: one email, or a session email and one short follow-up.

### Decisions

- **Only a child is written about.** `recapHasParent_`: somebody with an accepted parent, who is not
  an admin, not a tutor, and not themselves anybody's parent — a tutor who was once a pupil, or a
  parent linked under a grandparent, does questions too.
- **Next morning, not the evening.** The sheet keeps days, not times; an evening hour would spend the
  day's receipt before the homework done after it. Capped at 9 because a question redone before the
  morning email moves its last day on and leaves the previous day's email.
- **An agreed lesson not yet paid** makes no session group, so its day is emailed as a day of work:
  the parents hear about the questions either way, and the lesson is named once it is paid.
- **A follow-up only behind an email that went** (or a "nothing done"): one still held or not due
  carries everything when it goes. A session receipt from before `question_keys` has no follow-up.
- **Words are the phone's text**, so they are printed only when they read like a question:
  `DIGEST_WORDS_REFUSE` turns away a link, an address, a one-letter domain (`x.com`), a non-ASCII dot,
  a phone number, an 8-digit run and a sort code — measured against every question and stem in the
  library, none of which it refuses — and only under a key in the library's own shape. A child's
  phone writes only that child's rows (the token decides the person), and those go only to that
  child's parents. Filled once; clear the cell to have it written again.
- **The phone sends words only to a backend that keeps them**: `attemptWords` in `features` (the code)
  and `keepsWords` on the person's attempts (the tab has the column). A backend synced before
  `ensureSchema` would otherwise be sent every row's words on every visit.

### Faults found on the way, fixed

- **The backlog sync looped for ever** with more than fifty unnamed rows: the reply carried no `named`
  flag, so the next pass sent the same fifty. The reply now carries `named` / `worded`, the phone keeps
  the flags, and a key-and-day is sent once a visit (a refused batch is un-marked and retried).
- **`attemptWords_` was quadratic** on `<a` with no `>` (18 s for 160 KB, under the script lock): it
  now cuts first and matches `<…>` with no `<` inside.
- **The hourly check re-claimed every sent email** for 24 hours, taking the lock and re-reading the
  log each time; it now counts what the log already says without the lock, and does not rewrite an
  unchanged preview row every hour.
- `doneWords_` first said "(picture on the site)" for 622 questions with no picture (it read the
  transcribers' `figure` tag); it now uses the site's own test.
- **The follow-up went thirteen hours late.** A session group stays in its 24-hour window after its
  email has gone, and "never in the same hour as the day's own email" held the 07:00 follow-up until
  that window closed at 20:05. A session group now holds back its follow-up only while the log has no
  `sent` row for that day — the test `recapLaterGroups_` itself uses.
- **`020 7946 0018` and `+44 20 7946 0018` passed** the phone-number refusal; the landline rule takes
  London's 3-4-4 spacing and the international prefix now. A sort code written with spaces is not
  refused: `12 34 56` is also how a list of two-digit numbers looks in the library.

### For the owner to do — once, in one Apps Script sitting

1. GitHub Assistant ↓ to pull `main` into the project (after this branch is merged).
2. Run `ensureSchema` from the function list: it adds `attempts.words`, `recap_log.question_keys` and
   the `session_recap_morning` row, all arriving off.
3. Run `installSessionRecap` once (books the hourly check; nothing new to authorise).
4. Deploy → Manage deployments → pencil → New version → Deploy.
5. In the Ledger's `config` tab set `session_recap` to `preview`. After a day, open Settings → the
   "Daily email to parents" card → Preview, read what would go, then set it to `send`.

The child has to be signed in as themselves on the device they work on — a question marked while the
tutor is signed in goes on the tutor's row (291).
