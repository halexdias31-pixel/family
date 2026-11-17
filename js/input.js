/* @family. — input.js THE ONE INPUT LAYER (owner, 17 Nov: shared engines for the tools and games). Pointer, touch, keys
   and drags for every game and tool: the guards (never while somebody types, never with a modifier), pointer capture so
   a thumb sliding off still lets go, and one place a key is mapped to an action. The keypad's own keys and its focus
   rules (keypad-*.js) sit above this: a box the keypad serves is typing, so no game key fires in it. */

/* SOMEBODY IS TYPING: a field, an editable, or a box the site keypad is serving. */
const inputTyping_ = t => !!(t && (t.isContentEditable || (t.closest && t.closest('input, textarea, select, [contenteditable], .kp-in, [data-kpb]'))));
const inputBare_ = e => !(e.metaKey || e.ctrlKey || e.altKey);

/* KEYS TO ACTIONS: `map` is key (or code) -> action; `fn(action, down, e)` runs when `when(e)` allows, and the key is
   then the game's alone (no default, no column turning). `up: true` also reports key-up; `capture` sees it first. */
function inputKeys_(map, fn, o) {
  o = o || {};
  const h = e => {
    const a = map[e.key] !== undefined ? map[e.key] : map[e.code];
    if (a === undefined || !inputBare_(e) || inputTyping_(e.target) && !o.inField) return;
    if (o.when && !o.when(e)) return;
    if (fn(a, e.type === 'keydown', e) === false) return;
    e.preventDefault();
    if (o.stop !== false) e.stopPropagation();
  };
  document.addEventListener('keydown', h, !!o.capture);
  if (o.up) document.addEventListener('keyup', h, !!o.capture);
  return () => { document.removeEventListener('keydown', h, !!o.capture); if (o.up) document.removeEventListener('keyup', h, !!o.capture); };
}

/* HELD BUTTONS (pedals, a d-pad): each pointer holds the `[attr]` it went down on, captured, until it lifts or is lost;
   `on(set, e)` hears the whole held set each time it changes. */
function inputHold_(root, attr, on) {
  const held = new Map();
  const sync = e => { const s = {}; held.forEach(k => { s[k] = true; }); on(s, e); };
  root.addEventListener('pointerdown', e => {
    const b = e.target.closest('[' + attr + ']');
    if (!b || !root.contains(b)) return;
    e.preventDefault();
    try { b.setPointerCapture(e.pointerId); } catch (err) { /* a synthetic pointer has nothing to capture */ }
    held.set(e.pointerId, b.getAttribute(attr));
    sync(e);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => root.addEventListener(n, e => { if (held.delete(e.pointerId)) sync(e); }));
  root.addEventListener('contextmenu', e => e.preventDefault());
  return held;
}

/* A DRAG, document-wide: `start(e)` returns the drag's own state (truthy) to take this pointer, `move(g, e)` and
   `end(g, e)` follow it. Each pointer is its own drag; the page never scrolls under one. */
function inputDrag_(start, move, end, o) {
  o = o || {};
  const go = new Map();
  document.addEventListener('pointerdown', e => {
    const g = start(e);
    if (!g) return;
    if (o.capture && g.el && g.el.setPointerCapture) { try { g.el.setPointerCapture(e.pointerId); } catch (err) { /* synthetic */ } }
    if (e.cancelable) e.preventDefault();
    go.set(e.pointerId, g);
  }, !!o.early);
  document.addEventListener('pointermove', e => {
    const g = go.get(e.pointerId);
    if (!g) return;
    if (e.cancelable) e.preventDefault();
    if (move) move(g, e);
  }, { capture: !!o.early, passive: false });
  ['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, e => {
    const g = go.get(e.pointerId);
    if (!g) return;
    go.delete(e.pointerId);
    if (end) end(g, e);
  }, !!o.early));
  return go;
}
