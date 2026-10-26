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
  const fixture = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8'));
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
  w.eval(src + '\n;window.__a = { DM: DRAW_MARK, qId: qId_, STUFF: () => STUFF, ACTIONS, PADLOCK };');
  return w;
}

const S = v => (v == null ? '' : String(v)).trim();
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
const WRONG = ['zzqq wvxk', '987654.321'];   // no letter sum or product hides in either ("9x7" was 63)

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
    'cellsOf_', 'qType_', 'drawFig_', 'questionParts_', 'insertsFor_', 'stemChunks_', 'partChunks_', 'markOrder_', 'orderWays_', 'qToolkit_'];
  const missing = need.filter(n => typeof w[n] !== 'function');
  if (missing.length || !A || !A.DM) { console.log('FAILED — not reachable in the app: ' + missing.concat(A && A.DM ? [] : ['DRAW_MARK']).join(', ') + ' — NOTHING was checked'); process.exit(1); }
  if (process.env.HEAP) fs.writeSync(2, 'booted ' + Math.round(process.memoryUsage().heapUsed / 1e6) + 'MB\n');
  const all = [...byId.keys()].filter(id => !ONLY || id === ONLY);
  if (!all.length) { console.log('FAILED — no question parts reached the finder' + (ONLY ? ' with id ' + ONLY : '') + ' — this check cannot see its subject'); process.exit(1); }

  const fails = {};                 // invariant -> [row id: why]
  const count = { parts: 0, skipped: 0, pages: 0, figures: 0, zoomed: 0, selfTested: 0, rulesOnly: 0, drawn: 0, inserts: 0, reading: 0, readingBlind: 0, accepted: 0, importFlagged: 0 };
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
  const doorless = () => [...host.querySelectorAll('.qsheet figure')].filter(f => !f.closest('.qpad, .qseen') && f.getAttribute('data-do') !== 'q-zoom-fig').length;

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
    if (!has('[data-do="q-zoom"]')) bad('zoom', x, 'no Zoom tile in its row');
    if (!has('[data-do="q-lock"]')) bad('zoom', x, 'no padlock in its row');
    if (doorless()) bad('zoom', x, doorless() + ' figure(s) are not a tap to zoom');
    else if (has('.qsheet figure')) count.zoomed++;
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
    if (type !== 'print' && control[fam] === false) bad('control', x, 'a ' + type + ' part with no ' + fam + ' control');
    if (control[fam] === undefined && type !== 'print') bad('control', x, 'type ' + type + ' has no control rule in this check');
    /* ---------- THE PEN, WITH ITS INSTRUMENTS ---------- */
    if (pen) {
      count.drawn++;
      const tools = [...host.querySelectorAll('[data-do="pad-tool"]')].map(t => t.getAttribute('data-tool'));
      if (['ruler', 'compass', 'protractor'].some(t => tools.indexOf(t) < 0)) bad('pen', x, 'its pen has ' + JSON.stringify(tools) + ', not the Ruler, Compass and Protractor');
    } else if (DRAWN.has(type) && type !== 'label') bad('pen', x, 'a ' + type + ' part with no pen');
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
          if (!has('[data-do="q-zoom"]')) bad('zoom', x, 'stem page ' + i + '.' + j + ' has no Zoom');
          if (!figs()) bad('figures', x, 'stem ' + i + ' has a drawing with no size');
          if (doorless()) bad('zoom', x, 'stem ' + i + ' has a figure that is not a tap to zoom');
        }
      });
      const pre = w.partChunks_(x).length - 1;
      for (let j = 0; j < pre; j++) {
        host.innerHTML = w.questionPreCard_(x, j);
        count.pages++;
        if (!has('[data-do="q-zoom"]')) bad('zoom', x, 'page ' + (j + 1) + ' of its words has no Zoom');
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
      if (!w.insertsFor_(x).length) bad('insert', x, 'its words name an insert or formulae sheet and its paper links none');
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

  const inv = Object.keys(fails);
  const total = inv.reduce((s, k) => s + fails[k].length, 0);
  const line = `parts ${count.parts} (pending without words skipped ${count.skipped}), pages ${count.pages}, figures ${count.figures}, `
    + `cards with a zoomable figure ${count.zoomed}, drawn ${count.drawn}, self-tested ${count.selfTested} (rule-only ${count.rulesOnly}), insert-naming ${count.inserts}, reading a source ${count.reading}${count.readingBlind ? ' (' + count.readingBlind + ' with no private half here)' : ''}, waiting for the owner ${count.accepted}, import-flagged ${count.importFlagged}`;
  if (!total) { console.log('OK — every question part can be answered: ' + line); process.exit(0); }
  console.log('FAILED — ' + total + ' failure(s) across ' + inv.length + ' invariant(s): ' + line);
  inv.forEach(k => {
    console.log('  ' + k + ' (' + fails[k].length + ')');
    fails[k].slice(0, process.env.VERBOSE || process.argv.includes('-v') ? 1e9 : 40).forEach(f => console.log('    ' + f));
    if (fails[k].length > 40 && !process.argv.includes('-v')) console.log('    … and ' + (fails[k].length - 40) + ' more (-v for all)');
  });
  process.exit(1);
})();
