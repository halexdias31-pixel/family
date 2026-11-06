/* @family. — pixel.js THE PIXEL EDITOR, A TOOL (547): bare bones -- a grid, a colour, pen or eraser, Clear and a PNG. This device only (`pixelArt`). */

/* THREE GRID SIZES, square. The owner asked for bare bones (30 Oct): nothing past what coddy's maker has at its plainest. */
const PXE_SIZES = [8, 16, 32];
const PXE_KEY = 'pixelArt';
/* ONE PICTURE PER DEVICE: { n, colour, tool, px: ['' | '#rrggbb', ...] } row by row; '' is see-through. */
let PXE = null;
const pxeHex_ = v => (/^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v).toLowerCase() : '');
function pxeLoad_() {
  if (PXE) return PXE;
  let got = null;
  try { got = JSON.parse(localStorage.getItem(PXE_KEY) || 'null'); } catch (e) { got = null; }
  const n = got && PXE_SIZES.indexOf(Number(got.n)) >= 0 ? Number(got.n) : 16;
  const px = new Array(n * n).fill('');
  if (got && Array.isArray(got.px)) got.px.slice(0, n * n).forEach((c, i) => { px[i] = pxeHex_(c); });
  PXE = { n, colour: pxeHex_(got && got.colour) || '#000000', tool: got && got.tool === 'eraser' ? 'eraser' : 'pen', px };
  return PXE;
}
function pxeKeep_() { try { localStorage.setItem(PXE_KEY, JSON.stringify(PXE)); } catch (e) { /* storage blocked: the picture lives until the page goes */ } }

function pxeHtml_() {
  pxeLoad_();
  const cells = PXE.px.map((c, i) => `<span class="pxe-c" data-pxe="${i}"${c ? ` style="background:${c}"` : ''}></span>`).join('');
  return `<div class="pxe">
    <label class="pxe-line"><span>Grid</span><select data-pxe-set="n" aria-label="Grid">${PXE_SIZES.map(s => `<option value="${s}"${s === PXE.n ? ' selected' : ''}>${s} × ${s}</option>`).join('')}</select></label>
    <label class="pxe-line"><span>Colour</span><input type="color" data-pxe-set="colour" value="${esc(PXE.colour)}" aria-label="Colour"></label>
    <div class="tile-row">${
      tile_({ icon: 'pen', label: 'Pen', note: 'paints a square', act: 'pxe-tool', data: { tool: 'pen' }, on: PXE.tool === 'pen', pressed: PXE.tool === 'pen' })}${
      tile_({ icon: 'close', label: 'Eraser', note: 'clears a square', act: 'pxe-tool', data: { tool: 'eraser' }, on: PXE.tool === 'eraser', pressed: PXE.tool === 'eraser' })}${
      tile_({ icon: 'bin', label: 'Clear', note: 'every square', act: 'pxe-clear' })}${
      tile_({ icon: 'save', label: 'Export PNG', note: 'the picture', act: 'pxe-png' })}</div>
    <div class="pxe-grid" style="grid-template-columns:repeat(${PXE.n}, 1fr)" aria-label="${esc(PXE.n + ' by ' + PXE.n + ' grid')}">${cells}</div>
  </div>`;
}
function pxePaint_() { document.querySelectorAll('[id="pxe-box"]').forEach(el => { el.innerHTML = pxeHtml_(); }); }
function initPixel_() { pxePaint_(); }

/* THE PICTURE, one PNG pixel per square times a whole number, so it stays sharp: 512 px a side; see-through squares stay see-through. */
function pxeCanvas_() {
  pxeLoad_();
  const k = Math.floor(512 / PXE.n), cv = document.createElement('canvas');
  cv.width = cv.height = k * PXE.n;
  const g = cv.getContext && cv.getContext('2d');
  if (!g) return cv;
  PXE.px.forEach((c, i) => { if (c) { g.fillStyle = c; g.fillRect((i % PXE.n) * k, Math.floor(i / PXE.n) * k, k, k); } });
  return cv;
}

/* ---------- PAINTING: a press paints the square under it, and a drag paints every square it crosses (the grid takes the drag, never the column). */
let PXE_DOWN = false;
function pxeAt_(e) {
  const hit = (document.elementFromPoint && document.elementFromPoint(e.clientX, e.clientY)) || e.target;
  const c = hit && hit.closest ? hit.closest('[data-pxe]') : null;
  if (!c) return;
  const i = Number(c.dataset.pxe), v = PXE.tool === 'eraser' ? '' : PXE.colour;
  if (PXE.px[i] === v) return;
  PXE.px[i] = v;
  c.style.background = v;
}
document.addEventListener('pointerdown', e => {
  if (!(e.target && e.target.closest && e.target.closest('.pxe-grid'))) return;
  pxeLoad_();
  PXE_DOWN = true;
  e.preventDefault();
  pxeAt_(e);
});
document.addEventListener('pointermove', e => { if (PXE_DOWN) pxeAt_(e); });
function pxeUp_() { if (!PXE_DOWN) return; PXE_DOWN = false; pxeKeep_(); }
document.addEventListener('pointerup', pxeUp_);
document.addEventListener('pointercancel', pxeUp_);

/* THE FORM'S TWO ROWS: a new grid size starts a blank picture of that size; the colour is kept as it is picked. */
document.addEventListener('change', e => {
  const s = e.target && e.target.closest ? e.target.closest('[data-pxe-set]') : null;
  if (!s) return;
  pxeLoad_();
  if (s.dataset.pxeSet === 'n' && PXE_SIZES.indexOf(Number(s.value)) >= 0 && Number(s.value) !== PXE.n) {
    PXE.n = Number(s.value); PXE.px = new Array(PXE.n * PXE.n).fill(''); pxeKeep_(); pxePaint_(); return;
  }
  if (s.dataset.pxeSet === 'colour' && pxeHex_(s.value)) { PXE.colour = pxeHex_(s.value); PXE.tool = 'pen'; pxeKeep_(); pxePaint_(); }
});

on('pxe-tool', el => { pxeLoad_().tool = el.dataset.tool === 'eraser' ? 'eraser' : 'pen'; pxeKeep_(); pxePaint_(); });
on('pxe-clear', () => { const p = pxeLoad_(); p.px = new Array(p.n * p.n).fill(''); pxeKeep_(); pxePaint_(); });
on('pxe-png', () => {
  const cv = pxeCanvas_();
  try {
    cv.toBlob(b => { if (b) { saveBlob_(b, 'pixel-art-' + PXE.n + 'x' + PXE.n + '.png'); toast('Picture saved'); } }, 'image/png');
  } catch (e) { toast('The picture could not be made here.'); }
});
