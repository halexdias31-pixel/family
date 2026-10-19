# check/digest-dry.js

The full text of comments in `check/digest-dry.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/digest-dry.js SUNDAY'S EMAILS, WRITTEN TO A FOLDER, OVER THE REAL SHEET, SENDING NOTHING

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/digest-dry.js   SUNDAY'S EMAILS, WRITTEN TO A FOLDER, OVER THE REAL SHEET, SENDING NOTHING

   *"i want to make sure everything is set up"* (the owner, 12 Oct, about the email of Sunday 18 Oct). The
   checks prove the rules on invented people; this proves the WEEK — the real Ledger's people, links and
   submissions through the real `digestPlan_` and `digestRender_`, the night before it matters, without a
   single email leaving this machine. docs/history/348. SINCE 18 OCT IT SIMULATES NO MARKING (docs/history/352,
   the owner: *"The marking is already done on each question."*): the 9pm run prints each verdict as the
   child's press recorded it, so this renders exactly that, and stops if anything asks Gemini.

     node check/digest-dry.js --sheets /path/to/sheets.json --week 2026-10-18 --out /tmp/sunday
     (--library /path/to/questions.json   the library each question is printed from — the repository's by default)

   `--sheets` is check/live.js's dump — `{ "ledger": { "<tab>": [[header], [row], …] } }`, a cell a string,
   number or boolean — and a date cell may be ISO text, `dd/mm/yyyy hh:mm:ss` as a UK sheet shows it (read
   as London time), or a Sheets serial number. `--week` is any day of the week; the email is that week's
   Sunday at `weekly_digest_hour`, London.

   WHAT IT DOES, IN ONE BACKEND SCOPE (`check-mail-load.js`'s world: London's calendar, the lock,
   the triggers and MailApp stubbed):
     0. THE SHEET AS IT IS, FIRST AND LOUD: when `weekly_digest` is not `send`, a real Sunday with this sheet
        sends NOTHING, and the first line says so before anything else. What follows is what it would do
        with `weekly_digest` at `send` and everything else as the sheet has it;
     1. the setup check's reach lines (`checkSundayEmail`) as of the hour before the email — who sent
        answers, who will be emailed, who will not be and why, who has a parent and no work yet;
     2. how many answers in the emails say "not marked" — recorded `sent`, so nothing marked them; no pass
        marks them first (there is none since 18 Oct), and Gemini is never asked;
     3. every email the Sunday run would send — less any the sheet's `digest_log` already records as
        sent for that week — put through `mailOut_`'s own net with a MailApp that only keeps what it is
        handed, written to `--out` as NN.html, NN.txt and NN.json (to, subject, text, html), with
        summary.json beside them. The folder's own NN.* and summary.json from an earlier run are deleted
        first, so nothing stale sits beside the new ones.

   NOTHING IS SENT, AND THE OUTPUT NEVER LANDS IN THE REPOSITORY. The world's MailApp records anything
   handed to it and this exits 1 if it recorded one; `--out` inside the repository is refused — by its
   real path, so a symlink or a folder called `..something` inside it is refused too — because the emails
   carry real addresses and children's first names, and this repository is public. THE MARKS IN THE
   EMAILS ARE THE SHEET'S, as each press recorded them.
================================================================================================== */
```

### ---------- REFUSING TO WRITE INTO THE REPO — check/live.js's rule, for the same reason: addresses and names.

top level, before `real`

```
/* ---------- REFUSING TO WRITE INTO THE REPO — check/live.js's rule, for the same reason: addresses and names.
   INSIDE IS INSIDE BY ITS REAL PATH. It asked `path.relative(...).startsWith('..')`, and a folder in the
   repository called `..sunday` is `..sunday` relative to it — so the real week's emails went into the
   public working tree as untracked files (the review of 12 Oct). Now: outside only when the relative path
   is `..` itself, starts with `../`, or is on another drive; and both sides through `realpath` (of the
   nearest part of `--out` that exists), so a symlink into the repository is inside too. */
```

### ---------- 0. WHAT THE SHEET SAYS, BEFORE THIS RUN TREATS IT AS SWITCHED ON

top level, before `cfgReal`

```
/* ---------- 0. WHAT THE SHEET SAYS, BEFORE THIS RUN TREATS IT AS SWITCHED ON --------------------------------
   `weekly_digest` is the one switch this run assumes is `send` — the owner's step 3 — so the rest is the
   week as it will be. The plan does not read the switch, so nothing is changed for it. */
```

### ---------- THE CLOCK, AND THE ANSWERS AS THEY HAD ARRIVED BY IT

top level, before `d0`

```
/* ---------- THE CLOCK, AND THE ANSWERS AS THEY HAD ARRIVED BY IT --------------------------------------------
   The dump is the sheet as it is now, so every answer that arrived after the simulated moment is taken off
   the tab before the backend reads it. The grid is changed in place, because the backend's own table holds
   that array. */
```

### ---------- THE SITE STUBBED, AND GEMINI REFUSED

top level, before `net`

```
/* ---------- THE SITE STUBBED, AND GEMINI REFUSED ------------------------------------------------------------
   The library's URL is the local file. A Gemini call STOPS the run: the 9pm email marks nothing (18 Oct), so
   one is a bug, not a thing to simulate. Anything else is refused, so nothing here reaches the network. */
```

