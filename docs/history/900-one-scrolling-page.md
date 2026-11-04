# 900 — One scrolling page instead of sideways columns

The owner (4 Nov, roadmap): the most stable, scalable, lowest-maintenance UI. The site is only Find and Sign in, so
the sideways grid had nothing left to slide between.

- `FLOW_LAYOUT = true` (shell.js) puts `html.flow` on the root. With it on, `placeGrid` is `flowPlace_`: no
  transforms, no glass, every page in normal flow and touchable; `.on` is the page whose foot is past a quarter of the
  window (`flowScrolled_`, on the browser's own scroll), and turning to it is the ordinary `goPage`, so Find's
  41-page window, fills and Ledger asks follow the scroll. `flowMore_` (find.js) draws the next three results when
  the foot of what is drawn comes within a window's height. A result not yet drawn takes no room.
- `goPage` from a tap (a question opened, its answer shown) scrolls that page into view after its fills
  (`flowShow_`); `go(id)` shows that section (the sign-in card above Find) and scrolls to it.
- Off with it: swipes and wheel paging (overworld.js), arrow-key paging, the wide window's beside-card clicks,
  `WIDE`, the 300 ms after-slide wait (0 now), the keypad's column lift (the page scrolls instead; the body's foot
  grows by `--kp-h` while the pad is up). `stuffKeepPlace_` scrolls the window rather than shifting the column.
  All of it stays in the code; `FLOW_LAYOUT = false` brings the columns back.
- The top bar (`#topbar`, index.html; `topbarPaint_`): the brand, then the name and Sign out, or Sign in, which
  shows the sign-in card in place.
- Keypad: an ordinary box keeps the phone's own keyboard (`kpBind_` binds nothing). Answer boxes keep the pad;
  worded answer boxes still use it too (their drawn overlay needs it — not changed here).
- A list, not cards (owner, 4 Nov): with `html.flow` a pane has no frame, radius, shadow or side padding; pages are
  divided by one `--line` hairline; a card's tags are one small grey line. An opened question or answer is plain content.
- "Swipe up for the one" says "Scroll down" (`SWIPE_UP`).
- Style: one block of `html.flow` rules after `.screen.paged`; the loupe's z-index joined the pen sizes' (9999), one
  fewer distinct value. UI simplicity 74.2 → 74.7.
- Checked by hand with Playwright at 390×844 and 1440×900 as a student and an admin with the fixture; only
  `node js/check.js` and the question/marking/keypad/sign-in journeys were run, on the owner's order.
