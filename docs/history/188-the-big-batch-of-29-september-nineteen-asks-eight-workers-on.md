## The big batch of 29 September: nineteen asks, eight workers, one PR

Built by parallel workers in separate worktrees and merged here; each item's reasoning is in the code
beside it. The shape of it, so the next reader knows where to look:

| | |
|---|---|
| **camera** | the new-post card is the page ABOVE the newest post on the feed; the app still opens on the newest post. The `make` column is gone (11 screens) |
| **reels** | a random order dealt once per open; the Drive iframe player is gone — only real video files play |
| **posts** | several photos and videos: `image` holds the first, new `posts.media` holds the rest (`" \| "`). A single photo sits in a fixed 4:5 box and pages ±2 preload, so the column no longer moves as pictures arrive |
| **messages** | photos, videos and files in a chat via new `messages.attachments`; optimistic bubbles with retry; day lines; Enter sends on a keyboard |
| **You card** | lean: the edit, add-child, figure and build tiles and the "only you see this" card are gone. Add your child, credits and the wardrobe live on Settings |
| **settings** | the wardrobe is one card; the week grid is square and tidy; "Specialise in" + "Also teach" (new `people.teaches_also`); qualifications up to 10 (new `people.quals`, packed, migrated from `qual_1..3`); library cards up to 5; extra qualifications and favourite colour are dropdowns; Contact & address merged for parents and students |
| **profile cards** | subjects as chips, `Maths (GCSE)`, the specialism edged in gold |
| **tools** | flyer and cheat sheet have no on-screen preview; the cheat sheet lays out in fixed slots, gains a periodic table (M50), and its number square and times table are bigger |
| **Find** | spotlight responds at once; each practical is four pages (card+diagram, equipment, steps, worksheet) counted once; narrowing reuses the last result, search text is lazy, the invisible pane blurs are gone (about 20% faster a tap at 8x); a repaint no longer empties the page you are on; swiping back up no longer writes a result over the question; a star past page 15 no longer moves you; venues are ordinary cards |

**New columns, all created by `?setup=1`**: `people.quals`, `people.teaches_also`,
`posts.media`, `messages.attachments`. Backend stamps are `2026-09-29-c-batch`.

**Two instruments were taught something on the way.** `check/press.js` walks a swipe's start point
to a gap in the box, because Chromium's touch adjustment snaps a touch near a `<select>` onto it —
the flyer's dropdowns moved to the middle of its card when the preview went, and every swipe from the
middle became a press on a select. And `pressMark_` ignores a disabled control, which never fires the
click that would clear the mark.
