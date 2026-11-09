/* ---------- THE FINGER PEN KEEPS EVERY SAMPLE, AND DRAWS IT ONCE A FRAME (338, increment 1b) § */
check('the finger pen keeps every sample: the folded ones, one box read per event, the box read again when the pad moves, the frame\'s live path is padPath_ of the points so far, chunked past 128 segments, and the last point is never dropped', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (!t || typeof t.padWrap !== 'function' || typeof t.padKey !== 'function' || typeof t.padOn !== 'function'
      || typeof w.padDrop_ !== 'function' || typeof t.padSt !== 'function' || typeof t.padPath !== 'function') {
    return ['padWrap_, padKey_, padDrop_, PAD_ST or padPath_ are not reachable — every sample was NOT checked'];
  }
  const x = { kind: 'question', answerType: 'drawing', html: '<p>Draw it.</p>', key: 'q:Q-FINGER-2' };
  const k = t.padKey(x);
  const host = d.createElement('div');
  d.body.appendChild(host);
  const W = 340, H = 170;
  let L = 100, T = 50, reads = 0;
  const ink = () => host.querySelector('.qpad-ink');
  const kOf = () => Number((host.querySelector('.qpad') || { getAttribute: () => 1 }).getAttribute('data-aspect')) || 1;
  const fresh = () => {
    w.padDrop_();
    try { w.localStorage.removeItem(k); } catch (e) {}
    t.padOn(k);
    L = 100; T = 50;
    host.innerHTML = t.padCard(x, '<svg viewBox="0 0 340 170"></svg>', '');
    ink().getBoundingClientRect = () => { reads++; return { left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T }; };
  };
  const fire = (type, id, px, py, ts, o) => penEv_(w, ink(), type, Object.assign({ id: id, x: px, y: py, t: ts }, o || {}));
  const stored = () => { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return ['unreadable']; } };
  const lives = () => [...host.querySelectorAll('.qpad-g [data-live]')];
  const one = (what) => {
    const s = stored(), paths = [...host.querySelectorAll('.qpad-g path')];
    if (lives().length) bad.push(what + ': ' + lives().length + ' live chunk(s) left after the lift');
    if (paths.length !== s.length) bad.push(what + ': ' + paths.length + ' path(s) drawn for ' + s.length + ' stored');
    const last = paths[paths.length - 1], want = s.length ? t.padPath(s[s.length - 1], kOf()) : '';
    if (last && last.getAttribute('d') !== want) bad.push(what + ': the path drawn after the lift is not padPath_ of what was stored — ' + String(last.getAttribute('d')).slice(-60) + ' against ' + want.slice(-60));
    if (!penWhole_(s)) bad.push(what + ': the store holds something that is not a list of lists of whole numbers');
  };

  /* P1: ONE MOVE CARRYING SIX FOLDED SAMPLES, one a duplicate and none with a `pointerId`; then a move whose
     list is empty. (150,100) is units (50,100). */
  fresh();
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  const co = [[152, 100], [154, 101], [154, 101], [156, 102], [158, 103], [160, 104]]
    .map((p, i) => ({ clientX: p[0], clientY: p[1], timeStamp: 1002 + 2 * i }));
  reads = 0;
  fire('pointermove', 1, 160, 104, 1012, { co: co });
  if (reads !== 1) bad.push('a move carrying six samples read the pad\'s box ' + reads + ' times — wanted once, shared by all of them');
  /* 10.8px FROM THE LANDING IS STILL A DOT (357, `PAD_DOT_PX` 12): the stroke is ONE point, where the finger is aiming
     now, and every sample is kept beside it -- the move past 12px below draws the line from all of them. */
  if (JSON.stringify(t.padSt()) !== '[60,108]') bad.push('six folded samples 10.8px from the landing gave the stroke ' + JSON.stringify(t.padSt()) + ', wanted [60,108] — one point, still a dot under PAD_DOT_PX');
  fire('pointermove', 1, 170, 110, 1020, { co: [] });
  fire('pointerup', 1, 170, 110, 1030);
  if (JSON.stringify(stored()) !== '[[50,100,52,100,54,102,56,104,58,106,60,108,70,120]]') bad.push('the folded samples and an empty list stored ' + JSON.stringify(stored()) + ' — wanted every sample, then the event\'s own point');
  one('the folded samples');

  /* THE PAD MOVES UNDER THE FINGER (a sibling's zoom, `padFaceFit_`, the pane scrolled): the next event reads
     the box again. Units 50, then 60; the pad 50px further right; (220,100) is then unit 70, not 120. */
  fresh();
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  fire('pointermove', 1, 160, 100, 1010);
  L = 150;
  fire('pointermove', 1, 220, 100, 1020);
  fire('pointerup', 1, 220, 100, 1030);
  if (JSON.stringify(stored()) !== '[[50,100,60,100,70,100]]') bad.push('after the pad moved 50px under the finger the stroke was stored as ' + JSON.stringify(stored()) + ', wanted [[50,100,60,100,70,100]] — a box kept from the down');
  one('the pad moved');

  /* P20: THE LIVE PATH AGAINST WHAT IS STORED. */
  fresh();
  fire('pointerdown', 1, 110, 60, 1000, { prim: true });
  const dot = (lives()[0] || { getAttribute: () => null }).getAttribute('d');
  if (dot !== t.padPath([10, 20], kOf())) bad.push('the finger\'s dot was not drawn the moment it landed: ' + dot);
  for (let i = 1; i <= 40; i++) fire('pointermove', 1, 110 + 4 * i, 60 + (i % 5) * 3, 1000 + 8 * i);
  const before = (lives()[0] || { getAttribute: () => '' }).getAttribute('d');
  if (before === t.padPath(t.padSt(), kOf())) bad.push('the live path was rewritten inside every event — it was meant to be written once a frame');
  await wait(5);
  const framed = lives().map(p => p.getAttribute('d'));
  if (framed.length !== 1 || framed[0] !== t.padPath(t.padSt(), kOf())) bad.push('after a frame the live path is not padPath_ of the points so far: ' + framed.map(s => s.slice(-40)).join(' | '));
  fire('pointermove', 1, 280, 70, 1400);
  fire('pointermove', 1, 300, 80, 1408);
  fire('pointerup', 1, 300, 80, 1410);
  const s20 = stored()[0] || [];
  if (JSON.stringify(s20.slice(-4)) !== '[180,40,200,60]') bad.push('the last two points, moved after the last frame, are not the stored stroke\'s end: ' + JSON.stringify(s20.slice(-6)));
  one('the live path against the stored');

  /* P21: A 300-POINT STROKE IS DRAWN IN CHUNKS while it is drawn, and is one path after. */
  fresh();
  fire('pointerdown', 1, 110, 100, 1000, { prim: true });
  for (let i = 1; i < 300; i++) fire('pointermove', 1, 110 + i, 100 + (i % 2) * 2, 1000 + 4 * i);
  await wait(5);
  const ch = lives().map(p => p.getAttribute('d'));
  if (ch.length < 2) bad.push('a 300-point stroke was drawn as ' + ch.length + ' live path(s) — the frame rewrites the whole stroke');
  const joined = ch.map((s, i) => (i ? s.replace(/^M[^LC]*/, '') : s)).join('');
  if (joined !== t.padPath(t.padSt(), kOf())) bad.push('the chunks of a 300-point stroke do not join into padPath_ of it');
  /* AND A FRAME AFTER THAT WRITES THE OPEN CHUNK, NOT THE STROKE: § */
  let dw = 0;
  const sa = w.Element.prototype.setAttribute;
  w.Element.prototype.setAttribute = function (n, v) { if (n === 'd' && this.hasAttribute && this.hasAttribute('data-live')) dw++; return sa.call(this, n, v); };
  try {
    for (let i = 300; i < 320; i++) fire('pointermove', 1, 110 + i, 100 + (i % 2) * 2, 1000 + 4 * i);
    await wait(5);
  } finally { w.Element.prototype.setAttribute = sa; }
  if (dw > 2) bad.push('a frame of a 320-point stroke wrote ' + dw + ' live `d`s — wanted the open chunk only (and one being frozen): a frame\'s cost must not grow with the stroke');
  if (!dw) bad.push('a frame after 20 more points wrote no live path at all');
  fire('pointerup', 1, 429, 102, 2300);
  if ((stored()[0] || []).length !== 640) bad.push('the 320-point stroke stored ' + ((stored()[0] || []).length / 2) + ' points');
  one('a 320-point stroke');

  w.padDrop_();
  t.padOn('');
  try { w.localStorage.removeItem(k); } catch (e) {}
  host.remove();
  return bad;
});

