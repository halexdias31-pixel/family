
/* ---------- WHAT A PLACEHOLDER MAY HOLD, ASKED ONE WAY OF EVERY PLACEHOLDER § */
const PLACEHOLDER_KEYS_ = 'button, [data-do], input, select, textarea, a[href], summary, details, label, '
  + '[tabindex], [onclick], [role], [contenteditable]';


/* ---------- THE FINGER PEN: TWO FINGERS, A PALM OR A THUMB LEAVE NOTHING (338) § */
const penEv_ = (w, el, type, o) => {
  const e = new w.MouseEvent(type, { bubbles: true, cancelable: true, clientX: o.x, clientY: o.y });
  const put = (n, v) => Object.defineProperty(e, n, { value: v });
  put('pointerId', o.id);
  put('pointerType', o.type === undefined ? 'touch' : o.type);
  put('isPrimary', !!o.prim);
  if (o.t !== undefined) put('timeStamp', o.t);
  put('width', o.size || 16); put('height', o.size || 16);
  if (o.co) put('getCoalescedEvents', () => o.co);
  el.dispatchEvent(e);
  return e;
};
/* EVERY STORED VALUE IS A LIST OF LISTS OF WHOLE NUMBERS -- the format every device and account holds. */
const penWhole_ = all => Array.isArray(all) && all.every(st => Array.isArray(st) && st.length % 2 === 0
  && st.every(v => typeof v === 'number' && Number.isInteger(v)));

