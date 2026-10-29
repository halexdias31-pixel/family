#!/usr/bin/env node
/* tools/ai-draw-accuracy.js — HOW OFTEN THE AI AGREES WITH drawMarker_ ON A DRAWING (round 3). Not in the suite: it asks Gemini for real. */
/* Usage: GEMINI_API_KEY=… node tools/ai-draw-accuracy.js [--limit=N] [--id=ROW] [--shots=DIR] [--render-only]. No key: "skipped — no key", exit 0. */
/* Each part with draw_answer is drawn right (drawMarker_'s own example) and wrong (that drawing moved), rendered by the phone's penPng_ in Chromium, */
/* marked by the backend's own aiMark (validation, cap and prompt as live), and the AI's full-or-not compared with drawMarker_'s. */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const arg = k => { const a = process.argv.find(x => x === '--' + k || x.startsWith('--' + k + '=')); return a ? (a.split('=')[1] || true) : null; };
const KEY = process.env.GEMINI_API_KEY || '';
const RENDER_ONLY = !!arg('render-only');
if (!KEY && !RENDER_ONLY) { console.log('skipped — no key (set GEMINI_API_KEY to run the AI over the drawn parts)'); process.exit(0); }
const LIMIT = Number(arg('limit')) || Infinity, ONLY = arg('id') || '', SHOTS = arg('shots') || '';

const { JSDOM } = require('jsdom');
const LIB_FULL = require('../check/lib-full.js');
const { cutFrom } = require('../js/check-marks-load.js');

/* ---------- THE APP IN JSDOM: the card as Find draws it, drawMarker_ and the AI's own question and scheme ---------- */
function bootApp(lib) {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const files = [...(/window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html) || ['', ''])[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
  const dom = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, ''), { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.org/' });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  const fixture = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8'));
  const ok = v => ({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(v)), json: () => Promise.resolve(v) });
  w.fetch = (url, o) => Promise.resolve(ok(o && o.body ? { success: true } : /data\/questions\.json/.test(String(url)) ? lib : fixture));
  w.__aheadHold = true;
  w.eval(files.map(f => fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8')).join('\n')
    + '\n;window.__a = { DM: DRAW_MARK, padKey: padKey_, STUFF: () => STUFF };');
  return w;
}

/* ---------- THE BACKEND'S OWN aiMark, its UrlFetchApp a real request (curl, synchronous as Apps Script's is) ---------- */
function backendWithGemini() {
  const { backend } = require('../js/check-gas-load.js');
  const fetch = (url, o) => {
    const hdr = Object.entries((o && o.headers) || {}).flatMap(([k, v]) => ['-H', k + ': ' + v]);
    const out = execFileSync('curl', ['-sS', '-X', 'POST', '-H', 'Content-Type: application/json', ...hdr, '--data-binary', '@-', '-w', '\n%{http_code}', url],
      { input: String((o && o.payload) || ''), maxBuffer: 64 * 1024 * 1024 }).toString();
    const at = out.lastIndexOf('\n');
    return { getResponseCode: () => Number(out.slice(at + 1)) || 0, getContentText: () => out.slice(0, at) };
  };
  const quiet = () => {};
  const b = backend({ UrlFetchApp: { fetch }, console: { log: quiet, warn: quiet, error: quiet, info: quiet } });
  b.seed('people', [{ person_id: 'P-H1', first_name: 'Hal', last_name: 'Harness', handle: 'harness', email: 'h1@example.org', pin: '0000', verified: 'TRUE', role: 'student', city: 'London' }]);
  b.seed('config', [{ key: 'ai_marks_per_day', value: '100000' }]);
  b.props.GEMINI_API_KEY = KEY;
  const tok = b.post({ action: 'verifyLogin', email: 'h1@example.org', pin: '0000' }).token;
  return body => b.post(Object.assign({ action: 'aiMark', token: tok, personId: 'P-H1' }, body));
}

/* A WRONG DRAWING: the right one moved a fifth of the pad, else mirrored -- the first of these drawMarker_ itself marks below full */
const MOVES = [st => st.map((v, i) => (i % 2 ? v : v + 68)), st => st.map((v, i) => (i % 2 ? v + 68 : v)), st => st.map((v, i) => (i % 2 ? v : 340 - v)), st => st.map((v, i) => (i % 2 ? 340 - v : v))];