/* ---------- A POINT PUT DOWN ON THE GRID THE PICTURE DRAWS (docs/history/357) § */
check('a placement snaps to the grid the picture draws and a line never does: Q7\'s grid read, a bar chart not, a wobbling tap stored as its intersection, a line kept raw, a ruler end on its intersection (357)', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (!t || typeof w.padGrid_ !== 'function' || typeof t.padWrap !== 'function' || typeof t.padOn !== 'function' || typeof w.padDrop_ !== 'function') {
    return ['padGrid_, padWrap_ or padDrop_ are not reachable — snapping was NOT checked'];
  }
  const rows = LIB_FULL.rows('questions');
  const q7 = rows.find(r => r.row_id === 'Q-1MA1-2406-1F-7');
  const G = q7 && w.padGrid_(q7.diagram);
  if (!G || G.xs.length !== 14 || G.ys.length !== 17) bad.push('Q7\'s grid read as ' + (G ? G.xs.length + ' x ' + G.ys.length : 'nothing') + ' lines — wanted 14 x 17');
  const fine = rows.find(r => r.row_id === 'Q-1MA1-2005-1H-12b');
  const F = fine && w.padGrid_(fine.diagram);
  if (!F || F.xs.length < 60) bad.push('the cumulative frequency grid (path.grid) read as ' + (F ? F.xs.length + ' x ' + F.ys.length : 'nothing'));
  const bars = '<svg viewBox="0 0 340 300"><line x1="30" y1="10" x2="30" y2="270"/><line x1="30" y1="270" x2="330" y2="270"/>'
    + [60, 110, 160, 210, 260].map((x, i) => `<rect x="${x}" y="${270 - 40 * (i + 1)}" width="30" height="${40 * (i + 1)}"/><line x1="${x}" y1="${270 - 40 * (i + 1)}" x2="${x}" y2="270"/>`).join('')
    + [50, 90, 130, 170, 210, 250].map(y => `<line x1="24" y1="${y}" x2="30" y2="${y}"/>`).join('') + '</svg>';
  if (w.padGrid_(bars)) bad.push('a bar chart\'s bars and ticks were read as a grid — a point would snap to a bar');
  let grids = 0, pens = 0;
  rows.forEach(r => { if (!/^(drawing|annotate)$/.test(r.answer_type || '') || !r.diagram) return; pens++; if (w.padGrid_(r.diagram)) grids++; });
  if (grids < 150) bad.push(`only ${grids} of ${pens} pen pictures read as a grid — the map measured 196 ruled`);

  /* ON A PAD, Q7's PICTURE at 280px wide (17px squares at 390 are 16.5 here). */
  const x = { kind: 'question', answerType: 'annotate', html: '<p>Draw it.</p>', key: 'q:Q-SNAP-1', needs: [] };
  const k = t.padKey(x), host = d.createElement('div');
  d.body.appendChild(host);
  const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(q7.diagram), Wd = 280, Hd = Wd * vb[2] / vb[1], L = 40, T = 60;
  const fresh = () => {
    w.padDrop_();
    try { w.localStorage.removeItem(k); } catch (e) {}
    t.padOn(k);
    host.innerHTML = t.padCard(x, q7.diagram, '');
    host.querySelector('.qpad-ink').getBoundingClientRect = () => ({ left: L, top: T, width: Wd, height: Hd, right: L + Wd, bottom: T + Hd, x: L, y: T });
  };
  const ink = () => host.querySelector('.qpad-ink');
  const fire = (type, px, py, ts) => penEv_(w, ink(), type, { id: 1, x: px, y: py, t: ts, prim: type === 'pointerdown' });
  const stored = () => { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return ['unreadable']; } };
  fresh();
  if (!host.querySelector('.qt-row .qt-t[data-tool="ruler"]')) bad.push('Q7\'s pad offers no Ruler — every grid gets one');
  const ux = G.xs.map(v => v / vb[1] * 340), uy = G.ys.map(v => v / vb[2] * 340);
  const sx = Wd / 340, sy = Hd / 340;
  const aim = [L + ux[5] * sx, T + uy[8] * sy], want = [Math.round(ux[5]), Math.round(uy[8])];
  fire('pointerdown', aim[0] + 3.6, aim[1] - 3.2, 1000);
  fire('pointermove', aim[0] - 2.9, aim[1] + 3.8, 1016);
  fire('pointermove', aim[0] + 1.1, aim[1] - 3.9, 1032);
  fire('pointerup', aim[0] + 1.1, aim[1] - 3.9, 1040);
  if (JSON.stringify(stored()) !== JSON.stringify([want])) bad.push('a tap wobbling 4px round an intersection stored ' + JSON.stringify(stored()) + ' — wanted ' + JSON.stringify([want]));
  /* A LINE FROM THERE: the finger's own samples, from its own first one -- not the intersection. */
  fire('pointerdown', aim[0] + 3, aim[1] + 2, 2000);
  for (let i = 1; i <= 10; i++) fire('pointermove', aim[0] + 3 + 5 * i, aim[1] + 2 + 2 * i, 2000 + 8 * i);
  fire('pointerup', aim[0] + 53, aim[1] + 22, 2090);
  const line = stored()[1] || [];
  const first = [Math.round((aim[0] + 3 - L) / Wd * 340), Math.round((aim[1] + 2 - T) / Hd * 340)];
  if (line.length !== 22 || line[0] !== first[0] || line[1] !== first[1]) bad.push('a line was stored as ' + JSON.stringify(line) + ' — wanted 11 raw points from ' + JSON.stringify(first) + ': a line never snaps');
  /* THE RULER: both ends land on their intersections. */
  fresh();
  const tool = host.querySelector('.qt-row .qt-t[data-tool="line"]');
  if (tool) t.ACTIONS[tool.getAttribute('data-do')](tool);
  host.innerHTML = t.padCard(x, q7.diagram, '');
  host.querySelector('.qpad-ink').getBoundingClientRect = () => ({ left: L, top: T, width: Wd, height: Hd, right: L + Wd, bottom: T + Hd, x: L, y: T });
  const a = [L + ux[2] * sx, T + uy[3] * sy], b = [L + ux[9] * sx, T + uy[12] * sy];
  fire('pointerdown', a[0] - 3, a[1] + 3.5, 3000);
  for (let i = 1; i <= 10; i++) fire('pointermove', a[0] - 3 + (b[0] - a[0] + 6) * i / 10, a[1] + 3.5 + (b[1] - a[1] - 6.5) * i / 10, 3000 + 16 * i);
  fire('pointerup', b[0] + 3, b[1] - 3, 3200);
  const r = stored()[0] || [];
  const rw = [Math.round(ux[2]), Math.round(uy[3]), Math.round(ux[9]), Math.round(uy[12])];
  if (tool && JSON.stringify(r) !== JSON.stringify(rw)) bad.push('a ruler line stored ' + JSON.stringify(r) + ' — wanted ' + JSON.stringify(rw) + ', both ends on their intersections');
  if (!tool) bad.push('no Ruler tile to press');
  console.log(`          ${grids} of ${pens} pen pictures read as a grid`);
  w.padDrop_();
  t.padOn('');
  try { w.localStorage.removeItem(k); } catch (e) {}
  host.remove();
  return bad;
});

