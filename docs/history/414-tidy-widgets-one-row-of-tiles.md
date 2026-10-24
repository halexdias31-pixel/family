# 414 — tidy widgets: one empty state, Reels opens on a reel, Board games, one row of tiles (24 Oct 2026)

Seven asks from the owner in one go, from a look at the app at phone width.

## 1. An empty widget is its title

"Nothing in the window yet. Press Spotlight on a card…" and its siblings are gone. `emptyCard_(title)`
(shell.js) is the one empty state: `<div class="card is-empty"><h3>Title</h3></div>`, nothing under it.
Used by Spotlight (an admin too — the old admin-only how-to went with it), Saved (signed out and nothing
kept), the shop with nothing for sale and the Reels column with no clips. The basket, a widget with its own
heading, draws nothing under the heading when empty (`cartCard_` returns `''`).

Not changed (judgement): the four placeholders that say "Not built yet" (Contest, Practice, LEGO trade-in,
Progress) — their check (`placeholderFaults_`) asks them to say so, and "coming soon" is not "empty"; the DMs'
"Nothing yet — open a tutor's card and press Message", which is a column, not a widget, and the only door to
starting a conversation; a load that failed still draws `nothingHere()` with Try again.

## 2. Reels opens on the first reel

404 put an admin's "+ Add a reel" on page 0, so an admin opened Reels on a form. Now the column's lead is
`reelLead_()` (posts.js): its widgets (kind `reel`), then the admin's "+", then the reels; `REEL_LEAD` is
that count and `PAGE_HOME.reel` (shell.js) is `REEL_LEAD`, so the column opens on the first reel with the "+"
one swipe back. `reelLeadSet_` moves `PAGE.reel` by however much the lead grew or shrank — an admin signing in
keeps the reel in front in front.

## 3. SuperTux is gone

The widget, `tuxPaint_`/`tuxPlay_`, `.tux-*`, the `brand('supertux_url')` reader, its journey and its history
note (363, removed as asked; this note is the record that it existed: an entry linking the upstream release
and framing a web build on Play).

## 4. Board games: Connect 4, Othello and Scrabble in one widget

Built the way Word games were in 238. `BOARD_GAMES` (games.js) holds each game's body and start; the
`boardgames` widget (map.js) has a getter `html` with a `#bg-pick` select and `#bg-slot`; the choice is kept
on the device as `bg-game`. None of the engines changed and none needs a `stop`; Scrabble keeps its game
across a switch (its state is `scrabble`, `initScrabble` only paints it). `initConnect4`, `initOthello`,
`initScrabble` are in check-widgets' `ACCEPTED_ENGINE` with the reason. Stars on the three old ids match
nothing now, as 238's did.

## 5. Videos is on the Reels column

`videos` is kind `reel`; `WIDGET_COLS` and `widgetsOn_` (arcade.js) know the `reel` column, `startScreen_`
starts it (`toolsStart_('reel')`), Saved accepts a starred `reel` widget. Its page on Reels is its index among
the column's widgets, which every videos check now uses (`goPage('reel', n)`, `#s-reel #wgt-videos`); the
videos states moved from `games` to a new `reel` entry in check/states.js.

## 6. One row of tiles

George's card for an admin was star, message, share, edit, eye, person+, then bin and crosshair alone on a
second line. `tileRow_(html, cls, own)` (tiles.js) is the rule for every card's row (`cardTiles_`, posts,
a session's receipt row, a family card's admin row, the `?tutor=` sheet):

- a tile is an admin's or owner's when drawn in the `admin` or `danger` tone; those sit after the viewer's
  tiles in one `.tile-group.is-admin` at the far end, ordered `card-edit`, `person-edit`, `spot`,
  `set-listed`, the rest, a danger tile last;
- six 44px tiles fit a card at 390px (`TILE_ROW_MAX`); past six the admin tiles go behind one gold
  **Admin ⋯** tile (icon `more`), or, with no admin tiles, the tail behind **More ⋯**. The tile opens a
  `.tile-sheet` row under the tiles and closes it, and the pane is fitted again (`paneReach_`);
- a row of six or fewer with no admin tile is left exactly as written; your own card (`me`) is never split,
  because the Staff hub's gold there means "terms to agree", not "admin".

A tutor's row leads with what a visitor came for: Message, Share, then Save. George, for an admin, is now
Message, Share, Save, Admin ⋯ (Edit their card, Edit name/role/email, Spotlight, Listed, Delete).

**"patient · driven · driven"**: `profList_` (cards.js) keeps each word once, case ignored, first spelling kept —
every list a profile reads goes through it.

## 7. The columns, looked at again

Moved, because each is plainly in the wrong group (392's rule: grouped by purpose, one widget per thing):
- **One more thing** (the fact dealer, kind `reel`) leads Reels beside Videos — it is the reels' own deck,
  and Games keeps games;
- **LEGO trade-in** (placeholder) is kind `shop`, on the Shop column under the basket — trading sets in is
  buying and selling, not a tool.

`TAB_ORDER` and columns.json are unchanged (no column was added or split); the Reels note in columns.json
says what leads it. Left as judgement calls, not made: an admin's tools (Make a flyer, Check uploads) to
Business, which is not a widget column; My teaching hours to the Staff hub; Library cards to You; the
Practice placeholder to Progress; Calendar and Timetable as one widget; splitting Games into arcade
(Flabby Pird, Console, Chess) and classroom (Times Tables, Word games, Word Search, Sentence Scramble).

## Checks

- check-flow: new journeys *the board games are one widget…*, *an empty Spotlight, Saved, shop and basket
  draw their title alone…*, *an admin sees a tutor card's tiles as one row…*; rewritten to the new places:
  the contest is the last game, Connect 4 through the picker, LEGO trade-in on Shop, every videos journey on
  Reels, the drawn-ahead widget list, and 404's journey now asks that a student's and an admin's Reels stand on
  the first reel with the "+" the page just before it. SuperTux's journey went with it.
- check/ui.js: **A TILE ALONE ON A SECOND LINE** — at a width of 430 or less, a `.tile-row` whose tiles wrap
  with one tile on the last line fails. Its first run found one the tile rule cannot reach: the whiteboard's
  toolbar (`.nb-bar`, six tools in 272px) wrapped 5+1; at a phone's width in portrait it is now a grid of
  two rows of three. The Reels' Sound-tile rule no longer asks for a reel in view while a lead widget
  (Videos) is the page in front.
- check/states.js and check/videos.js reach Videos on Reels and the boards through `bg-game`.

CSS `2026-10-24-h-tidy-widgets`. No backend change.
