# 489 — The owner's notes, round two: the feed, the tiles, the front door

Notes left through the Note for Claude tile (Ledger `claude_notes`), done together. Backend and css
2026-10-27-zc-front.

## N-1793132679331-669 (URGENT): the Christmas card's delete and the camera

> "I tried to delete [the Christmas card] and it ended up deleting the camera and now… the latest post appearing
> above the camera. You need to stabilise this."

**What was wrong.** The feed was drawn as festive cards, then the camera, then the posts. The camera's place was
`feedCamAt_()`, which returned `DATA.festive.length`, the festive cards *sent*, not the ones *drawn*. Once
`item:feed:festive` was deleted (477's `deleted` list), `postsBlocks` drew no festive card but `feedCamAt_` still
said 1. So `feedColumn_` put the newest post at page 0 and the camera at page 1, and the feed's home page, its
camera watch and `feedPageOf_` all counted from the wrong place. The owner was left on page 0, the newest post, with
the camera one page down. That is the "latest post above the camera", and to the owner the camera looked deleted.
The Delete tile itself acted on the right id (`data-lc="item:feed:festive"`, `mergeAll_` of an item is itself). A
second weakness made the tile row easy to misread: `festiveCard` is a `<div class="fest">` and `cardRowIn_` only put
a row inside `card`/`own-set`, so the festive card's Delete and Note row hung *outside* it, under the card.

**Fixed at the root.**
- The camera is the feed's first page, always (`feedColumn_` = camera, then `postsBlocks`). The owner asked for the
  camera first.
- `feedCamAt_()` is 0, or -1 once the camera itself is deleted. `feedPostsAt_()` is the camera plus the festive cards
  *actually drawn* (`FEED_FEST_N`, set by `postsBlocks`). The feed's home page (`PAGE_HOME.feed`, shell.js) and
  `feedPageOf_` use it.
- `itemMark_` writes `data-item="<id>"` on the item's own box. `cardRowIn_` accepts `fest`, and a class after other
  attributes, so the row sits inside the thing it acts on.

**Restoring the camera (a one-off).** Deletes are final by design (477), but if this one happened it was our bug's
doing. The layout's shape number goes to `v: 2` (`LAYOUT_V`). A layout older than v2 that has `item:feed:camera` in
`deleted` gets it taken out and `item:feed:festive` put in, since that was the owner's intent (`layoutMigrate2_`,
layout.js; the same rule in `layoutClean_`, backend/core.gs). Every save writes v2, so the repair never runs again,
and a camera deleted on purpose after today stays deleted. If the stored layout never had the camera deleted, nothing
changes.

Journey: *the festive card deletes alone (489)*. It deletes the festive item and asserts the camera stays first with
the newest post under it, that the layout saved v2, and that the repair runs in both copies and only on v1. The
mutation that puts the camera back after the first block fails it.

## N-…491: the box replaces the widget

> "when I write something to edit a widget the whole widget should be replaced by the text box; otherwise the text
> box appears underneath and stretches the screen and everything becomes less stable."

`boxInPlace_(el, html)` (layout.js) puts Note for Claude's box and the report box *inside* the thing (`.card`,
`.own-set`, `.fest`, `.post`). The thing gets `.is-writing`, which keeps its height (`--writing-h`, at least 12rem)
and hides every other child while writing. `boxOut_` (Cancel, or Send succeeding) gives it back. A message still
takes its report box under the bubble. After a note is sent the box closes, a toast says so, and the open notes are
listed the next time it opens.

## N-…330, …977, …787, …369: one tile, "Report or suggest a change"

> "suggesting a change and reporting is the same thing so these tiles need to merge"

`reportTile_` is called "Report or suggest a change" (the flag, with no note unless it is flagged to fix). "Suggest a
change" (`suggest`) is a reason for everything but a message or post, in `REPORT_WHY` and the backend's
`REPORT_REASONS`. Checked in the app at 390px: content cards and every Finder kind already carried it
(`cardTiles_` → `reportTileFor_`). The **booking form and a session's receipt did not** (`receipt.js` `rc-tiles`,
`jobPage_`), and now both do.

## N-…330: no tile row split by a return