/* ---------- A FAST LINE IS DRAWN ROUND, AND EVERY STORED STROKE STILL DRAWS (338, increment 1c) § */
check('a fast line is drawn round and every stored stroke still draws: padPath_ keeps dots, rulers, corners and dense strokes byte for byte, curves a fast circle within half a percent, reads the pad\'s aspect, and an old drawing loads unchanged', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (typeof w.padPath_ !== 'function' || typeof w.padAspect_ !== 'function' || !t || typeof t.padWrap !== 'function') {
    return ['padPath_, padAspect_ or padWrap_ is not reachable — the curves were NOT checked'];
  }
  /* TODAY'S STRING, written out here as it was: the polyline, and a lone point as a dot. */
  const today = st => { let s = ''; for (let i = 0; i + 1 < st.length; i += 2) s += (i ? 'L' : 'M') + st[i] + ' ' + st[i + 1];
    return st.length === 2 ? `M${st[0]} ${st[1]}L${st[0]} ${st[1]}` : s; };
  const P = (st, k) => w.padPath_(st, k);
  /* THE PATH AS SEGMENTS, and points along it: a cubic at 21 values of t, a line at its two ends. */
  const segs = s => { const out = []; let cur = null; const re = /([MLC])([^MLC]*)/g; let m;
    while ((m = re.exec(s))) {
      const n = m[2].trim().split(/[\s,]+/).map(Number);
      if (m[1] === 'M') cur = [n[0], n[1]];
      else if (m[1] === 'L') { out.push([cur, [n[0], n[1]]]); cur = [n[0], n[1]]; }
      else { out.push([cur, [n[0], n[1]], [n[2], n[3]], [n[4], n[5]]]); cur = [n[4], n[5]]; }
    }
    return out; };
  const along = (s, from, to) => [].concat(...segs(s).slice(from || 0, to).map(g => {
    if (g.length === 2) return [g[0], g[1]];
    const pts = [];
    for (let i = 0; i <= 20; i++) { const u = i / 20, v = 1 - u;
      pts.push([0, 1].map(c => v * v * v * g[0][c] + 3 * v * v * u * g[1][c] + 3 * v * u * u * g[2][c] + u * u * u * g[3][c])); }
    return pts; }));
  /* EVERY STORED POINT IS AN END OF A SEGMENT, in order -- the curve passes through what was drawn. */
  const ends = (s, st) => {
    const want = []; for (let i = 0; i + 1 < st.length; i += 2) if (!want.length || want[want.length - 1][0] !== st[i] || want[want.length - 1][1] !== st[i + 1]) want.push([st[i], st[i + 1]]);
    const g = segs(s), got = g.length ? [g[0][0]].concat(g.map(x => x[x.length - 1])) : [];
    return JSON.stringify(got) === JSON.stringify(want) || JSON.stringify(got) === JSON.stringify(want.concat([want[want.length - 1]]));
  };
  /* THE WORST DISTANCE OF THE DRAWN PATH FROM A CIRCLE, in Q = (x, k.y) -- proportional to the screen. */
  const radial = (s, k, cx, cy, r, from, to) => Math.max(...along(s, from, to).map(p => Math.abs(Math.hypot(p[0] - cx, k * p[1] - k * cy) - r)));

  /* PP1, PP2, PP7: TODAY'S STRING, BYTE FOR BYTE. */
  const same = [[5, 5], [1, 2, 3, 4], [5, 5, 5, 5], [0, 0, 100, 0, 100, 100, 0, 100, 0, 0], [0, 0, 200, 0, 100, 170, 0, 0],
    [34, 34, 306, 34, 306, 170], [50, 100, 200, 180], [1, 2, NaN, 4, 5, 6], [1, 2, 3, 4, 5, 6, 7], [1, 2, Infinity, 4, 5, 6, 7, 8]];
  /* PP3: A DENSE STROKE (every chord under 8 units) and every stroke the journeys in this file store. */
  const dense = []; for (let i = 0; i <= 90; i++) dense.push(Math.round(170 + 60 * Math.cos(i / 15)), Math.round(170 + 60 * Math.sin(i / 15)));
  same.push(dense);
  /* (AT k = 1: a vertex's turn is measured on the screen, so a stroke's corners are the same at every aspect
     only where they are square to the page -- the rest are drawn as the pad's own shape bends them.) */
  const journeys = [[20, 20, 200, 200], [5, 5, 9, 9], [1, 1, 300, 300], [10, 10, 100, 100], [40, 40, 120, 40, 160, 120], [34, 34, 170, 34], [45, 85, 159, 85], [34, 34, 306, 306], [30, 30, 90, 30]];
  same.concat(journeys).forEach((st, n) => { (n < same.length ? [1, 0.5, 4 / 3] : [1]).forEach(k => {
    let got;
    try { got = P(st, k); } catch (e) { got = 'threw ' + e.message; }
    if (got !== today(st)) bad.push('padPath_(' + JSON.stringify(st).slice(0, 50) + ', ' + k + ') drew ' + String(got).slice(0, 70) + ' — wanted today\'s ' + today(st).slice(0, 70));
  }); });
  /* PP4: AN L KEEPS ITS CORNER. */
  const ell = P([0, 0, 100, 0, 100, 100], 1);
  if (/C/.test(ell) || !/L100 0L100 100/.test(ell)) bad.push('an L was drawn ' + ell + ' — its corner is the answer');
  /* PP5: A 12-GON OF RADIUS 100, k = 1: § */
  const ring = n => { const st = []; for (let i = 0; i <= n; i++) { const a = 2 * Math.PI * i / n; st.push(170 + 100 * Math.cos(a), 170 + 100 * Math.sin(a)); } return st; };
  const g12 = P(ring(12), 1);
  if (!/C/.test(g12)) bad.push('a 12-gon of radius 100 was drawn with no curve: ' + g12.slice(0, 60));
  const e12 = radial(g12, 1, 170, 170, 100, 1, -1), x12 = radial(g12, 1, 170, 170, 100), sag = 100 * (1 - Math.cos(Math.PI / 12));
  if (!(e12 <= 0.5)) bad.push('a 12-gon of radius 100 is drawn ' + e12.toFixed(2) + ' units off its circle between its ends — wanted 0.5 (half a percent) at most');
  if (!(x12 < sag)) bad.push('a 12-gon\'s end segments are ' + x12.toFixed(2) + ' units off its circle — worse than the polygon\'s ' + sag.toFixed(2));
  if (!ends(g12, ring(12))) bad.push('the 12-gon\'s curve does not pass through every stored point');
  /* PP6: A 9-POINT RING CURVES (40 degrees a vertex); A HEXAGON DOES NOT (60). */
  if (!/C/.test(P(ring(9), 1))) bad.push('a 9-point ring (40 degrees a turn) was drawn with no curve');
  if (/C/.test(P(ring(6), 1))) bad.push('a hexagon (60 degrees a turn) was drawn with curves — its corners are corners');
  /* PP8: A CIRCLE STORED ON THE 3:4 BOARD -- round on the screen, so an ellipse in units -- is round drawn with
     k = 4/3, and the k = 1 string differs. Board 300 x 400px: one unit across is 300/340px, down 400/340. */
  const sx = 300 / 340, sy = 400 / 340, R = 120, board = [];
  for (let i = 0; i <= 12; i++) { const a = 2 * Math.PI * i / 12; board.push(Math.round(170 + R * Math.cos(a) / sx), Math.round(170 + R * Math.sin(a) / sy)); }
  const kb = w.padAspect_({ prefix: 'board' }, '');
  if (kb !== 1.3333) bad.push('the board\'s aspect is ' + kb + ', wanted 1.3333 — it is 3:4 whatever its surface\'s viewBox says');
  const gb = P(board, kb), eb = radial(gb, kb, 170, 170, R / sx, 1, -1);
  if (!(eb <= R / sx * 0.01)) bad.push('a round circle stored on the board is drawn ' + eb.toFixed(2) + ' units off round between its ends with the board\'s aspect — wanted 1% at most');
  if (gb === P(board, 1)) bad.push('the board\'s circle is drawn the same with k = 1 and k = 4/3 — the aspect is not read');
  /* PP9: DUPLICATES AND COLLINEAR RUNS -- nothing that is not a number. */
  const dup = P([10, 10, 10, 10, 50, 10, 90, 10, 90, 10, 130, 10, 170, 50, 170, 50, 210, 90], 1);
  if (/NaN|Infinity|undefined/.test(dup)) bad.push('duplicates and a straight run drew ' + dup);
  if (!ends(dup, [10, 10, 10, 10, 50, 10, 90, 10, 90, 10, 130, 10, 170, 50, 170, 50, 210, 90])) bad.push('duplicates and a straight run: not every point is an end of a segment');

  /* ---------- AND ON A PAD: THE ASPECT IT IS DRAWN WITH, AND AN OLD DRAWING ------------------------------- */
  const x = { kind: 'question', answerType: 'drawing', html: '<p>Draw it.</p>', key: 'q:Q-FINGER-3' };
  const k = t.padKey(x);
  const host = d.createElement('div');
  d.body.appendChild(host);
  /* AN OLD DRAWING: a fast circle as a phone stored it before 338 -- ten whole-number points a turn. */
  const old = []; for (let i = 0; i <= 9; i++) { const a = 2 * Math.PI * i / 9; old.push(Math.round(170 + 120 * Math.cos(a)), Math.round(170 + 120 * Math.sin(a))); }
  const value = JSON.stringify([old, [50, 100, 200, 180]]);
  w.localStorage.setItem(k, value);
  host.innerHTML = t.padCard(x, '<svg viewBox="0 0 340 340"></svg>', '');
  const pad = host.querySelector('.qpad');
  if (pad.getAttribute('data-aspect') !== '1') bad.push('a square figure\'s pad says data-aspect="' + pad.getAttribute('data-aspect') + '", wanted 1');
  const ds = [...pad.querySelectorAll('.qpad-g path')].map(p => p.getAttribute('d'));
  if (!/C/.test(ds[0] || '') || !ends(ds[0] || '', old)) bad.push('an old fast circle is not drawn round through its stored points: ' + String(ds[0]).slice(0, 60));
  if (ds[1] !== 'M50 100L200 180') bad.push('an old ruler line is drawn ' + ds[1] + ', wanted M50 100L200 180');
  if (w.localStorage.getItem(k) !== value) bad.push('drawing an old drawing changed what is stored');
  host.innerHTML = t.padCard(x, '<svg viewBox="0 0 340 170"></svg>', '');
  const wide = host.querySelector('.qpad');
  if (wide.getAttribute('data-aspect') !== '0.5') bad.push('a 340x170 figure\'s pad says data-aspect="' + wide.getAttribute('data-aspect') + '", wanted 0.5');
  if (wide.querySelector('.qpad-g path').getAttribute('d') !== P(old, 0.5)) bad.push('the pad does not draw its marks with its own aspect');
  /* AND A REPAINT (Undo, Clear, a copy) DRAWS WITH THE SAME NUMBER. */
  w.padRepaint_(wide, [old]);
  if (wide.querySelector('.qpad-g path').getAttribute('d') !== P(old, 0.5)) bad.push('padRepaint_ does not draw with the pad\'s own aspect');
  if (w.localStorage.getItem(k) !== value) bad.push('drawing the pad again changed what is stored');
  try { w.localStorage.removeItem(k); } catch (e) {}
  host.remove();
  return bad;
});

