#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-answerable.js EVERY QUESTION PART IN THE LIBRARY CAN BE ANSWERED (457). § */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const LIB_FULL = require('../check/lib-full.js');

const DIR = __dirname, ROOT = path.join(DIR, '..');
const ONLY = (process.argv.find(a => a.startsWith('--id=')) || '').slice(5);

/* WAITING FOR THE OWNER, each with its reason: [row ids, invariant, why]. Counted and printed with -v, never failed. */
const ACCEPTED = [
  [/^Q-1GK0-(1906-1F|2011-1H)-/, 'self', 'Edexcel GCSE Greek listening: the options are there and the scheme\'s answers are not (choice_right empty) -- the owner to supply them (457)'],
  [/^Q-R0396-2$/, 'insert', 'AQA English Language Paper 1, November 2017: only the redacted insert is in Drive -- the owner to drop the full one in (458)'],
  /* READING INSERTS NOT YET IN DRIVE (458): each paper's own insert, or the source it is missing, for the owner to drop in; then typed into the Ledger */
  [/^Q-(R0396|R0388|R0376|P-AQA-8700-2506-1|R0395|R0393|R0394|R0379|R0377)-/, 'reading', 'AQA English Language: this paper\'s insert is not in Drive, or only its redacted copy (458)'],
  [/^Q-(R0375|R0390)-/, 'reading', 'AQA English Language Paper 2: Drive\'s copy of the insert has Source B and not Source A (458)'],
  /* THE BOARDS' BULK PAPERS (521) name inserts no row stands for yet: the owner to supply each, verified, before the paper's parts can open one */
  [/^Q-AQA-7037-(2111-1-05-2|2206-1-05-3)$/, 'insert', 'AQA A-level Geography 7037/1: AQA\'s public insert prints Figures 9a-9d and 10a-10c as "not reproduced, third-party copyright" (521)'],
  [/^Q-OCR-H420-(1806-01-23a|2111-01-17a)$/, 'insert', 'OCR A-level Biology H420/01: the inserts are micrographs, which an insert row\'s words cannot carry, and OCR publishes no Nov 2021 insert (521)'],
];
const accepted = (id, inv) => ACCEPTED.find(a => a[1] === inv && a[0].test(id));

function order_() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
  if (!m) { console.log('FAILED — cannot read window.FILES out of index.html, so the app could not be loaded'); process.exit(1); }
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}

function boot(lib) {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.org/' });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  w.confirm = () => true;
  /* AI MARKING ON, as with the key in place: an AI part's Check is then pressable exactly where it has a scheme to mark against */
  const fixture = Object.assign(JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8')), { aiMarking: true });
  const ok = v => ({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(v)), json: () => Promise.resolve(v) });
  w.fetch = (url, o) => {
    const u = String(url);
    if (o && o.body) return Promise.resolve(ok({ success: true }));
    if (/data\/questions\.json/.test(u)) return Promise.resolve(ok(lib));
    /* AND THE INSERTS (455), which the insert invariant reads; anything else gets the payload, as check-flow's boot does */
    if (/data\/inserts\.json/.test(u)) return Promise.resolve(ok(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'inserts.json'), 'utf8'))));
    return Promise.resolve(ok(fixture));
  };
  try {
    w.HTMLMediaElement.prototype.pause = function () {};
    w.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
    w.HTMLMediaElement.prototype.load = function () {};
  } catch (e) {}
  w.__aheadHold = true;
  const src = order_().map(n => fs.readFileSync(path.join(DIR, n + '.js'), 'utf8')).join('\n');
  w.eval(src + '\n;window.__a = { DM: DRAW_MARK, qId: qId_, STUFF: () => STUFF, ACTIONS, PADLOCK, QT_ORDER, PEN_OPEN };');
  return w;
}

