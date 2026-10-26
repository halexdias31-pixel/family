# 463 — The finder list: inserts are Content, no Insert or Figure tile, a Magnifier, Back to top, and your result

26 Oct 2026. Six requests from the owner, in one list:

1. *"Remove the insert viewer tile — they can open it in their 2nd finder."*
2. *"Inserts count as content and should be found under the Content tag; you created a new tag, that's not necessary."*
3. *"Remove the 'figure over this page' tile everywhere — if they want to see the figure, they scroll up."*
4. *"Add a button to scroll back to the top of the finder when they're at the bottom."*
5. New tags: *"attempted / unattempted, correct / incorrect."*
6. *"The zoom tile should be a magnifying tool instead — you hold it to see better."*

## 1 and 2. An insert is Content, found in Find, and no tile on a question

`insertTile_` and the `ins-show` handler are gone, and with them the sheet a question opened in place (455, 458). The
insert kind keeps its own card (`insertCard_`: the sheet, Print, Official, and a reading insert's private extract asked
for when the card is drawn), and its `kindLabel` is `Content`, as boxers and fights became Content in 445. The item no
longer says `documentType: 'Insert'`, so there is no Type tag of its own; `Inserts` and `Insert` are in
`RETIRED_ANSWERS`, so a kept place standing on either is dropped. An insert is still found by subject, level, key stage,
board and tier, and by its words.

`insertsFor_` stays: `check-answerable` still asks that a paper whose words name an insert has one in Find for it.

## 3. No figure tile

`figTile_` and the `q-fig` handler are gone from the answer box's line, the cells box and a chosen part's row.
`figsBefore_` stays, because Read aloud asks it whether there is a picture to look at.

## 4. Back to top

Every result page of a finder ends in a `Back to top` tile (`findTopRow_`, `find-top`), so it is at the bottom of a
long page and on the last page. It turns the finder it is drawn in (`finderAt_`) to its first page, in that finder's
binding; the other finder stays where it was.

## 5. Your result

One ordinary facet, `myResult` ("Your result"), with no flag (396): `myResultOf_` reads the viewer's latest press per
question, the account's and this device's (`progressPresses_`, as Progress counts them), and says `Unattempted`, or
`Attempted`, and when marked also `Correct`, `Incorrect` or `Part marks` (`progressScore_`). Signed out it is blank on
every item, so the one rule never asks it. Its colour is `--tag-mine`. A press (`subRecord_`) bumps a generation
(`myResultNew_`), every finder forgets what it found, and the tag on the pressed question's own page is said again.

## 6. The Magnifier

`qToolkit_` says `magnify` where it said `zoom`; the tile is `q-mag`, first in every question page's row. On, a mouse
over the page carries a 160px circle showing the page 2.5 times bigger; on a touch screen a finger held still for
220 ms brings it up above the finger, it follows the finger, and lifting puts it away. While it is up the column does
not turn (`magBusy_` in overworld.js) and the page does not scroll. The glass holds a copy of the page (`magCopy_`):
words, figures, pictures, typed answers and the pen's canvas, retaken when the page changes or after a second. It goes
off by the tile or when a tab or link leaves the page (`magStray_`, from `placeCells`, as the padlock's `qLockStray_`).

The Zoom sheet (`qZoomOpen_`, `−`/`+`, pinch) and the tap-to-zoom figure (`q-zoom-fig`) went with it.

## Checks

- `check-answerable`: "no Zoom tile" became "no Magnifier tile" on every card, stem page and long-part page; the
  figure-is-a-door test went.
- Journeys: the toolkit journey drives the Magnifier with a mouse and a held finger; the twin journey asks for the
  Magnifier; the Figure-tile journey now asks that no part has one; the reading-insert journey opens the insert's own
  Content card. New: `back to top` and `your result`. The Find/Find 2 sameness journey removes the person's own result
  tag before it compares, as it removes the star.
- `check/states.js`: the Figure-tile state went; the keypad state asks only that the box is above the pad.
