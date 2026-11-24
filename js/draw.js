/* @family. — draw.js THE ONE DRAWING LAYER (owner, 17 Nov: shared engines for the tools and games). Every canvas and SVG
   the games and tools draw goes through here: the pixel ratio, the fit to its box, the resize, one clear-and-draw loop,
   and a pointer's place in an SVG's own units. A game keeps only what it draws. */

/* THE PIXEL RATIO, capped: past 3 (2 for WebGL) a phone spends its battery on pixels nobody can see. */
const drawRatio_ = cap => Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, cap || 3);

/* A CANVAS FITTED TO ITS BOX: backing store = CSS box x ratio, a 2D context scaled so the game draws in CSS pixels, and
   the box itself in `dataset.w`/`h` for the game's own maths. A box with no size yet is early, not wrong: `again` is
   asked once on the next frame. Returns { w, h, dpr, ctx } or null. `gl` leaves the context to the caller. */
function drawFit_(canvas, o) {
  o = o || {};
  const box = canvas.getBoundingClientRect();
  if (!box.width || !box.height) {
    if (o.again && !canvas.dataset.waiting) {
      canvas.dataset.waiting = '1';
      requestAnimationFrame(() => { delete canvas.dataset.waiting; o.again(); });
    }
    return null;
  }
  delete canvas.dataset.waiting;
  const dpr = drawRatio_(o.cap), w = Math.round(box.width), h = Math.round(box.height);
  const bw = Math.max(1, Math.round(w * dpr)), bh = Math.max(1, Math.round(h * dpr));
  if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
  canvas.dataset.w = w; canvas.dataset.h = h;
  let ctx = null;
  if (!o.gl) {
    try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
    /* A context is not guaranteed: a browser with the canvas turned off returns null. */
    if (ctx && ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  return { w, h, dpr, ctx };
}

/* A FIXED-SIZE CANVAS (a minimap, a picture to save): w x h CSS pixels at the ratio, the context scaled to match. */
function drawFixed_(canvas, w, h, cap) {
  const dpr = drawRatio_(cap), bw = Math.round(w * dpr), bh = Math.round(h * dpr);
  if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
  let ctx = null;
  try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
  if (ctx && ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx ? { w, h, dpr, ctx } : null;
}

/* CLEAR, then fill when a colour is given: the first line of every frame. */
function drawClear_(ctx, w, h, fill) {
  ctx.clearRect(0, 0, w, h);
  if (fill) { ctx.fillStyle = fill; ctx.fillRect(0, 0, w, h); }
}

/* ---------- ONE LOOP: every running game's frame in one requestAnimationFrame. A frame gets (now ms, dt s) and returns
   false to stop itself; a hidden tab stops them all (each is told through its `stop`). */
const DRAW_LOOPS = new Map();
let DRAW_RAF = 0, DRAW_LAST = 0;
const drawNow_ = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
function drawTick_() {
  DRAW_RAF = 0;
  const now = drawNow_(), dt = DRAW_LAST ? Math.min(0.25, (now - DRAW_LAST) / 1000) : 0;
  DRAW_LAST = now;
  DRAW_LOOPS.forEach((L, key) => {
    let go = false;
    try { go = L.frame(now, dt) !== false; } catch (e) { go = false; if (typeof oops_ === 'function') oops_(e, 'draw:' + key); }
    if (!go && DRAW_LOOPS.get(key) === L) DRAW_LOOPS.delete(key);
  });
  if (DRAW_LOOPS.size) DRAW_RAF = requestAnimationFrame(drawTick_);
  else DRAW_LAST = 0;
}
function drawLoop_(key, frame, stop) {
  DRAW_LOOPS.set(key, { frame, stop });
  if (!DRAW_RAF) DRAW_RAF = requestAnimationFrame(drawTick_);
}
function drawStop_(key) {
  DRAW_LOOPS.delete(key);
  if (!DRAW_LOOPS.size && DRAW_RAF) { cancelAnimationFrame(DRAW_RAF); DRAW_RAF = 0; DRAW_LAST = 0; }
}
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  [...DRAW_LOOPS].forEach(([key, L]) => { drawStop_(key); if (L.stop) L.stop(); });
});