const S = v => (v == null ? '' : String(v)).trim();
/* THE TOOL ROW AS ITS TOOLS' NAMES, left to right, Check last: read off the tiles' own acts, never off a list in the app */
/* THE OWNER'S ORDER, written here and not read from the app, so an app that reorders its tools fails */
/* round 4: no Calculator, Grid, Table or Formula sheet (a question brings its own), and the padlock once, in the row */
const TOOL_ORDER = ['pen', 'line', 'ruler', 'protractor', 'compass', 'photo', 'mag', 'read', 'lock', 'check'];
const DRAWING_TOOLS = new Set(['pen', 'line', 'ruler', 'protractor', 'compass']);
const TOOL_OF = { 'qt-pen': 'pen', 'qp-work': 'photo', 'q-mag': 'mag', 'read-aloud': 'read', 'q-lock': 'lock' };
/* EACH TILE ONCE ON A PAGE (round 4: two padlocks, `q-lock` and the widgets' `game-lock`): a tile is its act and tool, and a lock is a lock */
const SAME_AS = { 'game-lock': 'q-lock' };
const twiceOn = root => {
  const seen = {};
  [...root.querySelectorAll('.tile[data-do]')].forEach(t => {
    const act = t.getAttribute('data-do');
    const k = (SAME_AS[act] || act) + (t.getAttribute('data-tool') ? ' ' + t.getAttribute('data-tool') : '');
    seen[k] = (seen[k] || 0) + 1;
  });
  return Object.keys(seen).filter(k => seen[k] > 1).map(k => k + ' x' + seen[k]);
};
const toolsOf = row => [...row.querySelectorAll('.tile')].filter(t => !t.classList.contains('qt-fold')).map(t => {
  if (t.classList.contains('is-submit')) return 'check';
  const act = t.getAttribute('data-do') || '';
  return act === 'qt-pen' ? (t.getAttribute('data-tool') || 'pen') : TOOL_OF[act] || (act === 'qt-inst' ? t.getAttribute('data-tool') : act || '?');
});
const DRAWN = new Set(['label', 'points', 'line', 'shape', 'shade', 'hand', 'graph', 'construct', 'numline']);
const TYPED = new Set(['value', 'unit', 'multi', 'fraction', 'coords', 'expr', 'words', 'reason', 'measure']);
/* "the insert", never the verb ("Insert two commas") */
const INSERT_WORDS = /\b(formulae? (sheet|booklet)|equations? sheet|data sheet|(the|an) insert|insert (booklet|sheet)|resource booklet|source booklet|periodic table)\b/i;
/* A PART THAT READS FROM A PRINTED SOURCE (458): "Source A", "the source", "both sources" */
const READ_WORDS = /\b(source [ab]|the source|both sources)\b/i;
/* AND THE WORDS EACH READING INSERT HAS HERE, the private half joined (`check/lib-full.js`): the extract is never in data/ */
let INS_TEXT = null;
const insText_ = () => {
  if (INS_TEXT) return INS_TEXT;
  INS_TEXT = {};
  try { LIB_FULL.rows('inserts').forEach(r => { INS_TEXT[S(r.insert_id)] = S(r.source_text); }); } catch (e) { INS_TEXT.__error = e.message; }
  return INS_TEXT;
};
const WRONG = ['zzqq wvxk', '987654.321'];
/* EACH MARKER'S CHECK, written here and not read from the app: a part's Check must be its marker's (Review A) */
const CHECK_OF = { choice: 'qp-choice-check', order: 'qp-order-send', cells: 'qp-cells-check', draw: 'pad-check', accept: 'qp-check', words: 'qp-rule', ai: 'qp-ai' };
/* EACH PART'S MARKER FROM ITS OWN ROW, written here and not asked of the app (Review B: an app that handed every accept part to the AI passed) */
const MARKER_OF = (x, r) => {
  if (Array.isArray(x.choices) && x.choices.length >= 2) return S(x.answerType || r.answer_type).toLowerCase() === 'order' ? 'order' : 'choice';
  return S(r.cells) ? 'cells' : S(r.draw_answer) ? 'draw' : S(r.accept) ? 'accept' : S(r.mark_words) ? 'words' : 'ai';
};
/* A MARK SCHEME FROM THE ROW ITSELF (round 4): an AI part with no `answer` has none -- an importer's note is not one -- and its Check is never the AI's */
const SCHEME_IN = r => !!S(r.answer).replace(/<[^>]*>/g, ' ').replace(/&nbsp;|\s+/g, ' ').trim();
const NO_SCHEME_SAYS = /^No mark scheme yet\b/;
const PEN_DRAW_EVERY = 10;
const byMarker = {}, notReady = {}, notReadyLive = [];   // no letter sum or product hides in either ("9x7" was 63)

