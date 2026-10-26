# 447 — Smaller animations on content cards

**Asked (owner):** "animations on the content bits should be smaller."

## What changed

- **One cap for every drawing, in style.css, never in a row** (rows stay script-written, `tools/anim_row.py`):
  `.tb-an-stage > *` is at most `min(100%, 28rem)` wide and centred; its top-level `svg` at most `28svh` tall.
  An SVG's viewBox meets, so a drawing keeps its shape and stays vector-crisp; the HTML-built ones are capped
  by width alone (a height cap would clip them; a narrower width cap made `.an-sieve` and `.an-bayes` scroll sideways in check/ui.js, so it was dropped).
- `svh`, not `dvh`, so the drawing does not resize as a phone's address bar comes and goes (as 1058).
- The splash copy is untouched: it draws from the row, and the rows did not change, so `SPLASH_CACHE_MAX` holds.

## Measured (390×844, fixture)

Drawn height: Cell structure 285 → 236; Pythagoras 331 → 261;
A web of causes, 1914 (History) 271 → 251. Tallest of all 172 was 346 px (41% of 844). The words under each drawing start 20–30 px higher, on the first screen.
css 2026-10-25-j-anim-size.
