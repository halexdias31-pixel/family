# js/check-mail-load.js

The full text of comments in `js/check-mail-load.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-mail-load.js THE BACKEND WITH ITS MAIL, TRIGGERS, LOCK AND CLOCK STUBBED

top level, before `path`

```
/* ==================================================================================================
   @family. — check-mail-load.js   THE BACKEND WITH ITS MAIL, TRIGGERS, LOCK AND CLOCK STUBBED

   NOT A CHECK — a harness, like `check-gas-load.js` underneath it, and not on the roster in
   check-all.js. LIFTED OUT OF `check-digest.js`, WHICH WROTE IT, the day a second parent email needed
   it. That email (after each session, then every day of work) was removed on 8 Oct — docs/history/295
   — and its check with it; check-digest.js is the one user again, and the harness stays a file of its
   own because it is a world, not a list of rules.

     · THE RECEIPT THE MAIL STUB LOOKS FOR IS A PARAMETER. `world({ receipt: { tab, keyCol } })` —
       `digest_log` / `week_of` by default, the weekly email's. A send with no row for that address
       saying `sending`, under a well-formed key, at the moment of sending, is recorded in
       `mail.unreceipted`; a send while the lock is held, in `mail.locked`.
     · THE TRIGGER STUB KNOWS `everyHours`, so a check can book the kind of hourly trigger
       `installWeeklyDigest` must take away (`DIGEST_RETIRED_RUNS`); and `after`, with an id per trigger,
       so a check can book the one-offs the old marking pass's run-up left (gone since 18 Oct).
     · `formatDate` ANSWERS `yyyy-MM-dd HH:mm` IN THE ZONE NAMED, as well as `yyyy-MM-dd`, so a London
       clock is never quietly a UTC one — the whole of the summer question.

   AND THE STATIC READERS check-digest's "nothing starts it" section wrote — `strip`, `calls`,
   `mentions`, `unquote`. Every person the check invents is invented, and every PIN is 0000.
================================================================================================== */
```

### ---------- A CALENDAR THAT KNOWS WHERE LONDON IS

top level, before `dayIn`

```
/* ---------- A CALENDAR THAT KNOWS WHERE LONDON IS --------------------------------------------------
   THE HARNESS'S `formatDate` IS UTC WHATEVER ZONE IT IS ASKED FOR, which is right for what it was
   written for and would make these checks unable to tell a London day from a UTC one — the whole of the
   BST question. So here `yyyy-MM-dd` (and `yyyy-MM-dd HH:mm`) is answered in the zone named, by the
   same tz database a browser uses. A backend that asked for UTC (or never asked) gets UTC, and the
   summer cases catch it. */
```

### THE RECEIPT IS ASKED FOR AT THE MOMENT OF SENDING.

in `world`

```
/* THE RECEIPT IS ASKED FOR AT THE MOMENT OF SENDING. At-most-once is "the log says `sending` before
     the email goes", and a check that only read the log afterwards could not tell that order from the
     reverse — sending first and writing `sent` after passed it. So the stub looks at the log itself:
     a row for this address, under a well-formed key, saying `sending`, or the send is recorded as
     unreceipted. And the lock: an email sent while the run holds it is the whole mailing holding up
     the site. */
```

### ---------- READING THE SOURCE FOR WHO NAMES WHAT

top level, before `strip`

```
/* ---------- READING THE SOURCE FOR WHO NAMES WHAT ------------------------------------------------------
   Comments out; strings blanked by `unquote`, because "run weeklyDigestRun again" in a message is an
   instruction to a person, not a call. `calls` is a name followed by `(`; `mentions` is every
   word-bounded use, because `sunday: installWeeklyDigest,` in RUNNABLE calls nothing in the text and
   books the trigger from `?run=sunday`. Both skip the function's own declaration. */
```

