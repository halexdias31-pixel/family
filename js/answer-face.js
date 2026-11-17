/* @family. — js/answer-face.js THE ANSWER BOX'S FACES (owner, 16 Nov): text, camera, paper (owner, 17 Nov: one paper face, its grid a
   setting -- graph, lines or blank). A tile swaps which face fills the box's
   one slot, where the text box stood, the same width and place; nothing opens over the page (rule: nothing opens over the app). */

/* ---------- THE ONE SWAP: every face goes in and out of a box through `ansFace_`, so no tool draws a sheet of its own. */
/* `open(el, k, box)` fills a face made empty in the slot; `close(el)` lets go of what it holds (a camera stream) before it goes. */
const ANS_FACES = {};
/* THE SLOT: the typed box's row (or several boxes'), an essay's sheet; a box drawn without one takes the face at its top. */
const ansSlot_ = box => (box && box.querySelector(':scope > .qp-ans-row, :scope > .qp-sheet')) || null;
const ansFaceOf_ = box => (box && box.querySelector(':scope > .qp-face')) || null;
function ansFace_(box, face, k, o) {
  if (!box) return null;
  const was = ansFaceOf_(box);
  if (was) {
    const f = ANS_FACES[was.getAttribute('data-face')];
    try { if (f && f.close) f.close(was); } catch (e) { /* the face goes all the same */ }
    was.remove();
  }
  const slot = ansSlot_(box);
  if (!face || face === 'text' || !ANS_FACES[face]) { if (slot) slot.hidden = false; return null; }
  const el = document.createElement('div');
  el.className = 'qp-face qp-face-' + face;
  el.setAttribute('data-face', face);
  el.setAttribute('data-k', k || '');
  Object.keys(o || {}).forEach(a => el.setAttribute('data-' + a, o[a]));
  if (slot) { slot.hidden = true; slot.insertAdjacentElement('afterend', el); } else box.insertAdjacentElement('afterbegin', el);
  ANS_FACES[face].open(el, k || '', box);
  return el;
}
/* BACK TO THE TEXT FACE, from any face's Back tile -- a pick by hand, kept over the question's own default */
on('qp-face-text', el => { const f = el.closest('.qp-face'); if (f && f.getAttribute('data-face') === 'paper') ansFacePick_(f.getAttribute('data-k'), 'text');
  ansFace_(el.closest('.qp-mark'), 'text'); });

/* ---------- WHICH FACE A BOX SHOWS: the one the student picked by hand (the part's record, `face`), else the question's own
   (`face` on its row: text, graph, lines or blank -- kinds.json question `shape`), else text. A camera is never a default: it asks for the camera. */
const ansFacePick_ = (k, f) => partRecPutAt_(partKeyOfAns_(k), 'face', f);
function ansFaceWant_(x) {
  const own = partRecAt_(partKeyOfAns_(ansKey_(x))).face;
  const want = own || norm(x.face || (x.row && x.row.face));
  return PAPER_GRIDS.some(p => p.id === want) ? want : 'text';
}
/* A CARD DRAWN (again) gets its box's face back: asked by its tile row as it is drawn (`qtTiles_`), applied once the markup is in. */
const ANS_FACE_DUE = new Set();
function ansFaceDue_(x) {
  if (!x || !x.key || ansFaceWant_(x) === 'text') return;
  if (!ANS_FACE_DUE.size) setTimeout(ansFacesApply_, 0);
  ANS_FACE_DUE.add(x.key);
}
function ansFacesApply_() {
  const keys = [...ANS_FACE_DUE];
  ANS_FACE_DUE.clear();
  keys.forEach(key => {
    const x = qtItem_(key);
    if (!x) return;
    [...document.querySelectorAll('.qcard [data-key]')].filter(t => t.getAttribute('data-key') === key).forEach(t => {
      const box = qMark_(t);
      if (box && !ansFaceOf_(box)) paperOpen_(box, x, ansFaceWant_(x));
    });
  });
}

/* ---------- THE CAMERA FACE: the rear camera live in the slot, a shutter and a back tile. The stream is never kept: each shot
   becomes a page through `workShrink_` into `WORK_PICS` (working.js), exactly where a picked photo goes. */
