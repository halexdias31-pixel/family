/* @family. — poster.js THE POSTER PLANNER, A TOOL (547): bare bones -- a page of A0-A3, labelled boxes drawn, moved and resized, JSON and PNG out for Claude. This device only (`posterPlan`). */

/* ISO A SIZES IN MILLIMETRES, PORTRAIT. Every A size has the same shape, so the size changes the numbers handed over, not the page drawn. */
const PST_SIZES = { A0: [841, 1189], A1: [594, 841], A2: [420, 594], A3: [297, 420] };
/* THE FOUR KINDS OF BOX the owner named: what each is for is the label's job, the kind only says what goes there. */
const PST_KINDS = [['title', 'Title', 'pen'], ['text', 'Text', 'doc'], ['image', 'Image', 'photo'], ['chart', 'Chart', 'grid']];
const PST_KEY = 'posterPlan';
const PST_MIN = 0.03;   // a box no smaller than 3% of the page each way, so a stray tap does not leave a speck

/* ONE PLAN PER DEVICE: { size, orient, kind, boxes: [{ id, kind, label, x, y, w, h }] }, every position a fraction of the page. */
let PST = null;
let PST_SEL = '';
function pstFresh_() { return { size: 'A1', orient: 'portrait', kind: 'text', boxes: [] }; }
function pstLoad_() {
  if (PST) return PST;
  let got = null;
  try { got = JSON.parse(localStorage.getItem(PST_KEY) || 'null'); } catch (e) { got = null; }
  const p = pstFresh_();
  if (got && typeof got === 'object') {
    if (PST_SIZES[got.size]) p.size = got.size;
    if (got.orient === 'landscape') p.orient = 'landscape';
    if (PST_KINDS.some(k => k[0] === got.kind)) p.kind = got.kind;
    const n = v => Math.min(1, Math.max(0, Number(v) || 0));
    p.boxes = (Array.isArray(got.boxes) ? got.boxes : []).slice(0, 60).map((b, i) => ({
      id: String(b && b.id || 'b' + i), kind: PST_KINDS.some(k => k[0] === (b && b.kind)) ? b.kind : 'text',
      label: String(b && b.label || '').slice(0, 80), x: n(b && b.x), y: n(b && b.y), w: Math.max(PST_MIN, n(b && b.w)), h: Math.max(PST_MIN, n(b && b.h)) }));
  }
  PST = p;
  return PST;
}
function pstKeep_() { try { localStorage.setItem(PST_KEY, JSON.stringify(PST)); } catch (e) { /* storage blocked: the plan lives until the page goes */ } }
function pstMm_() { const s = PST_SIZES[PST.size]; return PST.orient === 'landscape' ? [s[1], s[0]] : s.slice(); }
const pstKindSay_ = k => (PST_KINDS.find(x => x[0] === k) || PST_KINDS[1])[1];

function pstBoxHtml_(b) {
  const pc = v => (v * 100).toFixed(2) + '%';
  return `<div class="pst-box pst-${esc(b.kind)}${b.id === PST_SEL ? ' on' : ''}" data-pst="${esc(b.id)}"
    style="left:${pc(b.x)};top:${pc(b.y)};width:${pc(b.w)};height:${pc(b.h)}">
    <span class="pst-kind">${esc(pstKindSay_(b.kind))}</span><span class="pst-label">${esc(b.label)}</span>
    <span class="pst-grip" data-pst-grip="${esc(b.id)}" aria-hidden="true"></span>
  </div>`;
}
function pstHtml_() {
  pstLoad_();
  const mm = pstMm_();
  const sel = PST.boxes.find(b => b.id === PST_SEL);
  const opt = (v, t, on) => `<option value="${esc(v)}"${on ? ' selected' : ''}>${esc(t)}</option>`;
  return `<div class="pst">
    <label class="pst-line"><span>Size</span><select data-pst-set="size" aria-label="Size">${Object.keys(PST_SIZES).map(k => opt(k, k, k === PST.size)).join('')}</select></label>
    <label class="pst-line"><span>Orientation</span><select data-pst-set="orient" aria-label="Orientation">${opt('portrait', 'Portrait', PST.orient === 'portrait')}${opt('landscape', 'Landscape', PST.orient === 'landscape')}</select></label>
    <p class="faint pst-say">Pick a kind, then drag on the page to draw a box. Drag a box to move it, its corner to resize it.</p>
    <div class="tile-row pst-kinds">${PST_KINDS.map(k => tile_({ icon: k[2], label: k[1], note: 'the next box drawn', act: 'pst-kind', data: { kind: k[0] }, on: PST.kind === k[0], pressed: PST.kind === k[0] })).join('')}</div>
    <div class="pst-page" style="aspect-ratio:${mm[0]} / ${mm[1]}" aria-label="${esc(PST.size + ' ' + PST.orient + ', ' + PST.boxes.length + ' boxes')}">${PST.boxes.map(pstBoxHtml_).join('')}</div>
    <p class="faint pst-mm">${esc(PST.size)} · ${mm[0]} × ${mm[1]} mm · ${PST.boxes.length} box${PST.boxes.length === 1 ? '' : 'es'}</p>
    ${sel ? `<label class="pst-line"><span>${esc(pstKindSay_(sel.kind))} box label</span><input data-pst-label="${esc(sel.id)}" maxlength="80" value="${esc(sel.label)}" placeholder="e.g. Method" autocomplete="off"></label>
    <div class="tile-row">${tile_({ icon: 'bin', label: 'Remove box', note: sel.label || pstKindSay_(sel.kind), act: 'pst-del', data: { id: sel.id } })}</div>` : ''}
    <div class="tile-row pst-out">${
      tile_({ icon: 'code', label: 'Export JSON', note: 'the layout, for Claude', act: 'pst-json', off: !PST.boxes.length })}${
      tile_({ icon: 'save', label: 'Export PNG', note: 'a picture of the layout', act: 'pst-png', off: !PST.boxes.length })}${
      tile_({ icon: 'bin', label: 'Clear', note: 'every box', act: 'pst-clear', off: !PST.boxes.length })}</div>
  </div>`;
}
function pstPaint_() { document.querySelectorAll('[id="pst-box"]').forEach(el => { el.innerHTML = pstHtml_(); }); }
function initPoster_() { pstPaint_(); }

