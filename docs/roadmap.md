# The owner's roadmap — what was asked, where it stands

Kept so nothing is lost. "Coming soon" widgets on the site are the other half of this list: each one is
something switched off on purpose (data/settings/tiers.json, history 860) and waiting to be done properly.

## Nothing is lost — the safety net
- **Every feature's code is still in the repo.** Switched off, never deleted: screens by `active` in
  data/settings/columns.json, widgets by data/settings/tiers.json, settings by `SETTINGS_OFF` (js/me.js),
  layout editing by `LAYOUT_EDIT` (js/layout.js), Find 2 by `res` in columns.json, Find's front cards by `HEALTH_IN_FIND`.
- **The whole site as it was with every feature on** is commit `389d843` (4 Nov 2026, before the shutdown).
  Any file can be brought back from it with `git checkout 389d843 -- <file>`; the earlier full site before
  Tools/Games moved into Find is `a2397ac`.
- Each "Coming soon" card in Find names one switched-off thing; turning it back on removes the card.

## The direction (owner, 3–4 Nov 2026)
- Apple-like: minimal, stable, few features done well. **Find is the core; everything else is secondary.**
- Organise first, then optimise round by round against the Stability and Logic health scores.
- Reorganising should take minutes: one-line edits in tiers.json and widgets-in-find.json.
- Everything browsable lives in Find; only Feed, Messages, Book, the Basket and a few fixed screens stay columns.

## In progress / next
1. **Settings into Find** under "Settings", by For: Student, Parent, Apprentice, Staff, Admin, Business, Web (stage 3, started).
2. **Profiles into Find** under "People": Tutor, Student, Parent, Apprentice, Web (stage 3).
3. **The move tool** — the owner moves any widget into or out of Find themself (stage 4; reads widgets-in-find.json).
4. **One-step on/off** — tiers.json read at boot so turning a widget on is one edit (today it also needs `node tools/tiers.js`).
5. **Menu tidy-up merged** — answer never repeats a chosen chip; card and Sunday email name papers alike (830).
6. **Browser checks** — route secondary ones to report-only, fix the core ones (870): the Find search box shifts ~20px
   when an answer is pressed; the card sits at 183px instead of 300 after clearing.

7. **One question page, mechanical markers** (owner, 5 Nov): every question on one page — type, draw or write
   anywhere; each question's data names its answer areas; one reader turns any input (typed, finger-written digits
   read on the phone, drawn needle/bars/points/shading) into a plain answer; ~5 shared checkers (number, expression,
   points, choice, words) mark it the same every time, offline, no AI. AI only for method marks, never the answer.
   Steps: map the 24 qtypes onto the checkers → build the page with old markers behind it → move types a few at a
   time with the answer check proving each batch → remove old screens last. Health checker tracks it (qtypes moved,
   answer areas present, checker proofs).

8. **Import any paper by uploading a folder** (owner, 5 Nov): admin-only Import in Settings; pick a folder of PDFs
   (Edexcel, AQA, Corbettmaths, mixed); the browser reads each, recognises the publisher (one rule set each, new
   publisher = new rule set), splits questions/parts/marks, crops figures, matches the mark scheme, tags it; a
   preview shows each question with the checker's findings; OK saves to the private library (sheet, never the repo)
   and it appears in Find. Mechanical, no AI; unclear items flagged, never guessed. Health checks every batch and
   every imported question. Default: waits for OK in preview. Needs one Apps Script deploy.

## Paused, to come back to
- **One scrolling page instead of sideways columns** (owner agreed it's the long-term move, 4 Nov): the browser's own
  scrolling, cards loaded as they scroll in, the @family keypad only in maths answer boxes. Its own careful job, with
  the question pages checked first; not while things are settling.
- **Fast Find that fits a phone** (805 was reverted: an iPhone tab ran out of memory on Practice). Needs a phone-memory
  check, then a lighter index (typed arrays, lazy columns, only the visible window).
- **First-moment check** — every screen with the later files held back (the finderPageCount_ crash on 4 Nov).
- **Instant return visits** — keep the last screen on the device (owner said yes): no secrets, tied to the account and
  build, cleared on sign-out, writes wait for fresh data.
- **Feed moves as one unit** by its top post.
- **Saved, shop items, readable texts into Find** (cut list "move into Find").

## Switched off ("Coming soon") — the 23, each to revisit
console, boardgames, wordgames, reels, videos, newspaper, flyers, mat, timer, docket, notepad, spotify, speedread,
timetable, typing, termdates, countdowns, favlinks, rewrite, poster, pixel, verse (e-ink), whiteboard.
Owner notes attached to some: Docket "doesn't work" (not reproduced); favourite links as an icon grid (done before off);
e-ink pictures improved (device needs `tools/epaper-verse/build.sh`).

## Secondary, still on, not polished
Spotlight, Apprentice screens, placeholder cards (Brownie points, Roadmap, Code of conduct), Logic health, Stability,
the layout editor (whole columns move, insert a column, any widget anywhere), Mechanics (Clio only), Chemistry, Themes.

## Content and data
- Mechanics: Renault Clio III only, 68 parts, example part numbers and approximate prices — owner to confirm engine and prices.
- Edexcel GCSE 1MA1: 28 papers imported questions-only; answers wait for mark schemes; ~25 expressions to check against PDFs.
- Missing papers to source: Nov 2020 1MA1, Nov 2019 3F, some 2019/2018 Higher; OCR FSMQ for Further Maths.
- Owner's profile-card screenshots (IMG_2280/2281) never seen — re-send via Suggest if still wrong.

## Owner actions
- After merging anything with backend changes: Apps Script ↓ sync, Deploy → New version, open the site once as admin.