check('the finger pen: on a question\'s pad a two-finger tap, pan or pinch, a third finger or a palm leave nothing, a palm that lands first does not take the finger\'s line, and a cancel keeps only a real line', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (!t || typeof t.padWrap !== 'function' || typeof t.padKey !== 'function' || typeof t.padOn !== 'function'
      || typeof w.padBusy_ !== 'function' || typeof w.padDrop_ !== 'function' || typeof t.padTouch !== 'function' || !t.padTouch()) {
    return ['padWrap_, padKey_, padBusy_, padDrop_ or PAD_TOUCH are not reachable — the finger pen was NOT checked'];
  }
  const x = { kind: 'question', answerType: 'drawing', html: '<p>Draw it.</p>', key: 'q:Q-FINGER-1' };
  const k = t.padKey(x);
  const host = d.createElement('div');
  d.body.appendChild(host);
  /* (100, 50) to (440, 220) on the screen: x units = px - 100, y units = (py - 50) * 2. */
  const L = 100, T = 50, W = 340, H = 170;
  const ink = () => host.querySelector('.qpad-ink');
  const fresh = () => {
    w.padDrop_();
    try { w.localStorage.removeItem(k); } catch (e) {}
    t.padOn(k);
    host.innerHTML = t.padCard(x, '<svg viewBox="0 0 340 170"></svg>', '');
    ink().getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T });
  };
  const fire = (type, id, px, py, ts, o) => penEv_(w, ink(), type, Object.assign({ id: id, x: px, y: py, t: ts }, o || {}));
  const stored = () => { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return ['unreadable']; } };
  const clean = (what, want) => {
    const s = stored();
    if (JSON.stringify(s) !== JSON.stringify(want)) bad.push(what + ': stored ' + JSON.stringify(s).slice(0, 160) + ', wanted ' + JSON.stringify(want).slice(0, 160));
    if (!penWhole_(s)) bad.push(what + ': the store holds something that is not a list of lists of whole numbers: ' + JSON.stringify(s).slice(0, 80));
    const paths = host.querySelectorAll('.qpad-g path').length;
    if (paths !== s.length) bad.push(what + ': ' + paths + ' path(s) drawn for ' + s.length + ' stored');
    if (host.querySelector('[data-live]')) bad.push(what + ': a live preview was left on the picture');
    if ((host.querySelector('.qpad-aid') || {}).innerHTML) bad.push(what + ': the aid was left on the picture');
    if (w.padBusy_()) bad.push(what + ': padBusy_ still says a finger is on the drawing, so the column could never be swiped off it');
    if (t.padTouch().size) bad.push(what + ': ' + t.padTouch().size + ' contact(s) left behind after every finger lifted');
  };
  /* A LINE OF n STEPS from (x0, y0) by (dx, dy) a step, every `dt` ms from `t0`, as one finger's moves. */
  const line = (id, x0, y0, dx, dy, n, t0, dt) => { for (let i = 1; i <= n; i++) fire('pointermove', id, x0 + dx * i, y0 + dy * i, t0 + dt * i); };
  /* AND TWO FINGERS MOVING TOGETHER, each frame's moves one after the other, as the platform sends them. */
  const both = (a, b, n, t0, dt) => {
    for (let i = 1; i <= n; i++) {
      fire('pointermove', a.id, a.x + a.dx * i, a.y + a.dy * i, t0 + dt * i);
      fire('pointermove', b.id, b.x + b.dx * i, b.y + b.dy * i, t0 + dt * i);
    }
  };
  /* IN UNITS BY THE PEN'S OWN ARITHMETIC (`padMap_`), so a half is rounded the way the pen rounds it. */
  const units = (pts) => [].concat(...pts.map(p => [Math.round((p[0] - L) / W * 340), Math.round((p[1] - T) / H * 340)]));

  /* P2: A TWO-FINGER TAP, 40ms apart, both still, lifted in either order. */
  for (const first of [1, 2]) {
    fresh();
    fire('pointerdown', 1, 150, 100, 1000, { prim: true });
    fire('pointerdown', 2, 250, 110, 1040);
    if (host.querySelector('[data-live]')) bad.push('a second finger 40ms after the first left the first one\'s dot showing');
    fire('pointerup', first, first === 1 ? 150 : 250, 100, 1100);
    fire('pointerup', 3 - first, first === 1 ? 250 : 150, 110, 1110);
    clean('a two-finger tap, finger ' + first + ' lifted first', []);
  }
  /* P3: A TWO-FINGER PAN, 40ms apart, 150px up together -- in 5px steps, and in 15px steps (several samples
     folded into one event, finger 1's arriving before finger 2's of the same frame). */
  for (const step of [5, 15]) {
    fresh();
    fire('pointerdown', 1, 150, 210, 1000, { prim: true });
    fire('pointerdown', 2, 230, 212, 1040);
    both({ id: 1, x: 150, y: 210, dx: 0, dy: -step }, { id: 2, x: 230, y: 212, dx: 0, dy: -step }, 150 / step, 1040, 8);
    fire('pointerup', 1, 150, 60, 1300); fire('pointerup', 2, 230, 62, 1302);
    clean('a two-finger pan in ' + step + 'px steps', []);
  }
  /* P4: A PINCH, then one finger lifts and the other drags on 100px. */
  fresh();
  fire('pointerdown', 1, 200, 135, 1000, { prim: true });
  fire('pointerdown', 2, 260, 135, 1040);
  both({ id: 1, x: 200, y: 135, dx: -4, dy: 0 }, { id: 2, x: 260, y: 135, dx: 4, dy: 0 }, 10, 1040, 8);
  fire('pointerup', 1, 160, 135, 1200);
  line(2, 300, 135, 5, 0, 20, 1200, 8);
  fire('pointerup', 2, 400, 135, 1400);
  clean('a pinch, then the other finger dragged on', []);
  /* P5: A THIRD FINGER while the first two are held. */
  fresh();
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  fire('pointerdown', 2, 300, 100, 1040);
  fire('pointerdown', 3, 220, 180, 1060);
  line(1, 150, 100, 3, 0, 5, 1060, 8);
  fire('pointerup', 3, 220, 180, 1120); fire('pointerup', 2, 300, 100, 1125); fire('pointerup', 1, 165, 100, 1130);
  clean('a third finger while two were held', []);
  /* P6: A PALM FIRST (its size unknown), the fingertip 40ms later drawing 4.5px a step, the palm trembling
     by a pixel: exactly the finger's line, from its own first point, and nothing of the palm. */
  fresh();
  fire('pointerdown', 1, 380, 190, 1000, { prim: true, size: 1 });
  fire('pointerdown', 2, 150, 80, 1040);
  const finger = [[150, 80]];
  for (let i = 1; i <= 30; i++) {
    finger.push([150 + 4.5 * i, 80 + 2 * i]);
    fire('pointermove', 2, 150 + 4.5 * i, 80 + 2 * i, 1040 + 8 * i);
    fire('pointermove', 1, 380 + ((i % 3) - 1) * 1.2, 190 + ((i + 1) % 3) * 0.4, 1040 + 8 * i, { size: 1 });
  }
  fire('pointerup', 2, 285, 140, 1300);
  fire('pointerup', 1, 380, 190, 1320);
  clean('a palm first and then the finger', [units(finger)]);
  /* P7: A FINGER HELD STILL 300ms, A PALM LANDS ON THE INK, the finger draws 100px, the palm lifts: § */
  fresh();
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  fire('pointerdown', 2, 380, 190, 1300);
  if (host.querySelector('[data-live]')) bad.push('a palm landing beside a finger held still left the finger\'s dot showing — it is not yet known which is the finger');
  const held = [[150, 100]];
  for (let i = 1; i <= 10; i++) { held.push([150 + 2 * i, 100]); fire('pointermove', 1, 150 + 2 * i, 100, 1300 + 8 * i); }
  await wait(5);
  if (!host.querySelector('[data-live]')) bad.push('the finger moved 20px with the palm still and its line did not come back within a frame');
  for (let i = 11; i <= 50; i++) { held.push([150 + 2 * i, 100]); fire('pointermove', 1, 150 + 2 * i, 100, 1300 + 8 * i); }
  fire('pointerup', 2, 380, 190, 1800);
  fire('pointerup', 1, 250, 100, 1810);
  clean('a finger held still, then a palm, then the line', [units(held)]);
  /* P8: A BRUSH -- a still touch 80px away at +60ms, lifted while the finger draws on: one stroke, every
     sample. */
  fresh();
  const brush = [[150, 100]];
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  for (let i = 1; i <= 50; i++) {
    if (i === 8) fire('pointerdown', 2, 230, 100, 1060);
    if (i === 13) fire('pointerup', 2, 230, 100, 1100);
    brush.push([150 + 2 * i, 100]);
    fire('pointermove', 1, 150 + 2 * i, 100, 1000 + 8 * i);
  }
  fire('pointerup', 1, 250, 100, 1410);
  clean('a brush of another finger while drawing', [units(brush)]);
  /* P9: A STAGGERED PAN -- the second finger 150ms after the first has gone 30px, and 300ms after with the
     first still. */
  fresh();
  fire('pointerdown', 1, 150, 200, 1000, { prim: true });
  line(1, 150, 200, 0, -2, 15, 1000, 10);
  fire('pointerdown', 2, 250, 200, 1150);
  both({ id: 1, x: 150, y: 170, dx: 0, dy: -5 }, { id: 2, x: 250, y: 200, dx: 0, dy: -5 }, 20, 1150, 8);
  fire('pointerup', 1, 150, 70, 1400); fire('pointerup', 2, 250, 100, 1402);
  clean('a pan whose second finger came 150ms late', []);
  fresh();
  fire('pointerdown', 1, 150, 200, 1000, { prim: true });
  fire('pointerdown', 2, 250, 200, 1300);
  both({ id: 1, x: 150, y: 200, dx: 0, dy: -5 }, { id: 2, x: 250, y: 200, dx: 0, dy: -5 }, 20, 1300, 8);
  fire('pointerup', 1, 150, 100, 1500); fire('pointerup', 2, 250, 100, 1502);
  clean('a pan whose second finger came 300ms after a still first', []);
  /* P10: A THUMB AND AN INDEX FINGER PINCHING, sizes 24 and 16. */
  fresh();
  fire('pointerdown', 1, 200, 135, 1000, { prim: true, size: 24 });
  fire('pointerdown', 2, 260, 135, 1040, { size: 16 });
  for (let i = 1; i <= 15; i++) {
    fire('pointermove', 1, 200 - 4 * i, 135, 1040 + 8 * i, { size: 24 });
    fire('pointermove', 2, 260 + 4 * i, 135, 1040 + 8 * i, { size: 16 });
  }
  fire('pointerup', 1, 140, 135, 1200); fire('pointerup', 2, 320, 135, 1202);
  clean('a thumb-and-finger pinch', []);
  /* P12: A CANCEL 50ms IN (a system gesture, the platform's own palm rejection) withdraws; A CANCEL AFTER
     500ms AND 200px of a real line keeps it, every sample. */
  fresh();
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  line(1, 150, 100, 5, 0, 6, 1000, 8);
  fire('pointercancel', 1, 180, 100, 1050);
  clean('a cancel 50ms into a stroke', []);
  fresh();
  const real = [[110, 60]];
  fire('pointerdown', 1, 110, 60, 2000, { prim: true });
  for (let i = 1; i <= 50; i++) { real.push([110 + 4 * i, 60 + 2 * i]); fire('pointermove', 1, 110 + 4 * i, 60 + 2 * i, 2000 + 10 * i); }
  fire('pointercancel', 1, 310, 160, 2500);
  clean('a cancel after 500ms and 200px', [units(real)]);
  /* P13: TWO FINGERS WITH ONE LIFT NEVER SENT, then a touch the platform calls primary -- nothing else is
     down -- draws its line. */
  fresh();
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  fire('pointerdown', 2, 250, 100, 1040);
  both({ id: 1, x: 150, y: 100, dx: 5, dy: 0 }, { id: 2, x: 250, y: 100, dx: 5, dy: 0 }, 6, 1040, 8);
  fire('pointerup', 1, 180, 100, 1200);
  const after = [[120, 150]];
  fire('pointerdown', 3, 120, 150, 3000, { prim: true });
  for (let i = 1; i <= 10; i++) { after.push([120 + 3 * i, 150]); fire('pointermove', 3, 120 + 3 * i, 150, 3000 + 8 * i); }
  fire('pointerup', 3, 150, 150, 3100);
  clean('a primary touch after a lost lift', [units(after)]);

  w.padDrop_();
  t.padOn('');
  try { w.localStorage.removeItem(k); } catch (e) {}
  host.remove();
  return bad;
});