/* ---------- THE LAYOUT HANDED OVER: millimetres from the top left, and the same as fractions, so either reading works. */
function pstExport_() {
  pstLoad_();
  const mm = pstMm_(), r = v => Math.round(v * 10) / 10;
  return { tool: 'poster-planner', paper: PST.size, orientation: PST.orient, width_mm: mm[0], height_mm: mm[1],
    note: 'Boxes are placed from the top-left corner of the page. Make a poster with this layout: each box\'s kind says what goes there and its label what it is about.',
    boxes: PST.boxes.map(b => ({ kind: b.kind, label: b.label, x_mm: r(b.x * mm[0]), y_mm: r(b.y * mm[1]), w_mm: r(b.w * mm[0]), h_mm: r(b.h * mm[1]),
      x: r(b.x * 1000) / 1000, y: r(b.y * 1000) / 1000, w: r(b.w * 1000) / 1000, h: r(b.h * 1000) / 1000 })) };
}
/* A FILE HANDED TO THE PHONE TO KEEP, for the poster and pixel tools; revoked later, as a download can start after the click returns. */
function saveBlob_(blob, name) {
  const href = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = href; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 60000);
}
/* THE PICTURE: the page in the paper tokens, each box outlined with its kind and label, 1600 px on the long side. */
function pstCanvas_() {
  const mm = pstMm_(), k = 1600 / Math.max(mm[0], mm[1]);
  const W = Math.round(mm[0] * k), H = Math.round(mm[1] * k);
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext && cv.getContext('2d');
  if (!g) return cv;
  let cs = null;
  try { cs = getComputedStyle(document.documentElement); } catch (e) { /* no styles: the system colours below */ }
  const v = (n, or) => { const s = cs && cs.getPropertyValue(n).trim(); return s || or; };
  const paper = v('--paper', 'Canvas'), ink = v('--paper-ink', 'CanvasText'), dim = v('--paper-dim', 'GrayText');
  g.fillStyle = paper; g.fillRect(0, 0, W, H);
  PST.boxes.forEach(b => {
    const x = b.x * W, y = b.y * H, w = b.w * W, h = b.h * H;
    g.strokeStyle = ink; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    g.fillStyle = dim; g.font = '600 22px sans-serif'; g.textBaseline = 'top'; g.fillText(pstKindSay_(b.kind).toUpperCase(), x + 12, y + 10, w - 24);
    g.fillStyle = ink; g.font = '700 30px sans-serif'; g.fillText(b.label || '', x + 12, y + 40, w - 24);
  });
  return cv;
}

