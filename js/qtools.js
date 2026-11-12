/* @family. — qtools.js THE ONE TOOL ROW (round 3, the owner's design): every tool on every question part, in one
   place and one order; only the marker varies. The page is words, figure, options, one answer box, this row, the verdict. */

/* ---------- THE REGISTRY: what each tool is called, the act its tile carries, and how it opens, closes, saves and restores. */
/* `open`/`close` take the card and the part; `save`/`restore` read and write the part's one record (`partRec_`). */
/* THE OWNER'S ROW (round 4): no Grid, Table or Formula sheet -- a question brings its own -- one padlock; Calculator back (owner, 11 Nov) */
const QT_TOOLS = [
  { id: 'pen',        icon: 'pen',        label: 'Pen',             note: 'draw on the figure',       act: 'qt-pen' },
  /* TWO TILES WHERE ONE DID TWO THINGS (owner, 1 Nov): "sometimes the ruler ... displays a ruler and sometimes ... draw straight lines" -- Straight line is the pen's, Ruler always measures. */
  { id: 'line',       icon: 'line',       label: 'Straight line',   note: 'draw a straight line',     act: 'qt-pen' },
  { id: 'ruler',      icon: 'ruler',      label: 'Ruler',           note: 'measure a length',         act: 'qt-inst' },
  { id: 'protractor', icon: 'protractor', label: 'Protractor',      note: 'measure an angle',         act: 'qt-inst' },
  { id: 'compass',    icon: 'compass',    label: 'Compass',         note: 'press the centre, drag',   act: 'qt-inst' },
  { id: 'photo',      icon: 'photo',      label: 'Photo of working', note: 'up to 3 pages',           act: 'qp-work' },
  { id: 'mag',        icon: 'zoom',       label: 'Magnifier',       note: 'hold it over the page',    act: 'q-mag' },
  { id: 'read',       icon: 'speak',      label: 'Read aloud',      note: 'reads the question out',   act: 'read-aloud' },
  { id: 'lock',       icon: 'unlock',     label: 'Lock',            note: 'hold this page still',     act: 'q-lock' },
  { id: 'calc',       icon: 'calc',       label: 'Calculator',      note: 'scientific',               act: 'qt-calc' },
  { id: 'offline',    icon: 'down',       label: 'Make available offline', note: 'this paper, on this device', act: 'offline-get' },
  { id: 'check',      icon: 'send',       label: 'Check',           note: '',                         act: '' },
];
/* THE ONE ROW EVERY PART SHOWS, identically (owner, 8 Nov); data/settings/qengine.json `row` repeats it (check-answerable) */
const QT_ROW = ['photo', 'mag', 'read', 'lock', 'ruler', 'protractor', 'calc', 'offline'];
/* THE PEN'S TILES, added only where the part has a figure to draw on (a drawing answer needs its pen) */
const QT_DRAWING = { pen: 1, line: 1, compass: 1 };
const QT_ORDER = QT_ROW.concat(Object.keys(QT_DRAWING), ['check']);
/* THE PEN'S OWN NAME FOR EACH DRAWING TILE: Straight line is the pad's `ruler` mode (a line from press to lift, `padStroke_`). */
const QT_PAD_TOOL = { pen: 'pen', line: 'ruler', compass: 'compass', protractor: 'protractor' };
const qMulti_ = x => { try { return (questionParts_()[qId_(x)] || []).length > 1; } catch (e) { return false; } };
const qtTool_ = id => QT_TOOLS.find(t => t.id === id) || null;