const CAM = { stream: null, el: null, timer: 0, refused: '' };
function camStop_() {
  if (CAM.stream) CAM.stream.getTracks().forEach(t => { try { t.stop(); } catch (e) { /* already stopped */ } });
  const v = CAM.el && CAM.el.querySelector('video');
  if (v) v.srcObject = null;
  if (CAM.timer) clearInterval(CAM.timer);
  CAM.stream = null; CAM.el = null; CAM.timer = 0;
}
/* WHY THERE IS NO LIVE CAMERA, said once with `tell_`; the phone's own picker is used instead */
function camWhy_(e) {
  const n = e && e.name;
  if (n === 'NotAllowedError' || n === 'SecurityError') return 'The camera was not allowed — choose or take a photo instead';
  if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'No camera was found — choose a photo instead';
  return 'The camera could not start — choose or take a photo instead';
}
const camRoom_ = k => WORK_MAX - (WORK_PICS[k] || []).length;
ANS_FACES.camera = {
  open(el, k) {
    el.innerHTML = fcG_('p', 'qp-face-say', { role: 'status', 'aria-live': 'polite' }, '', '')
      + fcG_('div', 'tile-row qp-face-tiles', null, tile_([
        { icon: 'photo', label: 'Take photo', note: camRoom_(k) + ' of ' + WORK_MAX + ' pages left', act: 'qp-cam-shot', data: { k } },
        { icon: 'left', label: 'Back', note: 'to typing', act: 'qp-face-text' }]));
    const v = document.createElement('video');
    v.className = 'qp-cam-view';
    v.setAttribute('aria-label', 'Camera');
    v.setAttribute('playsinline', '');
    v.muted = true; v.autoplay = true; v.playsInline = true;
    el.insertAdjacentElement('afterbegin', v);
    camStop_();
    CAM.el = el;
    /* LEAVING THE CARD (drawn again, the page moved on) stops it: a face no longer on the page holds no camera */
    CAM.timer = setInterval(() => { if (CAM.el && !CAM.el.isConnected) camStop_(); }, 1000);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(s => {
      if (CAM.el !== el || !el.isConnected) { s.getTracks().forEach(t => t.stop()); return; }
      CAM.stream = s;
      v.srcObject = s;
      const p = v.play && v.play();
      if (p && p.catch) p.catch(() => {});
    }).catch(e => { CAM.refused = camWhy_(e); camFallback_(el.closest('.qp-mark'), k, CAM.refused); });
  },
  close(el) { if (CAM.el === el) camStop_(); },
};
/* NO LIVE CAMERA: back to the text face, the reason said, and the picker working.js has always had */
function camFallback_(box, k, why) {
  ansFace_(box, 'text');
  tell_(null, 'info', why);
  workPick_(k);
}
/* THE SHUTTER: the frame drawn once to a canvas, made a JPEG, and handed on as a picked photo would be */
on('qp-cam-shot', el => {
  const face = el.closest('.qp-face'), k = el.getAttribute('data-k') || '';
  const v = face && face.querySelector('video');
  const say = face && face.querySelector('.qp-face-say');
  if (!v || !CAM.stream || !(v.videoWidth > 0)) { tell_(say, 'info', 'The camera is still starting'); return; }
  if (camRoom_(k) <= 0) { ansFace_(face.closest('.qp-mark'), 'text'); return; }
  const c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
  tell_(say, 'busy', 'Saving the page…');
  c.toBlob(b => {
    if (!b) { tell_(say, 'error', 'That photo could not be made — try again'); return; }
    workAdd_(k, [b]).then(() => {
      const left = camRoom_(k);
      /* THE LAST PAGE ALLOWED: the camera stops and the box is a text box again */
      if (left <= 0) { ansFace_(face.closest('.qp-mark'), 'text'); return; }
      tell_(say, 'saved', 'Page taken — ' + left + ' more allowed');
    });
  }, 'image/jpeg', 0.9);
});
/* PAGE HIDDEN: the camera stops and its face goes back to typing */
const camAway_ = () => { if (CAM.el) { const box = CAM.el.closest('.qp-mark'); camStop_(); if (box) ansFace_(box, 'text'); } };
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') camAway_(); });
window.addEventListener('pagehide', camAway_);
/* THE CAMERA TILE (`qp-work`): the live face where the device has one and has not refused it; the picker otherwise. */
function camOpen_(el, k) {
  const box = qMark_(el);
  const live = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  if (!box || !live || CAM.refused) {
    tell_(null, 'info', CAM.refused || (box ? 'This device has no live camera here — choose or take a photo instead' : ''));
    return workPick_(k);
  }
  const was = ansFaceOf_(box);
  if (was && was.getAttribute('data-face') === 'camera') return ansFace_(box, 'text');
  ansFace_(box, 'camera', k);
}