/* ---------- DRAWING, MOVING AND RESIZING with one pointer: a drag on the page draws, on a box moves, on its corner resizes. */
let PST_DRAG = null;
document.addEventListener('pointerdown', e => {
  const page = e.target && e.target.closest ? e.target.closest('.pst-page') : null;
  if (!page) return;
  pstLoad_();
  const r = page.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const at = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  const grip = e.target.closest('[data-pst-grip]'), box = e.target.closest('[data-pst]');
  let b = null, mode = 'draw';
  if (grip) { b = PST.boxes.find(x => x.id === grip.dataset.pstGrip); mode = 'size'; }
  else if (box) { b = PST.boxes.find(x => x.id === box.dataset.pst); mode = 'move'; }
  if (!b) {
    b = { id: 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind: PST.kind, label: '', x: at.x, y: at.y, w: 0, h: 0 };
    mode = 'draw';
  }
  PST_DRAG = { page, r, mode, b, at, from: { x: b.x, y: b.y, w: b.w, h: b.h } };
  e.preventDefault();
});
document.addEventListener('pointermove', e => {
  const d = PST_DRAG;
  if (!d) return;
  const nx = Math.min(1, Math.max(0, (e.clientX - d.r.left) / d.r.width)), ny = Math.min(1, Math.max(0, (e.clientY - d.r.top) / d.r.height));
  const b = d.b, f = d.from;
  if (d.mode === 'draw') { b.x = Math.min(d.at.x, nx); b.y = Math.min(d.at.y, ny); b.w = Math.abs(nx - d.at.x); b.h = Math.abs(ny - d.at.y); }
  else if (d.mode === 'move') { b.x = Math.min(1 - f.w, Math.max(0, f.x + nx - d.at.x)); b.y = Math.min(1 - f.h, Math.max(0, f.y + ny - d.at.y)); }
  else { b.w = Math.max(PST_MIN, Math.min(1 - f.x, f.w + nx - d.at.x)); b.h = Math.max(PST_MIN, Math.min(1 - f.y, f.h + ny - d.at.y)); }
  let el = d.page.querySelector('[data-pst="' + b.id + '"]');
  if (!el && d.mode === 'draw') { d.page.insertAdjacentHTML('beforeend', pstBoxHtml_(b)); el = d.page.lastElementChild; }
  if (el) Object.assign(el.style, { left: b.x * 100 + '%', top: b.y * 100 + '%', width: b.w * 100 + '%', height: b.h * 100 + '%' });
});
function pstDrop_() {
  const d = PST_DRAG;
  if (!d) return;
  PST_DRAG = null;
  if (d.mode === 'draw') {
    /* A TAP ON THE PAGE, not a drag: nothing is drawn and the selection is let go. */
    if (d.b.w < PST_MIN || d.b.h < PST_MIN) { PST_SEL = ''; pstPaint_(); return; }
    PST.boxes.push(d.b);
  }
  PST_SEL = d.b.id;
  pstKeep_();
  pstPaint_();
}
document.addEventListener('pointerup', pstDrop_);
document.addEventListener('pointercancel', pstDrop_);

/* THE FORM'S ROWS, kept as they change: size and orientation on `change`, a box's label on every keystroke (redrawn in place, not repainted). */
document.addEventListener('change', e => {
  const s = e.target && e.target.closest ? e.target.closest('[data-pst-set]') : null;
  if (!s) return;
  pstLoad_();
  const k = s.dataset.pstSet;
  if (k === 'size' && PST_SIZES[s.value]) PST.size = s.value;
  if (k === 'orient') PST.orient = s.value === 'landscape' ? 'landscape' : 'portrait';
  pstKeep_();
  pstPaint_();
});
document.addEventListener('input', e => {
  const i = e.target && e.target.closest ? e.target.closest('[data-pst-label]') : null;
  if (!i) return;
  const b = pstLoad_().boxes.find(x => x.id === i.dataset.pstLabel);
  if (!b) return;
  b.label = String(i.value || '').slice(0, 80);
  pstKeep_();
  document.querySelectorAll('[data-pst="' + b.id + '"] .pst-label').forEach(el => { el.textContent = b.label; });
});

on('pst-kind', el => { pstLoad_().kind = el.dataset.kind; pstKeep_(); pstPaint_(); });
on('pst-del', el => { const p = pstLoad_(); p.boxes = p.boxes.filter(b => b.id !== el.dataset.id); PST_SEL = ''; pstKeep_(); pstPaint_(); });
on('pst-clear', () => { pstLoad_().boxes = []; PST_SEL = ''; pstKeep_(); pstPaint_(); });
on('pst-json', () => {
  saveBlob_(new Blob([JSON.stringify(pstExport_(), null, 2)], { type: 'application/json' }), 'poster-layout.json');
  toast('Layout saved · give poster-layout.json to Claude');
});
on('pst-png', () => {
  const cv = pstCanvas_();
  try { cv.toBlob(b => { if (b) { saveBlob_(b, 'poster-layout.png'); toast('Picture saved'); } }, 'image/png'); } catch (e) { toast('The picture could not be made here.'); }
});
