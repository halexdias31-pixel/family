# 1150 — onboarding a new tutor through Find (7 Nov 2026)

The owner onboards a tutor today. After the core freeze (1090) the settings columns are off, so every step must be reachable through Find.
Journey: `check/flow/30-onboard-find.js` (apply → approve → card → listed → Book).

## What was broken
- **Apply to teach was unreachable.** It was a tile on Tutor settings' padlock card, and Find › Settings skips a padlock (`settingNone_`).
  Now it is a card of its own (`applyCard_`, me-roles.js; `staff:apply` in CARD_REG), tagged Student, Parent, Staff in `data/settings/setting-for.json`.
  A card marked `data-yours="1"` sorts with your own settings, not the locked ones.
- **A new tutor could not set their class size after their rate.** The month's pricing clock started on the very first rate, so the next card (Class size) was refused.
  Filling a blank price is setting up, not a change: `pricingChanged_` (people.gs) counts only fields that had a value, for the clock and the stamp.
- **Find › Profiles had no Book tile on a tutor.** `bookTile_` (tiles.js) is now shared by the tutor card and the profile card.

## Already working
- The admin's Applications card (Business) shows in Find › Settings › Business; Approve makes them a tutor and lists them.
- Every card section (picture, headline, rate, class size, at a glance, week) saves from Find.

## Not built
- An admin can make an account for someone ("Add a tutor" on Tutors, `personSave`): it shows the handle and PIN to pass on. No sign-in invite is emailed.
