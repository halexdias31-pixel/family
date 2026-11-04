# The owner's roadmap — what was asked, where it stands

Kept so nothing is lost. "Coming soon" widgets on the site are the other half of this list: each one is
something switched off on purpose (data/settings/tiers.json, history 860) and waiting to be done properly.

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

## Paused, to come back to
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