> "reformat all tiles so none are separated by a return; like here there is an arbitrary return after the tick
> cross tiles"

`tileRowsJoin_(html)` (tiles.js) runs over every page `pages()`/`stack()` draw. A tile row straight after another
joins it. A tile row after a box that ends in one (a list's last item's Approve/Decline, with an empty status line allowed
between) joins *that* row, inside the box. A settings form (`.me-form`) keeps its Save row: joining the card's row
into it moved Add a qualification and broke a section's own Save journeys, so that is left for now. The joined row keeps its classes and data on a `tile-group` span (`display: contents`), so
`.card-admin[data-lay-for]` still finds it. Not joined: a widget's own controls inside its slot (the Console's
Play/Choose file sit apart from its foot), and the rows of a list's separate items (each qualification is a thing).
check/tiles.js now fails a tile row standing under another.

## N-…698 (part): the tiles on Find cards and widgets

> "stars and two different stars and then one is opening a new place. I don't know what these tiles do… they seem
> very silly"

The two stars were Save (`star`) and Spotlight (`spot`, a rayed circle). Spotlight is now a megaphone. The "new
place" was `Open · in Find` on a kept card in Saved or Spotlight, drawn with the leave-the-site arrow. It opens the
card in Find, in place, so it is a magnifier now. The tiles, one meaning each:

| Icon | Tile | Where |
|---|---|---|
| star | Save | every card and widget |
| megaphone (`spot`) | Spotlight (admin) | Find cards |
| flag | Report or suggest a change | everything, Student rank and up |
| magnifier (`search`) | Open in Find | a kept card not drawn whole |
| arrow out (`open`) | Open (a Bible translation, a Talmud page) | those cards |
| speed | Speed read | content, practicals, projects |
| speak | Read aloud / Hear it | primary questions, content |
| zoom | Magnifier | questions |
| lock | Lock this page / game still | questions, games |
| chat, share | Message, Share | tutors |
| cart | Add to basket | shop items |
| book | Book this / on the booking form | levels, venues |
| play | Watch / Highlights | fights, boxers |
| up down left right | Move up/down/to the previous/next column (admin) | widgets, cards |
| house (`home`) | Start here: where *this column* opens (admin) | widgets (new), cards, people |
| door | Front door: where *the app* opens, for everybody (admin) | widgets, cards, items |
| merge, split | Merge with the card above, Split (admin) | widgets, cards |
| bin | Delete (admin) | widgets, cards, items |
| pen | Note for Claude (admin) | widgets, cards, items |

## N-…885 and N-…725: the front door

> "I want to make this widget [Calculator] the front door page it lands on when customers log in. but there's no
> front door tile setter" · "why can't I make the 1st widget below the home widget for this page"

The layout has `front: {col, id}`, one for the whole site, cleaned by `layoutSane_` and `layoutClean_`. `frontTile_`
(the door) is on every widget (`layoutTiles_`), card (`cardAdminRow_`) and item (`itemMark_`), and pressing it again
clears it. Opening the app (not a reload within `AWAY_AGAIN`, which goes back where you were) lands on the door's
column. It does so from the kept layout at the first frame, or through `frontGo_` once the payload comes (shell.js
`load`). The column opens at the door's page: a widget by its column's order, an item by the feed's, a card through
Start here's count (`cardStartOf_` falls back to the door). The second note was the same want for one column: widget
columns had no Start here. They do now (`start` accepts `reel tools games shop` in both cleaners), so a widget can be
where its column opens. The house means the column and the door means the app.

## N-…209 (Library cards): one card

> "change this to be only 1 card allowed."

`libraryShelf_` draws one slot: the card already filled, else the first. There is no "Add another", and a new card
is written over the old one. Save posts only that card's three fields. The four library journeys were rewritten for
one card.

## N-…321 (part, E-ink): the old report in the box

> "when I went to write a report here I saw the previous report… it was already written in the chat box"

The report's draft (`rep`, `kind|id`) was dropped on success, but the box was removed with the words still in it. A
browser that fires `change` as a focused box goes, or a draft write still held, wrote them back. Now the box is
emptied before it goes, Note for Claude's draft is dropped outright as well as through `draftSentDone_`, and the
journeys open each box again after Send and assert it is empty.