/* ---------- `?pen=sizes`: THE READING INCREMENT 2 WAITS FOR, AND NOTHING ELSE (338) § */
check('?pen=sizes lists the last eight contacts\' widths for one reading on a device, and size decides nothing yet', async () => {
  const bad = [];
  for (const url of ['https://example.org/?pen=sizes', 'https://example.org/']) {
    const { w } = boot({ url });
    await wait(300);
    const t = w.__t, d = w.document;
    if (!t || typeof t.padWrap !== 'function' || typeof t.padOn !== 'function' || typeof w.padDrop_ !== 'function') return ['padWrap_, padOn or padDrop_ not reachable — ?pen=sizes was NOT checked'];
    const x = { kind: 'question', answerType: 'drawing', html: '<p>Draw it.</p>', key: 'q:Q-FINGER-4' };
    const k = t.padKey(x);
    try { w.localStorage.removeItem(k); } catch (e) {}
    const host = d.createElement('div'); d.body.appendChild(host);
    t.padOn(k);
    host.innerHTML = t.padCard(x, '<svg viewBox="0 0 340 340"></svg>', '');
    const ink = host.querySelector('.qpad-ink');
    ink.getBoundingClientRect = () => ({ left: 0, top: 0, width: 340, height: 340, right: 340, bottom: 340, x: 0, y: 0 });
    for (let i = 0; i < 10; i++) {
      const o = { id: 1, prim: true, size: 30 + i * 5 };
      penEv_(w, ink, 'pointerdown', Object.assign({ x: 20 + i * 30, y: 50, t: 1000 + 100 * i }, o));
      penEv_(w, ink, 'pointermove', Object.assign({ x: 25 + i * 30, y: 80, t: 1040 + 100 * i }, o, { size: 60 + i * 5 }));
      penEv_(w, ink, 'pointerup', Object.assign({ x: 25 + i * 30, y: 80, t: 1060 + 100 * i }, o, { size: 1 }));
    }
    /* THE LINE IS WRITTEN AT THE NEXT FRAME, never inside a pointer event (after review: written in every `pointermove` it
       forced a layout per move, in the very mode the iPad reading is taken in). */
    await wait(5);
    const line = d.querySelector('.pad-sizes');
    let st = []; try { st = JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) {}
    if (st.length !== 10) bad.push(url + ': ten strokes by contacts 30 to 75px wide stored ' + st.length + ' — size must decide nothing until a device has been measured');
    if (/pen=sizes/.test(url)) {
      if (!line) bad.push('with ?pen=sizes in the address there is no .pad-sizes line');
      else {
        const rows = line.textContent.split('\n');
        if (rows.length !== 8) bad.push('the sizes line lists ' + rows.length + ' contacts, wanted the last 8');
        if (rows[rows.length - 1] !== 'touch 75x75 largest 105') bad.push('the last contact reads "' + rows[rows.length - 1] + '", wanted "touch 75x75 largest 105" — its kind, its size at the down and the largest during (the 1 of a lift is not a size)');
        if (line.getAttribute('aria-hidden') !== 'true') bad.push('the sizes line is read out to a screen reader');
        /* A CONTACT THAT GROWS: nothing written while its events are handled, the new size at the next frame. */
        const before = line.textContent;
        penEv_(w, ink, 'pointerdown', { id: 1, prim: true, size: 90, x: 30, y: 50, t: 3000 });
        penEv_(w, ink, 'pointermove', { id: 1, prim: true, size: 120, x: 40, y: 90, t: 3040 });
        if (line.textContent !== before) bad.push('the sizes line was written inside a pointer event — it forces a layout on every move; it is written once a frame');
        await wait(5);
        const last = line.textContent.split('\n').pop();
        if (last !== 'touch 90x90 largest 120') bad.push('a frame after a contact grew the sizes line ends "' + last + '", wanted "touch 90x90 largest 120"');
        penEv_(w, ink, 'pointerup', { id: 1, prim: true, size: 1, x: 40, y: 90, t: 3060 });
      }
    } else if (line) bad.push('without ?pen=sizes in the address the sizes line was drawn anyway');
    w.padDrop_(); t.padOn(''); try { w.localStorage.removeItem(k); } catch (e) {} host.remove();
  }
  return bad;
});

/* ---------- VIDEOS: THE BAR ALONE, RESULTS AS YOU TYPE, A TAP PLAYS IN THEIR PLACE, FULL SCREEN § */
/* WHAT IS ON THE CARD BESIDE THE BAR — nothing, when it is idle. § */
const vidIdle_ = box => {
  if (!box) return ['there is no card'];
  const seen = [];
  if (!box.querySelector('input.vid-q')) seen.push('no search box');
  if (box.querySelector('.vid-row')) seen.push(box.querySelectorAll('.vid-row').length + ' result row(s)');
  if (box.querySelector('.vid-watch.on') || box.querySelector('.vid-player')) seen.push('a player');
  if (box.querySelector('[data-do="vid-full"], [data-do="vid-unfull"]')) seen.push('a Full screen tile');
  const res = box.querySelector('.vid-results');
  if (res && res.innerHTML.trim()) seen.push('the results area holding "' + res.textContent.trim().slice(0, 60) + '"');
  const adm = box.querySelector('.vid-admin');
  if (adm && adm.innerHTML.trim()) seen.push('the admin row');
  if (box.querySelector('.vid-said')) seen.push('a count line');
  if (box.querySelector('.loading')) seen.push('a loader');
  const words = box.textContent.replace(/\s+/g, ' ').trim();
  if (words) seen.push('the words "' + words.slice(0, 80) + '"');
  return seen;
};
/* LET GO OF THE APP'S FULL SCREEN BY THE APP'S OWN DOOR, for a journey that goes on after a card that would
   not leave it — so the next question is asked of the card, not of the fault the last one found. */
