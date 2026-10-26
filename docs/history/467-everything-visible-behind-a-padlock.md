# 467 — Everybody sees every card; a padlock on what is not yours; every card says what it is for

## What the owner said (26 Oct)

1. *"Everybody can see everything; different things are just locked behind a padlock."*
2. *"I don't know what things are — I should know what they are even if I can't edit."*
3. *"Profile cards are uneditable by anyone, including admin — you edit your own things in your account settings
   (student/parent/tutor)."*
4. *"The tutor profile should fit on a normal phone even with lots of data."*

## 1. Locked cards instead of a padlock-only page

- Parent and Tutor settings, for a viewer who does not hold the role (any rank, or signed out), are the padlock line
  (`padlockCard_`, still with Apply to teach on Tutor settings for an adult who may apply) **followed by every card
  of that column**, each shut by `lockCard_` (me.js): `is-locked` on the card, a small padlock in its corner, every
  input, select, textarea and button `disabled`, links made inert, ids renamed `data-lock-id` so a shut copy is never
  the box a real card's code finds.
- **No data in them**: `lockedAs_(col, draw)` swaps `USER` for a placeholder of the column's role (`LOCK_AS_`:
  Tutor / Client / Student, empty profile, no person id) while the column's own builders draw (`settingsCards_`,
  `settingsSplit_`, `hubTile_`, `youSettingsPages_`), then puts the real `USER` back in a `finally`. The labels,
  groups and layout are therefore the real ones, the values blank. "Your card" is drawn as its title only — a
  placeholder has no card — and the progress widgets are not drawn (they are data).
- Signed out, Student settings is the sign-in card followed by Student settings' cards locked the same way.
- Staff or Admin with no parent's details (no client role) used to see Parent settings as a bare title; they now see
  the padlock line and the cards locked, like everybody else who is not a parent.
- A locked card keeps its `data-lay-card` / `data-split` id, so the admin's layout row and descriptions find it.
- Add as my child (Student profiles) and Manage your child are unchanged — that is how a parent account begins.

## 2. One line on every card saying what it is for

- `say` on each `CARD_REG` entry (layout.js), and `CARD_SAY_DYN` for the cards known by id alone (settings groups
  `set:<col>:<group>` by the group's slug, Business records `biz:rec:<page>`, `biz:profit-terms`). Each ≤ 90 characters.
- `cardSayIn_` puts `<p class="faint card-say">` after the card's first `<h3>` (or first inside it; a `+ Add` button
  card gets a span), on the first page of each card group, in both paths of `cardsOf_` — so every viewer sees it,
  not only an admin with a layout.

## 3. No Edit on any profile card, the admin included

- `cardMayEdit_` is your own card only, for every rank; `cardEditTile_` therefore draws Edit only on your own card on
  your role's settings column (464's rule). The admin's Edit on another tutor's card is gone, and so is the admin's
  Edit (`person-edit`) under a student or parent: the tile, its handler and its place in `TILE_ADMIN_ORDER_`.
- The admin keeps Delete, Show PIN, Send last week and Message under other people.
- **Decided, and what it costs**: the owner said "uneditable by anyone, including admin", so there is no back door
  in Business either. Somebody else's details are theirs to change on their own settings. The business's cut of one
  tutor's extra seat (`extra_seat_cut`, 345) was only set from the admin's edit of that tutor's card; until a home is
  asked for, it is the `config` default or the sheet cell. The three journeys that drove the admin's edit of another
  card (filled from getProfile, the seat cut in pounds, the parts adding up) were replaced by one: no profile card
  offers Edit to anybody.

## 4. A tutor's card fits a phone

- Availability is text, one line a day, hours in a row merged: "Mon 4–7pm", "Tue 10am–12pm, 3–5pm"
  (`profSpan_`, cards.js); taught hours one faint line after, "Already teaching Mon 5–6pm". The screen reader's
  `aria-label` is unchanged. The week grid is gone from the card (the booking form and the hub keep theirs).
- The map on a person's card is 130px tall instead of 200.
- At 390×844 a synthetic full tutor (eight subjects, four qualifications, a long description, photos, venues, hours
  on all seven days) draws 735px tall with nothing scrolling sideways.

## Checks

- check-flow: the six-columns journey now wants the padlock line and every card locked (padlock, nothing usable, a
  line each) for a non-holder, Parent settings locked for Staff and Admin too, and ignores locked boxes when it counts
  where each setting is edited (`editorsOf_`); a new "467: signed out" journey (all three settings columns locked,
  no values, no ids, every admin-row card on all seven right-hand columns has a line ≤ 90 characters); "no profile
  card offers Edit to anybody"; the two hours journeys read the lines.
- `--css-version` `2026-10-26-q-everything-visible`. No backend change, so the stamps are unchanged.
