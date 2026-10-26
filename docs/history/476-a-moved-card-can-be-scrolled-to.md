# 476 — A moved card can be scrolled to

Owner (iPhone, admin): "i just moved something on farthest right column to the left. it worked, it's now on the left column of the farthest right, but i cant scroll down to it."

## What was wrong

Every right-hand card column (`family staff account tutors students parents biz`) is drawn by `cardsOf_(col)`
(layout.js), which applies the admin's layout: cards moved in, moved out, deleted. But its `PAGER` entry in
shell.js still counted the column's own builder (`peoplePages_`, `familyPages_`, `adminPages_`...). The pager's
count is what `goPage` and the swipe stop at, so a card moved ◀ into a column was drawn one page past the
count and no scroll could reach it. Reproduced in Chromium at 390x844 with touch: Business card moved into
Profiles: parents drew 3 pages, pager said 2; a parents card moved into students drew 6, pager said 5; the
second still broken after a reload (the first only hid because the column also lost a card).

Widgets (`lay-w-col`) were fine: `PAGER.tools/games/shop` count `widgetsOf_`, which already reads the layout.

## The rule

A pager counts the list its screen draws (the rule `PAGER` already states). The card columns now count
`cardsOf_(col)` through `cardCount_` (shell.js), falling back to the builder when layout.js is absent.

## Checked

check-flow journey "a card moved ◀ into the next column is on a page that column scrolls to" (fails on the old
count, both live and after a reload). Before/after screenshots were taken with a Playwright wheel-scroll repro.
