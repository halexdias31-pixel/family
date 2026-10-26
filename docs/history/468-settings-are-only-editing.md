# 468 — Settings are only editing: no "Your card", a card per thing

## What the owner said (26 Oct, voice)

In Parent, Tutor and Student settings there must be no display of your own card ("Your card" showing how your
profile looks). Settings is purely editing. Each thing of the profile — picture, headline, qualifications,
availability, where you teach and the rest — is its own card, the way Contact / how to reach you / address were
split (466), which the owner loves. The person is displayed only on the profile columns (Tutors, Students,
Parents), read-only, as before.

## What changed

- **No preview, no Edit.** `ownCardSetPage_(setCol)` (me.js) used to draw your card as others see it with an Edit
  tile under it (464), the editor replacing it while open. It now returns **one card per section** of your own card
  (`cardEditCards_`), always open: `own:<col>:<section>` (`data-lay-card`), a title from `OWN_SEC_TITLE_`, the
  section's form, its own `.me-said` line, and its own Save and Cancel tiles. Nothing is pressed to start editing
  (`cardOwnOpen_` opens it when the column draws).
- **Sections** are the existing `CARD_SECTIONS` split by `ownCardSections_(face)`: Picture, Your figure, Name,
  Handle on your home role's column; Rate and class size, Headline, Photographs, Three words, At a glance,
  Qualifications, Where you teach, Available on Tutor settings (less what the Staff hub edits, as since 444).
- **Each card saves itself.** `card-save` and `card-cancel` act on the card they are on (`el.closest('.card-ed')`),
  so a Save sends that card's boxes alone. The draft is kept per section (`draftKeep_('card', pid + ':' + sec)`),
  so typing on one card survives a reload without being sent by another card's Save. Cancel on the Picture card
  puts the picture back, on the Figure card the look; other cards' Cancel just drops their typing.
- **The editor stays open.** After a Save or Cancel, `cardClose_` keeps your own `CARD_EDIT` and refreshes what
  Cancel would put back to what is there now; `cardSecRedraw_` redraws that one card's form in place, because the
  column's repaint waits while another card has typing in it.
- `CARD_DRAWN` kept only nine drawn copies and pruned the ones not yet in the page — twelve forms in one draw lost
  their copies and their Save did nothing. It now keeps the newest 32 always.
- `familyCardEdit` no longer keeps the handle (383's rule): it cannot change while the card is open.
- **Layout registry** (layout.js): `own:account|family|staff` became `ownSecReg_()` — one entry per section per
  column, each with a label, a `say` line and an `only` for Delete's second step. A column for a role you do not
  hold draws each section card shut (`lockedOwnCards_`), title and say line, padlocked, as 467.
- The line at the top of Student settings now says the name, picture, handle and figure "are edited on cards of
  their own".

## Checks

- check-flow: the card journeys of 330/339/345/444/453/464 rewritten for a card per section — every section a card
  in the card's order with its own layout id, title, say line, Save and Cancel; no `.own-set`, `.me-card` or
  `card-edit` on any settings column (the Six columns journey, every rank); each Save posts its own card's boxes
  and no other's; a refused Save keeps its card; Cancel per card; reload keeps each card's typing; the profile on
  the profile column is where the saved values are read. The one-place check (`editorsOf_`) now reads the open
  cards directly.
- check-drafts: the per-section draft key.
- check/states.js: your own card's states read the column's section cards together.