const vidLetGo_ = w => { try { w.vidFullOff_(); } catch (e) {} };
/* HOW MANY THE SEARCH FOUND: the rows drawn and the number on the line under them. */
const vidFound_ = box => {
  const rows = box ? box.querySelectorAll('.vid-results .vid-list .vid-row').length : 0;
  const m = /^(\d+) more — keep typing to narrow$/.exec(((box && box.querySelector('.vid-results .vid-more')) || {}).textContent || '');
  return rows + (m ? Number(m[1]) : 0);
};
check('the videos widget leads the Reels column: the bar alone, at most four results as you type, a tap plays in their place, an edit goes back, full screen fills the glass', async () => {
  const rows = [
    { title: 'How volcanoes erupt', url: 'https://www.youtube.com/watch?v=abcdefghijk', kind: 'clip',
      tags: 'science earth', age: '7+', notes: '', active: true },
    { title: 'Fractions in two minutes', url: 'data/reels/fractions.mp4', kind: 'clip',
      tags: 'maths', age: '', notes: '', active: '' },
    { title: 'A switched-off volcano', url: 'https://youtu.be/zyxwvutsrqp', kind: 'clip',
      tags: 'science', age: '', notes: '', active: false },
    /* note 311's review: a YouTube id that answers YouTube's grey 404 stand-in, and an owner's clip that
       lives in Drive — which a child's phone must not ask Drive a picture of. Both invented. */
    { title: 'A clip taken down since', url: 'https://www.youtube.com/watch?v=takendown01', kind: 'clip',
      tags: 'history', age: '', notes: '', active: true },
    { title: 'A clip kept in Drive', url: 'https://drive.google.com/file/d/example-o-001/view', kind: 'clip',
      tags: 'history', age: '', notes: '', active: true },
  ];
  let asked = 0;
  const full = [];
  const pops = [];
  const { w } = boot({ before: win => {
    const f0 = win.fetch;
    win.fetch = (url, o) => {
      if (/data\/videos\.json/.test(String(url))) {
        asked++;
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(rows),
                                 text: () => Promise.resolve(JSON.stringify(rows)) });
      }
      return f0(url, o);
    };
    /* JSDOM HAS NO FULL SCREEN AND NO TOP LAYER, so the journey stands in for both and writes down who
       asked. The real thing is measured in Chromium (`check/states.js`, "the videos card, its own full
       screen", and note 321). */
    win.HTMLElement.prototype.requestFullscreen = function () { full.push(this.tagName.toLowerCase()); return Promise.resolve(); };
    win.HTMLElement.prototype.showPopover = function () { pops.push('show:' + this.className); this.__open = true; };
    win.HTMLElement.prototype.hidePopover = function () { pops.push('hide:' + this.className); this.__open = false; };
  } });
  await wait(300);
  const t = w.__t;
  const d = w.document;
  const bad = [];
  /* A VIEWER OLD ENOUGH FOR THE 7+ CLIP: signed out or with no date of birth is underage (450). */
  t.USER({ name: 'Cal Parent', personId: 'P-C', role: 'client', roles: ['client'], rank: 'client', token: 'tk3',
           profile: { dob_d: '2', dob_m: '3', dob_y: String(new Date().getFullYear() - 30) } });
  /* ON THE REELS COLUMN (414), before the first reel — and on Games no longer. */
  if (t.widgetsOf('game').some(x => String(x.id) === 'videos')) bad.push('videos is still a widget of the Games column');
  const roster = t.widgetsOf('reel').map(x => String(x.id));
  if (roster.indexOf('videos') === -1) return ['there is no videos widget on the Reels column'];
  t.go('reel', false, true);
  await wait(LEAVE_MS); await woken_();
  /* AND THE CARD ITSELF IS WAITED FOR, `partyBoot_`'s rule below: § */
  for (let n = 0; n < 150 && !(asked && d.querySelector('#s-reel #wgt-videos .vid-box .vid-q')); n++) await wait(100);
  await wait(50);
  const box = d.querySelector('#s-reel #wgt-videos .vid-box');
  if (!box) return bad.concat(['the videos card did not draw on the Reels column']);
  if (!asked) bad.push('the card never asked for data/videos.json');
  const q = box.querySelector('input.vid-q');
  if (!q) return bad.concat(['there is no search box on the videos card']);
  const titles = () => [...box.querySelectorAll('.vid-results .vid-list .vid-row .vid-t')].map(e => e.textContent.trim());
  const type = v => { q.value = v; q.dispatchEvent(new w.Event('input', { bubbles: true })); };
  /* A PRESS ON WHAT IS THERE, OR A NAMED FAULT WHERE IT IS NOT — so a broken card says what was missing
     rather than throwing on the next line. */
  const press = (act, sel, what) => {
    const el = box.querySelector(sel);
    if (!el) { bad.push('there is no ' + what + ' to press'); return false; }
    t.ACTIONS[act](el);
    return true;
  };
  const play = () => press('vid-play', '.vid-results .vid-row[data-do="vid-play"]', 'result that plays');

  /* ---------- IDLE: *"at first all you see is a search bare"* ------------------------------------------ */
  const idle = vidIdle_(box);
  if (idle.length) bad.push('the card opens on more than the search bar: ' + idle.join('; '));

  /* ---------- RESULTS AS YOU TYPE, RANKED, AT MOST FOUR § */
  type('clip');
  const want = ['A clip taken down since', 'A clip kept in Drive', 'Fractions in two minutes', 'How volcanoes erupt'];
  if (titles().join('|') !== want.join('|')) bad.push('typing "clip" found ' + (titles().join(' | ') || 'nothing') + ' — wanted, in this order, ' + want.join(' | '));
  if (titles().indexOf('A switched-off volcano') !== -1) bad.push('a row with active: false is listed');
  if (box.querySelector('.vid-more')) bad.push('four results drew a "more" line with nothing more to find');
  /* AND NOT THE REELS: *"the video widget shouldn't acknowledge reels."* They were a third list here. */
  if (titles().some(x => /^Reel \d/.test(x))) bad.push('the videos widget lists the app\'s reels, which it was told not to: ' + titles().join(' | '));
  if (d.querySelector('#s-reel #wgt-videos input.vid-q') !== q) bad.push('typing rebuilt the search box, which drops a phone\'s keyboard');

  /* ---------- AND IT LOOKS LIKE YOUTUBE (note 311): A PICTURE ON EVERY ROW, AND A POSTER UNDER IT § */
  const rowOf = title => [...box.querySelectorAll('.vid-results .vid-row')]
    .find(r => (r.querySelector('.vid-t') || {}).textContent === title);
  const yt = rowOf('How volcanoes erupt');
  const ytImg = yt && yt.querySelector('.vid-th img.vid-img');
  if (!ytImg || ytImg.getAttribute('src') !== 'https://i.ytimg.com/vi/abcdefghijk/mqdefault.jpg')
    bad.push('the YouTube row\'s picture is not its i.ytimg.com mqdefault: ' + (ytImg ? ytImg.getAttribute('src') : 'no <img>'));
  else if (ytImg.getAttribute('alt') !== '' || ytImg.getAttribute('loading') !== 'lazy'
           || ytImg.getAttribute('referrerpolicy') !== 'no-referrer')
    bad.push('the YouTube row\'s picture is not alt="", lazy and no-referrer: ' + ytImg.outerHTML.slice(0, 200));
  if (yt && !yt.querySelector('.vid-th .vid-poster')) bad.push('the YouTube row has no poster under its picture, so a failed one would leave a hole');
  /* A PLAIN CLIP HAS NO BADGE: "Clip" is what every row a student is shown would say, in the one spot
     where YouTube puts something that differs per row (review of 9 Oct). */
  if (!yt || yt.querySelector('.vid-badge'))
    bad.push('a plain clip\'s picture carries a badge — the same word on every row a student is shown: ' + (yt ? yt.querySelector('.vid-badge').textContent : 'no row'));
  /* AND THE WORDS COME FIRST IN THE MARKUP, so a screen reader hears the title before the picture's labels. */
  if (yt && !(yt.firstElementChild && yt.firstElementChild.classList.contains('vid-txt')))
    bad.push('a row\'s picture comes before its title in the markup, so its labels are read before what it is called');
  /* THE POSTER IS A FLAT FRAME AND THE KIND'S MARK — NO LETTER. A letter in gold read as a contacts list,
     and forty rows of one title's pattern drew a column of the same letter (review of 9 Oct). */
  const mp4 = rowOf('Fractions in two minutes');
  if (!mp4 || mp4.querySelector('img') || !mp4.querySelector('.vid-th .vid-poster svg.tile-i-play'))
    bad.push('an .mp4 row has no picture to show and is not drawn a poster with the play mark: ' + (mp4 ? mp4.innerHTML.slice(0, 200) : 'no row'));
  if (box.querySelector('.vid-poster b') || /\S/.test([...box.querySelectorAll('.vid-poster')].map(p => p.textContent).join('')))
    bad.push('a poster carries a letter or a word, where YouTube\'s missing picture is a plain frame');
  /* A DRIVE ADDRESS IN THE OWNER'S LIST ASKS DRIVE FOR NOTHING AND STAYS A LINK. § */
  const kept = rowOf('A clip kept in Drive');
  if (!kept) bad.push('the owner\'s Drive clip is not listed');
  else {
    if (kept.querySelector('img') || /drive\.google\.com\/thumbnail/.test(box.innerHTML))
      bad.push('an owner\'s Drive clip asks Drive for a picture on a phone that never asked for a film: ' + kept.innerHTML.slice(0, 200));
    if (!kept.matches('a.vid-row.is-out') || kept.getAttribute('data-do'))
      bad.push('an owner\'s Drive clip is not the link out it always was: ' + kept.outerHTML.slice(0, 160));
    if (!kept.querySelector('.vid-badge .vid-out[role="img"][aria-label="opens in a new tab"]'))
      bad.push('a row that opens in a new tab has no named out-arrow on its picture');
    if (/opens in a new tab/.test(kept.textContent)) bad.push('a row\'s line says "opens in a new tab" beside the arrow that says it');
  }
  if (box.querySelector('.vid-watch.on') || box.querySelector('.vid-stage .vid-player') || box.querySelector('[data-do="vid-full"]'))
    bad.push('with nothing playing the card draws a player or a Full screen tile — YouTube shows the list');
  /* A PICTURE THAT FAILS IS TAKEN AWAY and the poster under it is what shows — through the one listener
     (`error` does not bubble, so it has to be the capture phase), and the next paint does not ask again. */
  if (ytImg) {
    ytImg.dispatchEvent(new w.Event('error'));
    if (!ytImg.classList.contains('is-gone')) bad.push('a picture that failed to load was left in place over its poster');
    type('volc');
    const again = rowOf('How volcanoes erupt');
    if (!again || again.querySelector('img.vid-img') || !again.querySelector('.vid-poster'))
      bad.push('after its picture failed, the next paint asked for it again instead of drawing the poster');
    type('clip');
  }
  /* AND A YOUTUBE PICTURE THAT LOADED AS YOUTUBE'S GREY STAND-IN — 404 with a 120x90 picture, which a browser draws and calls loaded, so `error` never fires. § */
  const gone = rowOf('A clip taken down since');
  const goneImg = gone && gone.querySelector('img.vid-img');
  if (!goneImg) bad.push('the second YouTube row has no picture to test the grey stand-in on');
  else {
    const loaded = width => {
      Object.defineProperty(goneImg, 'naturalWidth', { value: width, configurable: true });
      goneImg.dispatchEvent(new w.Event('load'));
    };
    loaded(320);
    if (goneImg.classList.contains('is-gone')) bad.push('a real 320px YouTube picture was taken away as though it had failed');
    loaded(120);
    if (!goneImg.classList.contains('is-gone')) bad.push('YouTube\'s grey 120x90 stand-in for a removed video was left over the poster');
  }

  /* ---------- NARROWING, NOTHING, AND BACK TO THE BAR ---------------------------------------------------- */
  type('volc');
  if (titles().join() !== 'How volcanoes erupt') bad.push('typing "volc" did not narrow to the one volcano: ' + titles().join(' | '));
  type('maths two');
  if (titles().join() !== 'Fractions in two minutes') bad.push('two words did not narrow to the row holding both: ' + titles().join(' | '));
  /* ---------- THE KEYBOARD'S SEARCH KEY PUTS THE KEYBOARD AWAY AND LEAVES THE RESULTS (review of 10 Oct) § */
  type('clip');
  q.focus();
  q.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  if (d.activeElement === q) bad.push('Enter in the box left the focus in it — a phone keeps its keyboard up over the results');
  if (titles().length !== 4 || q.value !== 'clip' || box.querySelector('.vid-watch.on'))
    bad.push('Enter in the box changed what the card shows: ' + (titles().join(' | ') || 'no rows') + ' for ' + JSON.stringify(q.value));
  type('zzzz');
  const none = (box.querySelector('.vid-results .vid-none') || {}).textContent || '';
  if (titles().length || none !== 'Nothing matches that.') bad.push('a search that matches nothing says "' + none + '" over ' + titles().length + ' row(s) — wanted "Nothing matches that."');
  type('   ');
  const spaces = vidIdle_(box);
  if (spaces.length) bad.push('a box holding only spaces is not the bar alone: ' + spaces.join('; '));
  type('');
  const cleared = vidIdle_(box);
  if (cleared.length) bad.push('an emptied box is not the bar alone: ' + cleared.join('; '));

  /* ---------- A TAP PLAYS IT IN THE CARD, IN PLACE OF THE RESULTS § */
  type('volc');
  /* AND THE PHONE'S KEYBOARD GOES: the box lets go of the focus when a result is tapped, or the keyboard
     stays up over the player it just asked for. */
  q.focus();
  play();
  if (d.activeElement === q) bad.push('tapping a result left the focus in the search box — a phone keeps its keyboard up over the player');
  const fr = box.querySelector('.vid-stage iframe.vid-player');
  if (!fr || !/^https:\/\/www\.youtube-nocookie\.com\/embed\/abcdefghijk\b/.test(fr.getAttribute('src') || ''))
    bad.push('tapping the YouTube row did not put its nocookie embed in the card: ' + (fr ? fr.getAttribute('src') : 'no iframe'));
  const nowT = box.querySelector('.vid-watch.on .vid-now .vid-now-t');
  if (!nowT || nowT.textContent !== 'How volcanoes erupt') bad.push('the title under the player is "' + (nowT ? nowT.textContent : 'not there') + '"');
  const nowK = box.querySelector('.vid-watch.on .vid-now .vid-now-k');
  if (!nowK || nowK.textContent !== 'Clip · 7+') bad.push('the line under the title is "' + (nowK ? nowK.textContent : 'not there') + '" — wanted the kind and the age');
  if (box.querySelector('.vid-results .vid-row') || (box.querySelector('.vid-results') || {}).innerHTML)
    bad.push('the results are still drawn under the player — the watch view replaces them');
  if (q.value !== 'volc' || d.querySelector('#s-reel #wgt-videos input.vid-q') !== q) bad.push('the bar did not keep what was typed over the player: ' + JSON.stringify(q.value));
  if (!box.querySelector('.vid-acts .tile[data-do="vid-full"]')) bad.push('there is no Full screen tile beside the title');

  /* ---------- ANY EDIT GOES BACK TO THE RESULTS, AND THE FILM STOPS § */
  type('volca');
  if (box.querySelector('.vid-stage .vid-player') || box.querySelector('.vid-watch.on'))
    bad.push('an edit of the box left the player in the card — the film goes on under the results');
  if (titles().join() !== 'How volcanoes erupt') bad.push('after an edit the results for the new words are ' + (titles().join(' | ') || 'not drawn'));
  play();
  type('');
  const back = vidIdle_(box);
  if (back.length) bad.push('clearing the box over a film did not leave the bar alone: ' + back.join('; '));

  /* AN MP4 ROW: a `<video>`, inline, on that file. */
  type('fractions');
  play();
  const v = box.querySelector('.vid-stage video.vid-player');
  if (!v || v.getAttribute('src') !== 'data/reels/fractions.mp4' || !v.hasAttribute('playsinline'))
    bad.push('tapping the mp4 row did not put an inline <video> of it in the card');
  if (box.querySelector('.vid-stage iframe')) bad.push('the old player was left in the card beside the new one');

  /* ---------- FULL SCREEN: THE BROWSER'S, WHERE THERE IS ONE ---------------------------------------------
     A tile, and pressing it asks the PLAYER, not the card. */
  const tile = box.querySelector('.vid-acts .tile[data-do="vid-full"]');
  if (!tile) bad.push('there is no Full screen tile under the player');
  else {
    t.ACTIONS['vid-full'](tile);
    if (full.join() !== 'video') bad.push('Full screen asked ' + (full.join() || 'nobody') + ' rather than the video');
    if (t.vidFs() || pops.length) bad.push('with the browser\'s full screen there, the app drew its own as well');
  }

  /* ---------- AND THE APP'S OWN WHERE THERE IS NONE — Safari on an iPhone, with a frame § */
  delete w.HTMLElement.prototype.requestFullscreen;
  const toasts = [];
  const realToast = w.toast;
  w.toast = m => { toasts.push(String(m)); };
  type('volc');
  play();
  const frame = box.querySelector('.vid-stage iframe.vid-player');
  const watch = box.querySelector('.vid-watch');
  const on = () => {
    pops.length = 0;
    const ft = box.querySelector('.vid-acts .tile[data-do="vid-full"]');
    if (!ft) { bad.push('there is no Full screen tile over the YouTube clip'); return false; }
    t.ACTIONS['vid-full'](ft);
    return true;
  };
  if (frame && watch && on()) {
    if (toasts.length) bad.push('with no full screen for a frame the tile toasted "' + toasts.join(' / ') + '" instead of filling the screen');
    if (pops.join() !== 'show:vid-watch on is-fs') bad.push('the app\'s full screen did not put the player\'s block in the top layer: ' + (pops.join(', ') || 'nothing shown'));
    if (t.vidFs() !== watch) bad.push('the app\'s full screen is not on for the card\'s own watch block');
    if (!watch.classList.contains('is-fs') || watch.getAttribute('popover') !== 'manual') bad.push('the watch block is not marked full screen: ' + watch.outerHTML.slice(0, 160));
    if (!watch.hasAttribute('data-noswipe')) bad.push('a swipe on the black round the film would turn the column — no data-noswipe');
    if (watch.getAttribute('role') !== 'dialog' || watch.getAttribute('aria-modal') !== 'true') bad.push('a screen reader is not told the film covers everything (role dialog, aria-modal)');
    const exit = box.querySelector('.vid-acts .tile[data-do="vid-unfull"]');
    if (!exit || box.querySelector('.vid-acts [data-do="vid-full"]')) bad.push('full screen did not swap Full screen for an Exit full screen tile');
    if (box.querySelector('.vid-stage iframe.vid-player') !== frame) bad.push('going full screen rebuilt the player — the film restarts');
    /* THE ARROWS DO NOT TURN THE GRID UNDER THE FILM. */
    const before = JSON.stringify([t.screenAt(), t.PAGE.stuff]);
    d.body.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    d.body.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    if (JSON.stringify([t.screenAt(), t.PAGE.stuff]) !== before) bad.push('an arrow key turned the column under the full-screen film');
    /* ESCAPE GIVES THE SCREEN BACK. */
    pops.length = 0;
    d.body.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    if (t.vidFs()) bad.push('Escape did not leave the app\'s full screen');
    if (pops.join() !== 'hide:vid-watch on is-fs') bad.push('leaving full screen did not take the block out of the top layer: ' + (pops.join(', ') || 'nothing hidden'));
    if (watch.classList.contains('is-fs') || watch.hasAttribute('popover') || watch.hasAttribute('data-noswipe') || watch.hasAttribute('role'))
      bad.push('the watch block is still marked full screen after Escape: ' + watch.outerHTML.slice(0, 160));
    if (!box.querySelector('.vid-acts .tile[data-do="vid-full"]') || box.querySelector('[data-do="vid-unfull"]')) bad.push('after Escape the Full screen tile did not come back');
    if (box.querySelector('.vid-stage iframe.vid-player') !== frame) bad.push('leaving full screen rebuilt the player — the film restarts');
    /* AND THE EXIT TILE DOES THE SAME. */
    if (t.vidFs()) vidLetGo_(w);
    if (on()) {
      if (!t.vidFs()) bad.push('the second press of Full screen did not fill the screen again');
      else if (press('vid-unfull', '.vid-acts .tile[data-do="vid-unfull"]', 'Exit full screen tile')) {
        if (t.vidFs() || watch.classList.contains('is-fs')) bad.push('the Exit full screen tile did not leave the app\'s full screen');
      }
    }
    if (t.vidFs()) vidLetGo_(w);
    /* AND WHERE THERE IS NO TOP LAYER EITHER (Safari before 17) the one case left still says something. */
    const sp = w.HTMLElement.prototype.showPopover;
    delete w.HTMLElement.prototype.showPopover;
    toasts.length = 0;
    if (press('vid-full', '.vid-acts .tile[data-do="vid-full"]', 'Full screen tile over the clip'))
      if (t.vidFs() || !/full screen button in the player/.test(toasts.join())) bad.push('with no top layer either the tile said "' + toasts.join(' / ') + '"');
    w.HTMLElement.prototype.showPopover = sp;
    /* AND LEAVING THE COLUMN WHILE IT IS ON ENDS IT, with the film. */
    on();
  }
  w.toast = realToast;
  /* LEAVING STOPS IT: no player left in the card on a column nobody is looking at, and no full screen. */
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  if (d.querySelector('#s-stuff .vid-stage .vid-player')) bad.push('leaving the Games column left the video in its player');
  if (t.vidFs() || d.querySelector('#s-stuff .vid-watch.is-fs')) bad.push('leaving the Games column left the app\'s full screen on');
  return bad;
});

