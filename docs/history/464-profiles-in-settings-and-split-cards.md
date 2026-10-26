# 464 — Your profile is edited in your role's settings; an admin can split a card a field a card

## What the owner said (26 Oct)

1. *"Profiles are no longer editable by anyone directly from the profile widget, except the admin. They have to go to
   the appropriate role's account settings. If they are not a tutor, it will just show a padlock on that column; same
   with parent account."*
2. *"Is it possible to add an option to split widgets up? E.g. Contact and address in account settings: split date of
   birth into its own widget, email into its own widget… same with business settings."*

## 1. Your own card is edited on your role's settings column

- **No Edit on your own card in any profile column** (Tutor, Student, Parent profiles), for anybody — `accountPages_`
  (find.js) draws your card with Share my profile only, and `cardEditTile_` (me.js) returns nothing for your own card
  unless it is asked from a settings column (`x.settings`).
- **Your card and its Edit are on the settings column of your rank's face** (`ownCardSetPage_`, `SET_OF_FACE_` /
  `FACE_OF_SET_`): Staff and Admin on **Tutor settings** (picture, figure, name, handle and, with a public tutor card,
  headline, photos, words, at a glance, qualifications, venues, travel, class size — less the hub's rate and week);
  Client on **Parent settings** (picture, figure, name, handle); Student on **Student settings** (the same four).
  The editor opens in that column, in place of the card. `CARD_EDIT.col` still names the face (`tutors`, `students`,
  `parents`); `faceOfCol_` maps a settings column back to it, so a reload mid-edit and the "save or cancel the card you
  are editing first" guard work as before.
- **An admin keeps Edit on somebody else's tutor card** on Tutor profiles, and Edit/Delete/PIN under every person on
  Student and Parent profiles, unchanged. An admin's *own* card is edited on Tutor settings like any tutor's, so every
  field still has one home (the six-columns journey opens every editor and counts the places).
- **A settings column for a role you do not hold is a padlock** (`padlockCard_`): the lock icon and one line —
  "Tutor settings are for tutors." / "Parent settings are for parents." — and nothing else, except on Tutor settings
  one tile for an adult who may apply (`applyTile_`): Apply to teach, Apply again, or "Application sent" (off) while
  one is open; off with "add your date of birth first" when there is no date of birth. The old "Teach with us" card
  (`applyCard_`) is gone.
- The line at the top of Student settings now says the card is edited "on Your card, on <your settings column>".

### Where each field of your own card is edited now

| Field | Student | Client (parent) | Staff / Admin |
|---|---|---|---|
| Picture, figure, name, handle | Student settings | Parent settings | Tutor settings |
| Headline, photos, words, at a glance, qualifications, venues, travel, class size (public tutor card) | — | — | Tutor settings |
| Rate, extra seat, week of hours | — | — | Staff hub on Tutor settings (unchanged) |
| Contact & address, date of birth, about you, exam dates | Student settings | Parent settings (`clientFields`) | Student settings (generic) |
| PIN, roles, notifications, reading aloud, sign out | Student settings | Student settings | Student settings |

## 2. Split and Join

- **For an admin**, a settings card of several fields, and the Business cards whose fields stand alone, carry one
  admin-toned tile under them: **Split** (a card a field). Each piece is its own card in the same place in the column,
  with its own Save and a **Join** tile that puts the card back together.
- Stored in the same layout value as 463: `{ v, widgets, deleted, split: [cardId…] }`, saved by `layoutSave` (one post
  per press, drawn at once, put back on refusal). `layoutSane_` and `layoutClean_` (core.gs) keep only ids matching
  `^(set|biz):`; ids are `set:<column>:<group>` and `biz:rec:<page>` / `biz:profit-terms` (`splitId_`). It applies
  for everybody — a Student settings card split by the admin is split on every student's phone.
- **Presentation only**: no field gains a second editor. A piece's Save posts its own boxes (`meSave_` already posts
  the boxes of the card pressed); `biz-save` now posts only the records whose boxes are in the card pressed, so a
  piece never blanks its neighbours.

### Splittable cards

- Every settings group card with more than one field on Student, Parent and Tutor settings (`settingsSplittable_`):
  e.g. Contact & address (email, phone, address lines, postcode, date of birth…), About you, Where you teach. **Not**
  the qualifications card (one shelf) or a week of hours (one grid).
- Business: each records card (Insurance, Tax, Legal and data, Safeguarding, …) — a record a card; and **Profit · the
  terms** — a term a card after the head with Reset to actual. Not Profit's sum (one chart), Setup, Posts waiting,
  Applications, Staff, Reports or Library import (lists, not fields).

## Checks

- check-flow: the six-columns journey now asks that your own profile card has no Edit, that your role's settings column
  does, that a padlock column is the icon, the line and at most Apply to teach, and still that every field is edited in
  one place; the card-editing journeys open your card on its settings column (`cardOpen_`); the apply journey presses
  the padlock's tile; new journey "split cards (464)" — Split, the pieces with their Saves and Joins in the same place,
  a reload, Join, Business Insurance and Profit terms, a piece's Save posting its own record, a member offered nothing.
- Stamps bumped together to `2026-10-26-k-profiles-split`; `--css-version` the same.