/* ---------- THE PAPER FACE (owner, 17 Nov): one face in the slot, its grid a setting -- graph (axes you set; tap a crossing for a point,
   join two, shade a square: N-20261115-g1), lines, or blank. Every pen tool draws on it through the one drawing layer, the pad
   (`padWrap_`, find-cells.js: pen, straight line, compass, protractor, Undo, Clear), under its own `pad:` key; the graph's points
   stay in the part's one record (`partRec_`, field `graph`), as they always were. */
const PAPER_GRIDS = [{ id: 'graph', icon: 'grid', label: 'Graph' }, { id: 'lines', icon: 'doc', label: 'Lines' }, { id: 'blank', icon: 'figure', label: 'Blank' }];
/* THE PEN TOOLS ON PAPER: the tool row's own acts and names (qtools.js `QT_TOOLS`), so a tile here and one in the row are one tool */
const PAPER_PENS = ['pen', 'line', 'compass', 'protractor'];
const GRAPH_SPAN = 20, GRAPH_SIZE = 340, GRAPH_M = 24;
const GRAPH_MODES = [{ id: 'point', icon: 'spot', label: 'Point' }, { id: 'join', icon: 'line', label: 'Join' }, { id: 'shade', icon: 'full', label: 'Shade' }];
const GRAPH_MODE = new Map(), GRAPH_PICK = new Map(), GRAPH_UNDO = new Map();
const graphBlank_ = () => ({ ax: { x0: -5, x1: 5, y0: -5, y1: 5 }, pts: [], lines: [], shade: [] });
const graphRecKey_ = k => partKeyOfAns_(k);
function graphRead_(k) {
  const g = partRecAt_(graphRecKey_(k)).graph;
  const b = graphBlank_();
  if (!g || typeof g !== 'object') return b;
  return { ax: Object.assign(b.ax, g.ax || {}), pts: Array.isArray(g.pts) ? g.pts : [], lines: Array.isArray(g.lines) ? g.lines : [], shade: Array.isArray(g.shade) ? g.shade : [] };
}
function graphPut_(k, g) {
  const empty = !g.pts.length && !g.lines.length && !g.shade.length;
  const ax = g.ax, b = graphBlank_().ax;
  const same = ax.x0 === b.x0 && ax.x1 === b.x1 && ax.y0 === b.y0 && ax.y1 === b.y1;
  partRecPutAt_(graphRecKey_(k), 'graph', empty && same ? null : g);
}
/* AXES KEPT SANE: whole numbers, min below max, at most GRAPH_SPAN squares a side */
function graphAxes_(ax) {
  const n = (v, d) => { const x = Math.round(Number(v)); return isFinite(x) ? x : d; };
  let x0 = n(ax.x0, -5), x1 = n(ax.x1, 5), y0 = n(ax.y0, -5), y1 = n(ax.y1, 5);
  if (x1 <= x0) x1 = x0 + 1; if (y1 <= y0) y1 = y0 + 1;
  x1 = Math.min(x1, x0 + GRAPH_SPAN); y1 = Math.min(y1, y0 + GRAPH_SPAN);
  return { x0, x1, y0, y1 };
}
/* WHERE A GRAPH POINT SITS IN THE PICTURE, and back */
function graphScale_(ax) {
  const nx = ax.x1 - ax.x0, ny = ax.y1 - ax.y0, S = (GRAPH_SIZE - 2 * GRAPH_M) / Math.max(nx, ny);
  return { S, px: x => GRAPH_M + (x - ax.x0) * S, py: y => GRAPH_M + (ax.y1 - y) * S, W: 2 * GRAPH_M + nx * S, H: 2 * GRAPH_M + ny * S };
}
const ptSame_ = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
/* THE PICTURE, in the figures' own drawing nodes (`figDraw_`) and their `grid`/`axis`/`ax` looks */
function graphSvg_(g, pick) {
  const ax = g.ax, T = graphScale_(ax), out = [];
  g.shade.forEach(c => out.push({ el: 'rect', a: { class: 'qp-graph-shade', x: T.px(c[0]), y: T.py(c[1] + 1), width: T.S, height: T.S } }));
  for (let x = ax.x0; x <= ax.x1; x++) out.push({ el: 'line', a: { class: 'grid', x1: T.px(x), y1: T.py(ax.y0), x2: T.px(x), y2: T.py(ax.y1) } });
  for (let y = ax.y0; y <= ax.y1; y++) out.push({ el: 'line', a: { class: 'grid', x1: T.px(ax.x0), y1: T.py(y), x2: T.px(ax.x1), y2: T.py(y) } });
  const minus = n => (n < 0 ? '−' + (-n) : String(n));
  if (ax.y0 <= 0 && ax.y1 >= 0) out.push({ el: 'line', a: { class: 'axis', x1: T.px(ax.x0), y1: T.py(0), x2: T.px(ax.x1), y2: T.py(0) } });
  if (ax.x0 <= 0 && ax.x1 >= 0) out.push({ el: 'line', a: { class: 'axis', x1: T.px(0), y1: T.py(ax.y0), x2: T.px(0), y2: T.py(ax.y1) } });
  const yLab = Math.min(T.H - 4, Math.max(14, T.py(Math.max(ax.y0, Math.min(0, ax.y1))) + 14));
  const xLab = Math.max(GRAPH_M - 4, T.px(Math.max(ax.x0, Math.min(0, ax.x1))) - 4);
  const every = Math.max(1, Math.ceil(Math.max(ax.x1 - ax.x0, ax.y1 - ax.y0) / 10));
  for (let x = ax.x0; x <= ax.x1; x += every) out.push({ el: 'text', a: { class: 'ax', x: T.px(x), y: yLab, 'text-anchor': 'middle' }, text: minus(x) });
  for (let y = ax.y0; y <= ax.y1; y += every) if (y) out.push({ el: 'text', a: { class: 'ax', x: xLab, y: T.py(y) + 4, 'text-anchor': 'end' }, text: minus(y) });
  g.lines.forEach(l => out.push({ el: 'line', a: { class: 'qp-graph-line', x1: T.px(l[0][0]), y1: T.py(l[0][1]), x2: T.px(l[1][0]), y2: T.py(l[1][1]) } }));
  g.pts.forEach(p => out.push({ el: 'circle', a: { class: 'qp-graph-pt' + (ptSame_(p, pick) ? ' is-picked' : ''), cx: T.px(p[0]), cy: T.py(p[1]), r: 6 } }));
  return figDraw_({ el: 'svg', a: { class: 'qp-graph-svg', viewBox: '0 0 ' + T.W + ' ' + T.H, role: 'img', 'aria-label': 'Graph: ' + graphSay_(g) }, kids: out });
}
const graphSay_ = g => g.pts.length + ' points, ' + g.lines.length + ' lines, ' + g.shade.length + ' squares shaded';
/* THE PAPER'S PAD: the part's own key with `~paper`, so a figure's pad and the paper under the same part keep their marks apart */
const paperItem_ = key => ({ key: key + '~paper' });
function paperPaint_(el, k) {
  const grid = el.getAttribute('data-grid') || 'graph', key = el.getAttribute('data-key') || '', graph = grid === 'graph';
  const g = graph ? graphRead_(k) : null, mode = GRAPH_MODE.get(k) || 'point';
  const field = (n, v) => cardBlock_({ type: 'group', tag: 'label', look: 'qp-graph-ax', text: n + ' ', blocks: [{ type: 'control', tag: 'input',
    attrs: { type: 'text', inputmode: 'numeric', 'data-ax': n.replace(/ /g, ''), value: String(v), size: 3, autocomplete: 'off', 'aria-label': n } }] });
  const pens = PAPER_PENS.map(qtTool_).filter(Boolean).map(t => ({ icon: t.icon, label: t.label, note: t.note, act: t.act, cls: 'qt-t', data: { tool: t.id, key } }));
  el.innerHTML = fcG_('div', 'tile-row qp-face-tiles qp-paper-grids', { role: 'toolbar', 'aria-label': 'Paper' }, tile_(PAPER_GRIDS.map(p =>
      ({ icon: p.icon, label: p.label, act: 'qp-paper-grid', on: grid === p.id, pressed: grid === p.id, data: { k, grid: p.id } }))))
    + (graph ? fcG_('div', 'qp-graph-axes', null, field('x min', g.ax.x0) + field('x max', g.ax.x1) + field('y min', g.ax.y0) + field('y max', g.ax.y1)) : '')
    + fcG_('div', 'qp-paper-art' + (graph ? ' qp-graph-art' : ''), { 'data-k': k }, padWrap_(paperItem_(key), graph ? graphSvg_(g, GRAPH_PICK.get(k)) : surfaceSvg_(grid)))
    + fcG_('p', 'qp-face-say', { role: 'status', 'aria-live': 'polite' }, '', graph ? graphSay_(g) : '')
    + fcG_('div', 'tile-row qp-face-tiles', null, tile_((graph ? GRAPH_MODES.map(m => ({ icon: m.icon, label: m.label, act: 'qp-graph-mode', on: mode === m.id, pressed: mode === m.id, data: { k, mode: m.id } }))
      .concat([{ icon: 'undo', label: 'Undo', note: 'the last point', act: 'qp-graph-undo', data: { k }, off: !(GRAPH_UNDO.get(k) || []).length },
        { icon: 'bin', label: 'Clear', note: 'the graph', act: 'qp-graph-clear', data: { k } }]) : [])
      .concat(pens, [{ icon: 'left', label: 'Back', note: 'to typing', act: 'qp-face-text' }])));
  if (!graph) return;
  el.querySelectorAll('input[data-ax]').forEach(inp => inp.addEventListener('change', () => graphAxSet_(el, k)));
  /* A TAP ON THE GRAPH, through the pad's ink above it: the graph's while no pen tool is in hand, the pen's while one is */
  const art = el.querySelector('.qpad-art'), pk = padKey_(paperItem_(key));
  if (art) art.addEventListener('click', e => { if (PAD_ON !== pk) graphTap_(el, k, e); });
}
function graphKeep_(el, k, g) {
  const u = GRAPH_UNDO.get(k) || [];
  u.push(JSON.stringify(graphRead_(k)));
  GRAPH_UNDO.set(k, u.slice(-50));
  graphPut_(k, g);
  paperPaint_(el, k);
}
function graphAxSet_(el, k) {
  const g = graphRead_(k), v = n => (el.querySelector('input[data-ax="' + n + '"]') || {}).value;
  g.ax = graphAxes_({ x0: v('xmin'), x1: v('xmax'), y0: v('ymin'), y1: v('ymax') });
  const inX = p => p[0] >= g.ax.x0 && p[0] <= g.ax.x1 && p[1] >= g.ax.y0 && p[1] <= g.ax.y1;
  g.pts = g.pts.filter(inX); g.lines = g.lines.filter(l => inX(l[0]) && inX(l[1]));
  g.shade = g.shade.filter(c => c[0] >= g.ax.x0 && c[0] < g.ax.x1 && c[1] >= g.ax.y0 && c[1] < g.ax.y1);
  graphKeep_(el, k, g);
}
/* A TAP ON THE GRID: nearest crossing for Point and Join, the square under it for Shade */
function graphTap_(el, k, e) {
  const svg = el.querySelector('.qp-graph-svg'), r = svg && svg.getBoundingClientRect(), g = graphRead_(k), T = graphScale_(g.ax);
  if (!r) return;
  if (!(r.width > 0)) return;
  const vx = (e.clientX - r.left) * T.W / r.width, vy = (e.clientY - r.top) * T.H / r.height;
  const gx = g.ax.x0 + (vx - GRAPH_M) / T.S, gy = g.ax.y1 - (vy - GRAPH_M) / T.S;
  const mode = GRAPH_MODE.get(k) || 'point';
  if (mode === 'shade') {
    const c = [Math.floor(gx), Math.floor(gy)];
    if (c[0] < g.ax.x0 || c[0] >= g.ax.x1 || c[1] < g.ax.y0 || c[1] >= g.ax.y1) return;
    const i = g.shade.findIndex(s => ptSame_(s, c));
    if (i === -1) g.shade.push(c); else g.shade.splice(i, 1);
    return graphKeep_(el, k, g);
  }
  const p = [Math.round(gx), Math.round(gy)];
  if (p[0] < g.ax.x0 || p[0] > g.ax.x1 || p[1] < g.ax.y0 || p[1] > g.ax.y1) return;
  const at = g.pts.findIndex(q => ptSame_(q, p));
  if (mode === 'point') {
    if (at === -1) g.pts.push(p); else { g.pts.splice(at, 1); g.lines = g.lines.filter(l => !ptSame_(l[0], p) && !ptSame_(l[1], p)); }
    return graphKeep_(el, k, g);
  }
  /* JOIN: the first point tapped is held, the second draws the line; a crossing with no point gets one */
  if (at === -1) g.pts.push(p);
  const held = GRAPH_PICK.get(k);
  if (!held || ptSame_(held, p)) { GRAPH_PICK.set(k, held ? null : p); return at === -1 ? graphKeep_(el, k, g) : paperPaint_(el, k); }
  GRAPH_PICK.delete(k);
  if (!g.lines.some(l => (ptSame_(l[0], held) && ptSame_(l[1], p)) || (ptSame_(l[1], held) && ptSame_(l[0], p)))) g.lines.push([held, p]);
  graphKeep_(el, k, g);
}
ANS_FACES.paper = { open(el, k) { paperPaint_(el, k); }, close() {} };
/* THE PAPER OPENED ON A BOX, on the grid asked for (else the one last used on this part, else graph) */
function paperOpen_(box, x, grid) {
  const k = ansKey_(x);
  graphCheckWrap_();
  const was = partRecAt_(partKeyOfAns_(k)).face;
  const g = PAPER_GRIDS.some(p => p.id === grid) ? grid : PAPER_GRIDS.some(p => p.id === was) ? was : 'graph';
  return ansFace_(box, 'paper', k, { grid: g, key: x.key });
}
/* THE PAPER TILE (`qp-paper`): opens the paper, or back to typing when it is open -- either way the student's pick, kept */
on('qp-paper', el => {
  const box = qMark_(el), x = qtItem_(el.getAttribute('data-key') || '');
  if (!box || !x) { tell_(null, 'info', 'This part has no answer box to draw in'); return; }
  const was = ansFaceOf_(box);
  if (was && was.getAttribute('data-face') === 'paper') { ansFacePick_(ansKey_(x), 'text'); return ansFace_(box, 'text'); }
  const f = paperOpen_(box, x);
  ansFacePick_(ansKey_(x), f.getAttribute('data-grid'));
});
/* THE GRID IS A SETTING: the same face drawn again on graph, lines or blank paper, and kept as the student's pick */
on('qp-paper-grid', el => {
  const f = el.closest('.qp-face'), grid = el.getAttribute('data-grid');
  if (!f || !PAPER_GRIDS.some(p => p.id === grid)) return;
  f.setAttribute('data-grid', grid);
  ansFacePick_(f.getAttribute('data-k'), grid);
  paperPaint_(f, f.getAttribute('data-k'));
});
/* A PEN TOOL WITH NOTHING TO DRAW ON (no figure, no surface): the paper opens in the answer box and the tool is laid on its pad */
function paperPadPick_(card, key, tool) {
  const x = qtItem_(key), box = card && qMark_(card);
  if (!x || !box) return null;
  let f = ansFaceOf_(box);
  if (!f || f.getAttribute('data-face') !== 'paper') { f = paperOpen_(box, x, 'blank'); ansFacePick_(ansKey_(x), 'blank'); }
  const pad = f && f.querySelector('.qpad');
  if (pad) padToolPick_(pad, tool || 'pen');
  return pad;
}
const graphFaceOf_ = el => el.closest('.qp-face-paper');
/* A GRAPH TOOL TAKEN UP PUTS THE PEN DOWN, so the next tap is the graph's */
on('qp-graph-mode', el => { const k = el.getAttribute('data-k'), f = graphFaceOf_(el), pad = f && f.querySelector('.qpad');
  if (pad && PAD_ON === pad.getAttribute('data-k')) { padArm_(pad, false); PAD_ON = ''; padDrop_(); }
  GRAPH_MODE.set(k, el.getAttribute('data-mode')); GRAPH_PICK.delete(k); paperPaint_(f, k); });