/* ---------- ONE TAP IS ONE PLAYER, WHEN THE CARD IS ALSO ON THE SAVED COLUMN § */
check('the videos card starred into Saved: one tap is one player, in the copy that was tapped', async () => {
  const rows = [
    { title: 'How volcanoes erupt', url: 'https://www.youtube.com/watch?v=abcdefghijk', kind: 'clip', tags: 'science', age: '', notes: '', active: true },
    { title: 'Volcano islands', url: 'https://www.youtube.com/watch?v=volcanoisle', kind: 'clip', tags: 'science', age: '', notes: '', active: true },
  ];
  let asked = 0;
  const { w } = boot({ before: win => {
    const f0 = win.fetch;
    win.fetch = (url, o) => {
      if (/data\/videos\.json/.test(String(url))) {
        asked++;
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(rows),
                                 text: () => Promise.resolve(JSON.stringify(rows)) });
      }
      return f0(url, o);
    };
  } });
  await wait(300);
  const t = w.__t;
  const d = w.document;
  if (!t.star) return ['the favourites are not exported'];
  /* SIGNED IN — a signed-out Saved column is one sentence, not the things kept (`savedCards_`). */
  t.USER({ name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'] });
  t.star('w:videos');
  /* AND EVERY COLUMN DRAWN AGAIN FOR THE PERSON NOW SIGNED IN, as a sign-in draws them. */
  t.repaint(true);
  await wait(50);
  t.go('reel', false, true);
  await wait(LEAVE_MS); await woken_();
  for (let n = 0; n < 150 && !(asked && d.querySelector('#s-reel #wgt-videos .vid-box .vid-q')); n++) await wait(100);
  t.go('saved', false, true);
  await wait(LEAVE_MS); await woken_();
  for (let n = 0; n < 150 && !d.querySelector('#s-saved .vid-box .vid-q'); n++) await wait(100);
  const reels = d.querySelector('#s-reel #wgt-videos .vid-box');
  const saved = d.querySelector('#s-saved .vid-box');
  if (!reels) return ['the videos card did not draw on the Reels column'];
  if (!saved) return ['the starred videos card did not draw on the Saved column, so this asks nothing'];
  const bad = [];
  const q = saved.querySelector('input.vid-q');
  q.value = 'volc';
  q.dispatchEvent(new w.Event('input', { bubbles: true }));
  const players = () => [...d.querySelectorAll('.vid-player')].map(p => (p.closest('.screen') || {}).id || '?');
  const rowsIn = box => box.querySelectorAll('.vid-results .vid-row').length;
  if (rowsIn(saved) !== 2 || rowsIn(reels) !== 2) bad.push('"volc" drew ' + rowsIn(saved) + ' result(s) on Saved and ' + rowsIn(reels) + ' on Reels — wanted both rows in both copies');
  const tap = box => {
    const r = box.querySelector('.vid-results .vid-row[data-do="vid-play"]');
    if (!r) { bad.push('there is no result to tap in the ' + (box === saved ? 'Saved' : 'Reels') + ' copy'); return false; }
    t.ACTIONS['vid-play'](r);
    return true;
  };
  const watching = (box, other, said) => {
    const p = players();
    if (p.length !== 1 || p[0] !== (box === saved ? 's-saved' : 's-reel'))
      bad.push(said + ' built ' + p.length + ' player(s), in ' + (p.join(', ') || 'none') + ' — wanted one, in the copy tapped');
    if (!box.querySelector('.vid-watch.on .vid-stage iframe.vid-player') || !box.querySelector('.vid-acts [data-do="vid-full"]'))
      bad.push(said + ': the copy tapped is not the watch view with its Full screen tile');
    if (other.querySelector('.vid-watch.on') || other.querySelector('.vid-stage').innerHTML.trim() || other.querySelector('[data-do="vid-full"]'))
      bad.push(said + ': the copy NOT tapped still draws a player, a stage or a Full screen tile');
    if (rowsIn(other) !== 2) bad.push(said + ': the copy not tapped shows ' + rowsIn(other) + ' result(s) — wanted the results for "volc"');
  };
  if (tap(saved)) watching(saved, reels, 'a tap in the Saved copy');
  /* AND A TAP IN THE OTHER COPY MOVES THE ONE PLAYER THERE. */
  if (tap(reels)) watching(reels, saved, 'then a tap in the Reels copy');
  /* AN EDIT IN EITHER COPY STOPS IT EVERYWHERE — an edit is an edit of the one search. */
  q.value = 'volca';
  q.dispatchEvent(new w.Event('input', { bubbles: true }));
  if (players().length) bad.push('an edit in the Saved copy left ' + players().join(', ') + ' playing');
  t.USER(null);
  return bad;
});