(async () => {
  const LIB = LIB_FULL.rows('questions');
  const w = bootApp(LIB);
  await new Promise(r => setTimeout(r, 600));
  const A = w.__a;
  try { A.STUFF().filters = []; } catch (e) {}
  const items = w.stuffItemsAll_().filter(x => x && x.kind === 'question' && x.row && String(x.drawAnswer || '').trim() && (!ONLY || x.row.row_id === ONLY));
  const host = w.document.createElement('div');
  w.document.body.appendChild(host);
  const cases = [];
  let noFig = 0, noWrong = 0, noScheme = 0;
  for (const x of items) {
    if (cases.length / 2 >= LIMIT) break;
    w.qtPenSet_(x, true);
    w.localStorage.removeItem(A.padKey(x));
    host.innerHTML = w.stuffCard(x);
    const svg = host.querySelector('.qpad .qpad-art > svg');
    if (!svg) { noFig++; continue; }
    const fig = w.drawFig_(svg.outerHTML);
    const right = A.DM.example(x.drawAnswer, fig);
    const full = A.DM.mark(right, x.drawAnswer, fig, x.marks);
    const wrong = MOVES.map(f => right.map(f)).find(st => { const m = A.DM.mark(st, x.drawAnswer, fig, x.marks); return m && m.got < m.of; });
    if (!wrong) noWrong++;
    const scheme = w.aiScheme_(x), question = w.aiQuestion_(x);
    if (!scheme.trim()) { noScheme++; continue; }
    for (const [kind, strokes] of [['right', right], ['wrong', wrong]]) {
      if (!strokes) continue;
      w.localStorage.setItem(A.padKey(x), JSON.stringify(strokes));
      host.innerHTML = w.stuffCard(x);
      const m = A.DM.mark(strokes, x.drawAnswer, fig, x.marks);
      cases.push({ id: x.row.row_id, kind, card: host.querySelector('.qcard') ? host.querySelector('.qcard').outerHTML : host.innerHTML,
                   question, scheme, marks: Number(x.marks) || 1, dmFull: !!(m && m.got === m.of), dm: m, rightFull: !!(full && full.got === full.of) });
    }
    w.localStorage.removeItem(A.padKey(x));
  }
  w.close();

  /* ---------- EACH CARD IN CHROMIUM, THE PHONE'S OWN penPng_ making the PNG the AI is sent ---------- */
  const { chromium } = require('playwright');
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  const qt = fs.readFileSync(path.join(ROOT, 'js', 'qtools.js'), 'utf8');
  const png = ['PEN_PNG_EDGE', 'PEN_PNG_PROPS', 'penInline_', 'penPng_'].map(n => cutFrom(qt, n));
  if (png.some(c => !c)) { console.log('FAILED — penPng_ and its constants are not in js/qtools.js, so nothing could be rendered'); process.exit(1); }
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  let rendered = 0, blank = 0;
  for (const c of cases) {
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><main style="padding:16px">${c.card}</main></body></html>`);
    await page.addScriptTag({ content: png.join('\n') + '\nwindow.penPng_ = penPng_;' });
    c.png = await page.evaluate(() => window.penPng_(document.querySelector('.qpad')));
    if (!c.png) { blank++; continue; }
    rendered++;
    if (SHOTS) fs.writeFileSync(path.join(SHOTS, c.id + '-' + c.kind + '.png'), Buffer.from(c.png.split(',')[1], 'base64'));
  }
  await browser.close();
  console.log(items.length + ' parts with draw_answer; ' + cases.length + ' drawings (' + rendered + ' rendered, ' + blank + ' gave no PNG); '
    + noFig + ' with no figure, ' + noWrong + ' with no wrong drawing drawMarker_ marks down, ' + noScheme + ' with no scheme for the AI.');
  if (RENDER_ONLY) { console.log('render only — Gemini not asked' + (SHOTS ? '; PNGs in ' + SHOTS : '')); return; }

  /* ---------- MARKED BY THE AI, AND COMPARED ---------- */
  const ask = backendWithGemini();
  const tally = { right: { n: 0, agree: 0 }, wrong: { n: 0, agree: 0 } }, errs = [], off = [];
  for (const c of cases) {
    if (!c.png) continue;
    const d = ask({ question: c.question, scheme: c.scheme, answer: '', marks: c.marks, images: [c.png] });
    if (!d || !d.success) { errs.push(c.id + ' ' + c.kind + ': ' + ((d && (d.message || d.error)) || 'no reply')); continue; }
    const aiFull = d.awarded >= d.available;
    const t = tally[c.kind];
    t.n++;
    if (aiFull === c.dmFull) t.agree++;
    else off.push(c.id + ' ' + c.kind + ': drawMarker_ ' + (c.dm ? c.dm.got + '/' + c.dm.of : '?') + ', AI ' + d.awarded + '/' + d.available + ' — ' + String(d.feedback || '').slice(0, 120));
    process.stdout.write('.');
  }
  process.stdout.write('\n');
  const pc = (a, b) => (b ? Math.round(1000 * a / b) / 10 : 0) + '%';
  const all = tally.right.n + tally.wrong.n, agree = tally.right.agree + tally.wrong.agree;
  console.log('right drawings: AI agrees with drawMarker_ on ' + tally.right.agree + ' of ' + tally.right.n + ' (' + pc(tally.right.agree, tally.right.n) + ')');
  console.log('wrong drawings: AI agrees with drawMarker_ on ' + tally.wrong.agree + ' of ' + tally.wrong.n + ' (' + pc(tally.wrong.agree, tally.wrong.n) + ')');
  console.log('overall: ' + agree + ' of ' + all + ' (' + pc(agree, all) + ')' + (errs.length ? '; ' + errs.length + ' not marked' : ''));
  off.forEach(l => console.log('  differs  ' + l));
  errs.slice(0, 20).forEach(l => console.log('  error    ' + l));
})().catch(e => { console.log('FAILED — ' + (e && e.stack || e)); process.exit(1); });