on('qp-graph-undo', el => {
  const k = el.getAttribute('data-k'), u = GRAPH_UNDO.get(k) || [];
  if (!u.length) return;
  graphPut_(k, JSON.parse(u.pop()));
  paperPaint_(graphFaceOf_(el), k);
});
on('qp-graph-clear', el => { const k = el.getAttribute('data-k'), g = graphRead_(k); GRAPH_PICK.delete(k); graphKeep_(graphFaceOf_(el), k, Object.assign(g, { pts: [], lines: [], shade: [] })); });

/* ---------- MARKED BY RULE, NEVER AI: where the part's key names points, lines or shaded squares (`graph_answer`), the one Check
   compares the drawing with them; with no such key it only saves. No second button, no AI fallback. */
/* THE KEY: "points: (1,2) (3,-4); lines: (1,2)-(3,-4); shade: (0,0) (1,0)" -- a square named by its bottom-left corner. */
function graphKeyOf_(x) {
  const raw = String((x && (x.graphAnswer || (x.row && x.row.graph_answer))) || '').trim();
  if (!raw) return null;
  const pairs = s => [...String(s || '').matchAll(/\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g)].map(m => [Number(m[1]), Number(m[2])]);
  const part = name => (new RegExp(name + '\\s*:([^;]*)', 'i').exec(raw) || [])[1] || '';
  const lines = part('lines').match(/\([^)]*\)\s*-\s*\([^)]*\)/g) || [];
  const key = { pts: pairs(part('points')), lines: lines.map(pairs).filter(l => l.length === 2), shade: pairs(part('shade')) };
  return key.pts.length || key.lines.length || key.shade.length ? key : null;
}
const ptName_ = p => p[0] + ',' + p[1];
const lineName_ = l => [ptName_(l[0]), ptName_(l[1])].sort().join('|');
/* WHAT IS RIGHT, what is missing and what is extra, by set: each of the key's items one share of the marks, each extra takes one back */
function graphMark_(x, g) {
  const key = graphKeyOf_(x);
  if (!key) return null;
  let want = 0, hit = 0, extra = 0;
  [['pts', ptName_], ['lines', lineName_], ['shade', ptName_]].forEach(([f, n]) => {
    if (!key[f].length) return;
    const a = new Set(key[f].map(n)), b = new Set((g[f] || []).map(n));
    want += a.size;
    b.forEach(v => { if (a.has(v)) hit++; else extra++; });
  });
  const marks = Number(x.marks) || 1;
  const got = Math.max(0, Math.round(marks * Math.max(0, hit - extra) / Math.max(1, want)));
  return { got, marks, right: hit === want && !extra };
}
/* EVERY CHECK ACT, wrapped once: while graph paper shows, the Check is the graph's (rule or save); otherwise it goes on as it always has. */
function graphCheck_(el) {
  const box = qMark_(el), face = box && ansFaceOf_(box);
  if (!face || face.getAttribute('data-face') !== 'paper' || face.getAttribute('data-grid') !== 'graph') return false;
  const x = qtItem_(face.getAttribute('data-key') || '');
  const k = face.getAttribute('data-k') || '', g = graphRead_(k);
  const m = x && graphMark_(x, g);
  /* NO RULE, NO MARK (owner, 16 Nov: AI marking is going): the graph is saved, and the line says so -- never sent to the AI */
  if (!m) { graphPut_(k, g); tell_(box.querySelector('.qp-verdict'), 'saved', 'Saved — this graph has no rule to mark it by'); return true; }
  tell_(box.querySelector('.qp-verdict'), m.right ? 'saved' : 'error', m.got + ' of ' + m.marks + ' — marked by its rule' + (m.right ? '' : '; check your points, lines and shading'));
  return true;
}
/* WRAPPED WHEN A PAPER FACE FIRST OPENS, not at load: the files that register the Check acts may load after this one. */
const GRAPH_CHECK_ACTS = ['qp-check', 'qp-noscheme', 'qp-cells-check', 'pad-check'];
function graphCheckWrap_() {
  GRAPH_CHECK_ACTS.forEach(act => {
    const was = ACTIONS[act];
    if (was && was.graphWrapped) return;
    const fn = function (el) { if (graphCheck_(el)) return; if (was) return was.apply(this, arguments); };
    fn.graphWrapped = true;
    ACTIONS[act] = fn;
  });
}
