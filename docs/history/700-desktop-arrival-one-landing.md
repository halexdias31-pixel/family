# 700 — the desktop arrival: one landing, kept boxes, one fade

The owner, 3 Nov, a 22 s screen recording of the live site on a wide desktop, signed in as admin: 0–7 s black
with small dots scattered in several columns; at ~8 s the columns pop in at once (a post, the calculator,
What's missing, the Find widgets) except one, an empty gap with dots; at ~16 s that column (the DMs) pops in,
the layout shifts, the cards are uneven. "It looks bad." Wanted: one soft fade, nothing popping, every widget
keeping its space while it loads (630, 670).

## Seen the same way

`check/arrival.js` now runs 1440x900 and 1920x1080 as an admin as well as the phone (`ARRIVAL_SIZE=phone,desk1440,desk1920`
picks), with the same slow 4G, CPU 4x and payload 5 s late; the fixture answers every backend call 5 s late,
so a column with its own call lands 5 s after the payload, as on the live site.

| desk1440 | before | after |
|---|---|---|
| cold, first drawn | 4.3 s | 4.1 s |
| cold, columns in view in | spotlight, feed, reel 9.7 s; **dm 14.0 s** | all four at 12.1 s |
| warm, columns in | dm 1.4 s after the rest | together, feed and dm from reserved boxes |

## Causes

- **The late column was Messages.** `dmSync_` (posts.js) asks `action: 'messages'` by POST only once the
  payload is in, so the DMs column waits a second cold Apps Script round trip — the 8 s gap in the recording.
- **The black 0–7 s is the payload,** not code or fonts: the recording has the dots from its first frame, so the
  eager code had run; the backend's doGet took the rest. (Also seen: `LOAD` in index.html is the clock in 5-minute
  steps, so a visit more than 5 minutes after the last fetches every file again; deliberate, left alone.)
- **The dots were scattered** because a column whose code was still a LATER file was drawn as a bare
  `loading_()` straight in the screen (top of the column), and a waiting pane had no frame and no height (306).
- **The pop:** `arrive_` added `.arrive` and nothing in style.css drew it, so nothing ever faded.

## Fixes

- **Messages come in the payload** (`messagesOf_`, dopost.gs, shared with the `messages` action), sent fresh per
  viewer beside favLinks — never in the kept body — and only for the token's own person (`askedBy_`). `dmAdopt_`
  (posts.js) takes them when the payload becomes `DATA`; the 20 s poll keeps them fresh. Needs the backend
  deployed (versions `2026-11-03-arrival-700`); until then the old ask still runs.
- **Each column's shape is kept on the device** (`arrival:shape`, `shapeSave_`): the heights of its first six
  page panes, for this card width, written after a landing and after the library. Heights only, no data, so
  466's ruling against a device copy of the payload (private rows, stale) still stands and is kept.
- **A waiting column draws its remembered pages** (`waitShape_`, `shapeHold_`): each a pane with its normal
  surface at the height it landed at (`[data-keep]`, `--keep-h`), the one `loading_()` in its middle. A pane never
  seen keeps 306's frameless dots, now in a page where the card will be, not at the top of the column.
- **One fade:** `.arrive` is an opacity fade of twice `--dur-enter` (0.44 s), nothing laid out; none under reduced motion.

## The check

Per column in view: when it first held content with no dots, and whether its wait was a reserved box. A column
that comes in more than 1.5 s after the first from an unreserved wait fails (Find's two are exempt: 546, they
wait for the library by promise). Before: `desk1440 cold: s-dm popped in 4.3s after the first column`.

## Still open

A first-ever visit has no shape to keep, so its waiting columns are dots on black until the payload; a device
copy of the public half of the payload is the way to paint at once and is the owner's call (466).
