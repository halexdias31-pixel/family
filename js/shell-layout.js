
/** Redraw whatever is showing. What almost everything calls after a change. */
/* THE ORDER A REDRAW HAPPENS IN, WRITTEN DOWN ONCE § */
const repaint = (instant) => {
  /* 000. A CHANGE OF PERSON PUTS AWAY WHAT WAS DRAWN FOR THE LAST ONE, NOW — before this returns, with no idle moment in between: § */
  const who = typeof widgetWho_ === 'function' ? widgetWho_() : '';
  if (REPAINT_WHO !== null && who !== REPAINT_WHO) {
    ACT_EPOCH++;
    if (typeof widgetsReveil_ === 'function') WIDGET_COLS.forEach(c => widgetsReveil_(c, true));
  }
  REPAINT_WHO = who;
  DRAW_EPOCH++;
  /* 0. EVERY OTHER SCREEN IS NOW OUT OF DATE — see the note on `STALE`. § */
  TABS.forEach(t => { if (t.id !== AT) STALE[t.id] = STALE[t.id] === 1 ? 1 : REPAINT_MARK; });
  /* 0b. AND EVERY WIDGET DRAWN FROM THE FACTS THAT HAVE JUST MOVED IS PUT BACK UNDER ITS LOADER NOW, on every column just marked — not when the column is next § */
  if (typeof widgetsReveil_ === 'function') WIDGET_COLS.forEach(c => { if (c !== AT && STALE[c]) widgetsReveil_(c, false); });
  /* 1. THE SCREEN YOU ARE ON, drawn from nothing (it is restarted below) — UNLESS A LANDING FINDS IT AS IT WAS. § */
  const land = REPAINT_MARK === 'maybe' && !(typeof WIDGET_COLS !== 'undefined' && WIDGET_COLS.indexOf(AT) !== -1)
            && !(typeof finderOf_ === 'function' && finderOf_(AT));
  const kept = paint(AT, !land, land ? { land: true } : undefined) === 'kept';
  /* 1b. AND WHATEVER THAT SCREEN HAS RUNNING, because `paint` has just replaced the markup it was running in. § */
  if (!kept && typeof startScreen_ === 'function') startScreen_(AT);
  paintNeighbours();               // 2. the ones either side
  /* 3. A repaint rebuilds the markup, which throws the positions away with it — so the page you were on would silently become the first one every time anything § */
  paintPager(AT, true);
  placeCells('x', instant !== false);   // 4. and only now, positions
  /* 5. AND EVERY COLUMN JUST MARKED IS DRAWN AGAIN IN THE NEXT QUIET MOMENTS, nearest first — see `ahead_`. */
  if (typeof aheadKick_ === 'function') aheadKick_();
};
/* WHO THE LAST REPAINT DREW FOR — see step 000 above. Null until the first, which has nobody before it. */
let REPAINT_WHO = null;

/* ---------- HOW MANY CARDS ABOVE AND BELOW THE ONE IN FRONT THE GLASS SHOWS § */
const glassRows_ = () => 2;

/* ---------- WHICH CARDS ARE ON THE GLASS, SAID ONCE PER PLACEMENT § */
let GLASS = { at: null, cols: [], pages: [] };

/* THE ONE SCROLLING PAGE (900): Find's section in flow, its page being read marked `.on` — `flowPlace_` (shell-pages.js). */
function placeGrid() { return flowPlace_(); }