/* ---------- THE PART'S ONE RECORD (text, choice, cells, strokes, photos, the AI's mark): keyed as its answer is. */
const PART_MEM = new Map();
/* 'ans:<who>:<item>' is 'part:<who>:<item>': any box's key names its record, so a writer holding only the key finds it */
const partKeyOfAns_ = k => /^ans:/.test(String(k || '')) ? String(k).replace(/^ans:/, 'part:') : 'part:' + String(k || '?');
const partRecKey_ = x => partKeyOfAns_(ansKey_(x));
function partRecAt_(pk) {
  if (PART_MEM.has(pk)) return PART_MEM.get(pk);
  let rec = null;
  try { rec = JSON.parse(localStorage.getItem(pk) || 'null'); } catch (e) { rec = null; }
  if (!rec || typeof rec !== 'object') rec = partMigrate_(pk);
  PART_MEM.set(pk, rec);
  return rec;
}
/* ONCE, THE FIRST TIME A PART IS READ: the old store kept beside it (the AI's mark, `aiMark:<ans key>`) folded in and removed. */
function partMigrate_(pk) {
  const rec = { v: 1 };
  const old = 'aiMark:' + pk.replace(/^part:/, 'ans:');
  try {
    const raw = localStorage.getItem(old);
    if (raw === null) return rec;
    const ai = JSON.parse(raw);
    if (ai && typeof ai.a === 'string' && typeof ai.v === 'string') rec.ai = ai;
    localStorage.setItem(pk, JSON.stringify(rec));
    localStorage.removeItem(old);
  } catch (e) { /* the old key stays, and is read again next visit */ }
  return rec;
}
function partRecPutAt_(pk, field, v) {
  const rec = partRecAt_(pk);
  if (v == null || v === '') delete rec[field]; else rec[field] = v;
  try { localStorage.setItem(pk, JSON.stringify(rec)); } catch (e) { /* this visit only */ }
}
const partRecRaw_ = x => partRecAt_(partRecKey_(x));
/* WHAT THE PART HOLDS, every kind of answer in one shape. The typed box and the pen go to the account under their own
   synced keys (answers.js, the server's ceilings); the record reads them, so nothing saved before it is lost. */
function partRec_(x) {
  const rec = Object.assign({}, partRecRaw_(x));
  const ak = typeof ansKey_ === 'function' ? ansKey_(x) : '';
  const a = ak && typeof ansRead_ === 'function' ? ansRead_(ak) : '';
  const isChoice = Array.isArray(x && x.choices) && x.choices.length >= 2;
  const isCells = typeof cellsOf_ === 'function' && cellsOf_(x).length > 0;
  if (a) { if (isChoice) rec.choice = a; else if (isCells) rec.cells = a; else rec.text = a; }
  try { rec.strokes = typeof padRead_ === 'function' ? padRead_(padKey_(x)) : []; } catch (e) { rec.strokes = []; }
  rec.photos = (typeof WORK_PICS !== 'undefined' && WORK_PICS[ak]) ? WORK_PICS[ak].length : 0;
  return rec;
}