/* THE SAMPLE A ROW'S OWN SCHEME GIVES: the first written way of `accept`, else nothing (a rule-only row is tested on its rule's own words, not here). */
const firstWay = acc => S(acc).split('|').map(w => w.trim()).find(w => w && !/^rule:/i.test(w)) || '';
/* A key-word rule's own full answer: the first way of every point, its terms side by side. */
const wordsSample = rule => S(rule).split(';').map(p => p.trim()).filter(Boolean)
  .map(p => p.split('|')[0].split('+').map(t => t.trim().replace(/^[~^!]+|\*$/g, '')).join(' ')).join('. ');

(async () => {
  let LIB;
  try { LIB = LIB_FULL.rows('questions'); }
  catch (e) { console.log('FAILED — the library could not be read whole: ' + e.message); process.exit(1); }
  /* A FRESH APP EVERY `CHUNK` PARTS: one window drawing nine thousand cards grows past any heap a machine here has */
  let w, A, doc, host, byId;
  const fresh = async () => {
    if (w) { try { w.close(); } catch (e) {} }
    w = boot(LIB);
    await new Promise(r => setTimeout(r, 400));
    A = w.__a;
    if (!A) return;
    try { A.STUFF().filters = []; } catch (e) {}
    doc = w.document; host = doc.createElement('div');
    doc.body.appendChild(host);
    byId = new Map(w.stuffItemsAll_().filter(x => x && x.kind === 'question' && x.row).map(x => [x.row.row_id, x]));
  };
  await fresh();
  const need = ['stuffItemsAll_', 'stuffCard', 'questionStemCard_', 'questionPreCard_', 'markAnswer_', 'markWords_', 'markCells_',
    'cellsOf_', 'qType_', 'drawFig_', 'questionParts_', 'insertsFor_', 'stemChunks_', 'partChunks_', 'markOrder_', 'orderWays_', 'qtRow_', 'qtPenSet_', 'markerOf_', 'padSource_', 'padHasArt_'];
  const missing = need.filter(n => typeof w[n] !== 'function');
  if (!missing.length && A && !(Array.isArray(A.QT_ORDER) && A.QT_ORDER.join(' ') === TOOL_ORDER.join(' '))) missing.push('QT_ORDER in the owner\'s order (' + TOOL_ORDER.join(' ') + ')');
  if (missing.length || !A || !A.DM) { console.log('FAILED — not reachable in the app: ' + missing.concat(A && A.DM ? [] : ['DRAW_MARK']).join(', ') + ' — NOTHING was checked'); process.exit(1); }
  if (process.env.HEAP) fs.writeSync(2, 'booted ' + Math.round(process.memoryUsage().heapUsed / 1e6) + 'MB\n');
  const all = [...byId.keys()].filter(id => !ONLY || id === ONLY);
  if (!all.length) { console.log('FAILED — no question parts reached the finder' + (ONLY ? ' with id ' + ONLY : '') + ' — this check cannot see its subject'); process.exit(1); }

  const fails = {};                 // invariant -> [row id: why]
  const count = { lazyDrawn: 0, lazy: 0, parts: 0, skipped: 0, pages: 0, figures: 0, zoomed: 0, selfTested: 0, rulesOnly: 0, drawn: 0, inserts: 0, reading: 0, readingBlind: 0, accepted: 0, importFlagged: 0 };
  const bad = (inv, x, why) => {
    const id = x.row.row_id;
    if (accepted(id, inv)) { count.accepted++; if (process.argv.includes('-v')) console.log('  accepted ' + id + ' ' + inv + ': ' + accepted(id, inv)[2]); return; }
    (fails[inv] = fails[inv] || []).push(id + (why ? ': ' + why : ''));
  };
  const has = sel => !!host.querySelector(sel);
  const n = sel => host.querySelectorAll(sel).length;
  const sized = svg => {
    const vb = S(svg.getAttribute('viewBox')).split(/[\s,]+/).map(Number);
    if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) return true;
    return parseFloat(svg.getAttribute('width')) > 0 && parseFloat(svg.getAttribute('height')) > 0;
  };
  const figs = () => {
    let ok = true;
    host.querySelectorAll('.qsheet svg, .qpad-art > svg').forEach(s => {
      if (s.ownerSVGElement || s.classList.contains('qpad-ink')) return;
      count.figures++;
      if (!sized(s)) ok = false;
    });
    host.querySelectorAll('.qsheet img').forEach(i => { count.figures++; if (!S(i.getAttribute('src'))) ok = false; });
    return ok;
  };

  const CHUNK = 600;
  for (let at = 0; at < all.length; at++) {
    if (at && at % CHUNK === 0) await fresh();
    const x = byId.get(all[at]);
    if (!x) continue;
    const r = x.row;
    const words = S(r.html) + S(r.lead) + S(x.html) + S(x.lead);
    if (LIB_FULL.pending(r) && !words && !S(r.diagram) && !S(r.diagram_twin) && !S(x.diagram)) { count.skipped++; continue; }
    count.parts++;
    if (process.env.HEAP && count.parts % 600 === 0) fs.writeSync(2, count.parts + ' ' + Math.round(process.memoryUsage().heapUsed / 1e6) + 'MB\n');
    const type = w.qType_(x);
    /* ---------- THE CARD, AS FIND DRAWS IT ---------- */
    try { host.innerHTML = w.stuffCard(x); }
    catch (e) { bad('parts', x, 'its card threw: ' + e.message); continue; }
    count.pages++;
    if (ONLY) console.log(host.innerHTML);
    const sheet = host.querySelector('.qsheet');
    const said = sheet ? S(sheet.textContent.replace(/\s+/g, ' ')) : '';
    if (!sheet || has('.qsheet p.empty') || (!said && !sheet.querySelector('svg, img, table'))) bad('words', x, 'the page has no words, figure or table');
    if (!figs()) bad('figures', x, 'a drawing with no size or a picture with no source');
    if (!has('[data-do="q-mag"]')) bad('magnifier', x, 'no Magnifier tile in its row');
    if (!has('[data-do="q-lock"]')) bad('magnifier', x, 'no padlock in its row');
    if (twiceOn(host).length) bad('twice', x, 'its card has a tile more than once: ' + twiceOn(host).join(', '));
    if (has('.qsheet figure')) count.zoomed++;
    /* ---------- AN ANSWER CONTROL THAT FITS ITS TYPE ---------- */
    const pen = has('.qpad .qpad-ink');
    const control = {
      typed: has('.qp-ans-in') || pen,
      choose1: n('[data-do="qp-choose"]') >= 2, chooseN: n('[data-do="qp-choose"]') >= 2,
      order: n('.qp-item') >= 2,
      table: has('input.qp-cell') || pen, match: has('input.qp-cell') || pen, label: has('input.qp-cell') || pen || has('.qp-ans-in'),
      essay: has('.qp-sheet') || has('.qp-ans-in'),
      drawn: pen,
    };
    const fam = TYPED.has(type) ? 'typed' : DRAWN.has(type) ? (type === 'label' ? 'label' : 'drawn') : type;
    if (control[fam] === false) bad('control', x, 'a ' + type + ' part with no ' + fam + ' control');
    if (control[fam] === undefined) bad('control', x, 'type ' + type + ' has no control rule in this check');
    /* ---------- ONE PAGE FOR EVERY PART (round 3): the nine tools in one order, one answer box, a surface to draw on ---------- */
    const rows = host.querySelectorAll('.qt-row');
    if (rows.length !== 1) bad('tools', x, rows.length + ' tool rows, wanted one');
    else {
      const got = toolsOf(rows[0]);
      /* THE DRAWING TOOLS WHERE THERE IS SOMETHING TO DRAW ON (`padHasArt_`): on a bare part they opened a blank working paper (owner, 29 Oct) */
      const wantRow = w.padHasArt_(x) ? TOOL_ORDER : TOOL_ORDER.filter(t => !DRAWING_TOOLS.has(t));
      if (got.join(' ') !== wantRow.join(' ')) bad('tools', x, 'its row reads ' + got.join(' ') + (w.padHasArt_(x) ? '' : ' — nothing to draw on, so no drawing tools'));
      const box = rows[0].closest('.qp-mark');
      if (!box || !box.querySelector('.qp-verdict')) bad('tools', x, 'its row is not in the box\'s mark with a verdict line under it');
      /* ---------- ITS MARKER (markerOf_), NEVER A PERSON: the Check is that marker's, and the line under it says how ---------- */
      let m = null;
      try { m = w.markerOf_(x); } catch (e) { bad('marker', x, 'markerOf_ threw: ' + e.message); }
      const own = MARKER_OF(x, r);
      if (m && m.kind !== own) bad('marker', x, 'its row says it is marked by ' + own + ', and the app marks it by ' + m.kind);
      if (m && (own === 'choice' || own === 'order') && m.ready !== !!S(r.choice_right)) bad('marker', x, 'its options ' + (S(r.choice_right) ? 'have' : 'have no') + ' key, and the app says it is ' + (m.ready ? '' : 'not ') + 'ready');
      if (m) {
        const want = own === 'ai' && !SCHEME_IN(r) ? 'qp-noscheme' : CHECK_OF[own];
        if (own === 'ai' && m.ready !== SCHEME_IN(r)) bad('marker', x, 'its row ' + (SCHEME_IN(r) ? 'has' : 'has no') + ' mark scheme, and the app says it is ' + (m.ready ? '' : 'not ') + 'ready');
        const go = [...rows[0].querySelectorAll('.is-submit')];
        if (!CHECK_OF[m.kind]) bad('marker', x, 'it is marked by ' + JSON.stringify(m.kind) + ' — only a rule or the AI marks');
        else {
          byMarker[m.kind] = (byMarker[m.kind] || 0) + 1;
          if (!m.ready) { notReady[m.kind] = (notReady[m.kind] || 0) + 1; if (!LIB_FULL.pending(r)) notReadyLive.push(r.row_id); }
          if (go.length !== 1 || go[0].getAttribute('data-do') !== want) bad('marker', x, 'marked by ' + own + ', its Check is ' + go.map(g => g.getAttribute('data-do')).join(', ') + ', wanted ' + want);
          else if (own === 'ai' && m.ready && go[0].disabled) bad('marker', x, 'a scheme to mark against, and its AI Check cannot be pressed');
          else if (want === 'qp-noscheme') {
            /* PRESSED, IT SAYS SO ON THE VERDICT LINE AND SENDS NOTHING: the line under the row says it before the press */
            const out = box && box.querySelector('.qp-verdict');
            try { A.ACTIONS['qp-noscheme'](go[0]); } catch (e) { bad('marker', x, 'its Check threw: ' + e.message); }
            if (!out || !NO_SCHEME_SAYS.test(S(out.textContent))) bad('marker', x, 'no mark scheme, and its Check says ' + JSON.stringify(out ? out.textContent : null));
            if (!NO_SCHEME_SAYS.test(S((host.querySelector('.qt-how') || {}).textContent))) bad('marker', x, 'no mark scheme, and the line under the row does not say so');
            if (box && (box.classList.contains('qp-ai') || box.querySelector('[data-do="qp-ai"]'))) bad('marker', x, 'no mark scheme, and its box still offers the AI');
          }
        }
        const how = host.querySelector('.qt-how');
        if (!how || !S(how.textContent) || S(how.textContent) !== S(m.how)) bad('marker', x, 'the line under Check says ' + JSON.stringify(how ? how.textContent : null) + ', not how it is marked');
      }
    }
    /* THE PHOTO TILE HAS ITS STRIP: thumbnails, removing one and Mark my working show there, on every kind of box (Review B) */
    host.querySelectorAll('.qt-row [data-do="qp-work"]').forEach(t => {
      const k = t.getAttribute('data-k'), mark = t.closest('.qp-mark');
      if (!k || !mark || ![...mark.querySelectorAll('.qp-work')].some(s => s.getAttribute('data-k') === k)) bad('photo', x, 'its Photo of working tile has no strip with its key to show the photos in');
    });
    const boxes = n('.qp-mark .qp-ans-in:not(.kp-in[data-do="qp-multi"])') + n('.qp-multi') + n('.qp-choices') + n('.qp-order') + n('.qp-cells-box');
    if (boxes !== 1) bad('box', x, boxes + ' answer boxes, wanted one');
    if (pen) count.drawn++;
    else if (DRAWN.has(type) && type !== 'label') bad('pen', x, 'a ' + type + ' part with no pen');
    else {
      /* THE FIRST PEN TAP makes its surface: its figure, its stem's, or the surface it names -- asked of padSource_ for every part, the card drawn for one in PEN_DRAW_EVERY (Review A: three draws a part took 7m47s) */
      try {
        w.qtPenSet_(x, true);
        const src = w.padSource_(x);
        /* NOTHING TO DRAW ON IS NO PEN, AND NO BLANK GRID IN ITS PLACE (owner, 29 Oct: "a button which opens the working paper") */
        if (!w.padHasArt_(x)) { if (src) bad('surface', x, 'nothing to draw on, and a Pen tap still lays a blank ' + (src.surface || 'surface')); }
        else if (!src || !S(src.svg)) bad('surface', x, 'a Pen tap gives it nothing to draw on');
        else if (count.parts % PEN_DRAW_EVERY === 0) {
          host.innerHTML = w.stuffCard(x);
          count.lazyDrawn++;
          if (n('.qpad .qpad-art > svg') < 1) bad('surface', x, 'a Pen tap draws nothing to draw on');
          else count.lazy++;
        } else count.lazy++;
      } catch (e) { bad('surface', x, 'opening its pen threw: ' + e.message); }
      finally { w.qtPenSet_(x, false); }
    }
    /* ---------- THE MARKER, ON THE ROW'S OWN ANSWER ---------- */
    try {
      const acc = S(x.accept), cells = w.cellsOf_(x), choices = Array.isArray(x.choices) ? x.choices : [];
      if (choices.length >= 2 && type === 'order') {
        const ways = w.orderWays_(x);
        const right = S(r.choice_right).split('|')[0];
        if (!ways || !ways.length) bad('self', x, 'an order part with no order to mark by');
        else { count.selfTested++; if (w.markOrder_(right.replace(/\s+/g, ''), ways) !== true) bad('self', x, 'its own order ' + right + ' is not marked right'); }
      } else if (choices.length >= 2) {
        const picks = S(r.choice_right).split('|')[0].split(',').map(v => parseInt(v, 10));
        count.selfTested++;
        if (!picks.length || picks.some(p => !(p >= 1 && p <= choices.length))) bad('self', x, 'choice_right ' + JSON.stringify(r.choice_right) + ' is not among its ' + choices.length + ' options');
      } else if (cells.length) {
        const asked = cells.filter(c => c.ways);
        if (asked.length) {
          count.selfTested++;
          const m = w.markCells_(cells.map(c => firstWay(c.ways)), cells);
          if (m.right !== m.of) bad('self', x, 'its own cells score ' + m.right + ' of ' + m.of);
          const z = w.markCells_(cells.map(() => WRONG[0]), cells);
          if (z.right === z.of) bad('self', x, 'a nonsense answer fills every cell right');
        }
      } else if (acc) {
        const eg = firstWay(acc);
        if (!eg) count.rulesOnly++;
        else {
          count.selfTested++;
          if (w.markAnswer_(eg, acc) !== true) bad('self', x, 'its own answer ' + JSON.stringify(eg) + ' is not marked right');
          if (WRONG.some(v => w.markAnswer_(v, acc) === true)) bad('self', x, 'a nonsense answer is marked right');
        }
      } else if (S(x.markWords)) {
        count.selfTested++;
        const m = w.markWords_(WRONG[0], x.markWords);
        if (m && m.got === m.of && m.of > 0) bad('self', x, 'a nonsense answer gets every key-word mark');
      }
      if (S(x.drawAnswer) && pen) {
        const svg = host.querySelector('.qpad-art > svg');
        const fig = w.drawFig_(svg.outerHTML), eg = A.DM.example(x.drawAnswer, fig);
        const full = A.DM.mark(eg, x.drawAnswer, fig, x.marks);
        count.selfTested++;
        if (!full || full.got !== full.of) bad('self', x, 'its own right drawing scores ' + JSON.stringify(full));
      }
    } catch (e) { bad('self', x, 'the marker threw: ' + e.message); }
    /* ---------- EVERY PAGE OF IT, AND WHAT IT READS ---------- */
    try {
      (x.stems || []).forEach((p, i) => {
        const chunks = w.stemChunks_(p);
        for (let j = 0; j < chunks.length; j++) {
          host.innerHTML = w.questionStemCard_(x, i, j);
          count.pages++;
          if (!has('[data-do="q-mag"]')) bad('magnifier', x, 'stem page ' + i + '.' + j + ' has no Magnifier');
          if (twiceOn(host).length) bad('twice', x, 'stem page ' + i + '.' + j + ' has a tile more than once: ' + twiceOn(host).join(', '));
          if (!figs()) bad('figures', x, 'stem ' + i + ' has a drawing with no size');
        }
      });
      const pre = w.partChunks_(x).length - 1;
      for (let j = 0; j < pre; j++) {
        host.innerHTML = w.questionPreCard_(x, j);
        count.pages++;
        if (!has('[data-do="q-mag"]')) bad('magnifier', x, 'page ' + (j + 1) + ' of its words has no Magnifier');
        if (twiceOn(host).length) bad('twice', x, 'page ' + (j + 1) + ' of its words has a tile more than once: ' + twiceOn(host).join(', '));
      }
    } catch (e) { bad('parts', x, 'a page of it threw: ' + e.message); }
    const uses = S(x.uses || r.uses).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (uses) {
      const sib = (w.questionParts_()[A.qId(x)] || []);
      if (!sib.some(p => S(p.qPart).toLowerCase().replace(/[^a-z0-9]/g, '') === uses)) bad('parts', x, 'it uses part ' + JSON.stringify(x.uses || r.uses) + ', which its question has not got');
    }
    /* ---------- THE INSERT IT SENDS YOU TO ---------- */
    if (/paper/i.test(S(x.documentType)) && INSERT_WORDS.test(words.replace(/<[^>]*>/g, ' '))) {
      count.inserts++;
      if (!w.insertsFor_(x).length) bad('insert', x, 'its words name an insert or formulae sheet and no insert in Find is for its paper');
    }
    /* ---------- THE SOURCE IT READS FROM, A PRIVATE READING INSERT WITH ITS WORDS (458) ---------- */
    const plain = words.replace(/<[^>]*>/g, ' ');
    if (/paper/i.test(S(x.documentType)) && /english/i.test(S(x.subject)) && READ_WORDS.test(plain)) {
      count.reading++;
      const named = [...new Set((plain.match(/\bsource [ab]\b/gi) || []).map(t => t.slice(-1).toUpperCase()))];
      if (!named.length) named.push('A');
      const ins = w.insertsFor_(x).filter(r => (r.forPapers || []).length);
      const text = insText_();
      /* A PENDING INSERT WITH NO PRIVATE HALF ON THIS MACHINE (a fresh clone) is a card, as `check/lib-full.js` has it; with the half here, its words are required */
      const here = Object.keys(LIB_FULL.readPrivate('inserts') || {}).length > 0;
      const miss = named.filter(src => !ins.some(r => (r.sources || []).indexOf(src) !== -1 && (text[r.id] || (!here && r.pending))));
      if (!here && ins.some(r => r.pending && !text[r.id])) count.readingBlind++;
      if (!ins.length) bad('reading', x, 'it reads from a printed source and its paper has no reading insert');
      else if (miss.length) bad('reading', x, 'its reading insert has no words here for Source ' + miss.join(' and ') + (text.__error ? ' (' + text.__error + ')' : ''));
    }
  }
  /* ---------- THE IMPORT'S OWN SELF-TEST (backend `libSelfTest_`) REFUSES NO ROW THE LIBRARY HOLDS, and flags only those waiting for the owner ---------- */
  if (!ONLY) {
    const { cutFrom } = require('./check-marks-load.js');
    const body = cutFrom(fs.readFileSync(path.join(ROOT, 'backend', 'content.gs'), 'utf8'), 'libSelfTest_');
    if (!body) (fails.import = fails.import || []).push('libSelfTest_ could not be read out of backend/content.gs — the import is not self-testing');
    else {
      const selfTest = eval('(' + body + ')');
      LIB.forEach(r => {
        if (!r || r.kind !== 'question') return;
        const t = selfTest('questions', r);
        if (t && t.refuse) (fails.import = fails.import || []).push(r.row_id + ': the import would refuse it — ' + t.refuse);
        if (t && t.flag && !accepted(r.row_id, 'self')) (fails.import = fails.import || []).push(r.row_id + ': the import flags it — ' + t.flag);
        if (t) count.importFlagged++;
      });
    }
  }

  if (!ONLY && Object.keys(byMarker).reduce((a, k) => a + byMarker[k], 0) < count.parts * 0.9) (fails.marker = fails.marker || []).push('only ' + JSON.stringify(byMarker) + ' of ' + count.parts + ' parts had a marker read — the row was not reached');
  const inv = Object.keys(fails);
  const total = inv.reduce((s, k) => s + fails[k].length, 0);
  const line = `parts ${count.parts} (pending without words skipped ${count.skipped}), pages ${count.pages}, figures ${count.figures}, `
    + `cards with a figure under the Magnifier ${count.zoomed}, drawn ${count.drawn}, a surface on the first Pen tap ${count.lazy} (${count.lazyDrawn} drawn), by marker ${Object.keys(CHECK_OF).map(k => k + ' ' + (byMarker[k] || 0)).join(', ')} (none by a person; nothing yet to mark against: ${Object.keys(notReady).map(k => k + ' ' + notReady[k]).join(', ') || 'none'}, ${notReadyLive.length} of them not waiting on an import), every part with the nine tools in order, each tile once, and one box, self-tested ${count.selfTested} (rule-only ${count.rulesOnly}), insert-naming ${count.inserts}, reading a source ${count.reading}${count.readingBlind ? ' (' + count.readingBlind + ' with no private half here)' : ''}, waiting for the owner ${count.accepted}, import-flagged ${count.importFlagged}`;
  if (!total) { console.log('OK — every question part can be answered: ' + line); process.exit(0); }
  console.log('FAILED — ' + total + ' failure(s) across ' + inv.length + ' invariant(s): ' + line);
  inv.forEach(k => {
    console.log('  ' + k + ' (' + fails[k].length + ')');
    fails[k].slice(0, process.env.VERBOSE || process.argv.includes('-v') ? 1e9 : 40).forEach(f => console.log('    ' + f));
    if (fails[k].length > 40 && !process.argv.includes('-v')) console.log('    … and ' + (fails[k].length - 40) + ' more (-v for all)');
  });
  process.exit(1);
})();