/* ---------- AND THE BEST FOUR, IN THE ORDER A PERSON WOULD WANT THEM § */
check('the videos card ranks what it finds — the title first, a row that plays before a door, then A to Z — shows four and says how many more', async () => {
  const yt = id => 'https://www.youtube.com/watch?v=' + id;
  const rows = [
    { title: 'Weather report', url: yt('weatherrep1'), kind: 'clip', tags: 'sun rain', active: true },
    { title: 'Tsunami waves', url: yt('tsunamiwave'), kind: 'clip', tags: '', active: true },
    { title: 'The sun and moon', url: 'data/reels/sun-and-moon.mp4', kind: 'clip', tags: '', active: true },
    { title: 'Sunflowers grow', url: 'https://example.org/sunflowers', kind: 'clip', tags: '', active: true },
    { title: 'Our sunny garden', url: yt('sunnygarden'), kind: 'clip', tags: '', active: true },
    { title: 'Moon landing', url: yt('moonlanding'), kind: 'clip', tags: '', notes: 'sun', active: true },
    { title: 'Sunsets explained', url: yt('sunsets0001'), kind: 'clip', tags: '', active: true },
    { title: 'Sun', url: yt('sunsunsun01'), kind: 'clip', tags: '', active: true },
  ];
  const { w } = boot({ serve: u => (/data\/videos\.json/.test(u) ? rows : undefined) });
  const { box, type, titles } = await vidCard_(w);
  if (!box) return ['the videos card did not draw on the Reels column'];
  for (let n = 0; n < 50 && box.querySelector('.loading'); n++) await wait(50);
  const bad = [];
  const more = () => ((box.querySelector('.vid-results .vid-more') || {}).textContent || '');
  const want = (q, list, line) => {
    type(q);
    if (titles().join('|') !== list.join('|')) bad.push('"' + q + '" found ' + (titles().join(' | ') || 'nothing') + ' — wanted ' + list.join(' | '));
    if (more() !== line) bad.push('"' + q + '" drew "' + more() + '" under its results — wanted "' + line + '"');
  };
  /* 0 the title; 1 its start (plays, then the door); 2 a word's start (A to Z); and four more below:
     3 inside a word, 4 the tags and the notes. */
  want('sun', ['Sun', 'Sunsets explained', 'Sunflowers grow', 'Our sunny garden'], '4 more — keep typing to narrow');
  want('SUN ', ['Sun', 'Sunsets explained', 'Sunflowers grow', 'Our sunny garden'], '4 more — keep typing to narrow');
  /* THE WHOLE TITLE BEATS A TITLE THAT ONLY STARTS WITH IT, whatever the door. */
  want('sunflowers grow', ['Sunflowers grow'], '');
  /* EVERY WORD STARTING A WORD OF THE TITLE BEATS A WORD FOUND IN THE NOTES. */
  want('moon sun', ['The sun and moon', 'Moon landing'], '');
  /* A PLURAL FINDS ITS SINGULAR, and ranks by it. */
  want('gardens', ['Our sunny garden'], '');
  /* AND THE WHOLE ORDER, PAST THE FOUR DRAWN — inside a word beats the tags and the notes, and those two
     go A to Z. Asked of `videosFound_` itself, since the card draws only the first four. */
  const order = (w.videosFound_('sun') || []).map(r => r.title);
  const full = ['Sun', 'Sunsets explained', 'Sunflowers grow', 'Our sunny garden', 'The sun and moon',
                'Tsunami waves', 'Moon landing', 'Weather report'];
  if (order.join('|') !== full.join('|')) bad.push('everything "sun" finds, in order, is ' + order.join(' | ') + ' — wanted ' + full.join(' | '));
  type('nami');
  if (titles().join() !== 'Tsunami waves') bad.push('"nami" found ' + (titles().join(' | ') || 'nothing') + ' — wanted the word it is inside');
  /* AND EXACTLY FOUR IS FOUR, WITH NO LINE. */
  type('su');
  if (titles().length !== 4 || !/^\d+ more — keep typing to narrow$/.test(more())) bad.push('"su" drew ' + titles().length + ' rows and "' + more() + '"');
  if (vidFound_(box) !== rows.length) bad.push('"su" says it found ' + vidFound_(box) + ' of the ' + rows.length + ' rows holding it');
  return bad;
});

