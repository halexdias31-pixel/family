# 465 — Layout tiles on every card of the right-hand columns, and Start here

## What the owner said (26 Oct)

- *"The main reason I asked for editing the layout was the farther-right columns — they're the most complicated, so
  it's hard to keep asking AI to edit them. You added move/delete tiles to the other widgets, but I especially need them
  on the right-hand columns: Parent/Tutor/Student settings, the profiles columns, Business, and so on."*
- Examples that must work: delete Build, the Layout card itself, Needs help, Manage your child, the "+ Add a …" cards;
  a "Start here" tile, including on a person's card, so Parent profiles opens on the first client and Tutor profiles on
  the first tutor; move "+ Add a …" to the bottom; Split on every card of several fields.

## How it works

- **Every card on family, staff, account, tutors, students, parents and biz** gets an admin row (`cardAdminRow_`,
  layout.js): ▲ Move up, ▼ Move down, ◀ / ▶ Move to the previous/next of these columns, Start here, Delete. Split
  (464) stays beside it on a card of several fields; a split card's pieces each carry the row and move together.
- **One registry** (`CARD_REG`, layout.js) names each card: id, own column, title, how its root is known, and `only`
  when it is the only editor of a setting. Settings groups are `set:<col>:<group>` (now on every group card as
  `data-lay-card`, or its `data-split`), Business records `biz:rec:<page>`, your card on a settings column `own:<col>`.
- **People are content, not cards**: the profile columns are lists (`ppl:<col>:<list>` — Add, Tutor directory, Needs
  help, Find by handle, You and your family, Manage your child, Every student/parent, Parent claims), marked on each of
  their pages with `<!--card:id-->` (`cardMark_`); the row goes under a list's last page.
- **Applied by `cardsOf_(col)`**, which every one of these screens now draws through: the column's own builder, less
  cards moved away or deleted, plus cards moved here — drawn by **their own column's builder**, so a moved card is the
  same card with its one home and its role gate (the Staff hub moved to Student settings is still built only for
  Staff; a client sees nothing). Unknown ids ignored, missing ones appended in the code's order, rubbish ignored, and
  with no card layout and no admin the column is exactly what the builder made.
- **Business only takes Business cards**: a settings or profiles card's ▶ stops before Business, because the column is
  an admin's alone and the card would vanish for everyone else.
- **Delete asks twice in place**; when the card is the only place to edit something the second step reads "Tap again —
  this removes the only place to edit X" (a settings group's title, your PIN, your role, which emails you get, your
  card, a Business record). Still one tap, no pop-up. Any card may go, the Layout card included.
- **The way back when the Layout card is deleted** (the owner's ask: no pop-up): while anything is deleted and the
  Layout card is not drawn, the last page of Business is a small "Deleted cards (N)" line with the same list, Add back
  and Reset layout (`layoutFoot_`). Chosen over keeping the Layout card undeletable because the owner asked that every
  card can go.
- **Start here**: on each card, on each person's page (`person:<id>`, from a `<!--person:id-->` mark) and, on a list's
  first person, "the first person" (`first-person`). It makes that the column's landing (`PAGE_HOME[col]`, falling back
  to what the column did before); pressed again it clears.
- **Stored** in the same layout value: `{ v, widgets, deleted, split, cards: {col: [ids]}, start: {col: id} }`;
  `layoutSane_` and `layoutClean_` (core.gs) keep only the seven columns, valid ids, at most 300 a column, the whole
  under `LAYOUT_MAX`.

## Checks

- check-flow, three "layout cards (465)" journeys: the row on every card of every right-hand column, Split beside it;
  move down/up and to another settings column (one post each, redrawn, a reload keeps it, every field still edited in
  one place); Business reorder; "+ Add a student" to the bottom; Delete twice with the only-editor wording; Build,
  Needs help, the Add cards, Manage your child, the Layout card deleted and the foot line's Add back; Reset; Start here
  on the first person, a person and a card, kept on reload, cleared on a second press; a gated card stays gated after
  a move; a member sees no tiles and cannot post; garbled `cards`/`start` fall back.
- Stamps bumped together to `2026-10-26-p-layout-cards`; `--css-version` the same.
