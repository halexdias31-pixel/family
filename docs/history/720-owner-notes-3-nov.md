# 720 — owner notes of 3 November

## 1. "WIDGETS is not defined (screen reel)" — a half-loaded app (N-1793715702255-43865)

670 moved 41 files into `window.LATER`, appended by `laterFiles_` (data.js) as `<script src async=false>`.
They ran in `FILES` order, one by one, each as it arrived. In `FILES`, `find` comes before `map`. So for the
moment between find.js running and map.js arriving, `allWidgets` (find.js) existed and `WIDGETS` (map.js) did
not. Arriving on Reels in that window, `startScreen_` → `toolsStart_('reel')` → `widgetsOf_` asked
`typeof allWidgets === 'function'` — true — and `allWidgets()` read `WIDGETS`: a ReferenceError, reported.

The guard was checking the wrong name, and every `typeof laterThing_ === 'function'` guard in the eager files
(hundreds) had the same hole: a guard proves its own name is in, not the names that name reads.

**The rule:** a LATER name is all-in or none. `laterFiles_` now fetches the 41 files side by side and runs
them as inline scripts (with `//# sourceURL`) in one synchronous loop, then sets `LATER_IN` in the same
task. No timer, frame or tap can run between the first and the last, so no screen can see one LATER file
without the others, and a `typeof` guard on any LATER name is a true answer for all of them.

**The check:** `check/later.js` holds every LATER file at the server, goes to and starts every column in
`TAB_ORDER` (no ReferenceError may reach the console or the error report), then lets the files go one at a
time in run order; after each, no function a LATER file declares may be readable until the last is in.
With the old loader it fails at the first file (`pseudoMoves`, games.js).

## 2. No Suggest a change on posts or on the "add reel" card (N-1793712750574-7735, N-1793715946804-19950)

Two exemptions, not a missing renderer. `postTiles_` (tiles.js) drew the tile only `!p.mine`, and the owner's
posts are his own; `addCard_` (the "+ Add a reel" card under Newspaper on Reels, and every other "+") drew
none, and 486's journey check let `.add-card` off. Now every post carries it, `addCard_` puts its Suggest in
the row right after it (as a person's card does), and the 486 journey asks of your own post and of a "+".

## 3. No widget titles (N-1793716151936-45504)

The widget's leading `<h3>` (in its slot, or in the slot's own card) is visually hidden by one rule in
style.css, so a screen reader still hears it, and every slot is `role="region"` with `aria-label` = the
widget's `name`. The layout editor names widgets by `name` (`layoutDeletedName_`, `layoutWidgets_`), not by the heading, so it is
unchanged; a widget's Suggest now carries its name too.

## 4. Docket (N-1793716206702-59175)

Not reproduced for a signed-in person: at 390x844, adding by + and by Enter, ticking and removing all drew
and saved (`saveTodo`). The one fault found: signed out, the add row was still drawn, took a line and did
nothing with it. `paintDocket` now hides the row until somebody is signed in. If the owner's "not working"
was something else, it needs a screenshot or the steps.

## 5. Speed reader: Read is a tile (N-1793716249744-90761)

`Read it` was a `.btn`; it is `tile_({ icon: 'play', label: 'Read it', act: 'sr-read' })` in a row.

## 6. Favourite links as a grid (N-1793716310174-24807)

A grid of the sites, icon over name. The icon is the site's own `/favicon.ico`, asked of that site with
`referrerpolicy="no-referrer"`: no icon service (Google's s2, DuckDuckGo's) learns the list. Under it is the
site's first letter, which shows when the site has no icon (`error` removes the image). Icons sit on a
white plate, since they are drawn for white pages. Move and remove are behind an Edit links tile.

## 7. The e-ink screen's pictures (N-1793716363522-66616)

Two causes. The bitmaps were Floyd-Steinberg at 120x160 and the screen shows them at 5/4 nearest pixel, so
every fourth row and column is doubled and the dither turned to stripes; and the widget stretched its 200px
canvas to the box (1.28x here, 1.75x on a phone), doubling dots unevenly again.

- `make-icons.js` fits the master to the panel's 150x200, stretches it to its 1st-99th percentile,
  sharpens lightly and applies an S-curve, makes each bitmap pixel the mean of the panel pixels it lands
  on, then dithers with Atkinson. `data/icons/120/` and `pictures.h` are regenerated (check-eink green).
  **The screen itself needs `tools/epaper-verse/build.sh` re-run** for the new pictures.h; PlatformIO is
  not in this container, so `epaper-verse.bin` is unchanged.
- `einkDraw_` draws whole device pixels per panel pixel (`einkScale_`) in the panel's own two inks.

## 8. Find: taps feel slow and are lost (N-1793717072309-72111)

Measured at CPU 4x, 390x844: a tap on an answer ran `paintStuff` in the click itself, 0.9 to 3.3 s, and no
frame was drawn until it ended, so the press mark (`is-pressed`, set at pointerdown) was never seen.
Tapping again "because nothing happened" put the second tap on the next question's answers. Now the
dispatcher runs `PRESS_AFTER_PAINT_` actions (`facet-pick`, `facet-skip`, `filter-drop`, `filter-clear`)
one frame later for a real tap: the lit answer is painted within ~10 ms, then the funnel works; a press
whose control is redrawn away before its frame does nothing; one waits at a time. `check/chip-feel.js`
taps three answers in a row at 4x and needs each lit in a frame before the redraw (red with the deferral
taken out). The redraw itself is still ~2 s at 4x; making the funnel cheaper is the next step.

## 9. A harder outline on a tutor card (N-1793717321137-26572)

`.prof-teach .prof-tag.is-main` gave the Teaches chips `border-color: var(--gold)` — black-on-white since
466, a heavier ring than every other chip. Removed; the "Teaches" caption already says which they are.

## Find stays centred with the keypad up (N-1793580918747-6187)

Reproduced at 390x844 with the @family. keypad: focusing Find's box left the card centred in the whole
screen (middle 422) with the pad over its bottom third, and the 508 hold kept a finder held where it was
after typing ended. Now `glassSeenH_` (shell.js) is the part of the glass above the pad while it is up;
`kpFinderCentre_` (keypad.js) centres a finder's card there when the pad opens and holds it while you type;
a finder with nothing focused is never held; closing the pad centres it again. `check/kp-centred.js` opens,
types and closes twice on Find and Find 2 (red without the centring).

## Checks

`node js/check.js`, `check-all --fast` (111) and FLOW_PART 1..8 green, except one journey in part 1, "a YouTube Short that never answers…", which fails about one run in three on the base commit too (the Short dealt at page 6 winds two clocks); left for its own note.
