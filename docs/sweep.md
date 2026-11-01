# The sweep — what to do when the owner says "sweep", "check my notes", "do the checks" or similar

Saved at the owner's request (1 Nov 2026) so every session follows the same routine. The owner is not a
programmer. Their philosophy, which decides every change: STABILITY, UNIVERSALITY (one rule for every case,
never per-case exceptions), UNIFORMITY, RELIABILITY, CONSISTENCY, INTUITIVENESS, SIMPLICITY. Act on what they
would ask for if they knew to ask. Follow CLAUDE.md strictly (public repo: no learner data/real names/emails/
PINs; no copyrighted material; "a human never marks" — AI marking only; tiles not pop-ups; one shared global scope).

1. **Branch.** `git fetch origin claude/focused-wright-blx2g6`. If an open pull request from an earlier sweep
   (branch `claude/nightly-*`) is still unmerged, check it out and add to it; otherwise create
   `claude/nightly-<YYYY-MM-DD>` from `claude/focused-wright-blx2g6`. Never more than one open sweep PR.
   (If the session is told to work on another branch, use that one instead.)
2. **The owner's notes first.** Read the Google Drive file "Notes for Claude" (id `10dephr1liy6hqL5pyKXY34Q7EXS977DP`).
   Skip any note whose id is in `data/notes-done.json`. For each new note: understand it (the path/screen it
   names; a "Picture:" or "Files:" link is in Drive — open it), fix the RULE behind it, not just the instance,
   with a check that fails before and passes after (prove by mutation), and add its id to `data/notes-done.json`.
3. **Then improve on your own.** Keep a running list in `docs/nightly.md`: areas audited in rotation (Finder and
   funnel; questions, keypad and marking; library data and labels; layout, slide and feel; loading, empty and
   error states; booking and accounts — read-only for money; performance; accessibility and text; the checks
   themselves — gaps and flaky ones), what each sweep found and fixed, and open ideas. Take the next area, audit
   it against the philosophy (the app's own checks, a real browser at 390px where useful), and make the most
   valuable improvements that fit — each a universal rule with a check proven by mutation. Prefer removing
   complexity and unifying duplicates over adding things. Record what you did and what comes next.
4. **Limits — ask, don't do:** new features or screens; prices, payments, booking money, payouts; accounts,
   ranks, permissions or privacy; deleting content or library rows; reversing anything the owner decided
   before (search `docs/history` first); anything ambiguous. Write these as plain-English questions.
5. **Checks.** Memory is limited: one heavy check at a time (wrap in `flock` on a shared lock file if several
   helpers run): `node js/check-all.js --fast`; `FLOW_PART=k/8 node --max-old-space-size=1500 js/check-flow.js`
   for k=1..8 in turn; `node check/tiles.js`. Everything green before pushing; if something can't go green,
   revert it and say so. Backend change → bump the four version stamps together; `style.css` change → bump
   `--css-version`. Comments say WHY in ≤240 characters; the story goes in `docs/history`.
6. If there were no new notes and nothing worth changing, say so in one line and stop.
7. **Finish.** Small logical commits (the session's commit trailers), push, and open or update ONE pull request
   into `claude/focused-wright-blx2g6` titled "Nightly <date>" — unless the owner asked for the work on the
   session's own branch. The summary, in plain English for a non-programmer: notes handled, improvements and
   why (in the philosophy's words), questions, and whether an Apps Script deploy is needed. Never merge it yourself.