/* ---------- THE MARKER: the one thing that varies between parts -- qtypes.js `qtMarker_`, which the Function tag reads too. */
/* WHAT THE LINE UNDER CHECK SAYS, by marker: how this part will be marked, before it is. Never a person. */
/* ONE LINE UNDER EVERY ROW (owner, 9 Nov): marking is one path for every type, so it says the same words everywhere. */
const QT_HOW_ALL = 'Marked by its mark scheme where a rule can, otherwise by AI';
/* the markers `markPart_` (find-marking.js) reads off the typed box: one Check, `qp-check`, for all of them */
const QT_SCHEME_KINDS = { choice: 1, order: 1, accept: 1, words: 1 };
/* `ready` is false where the marker has nothing to mark against yet (no key, no scheme): Check says so instead of asking */
const QT_NO_SCHEME = 'No mark scheme yet \u2014 flag it and we will add one';
const qtSchemeIn_ = x => !!x && !!String(x.answer || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|\s+/g, ' ').trim();
/* IS A MARKER'S SCHEME THERE: options with a key, or an AI part with an answer to mark against; the rest are ready as written. */
const choiceKeyed_ = x => (Array.isArray(x.choiceRight) ? x.choiceRight.length > 0 : !!x.choiceRight);
const MARKER_READY = { choice: choiceKeyed_, order: choiceKeyed_, ai: x => qtSchemeIn_(x) };
/* THE PEN: the card's pad, made on the first tap where the part has none -- its figure, else its stem's, else a grid. */
function qtPenOpen_(el, tool) {
  const key = qtKeyOf_(el);
  let card = el.closest('.qcard');
  if (!card) return null;
  let pad = card.querySelector('.qpad');
  if (!pad) {
    const x = qtItem_(key);
    if (!x) return null;
    qtPenSet_(x, true);
    card = qtRedraw_(card, x);
    pad = card && card.querySelector('.qpad');
  }
  if (pad) padToolPick_(pad, tool || 'pen');
  return pad;
}
on('qt-pen', el => { qtPenOpen_(el, QT_PAD_TOOL[el.getAttribute('data-tool')] || 'pen'); });
/* THE RULER ALWAYS MEASURES: laid on the figure, or on the pen's page -- made first where the part has only a surface. */
/* THE PROTRACTOR lies on the figure when there is one and no pen; under a pen it is the pen's; with neither, it opens the pen. */
on('qt-inst', el => {
  const tool = el.getAttribute('data-tool') || 'ruler';
  const card = el.closest('.qcard');
  const pad = card && card.querySelector('.qpad');
  if (tool === 'ruler') {
    if (card && card.querySelector('figure svg, .qpad-art > svg')) return measOpen_(el);
    const key = qtKeyOf_(el), made = qtPenOpen_(el, 'pen'), host = made && made.closest('.qcard');
    const t = host && [...host.querySelectorAll('.q-meast')].find(e => e.getAttribute('data-tool') === 'ruler' && e.getAttribute('data-key') === key);
    if (t) measOpen_(t);
    return;
  }
  if (!pad && tool === 'protractor' && card && card.querySelector('figure svg')) return measOpen_(el);
  qtPenOpen_(el, tool);
});
/* ---------- THE CALCULATOR (owner, 11 Nov): the old fx-83GT CW face (calc.js, its engine calc-engine.js), centred under the part's row. */
const calcAllowed_ = x => ![].concat((x && x.needs) || []).some(v => /^non-calculator$|^no calculator$/i.test(String(v).trim()));
const QCALC_OPEN = new Set();
const qcalcHtml_ = key => calcFaceHtml_(key);
on('qt-calc', el => {
  const key = qtKeyOf_(el), row = el.closest('.qt-row');
  if (!key || !row) return;
  const open = !QCALC_OPEN.has(key);
  if (open) QCALC_OPEN.add(key); else QCALC_OPEN.delete(key);
  const was = row.nextElementSibling && row.nextElementSibling.matches('.calc') ? row.nextElementSibling : null;
  if (was) was.remove();
  if (open) { row.insertAdjacentHTML('afterend', qcalcHtml_(key)); calcPaint_(row.nextElementSibling); }
  tileSet_(el, { on: open, pressed: open });
});
/* ---------- CHECK WITH NO MARK SCHEME: nothing is sent; the verdict line says what is missing, for a missing key too. */
on('qp-noscheme', el => {
  const mark = el.closest('.qp-mark'), out = mark && mark.querySelector('.qp-verdict');
  if (out) out.textContent = QT_NO_SCHEME;
});

/* ---------- WHAT THE AI SEES (round 3): the pen's drawing as a PNG and the photos of the working, beside the typed answer. */
/* the server's own ceiling for one picture (`WORKING_PHOTO_CHARS`); a drawing over it is drawn again at half the size */
const PEN_PNG_EDGE = 1024, PEN_PNG_CHARS = 760000, PEN_PNG_MS = 4000;
/* THE LOOK EACH LINE HAS ON SCREEN, written onto its copy: an <img> of an SVG never sees style.css, so `currentColor` and classes would draw nothing */
const PEN_PNG_PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-linecap',
  'stroke-linejoin', 'opacity', 'font-size', 'font-family', 'font-weight', 'font-style', 'text-anchor', 'dominant-baseline', 'visibility', 'display'];
