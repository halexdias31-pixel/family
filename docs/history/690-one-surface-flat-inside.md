# 690 — One surface: the pane is the box, what is in it is flat (polish package I, the rest)

**Asked:** the owner wants the app to look more like iOS: no "widget within a widget". A surface inside a
surface should not draw its own fill, edge and radius again. 561 landed package I's px radii and left the type
scale and the surface flattening; this is those two.

## What was doubled
Surveyed at 390 px with every column's front page and every state in check/states.js:
- `.card.is-widget` drew `--raised`, a `--line` edge and a 14px radius inside a `.pane` that already wore all
  three (shop, tools, games, reel, the three profile columns). The shop's Basket was a box in a box.
- `.qcard` (a question in Find's results) drew `--raised` plus an edge and radius inside its pane.
- `.card:has(> .msg-body)` (the messages card, and DAIVE's) the same in DM.
- The finder's search pill is an input and keeps its subtle fill; the chips are things, not boxes; booking's
  form was already label/value rows on the pane.

## The rule
style.css, after the widget block: `.pane :is(.card.is-widget, .qcard, .card:has(> .msg-body))` drops fill,
edge, radius and side padding; two of them in a row are parted by a `--line-soft` hairline and `--s4` of space.
The locked widget's gold ring is a box-shadow and is kept. A `.widget-full` already dropped its pane instead (one
surface either way).

## Type
The plan's scale (`--fs-xs … --fs-2xl`, `--lh-tight`, `--fw-title`) now names the screen's heading and label
roles: the card title (`.card > h3`), its `.sub`, field captions, the widget's small-caps head, the feed head,
the content card and practical heads, the bundle title, the report and statement heads. Paper and print sizes
(mm, pt) stay as they are: a sheet is sized for paper.

## The check
check/ui.js `A BOX INSIDE A BOX (690)`, measured by check/surface-nesting.js in the page for every state: a
visible box at least 64x28 px with its own fill or four-sided edge whose nearest such ancestor in the column is
another one fails. Inputs, buttons, tiles, chips, avatars and media are not surfaces. `ACCEPTED_NEST` lists the
rest with one reason each: pictures and video, drawn instruments and boards, answer inputs, paper objects,
message bubbles, library card faces. At 390 px before the rule it reported the widget, question and messages
cards; after it, none outside the list.

Screenshots (before/after, 390 px: feed, Find with chips, a question, Tutor settings, shop, booking) were taken
in the session's scratchpad `flat/`.