/* ---------- A WIDGET WAITING SHOWS THE ONE LOADER, AND ONLY THAT, UNTIL WHAT IT WAITS FOR LANDS § */
check('a widget waiting on its fetch shows the one loader and nothing else, and its content replaces it', async () => {
  const bad = [];
  const one = (card, where) => {
    const ls = card ? [...card.querySelectorAll('.loading')] : [];
    if (ls.length !== 1) { bad.push(where + ' shows ' + ls.length + ' loaders, not one'); return null; }
    const l = ls[0];
    if (l.getAttribute('role') !== 'status' || l.getAttribute('aria-label') !== 'Loading') bad.push(where + '\'s loader has no role="status" / aria-label="Loading"');
    if (l.querySelectorAll(':scope > span').length !== 3) bad.push(where + '\'s loader is not three dots');
    /* NOTHING ELSE IN THE CARD SAYS IT IS WAITING — the words, the skeleton and the ellipsis that were
       there before 9 Oct. */
    const said = (card.textContent || '').replace(/\s+/g, ' ');
    if (/Loading|Looking for|Looking in|Fetching|still coming|on its way|have not arrived/i.test(said)) bad.push(where + ' still says it is waiting in words: "' + said.trim().slice(0, 80) + '"');
    if (card.querySelector('.sk-box, .is-wait, .skeleton, .spinner')) bad.push(where + ' still draws a wait of its own beside the loader');
    return l;
  };

  /* ---------- 1. THE VIDEOS CARD, WHILE ITS FILE IS OUT: THE BAR IS USABLE, AND A WORD WAITS UNDER IT § */
  const rows = [{ title: 'How volcanoes erupt', url: 'https://www.youtube.com/watch?v=abcdefghijk', kind: 'clip',
                  tags: 'science', age: '', notes: '', active: true }];
  let release = null;
  const late = new Promise(r => { release = r; });
  const a = boot({ serve: url => (/data\/videos\.json/.test(url) ? late.then(() => rows) : undefined) });
  await wait(300);
  a.w.__t.go('reel', false, true);
  await wait(LEAVE_MS); await woken_();
  /* AND TURNED TO, as a finger turns to it. § */
  const vn = a.w.__t.widgetsOf('reel').findIndex(x => String(x.id) === 'videos');
  a.w.__t.goPage('reel', vn, true);
  /* AND THE CARD ITSELF WAITED FOR, the videos journey's rule above: § */
  for (let n = 0; n < 150 && !a.w.document.querySelector('#s-reel #wgt-videos .vid-box .vid-q'); n++) await wait(100);
  await wait(50);
  const vid = a.w.document.querySelector('#s-reel #wgt-videos');
  if (!vid) return ['the videos card did not draw on the Reels column'];
  const vbox = vid.querySelector('.vid-box');
  const vq = vbox && vbox.querySelector('input.vid-q');
  if (!vq) return ['the videos card has no search box while its file is out — nothing to type into'];
  if (vid.querySelector('.loading') || vbox.getAttribute('aria-busy') || vid.getAttribute('aria-busy'))
    bad.push('with its file out and nothing typed, the videos card is veiled — the bar is for typing into from the first paint');
  const vIdle = vidIdle_(vbox);
  if (vIdle.length) bad.push('with its file out the videos card is more than the bar: ' + vIdle.join('; '));
  vq.value = 'volc';
  vq.dispatchEvent(new a.w.Event('input', { bubbles: true }));
  const l1 = one(vid, 'the videos card with its file held and a word typed');
  if (l1 && l1.parentElement !== vbox.querySelector('.vid-results'))
    bad.push('the videos card\'s loader is not where the results will be (`.vid-results`) but in ' + (l1.parentElement && l1.parentElement.className));
  if (vbox.getAttribute('aria-busy')) bad.push('a word typed while the file is out veiled the card, bar and all');
  release();
  /* POLLED, BOUNDED — the same 120ms that is always enough alone was not under four runs at once. A
     loader left on for good still fails here, five seconds later. */
  for (let n = 0; n < 50 && (vid.querySelector('.loading') || !vid.querySelector('.vid-results .vid-row')); n++) await wait(100);
  if (vid.querySelector('.loading')) bad.push('the videos file landed and the card still shows its loader');
  const got = [...vid.querySelectorAll('.vid-results .vid-row .vid-t')].map(e => e.textContent.trim());
  if (got.join() !== 'How volcanoes erupt') bad.push('the videos file landed and the results read ' + JSON.stringify(got) + ', not the one row "volc" finds');

  /* ---------- 2. OVER THE MARKUP: A COLUMN'S WIDGETS BEFORE THEY ARE STARTED § */
  const tools = a.w.document.getElementById('s-shop');
  const waiting = tools ? [...tools.querySelectorAll('.widget-slot[aria-busy="true"]')] : [];
  if (!waiting.length) bad.push('the Shop column, drawn and not started (Tools went into Find, 790), has no widget waiting under the loader');
  waiting.forEach(sl => {
    if (sl.querySelectorAll(':scope > .loading').length !== 1) bad.push('#' + sl.id + ', waiting to start, has ' + sl.querySelectorAll(':scope > .loading').length + ' loaders over it');
    if (sl.lastElementChild && !sl.lastElementChild.classList.contains('loading')) bad.push('#' + sl.id + '\'s loader is not over its markup (the last child)');
  });
  a.w.__t.findGroup('Tools');
  await wait(LEAVE_MS);
  /* EVERY WIDGET ON THE COLUMN, NOT JUST THE ONES IN VIEW — so the queue is waited for to the end, for
     longer than `woken_`'s eight seconds: a slow machine is a late start, not a loader left on. */
  for (let k = 0; k < 300 && !a.w.__t.quiet(); k++) await wait(100);
  const still = [...a.w.document.querySelectorAll('#s-stuff .widget-slot[aria-busy], #s-stuff .widget-slot > .loading')]
    .map(el => (el.closest('.widget-slot') || el).id);
  /* A WIDGET WHOSE OWN CONTENT IS STILL OUT SHOWS ITS OWN LOADER INSIDE — that is a wait, not a widget
     left unstarted; only the veil over the slot itself is asked about here. */
  if (still.length) bad.push('arriving on Tools left ' + [...new Set(still)].join(', ') + ' under the loader');
  if (!a.w.document.querySelector('#s-stuff #wgt-calculator #mc-display')) bad.push('the calculator did not start when Tools was arrived at');

  /* ---------- 3. OVER THE BOXES: THE BUSINESS RECORDS WHILE `listRecords` IS OUT ------------------------- */
  let answer = null;
  const held = new Promise(r => { answer = r; });
  const admin = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 't' };
  const b = boot({ before: win => { try { win.localStorage.setItem('familyUser', JSON.stringify(admin)); } catch (e) {} },
                   reply: body => (body.action === 'listRecords' ? held : undefined) });
  await wait(300);
  /* ON THEIR OWN COLUMN NOW, the last one (docs/history/334) — `bizStart_` fires on arriving there. */
  b.w.__t.go('biz', false, true);
  await wait(LEAVE_MS); await woken_();
  if (b.w.__t.AT() !== 'biz') return bad.concat(['go("biz") left an admin on ' + b.w.__t.AT() + ' — the records\' loader was NOT checked']);
  const card = b.w.document.querySelector('#s-biz .me-form[data-biz-page="Insurance"]');
  if (!card) return bad.concat(['an admin\'s Business column has no Insurance card']);
  const l3 = one(card, 'the Insurance card with listRecords held');
  const body = card.querySelector('.biz-body');
  if (l3 && (!body || l3.parentElement !== body || body.getAttribute('aria-busy') !== 'true')) bad.push('the records\' loader is not over the boxes (`.biz-body[aria-busy]`)');
  if (body && !body.querySelector('input[data-biz][data-k="reference"]')) bad.push('the boxes are not drawn under the loader, so the card cannot hold its size');
  answer({ success: true, records: [{ id: 'pub_liability', title: 'Public liability insurance', category: 'Insurance',
                                      provider: 'Example Insure', reference: 'PL-000000', due_on: '2030-01-01' }] });
  for (let n = 0; n < 50 && card.querySelector('.loading'); n++) await wait(100);
  await wait(50);
  if (card.querySelector('.loading') || (body && body.getAttribute('aria-busy'))) bad.push('the records came back and the Insurance card is still under the loader');
  const ref = card.querySelector('[data-biz="pub_liability"][data-k="reference"]');
  if (!ref || ref.value !== 'PL-000000') bad.push('the records came back and the box under the loader reads ' + JSON.stringify(ref && ref.value) + ', not PL-000000');
  return bad;
});

/* A WIDGET ON THE GLASS IS DRAWN, WHICHEVER COLUMN IT IS IN (docs/history/331) § */
const COLUMNS_ = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'settings', 'columns.json'), 'utf8'));
const wideBoot_ = (opts) => {
  opts = opts || {};
  return boot(Object.assign({}, opts, {
    payload: opts.payload || Object.assign(payload(), { columns: COLUMNS_ }),
    before: win => {
      let iw = 1194;
      Object.defineProperty(win, 'innerWidth', { configurable: true, get: () => iw });
      Object.defineProperty(win, 'innerHeight', { configurable: true, get: () => 827 });
      win.__width = v => { iw = v; win.dispatchEvent(new win.Event('resize')); };
      win.matchMedia = q => {
        const m = /min-width:\s*(\d+)px/.exec(String(q));
        return { matches: !!m && iw >= Number(m[1]), media: String(q), addEventListener() {}, removeEventListener() {} };
      };
      win.CSS = Object.assign({}, win.CSS, { escape: s => String(s).replace(/[^\w-]/g, c => '\\' + c) });
      /* AND THE CALCULATOR'S PARTS FOUND IN TREE ORDER, as a browser finds them. § */
      const byId = win.document.getElementById.bind(win.document);
      win.document.getElementById = id => {
        if (!/^mc-/.test(String(id))) return byId(id);
        try { return win.document.querySelector('#' + win.CSS.escape(String(id))); } catch (e) { return byId(id); }
      };
      if (typeof opts.before === 'function') opts.before(win);
    },
  }));
};
const settle_ = async () => { await wait(LEAVE_MS); await woken_(); };
/* AND WHAT A STEP IS ABOUT TO ASK, WAITED FOR — bounded, so a state that never comes still fails on what was asked. § */
const until_ = async (fn, ms) => { for (let k = 0; k < (ms || 15000) / 100; k++) { let ok = false; try { ok = fn(); } catch (e) {} if (ok) return; await wait(100); } };

