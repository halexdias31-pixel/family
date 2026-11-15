# Find is the only way around (step 3)

The owner approved this on 14 Nov: **settings, messages and tools become parts of Find.** No separate
screens, no special flows. You get everywhere by choosing tags in Find, and what you arrive at is cards.

The machine copy of this page is `data/settings/find-only.json`. The check `js/check-find-only.js` (rule 5.8)
keeps the two honest, and `check/find-only-ratchet.json` counts the screens still standing outside Find.
That count can only go down.

## What is outside Find today (14 Nov)

There are **15 columns** in the app: Find itself, and **14 others**. Before phase 1 there were 19
columns, 18 of them outside Find; phase 2 (15 Nov) took Apprentice settings and phase 3 (15 Nov) Web settings and phase 4 (15 Nov) Parent settings. Only three are switched on (Find, DMs and Tutor profile). The rest are switched off, and most of
them already have a Find branch.

| Status | How many | What it means |
|---|---|---|
| Moved | 4 | Gone as a screen. Only a Find branch now. The old name, and a tab remembered on the phone, open the branch. |
| Redirect | 4 | A Find branch already exists and the old name opens it, but the old column's code is still there (switched off). These are the easiest to finish next. |
| Column | 2 | Still a column of its own, switched on. |
| Off | 8 | Switched off. Find shows a "Coming soon" card for each. The code is still there. |
| Flows | 10 | Not columns: pop-over sheets and links that open something outside Find. |

### Moved (done)

- **Apprentice profile**: a card per apprentice. Now **Find › Profiles › Apprentice**. An admin sees it, because the
  "see everyone" permission (`find:all-people`) is the admin's. The column was switched off, so nobody could
  see it before.
- **Apprentice settings** (15 Nov): one placeholder line. Now **Find › Settings › Apprentice**. Its card is still drawn
  by the same code (it is a settings *group*, `SETTING_GROUPS` in `js/shell-boot.js`), but there is no column.
- **Web settings** (15 Nov, phase 3): an admin's setup, moderation, imports, weekly email and build stamp. Now
  **Find › Settings › Site**, a settings group marked `admin` (so the layout still keeps Business cards off it).
  Its journeys open the branch with `siteOpen_` (`check/flow/02-qualification-tutor.js`); where one moved a card
  on the Web settings column (Build: up, Delete, Start here), it now moves a Biz settings card, since Find
  draws settings by `setting-for.json` order, not by the layout.

- **Parent settings** (15 Nov, phase 4): a parent's own settings (none yet: 469 put everybody's on Student settings). Now
  **Find › Settings › Parent**, a settings group. The layout journeys read "the last public column" from the live columns
  (Kids settings now), and one short journey checks the branch (owner: old journey lines are not rewritten to follow a
  moved screen; per-block tests replace them).

### Redirect: a Find branch exists, old code still to delete

| Screen | What it shows | Who sees it | Find branch |
|---|---|---|---|
| Kids settings (Student settings) | your picture, name, contact, password, PIN, sign out | everyone | Settings › Student |
| Tutor settings | staff hub, flyers, teaching settings, Apply to teach | tutors, admin | Settings › Staff |
| Biz settings | insurance, tax, legal, safeguarding, money | admin | Settings › Business (the Optimiser is already here) |
| Book | sessions, seats, payment | everyone | Booking |

### Columns still switched on

| Screen | What it shows | Who sees it | What is in Find already |
|---|---|---|---|
| DMs | one conversation per page | signed-in people | Find › Messages is a Coming soon card |
| Tutor profile | a card per tutor | everyone | the same tutors are Booking cards, tagged Profiles |

### Switched off, a Coming soon card in Find

Saved (what you starred), Spotlight (the shop window), Feed (posts), Reels (each video is already a Find
card), Shop (the Basket is already a Find card), Web profile (the business card), Student profile and Parent
profile (Find › Profiles › Student / Parent already list the same people).

### Flows that are not columns

- **Pop-over sheets**: Message someone, Speed read, Work file pages, a tutor's shared link (`?tutor=`).
- **Sign-in links**: the email confirmation link (`?verify=`) and the sign-in link (`?signin=`). These touch
  sign-in, so they wait for their own slice.
- **Back from paying** (`?paid=`), which opens Student settings. This touches money, so it waits too.
- Links that are already Find: a shared card (`?card=`). Links that only record something: a flyer's `?from=`.
  Developer switches: `?dev`, `?nobundle`, `?pen=sizes`.

## The design

1. **Each screen becomes a Find branch.** Its menu is tags (the choices block), and what you arrive at is cards. Settings
   already work this way: Find › Settings › your account type.
2. **The same permission rules decide who sees each branch.** These are the rows in
   `data/settings/permissions.json` (`see` rows such as `type:Staff` and `find:all-people`) and the lens.
   No new rule is written per screen.
3. **Old addresses keep working.** `data/settings/screens-moved.json` says where each old screen lives now:
   `find:<door>`, `find:Settings:<type>`, or `find:<door>:<tag>=<value>`, which opens a door with a tag already
   picked (new in this slice). This covers a link, a button that calls the old name, and a tab remembered on the
   phone.
4. **One screen at a time.** For each screen: move it, delete its column code, update the journeys honestly,
   and lower the ratchet.

## Why the other three settings wait (phases 2–4, 15 Nov)

Kids, Tutor and Biz settings are switched off, and Find › Settings already shows their cards. But about
700 lines of journeys (and `check/states.js`) still draw these columns to test the cards on them: the settings forms,
the layout engine (moving a card between columns, a new column between two), and the Business records. Each needs
its journeys moved to Find › Settings first, one screen per slice. Web settings went first (phase 3), Parent settings
second (phase 4).

## Order, easiest first

1. The 5 redirects: delete each column's code, since the branch already exists. Settings come first, one per
   slice. Book is later, because it touches money.
2. The switched-off profiles: Web, Student and Parent profile.
3. Saved, Spotlight, Feed, Reels and Shop: each one becomes a door or tag.
4. Tutor profile, then DMs: these are switched on, so each needs its journeys moved first.
5. Pop-over sheets become cards. The sign-in and payment links go last, with the data-safety journeys.

## Sign-in items that touch the same Find code (listed, not done in this slice)

These are already in `docs/owner-queue.md`:
- The site keypad on the sign-in name box.
- The sign-in tags stay after you sign in.
- Remove "Signed in as…".
- Forgot PIN shows only on the first PIN step.
- Each ● tag can be removed.
- A wrong PIN shows nothing.

This slice does not touch sign-in or PIN.