function penInline_(from, to) {
  const a = [from].concat([].slice.call(from.querySelectorAll('*'))), b = [to].concat([].slice.call(to.querySelectorAll('*')));
  a.forEach((el, i) => {
    if (!b[i]) return;
    const cs = getComputedStyle(el);
    b[i].setAttribute('style', PEN_PNG_PROPS.map(p => p + ':' + cs.getPropertyValue(p)).filter(t => !/:\s*$/.test(t)).join(';'));
    b[i].removeAttribute('class');
  });
}
/* THE PAD AS ONE SVG for the PNG: its figures, then the ink; and the <img> figures under it, with their boxes, for the canvas */
function penSvg_(pad, scale) {
  const art = pad && pad.querySelector('.qpad-art');
  if (!art || !art.querySelector('.qpad-ink .qpad-g path')) return null;
  const box = art.getBoundingClientRect();
  if (!(box.width > 0 && box.height > 0)) return null;
  const k = (scale || 1) * Math.min(2, PEN_PNG_EDGE / Math.max(box.width, box.height));
  const W = Math.max(1, Math.round(box.width * k)), H = Math.max(1, Math.round(box.height * k));
  const NS = 'http://www.w3.org/2000/svg';
  const out = document.createElementNS(NS, 'svg');
  out.setAttribute('xmlns', NS);
  out.setAttribute('width', W); out.setAttribute('height', H);
  out.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
  const at = el => { const r = el.getBoundingClientRect(); return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height }; };
  const svgs = [].filter.call(art.querySelectorAll('svg'), s => !(s.parentElement && s.parentElement.closest('svg')));
  const copy = s => {
    const r = at(s), c = s.cloneNode(true);
    penInline_(s, c);
    c.setAttribute('x', r.x); c.setAttribute('y', r.y);
    c.setAttribute('width', r.w); c.setAttribute('height', r.h);
    out.appendChild(c);
  };
  svgs.filter(s => !s.classList.contains('qpad-ink')).forEach(copy);
  svgs.filter(s => s.classList.contains('qpad-ink')).forEach(copy);
  const imgs = [].map.call(art.querySelectorAll('img'), el => Object.assign({ el }, at(el))).filter(m => m.w > 0 && m.h > 0);
  return { out, W, H, k: W / box.width, imgs };
}
/* A PAD'S FIGURE AND INK AS ONE PNG data URL, on the card's own ground; '' when there is no ink, no canvas, or it will not draw in time. */
function penPng_(pad, scale) {
  return new Promise(done => {
    let over = false;
    const end = v => { if (!over) { over = true; done(v || ''); } };
    try {
      const made = penSvg_(pad, scale);
      if (!made) return end('');
      const { out, W, H, imgs } = made;
      const card = pad.closest('.qcard') || pad;
      const ground = getComputedStyle(card).backgroundColor;
      const bg = ground && !/rgba\(0, 0, 0, 0\)|transparent/.test(ground) ? ground : token_('--raised', 'black');
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(out)], { type: 'image/svg+xml' }));
      const img = new Image();
      const timer = setTimeout(() => { URL.revokeObjectURL(url); end(''); }, PEN_PNG_MS);
      img.onerror = () => { clearTimeout(timer); URL.revokeObjectURL(url); end(''); };
      img.onload = () => {
        clearTimeout(timer);
        /* a picture figure goes under the SVG; one from another site taints the canvas, and then the drawing goes without it */
        const paint = withImgs => {
          const cv = document.createElement('canvas');
          cv.width = W; cv.height = H;
          const g = cv.getContext('2d');
          g.fillStyle = bg; g.fillRect(0, 0, W, H);
          if (withImgs) imgs.forEach(m => { if (m.el.complete && m.el.naturalWidth) g.drawImage(m.el, m.x * made.k, m.y * made.k, m.w * made.k, m.h * made.k); });
          g.drawImage(img, 0, 0, W, H);
          return cv.toDataURL('image/png');
        };
        try {
          let png;
          try { png = paint(imgs.length > 0); } catch (e) { if (!imgs.length) throw e; png = paint(false); }
          URL.revokeObjectURL(url);
          if (!/^data:image\/png;base64,/.test(png)) return end('');
          if (png.length > PEN_PNG_CHARS) return (scale || 1) > 0.3 ? penPng_(pad, (scale || 1) / 2).then(end) : end('');
          end(png);
        } catch (e) { URL.revokeObjectURL(url); end(''); }
      };
      img.src = url;
    } catch (e) { end(''); }
  });
}
/* THE PICTURES A PART'S AI MARK IS SENT: its drawing (if it has ink) then up to three photos -- only to a backend that says it reads them */
function aiImages_(x, card) {
  let feat = false;
  try { feat = (DATA.features || []).indexOf('aiMarkImages') !== -1; } catch (e) { feat = false; }
  if (!x || !feat) return Promise.resolve([]);
  const k = ansKey_(x);
  const pics = ((typeof WORK_PICS !== 'undefined' && WORK_PICS[k]) || []).map(p => p && p.url)
    .filter(u => /^data:image\/jpeg;base64,/.test(String(u || ''))).slice(0, typeof WORK_MAX === 'number' ? WORK_MAX : 3);
  const pk = padKey_(x);
  const pad = card && [].find.call(card.querySelectorAll('.qpad[data-k]'), p => p.getAttribute('data-k') === pk);
  const inked = padRead_(pk).length > 0;
  return (inked && pad ? penPng_(pad) : Promise.resolve('')).then(png => (png ? [png] : []).concat(pics)).catch(() => pics);
}
