## 401 — smoother page turns, and a coin with an edge (2026-10-24)

**Asked for as** five owner notes: "If I scroll quickly up or down it's clunky and janky. Make it smooth, more
stable, elegant"; "make the coin in the spinning animation look more 3D like it has thickness"; "delete the
suggester telling to bookmark"; "Book Bible change it to verses" (withdrawn by the owner mid-way: the Bible is
left exactly as it was); "Bundle is a tag option too, pick where appropriate".

### 1. Fast up and down

**Measured, not guessed.** A Playwright harness (kept out of the repo) served the app with `check/fixture.json`,
opened Games at 390x844 with touch and a 4x CPU throttle, and threw seven flicks down and seven up 110 ms apart;
then a 1280x800 window with a mouse, six trackpad-shaped wheel streams (40 decaying events each, 60 ms between
streams), one long momentum tail with folded spikes, and ten mouse-wheel notches. It recorded every rAF interval,
long tasks, and CDP `Performance.getMetrics` (layouts, style recalcs, script time), and wrapped the placement
functions with timers.

**Finding 1 — a whole-app forced layout on every release.** `paneWatch_` (find.js), run by `placeNow_` straight
after `placeGrid` has written every column's transform, read `innerWidth`/`innerHeight` to key its "measured for
this window" memo. In Chrome that read forces the style and layout the transforms just dirtied, synchronously,
inside the release. Wrapped timings over the 14 flicks: `paneWatch_` 168–186 ms total (max 23–27 ms in one
call) before; 5 ms (max 1–2 ms) after, with `placeNow_` falling from 319–401 ms to 172–181 ms. The size is now
kept in `PANE_VP_NOW`, cleared by `resize` and `visualViewport` `resize`, so it is read once per window shape.
Frames over 33 ms in the throttled phone burst moved from 28 to 10–14 in the instrumented runs; across
uninstrumented interleaved runs the phone frame counts were too noisy on this machine to quote as a gain
(base 33–35, new 15–55), so the function timings are the figure that counts.

**Finding 2 — a second trackpad flick was thrown away.** The wheel handler turns once per gesture and calls the
gesture over only after a 140 ms silence. A trackpad's momentum tail fills that silence, so a second flick (or a
flick back the other way) made inside the first one's tail did nothing: six flicks in a row turned ONE page
(`1,1,1,1,1,1`). That is the "clunky" on a laptop. Now a new flick inside the tail re-arms the turn when the
direction reverses, or when the pixels over the last 60 ms (input-timestamped, so a slow page folding events
together keeps the same sum) rise past three times the tail's own level — never within 300 ms of the last turn.
Six flicks now turn six pages (`1,2,3,2,1,0`), one long tail with folded spikes still turns exactly one, and
mouse-wheel notches are unchanged.

**Looked at and left:** the release path has no other forced read; `afterSlide_` jobs were 0–3 ms in the burst;
no image decoding showed in the window; listeners are already passive except `pointermove`, which must cancel
the drag. CSS scroll-snap is not used — the columns are placed by transforms (see 382), and that stays.

### 2. The coin has an edge

The flip (`tools/coin.py`, splash and Maths chapter 19) had twelve flat discs stacked between its faces, which
read as stripes when edge-on. It is now a cylinder: 48 strips stood round the rim (`rotateZ` → `translateY(-R)`
→ `rotateX(90deg)`), each a touch wider than its share so no seam shows, reeded with a fine repeating gradient,
darkened top and bottom, and each lit by its angle to a light at the upper left. The script writes every strip
rule; the row was given the 36 extra empty `nth-child` slots once, because `anim_row` only rewrites what is there.
`check-css`'s coin rule (four or more edge discs) still holds.

### 3. The bookmark suggester

Nothing in the code, the stylesheet, `data/` or the backend suggests bookmarking or installing: the install bar,
its door and the card went earlier (`me.js` cancels `beforeinstallprompt` so Chrome's own bar never shows), and
check-flow's "nothing offers to install" guards it, `bookmark` among its words. Nothing was left to delete; if the
owner still sees a suggestion it is the browser's own or a sheet value, and needs a screenshot.

### 5. Bundles

Left as 396 made them: no special tag rule. A question is the card; there is no whole-paper card to hang a
Bundle tile on, and the bundle card stands in front of any list of whole papers (`bundlePages_`), which is
where the order is made.
