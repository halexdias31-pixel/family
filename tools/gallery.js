#!/usr/bin/env node
/* @family. — tools/gallery.js ONE OF EVERY CARD AND SCREEN, PHOTOGRAPHED, AND COMPARED WITH THE LAST APPROVED SET. § */
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');

const ROOT = path.resolve(__dirname, '..');
const arg = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=').slice(1).join('=');
const DIR = path.resolve(arg('dir') || process.env.GALLERY_DIR || path.join(os.tmpdir(), 'family-gallery'));
const NOW = path.join(DIR, 'now'), OK = path.join(DIR, 'approved'), DIFF = path.join(DIR, 'diff');
const APPROVE = process.argv.includes('--approve');
/* THE SCREENSHOT GATE (owner, 12 Nov): --gate fails unless each changed or new shot is in gallery-approved.json with its hash. */
const GATE = process.argv.includes('--gate');
const SIGNED = path.join(ROOT, 'data', 'settings', 'gallery-approved.json');
const hash = f => require('crypto').createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 16);
const readSigned = () => { try { return JSON.parse(fs.readFileSync(SIGNED, 'utf8')); } catch (e) { return { why: '', shots: {} }; } };
/* --sign: after a person or agent LOOKED at the side-by-sides in <dir>/diff, the last run's changed shots are written as approved. */
if (process.argv.includes('--sign')) {
  let last = [];
  try { last = JSON.parse(fs.readFileSync(path.join(DIR, 'changed.json'), 'utf8')); } catch (e) { console.log('gallery --sign: no changed.json in ' + DIR + ' — run --gate first'); process.exit(1); }
  const j = readSigned(), who = arg('by') || process.env.USER || 'someone';
  j.why = 'visual changes a person or agent looked at and approved (node tools/gallery.js --sign --by=<who>); the gate reads it';
  j.shots = j.shots || {};
  last.forEach(c => { j.shots[c.f] = { hash: c.hash, by: who, at: new Date().toISOString().slice(0, 10) }; });
  fs.writeFileSync(SIGNED, JSON.stringify(j, null, 1) + '\n');
  console.log(`gallery --sign: ${last.length} shot(s) approved by ${who} in data/settings/gallery-approved.json`);
  process.exit(0);
}
const PORT = Number(process.env.GALLERY_PORT || 8761);
const WIDTHS = (arg('width') || '390,820').split(',').map(Number);
const ONLY = arg('only') ? arg('only').split(',') : null;
/* A SHOT THAT MOVED THIS SHARE OF ITS PIXELS OR MORE IS CHANGED; below it is a caret, a clock, a video frame. */
const NOISE = Number(arg('noise') || 0.001);

const FIXTURE = fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8');
const person = (role, name, id, handle) => ({ name, personId: id, person_id: id, role, roles: [role], handle, token: 't-' + role });
const PEOPLE = [
  { as: 'pupil',  user: person('student', 'Sam Student', 'P9', 'sam_quick12') },
  { as: 'parent', user: person('parent', 'Mo Member', 'P-MEMBER', 'momember') },
  { as: 'tutor',  user: person('tutor', 'Tia Tutor', 'P-TUTOR', 'tiatutor') },
  { as: 'admin',  user: person('admin', 'Test Admin', 'P001', 'testadmin') },
].filter(p => !arg('who') || arg('who').split(',').indexOf(p.as) !== -1);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
function serve() {
  const lib = require('../check/lib-full.js');
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      const libBody = lib.serve(p);
      if (libBody !== null) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(libBody); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not here'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(PORT, () => ok(s));
  });
}

/* STILL: no caret blinking, no transition half done, so two runs of the same code photograph the same. */
const STILL_CSS = '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }';
const safe = s => String(s).replace(/[^\w.-]+/g, '_').slice(0, 80);

/* IN THE PAGE: the cards on the screen now, one per kind, each marked so it can be photographed. */
function markCards_(max) {
  const seen = new Set(), out = [];
  document.querySelectorAll('[data-gal]').forEach(n => n.removeAttribute('data-gal'));
  const vw = innerWidth;
  [...document.querySelectorAll('.card, p.empty')].forEach(c => {
    if (out.length >= max || c.closest('[hidden]') || c.parentElement.closest('.card')) return;
    const r = c.getBoundingClientRect();
    if (r.width < 40 || r.height < 16 || r.right <= 0 || r.left >= vw) return;
    const cls = [...c.classList];
    const kind = (cls.find(k => /^kc-/.test(k) && k !== 'kc-facts') || cls.filter(k => k !== 'card' && k !== 'fc' && k !== 'kc')[0] || c.tagName.toLowerCase())
      + (c.querySelector('.kc-form, form, input, select, textarea') ? '.form' : '')
      + (cls.indexOf('is-locked') !== -1 ? '.locked' : '') + (cls.indexOf('oops') !== -1 ? '.oops' : '');
    if (seen.has(kind)) return;
    seen.add(kind); c.setAttribute('data-gal', String(out.length)); out.push(kind);
  });
  return out;
}

/* IN THE PAGE: one card of every Find kind and question type, plus the empty, locked and oops looks, drawn by the app's own makers into a slot on Find. */
function drawSpecimens_() {
  /* ITS OWN SHEET OVER THE APP, wearing Find's classes: the shell redraws its screens and would wipe a slot among them. */
  const front = document.querySelector('.screen.is-front') || document.querySelector('.screen');
  let slot = document.getElementById('gal-slot');
  if (!slot) { slot = document.createElement('div'); slot.id = 'gal-slot'; document.body.appendChild(slot); }
  slot.className = front ? front.className : 'screen';
  slot.style.cssText = 'position:absolute;left:0;top:0;width:100%;z-index:9999;background:var(--bg);display:block;height:auto;overflow:visible;transform:none';
  const all = (() => { try { return stuffItemsAll_() || []; } catch (e) { return []; } })();
  const by = {};
  all.forEach(x => {
    let k = x && x.kind || 'thing';
    if (k === 'question' && typeof qType_ === 'function') { try { k += '.' + qType_(x.row || x); } catch (e) { /* untyped: the kind alone */ } }
    if (!by[k]) by[k] = x;
  });
  const html = [], names = [];
  Object.keys(by).sort().forEach(k => {
    try { const h = findCard(by[k]); if (h) { html.push(`<div class="gal-one" data-gal-k="${k}">${h}</div>`); names.push(k); } } catch (e) { /* a maker that throws is the oops card's business */ }
  });
  const first = by[Object.keys(by).sort()[0]];
  try { if (first && typeof lockCard_ === 'function') { html.push(`<div class="gal-one" data-gal-k="locked">${lockCard_(findCard(first))}</div>`); names.push('locked'); } } catch (e) { /* no lock */ }
  try { html.push(`<div class="gal-one" data-gal-k="empty">${empty_('Nothing here yet.')}</div>`); names.push('empty'); } catch (e) { /* no empty_ */ }
  try { html.push(`<div class="gal-one" data-gal-k="oops">${oopsHtml_()}</div>`); names.push('oops'); } catch (e) { /* no oops */ }
  slot.innerHTML = html.join('');
  return names;
}

/* IN THE PAGE: two PNGs compared; the side-by-side drawn when they differ. */
async function compare_([a, b]) {
  const img = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const [A, B] = await Promise.all([img(a), img(b)]);
  const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height);
  const px = im => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    x.fillStyle = '#ff00ff'; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0); return x.getImageData(0, 0, w, h); };
  const da = px(A), db = px(B), d = new ImageData(w, h);
  let n = 0;
  for (let i = 0; i < da.data.length; i += 4) {
    const diff = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]);
    const g = (db.data[i] + db.data[i + 1] + db.data[i + 2]) / 12;
    if (diff > 24) { n++; d.data[i] = 255; d.data[i + 1] = 40; d.data[i + 2] = 40; } else { d.data[i] = d.data[i + 1] = d.data[i + 2] = g; }
    d.data[i + 3] = 255;
  }
  const share = n / (w * h);
  const sizeMoved = A.width !== B.width || A.height !== B.height;
  if (!n && !sizeMoved) return { share: 0 };
  const gap = 8, out = document.createElement('canvas'); out.width = w * 3 + gap * 2; out.height = h;
  const o = out.getContext('2d'); o.fillStyle = '#808080'; o.fillRect(0, 0, out.width, h);
  o.drawImage(A, 0, 0); o.drawImage(B, w + gap, 0); o.putImageData(d, (w + gap) * 2, 0);
  return { share, sizeMoved, was: [A.width, A.height], now: [B.width, B.height], png: out.toDataURL('image/png') };
}

async function settle(page) {
  await page.waitForTimeout(350);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});
}

/* A CARD BY ITS BOX, NOT BY PLAYWRIGHT'S ELEMENT SHOT: that one waits for a card to stop moving, and a card with a live part never does. */
async function clipShot(page, sel, file) {
  const r = await page.evaluate(q => { const el = document.querySelector(q); if (!el) return null;
    /* A SPECIMEN ALONE AT THE TOP, so its place does not hang on the half-pixels of the ones above it. */
    const one = el.closest('.gal-one');
    if (one) { document.querySelectorAll('.gal-one').forEach(g => { g.style.display = g === one ? '' : 'none'; }); window.scrollTo(0, 0); }
    else el.scrollIntoView({ block: 'start', inline: 'nearest' });
    const b = el.getBoundingClientRect(), x = Math.max(0, Math.floor(b.left)), y = Math.max(0, Math.floor(b.top));
    const w = Math.min(innerWidth, Math.ceil(b.right)) - x, h = Math.min(innerHeight, Math.ceil(b.bottom)) - y;
    return w > 4 && h > 4 ? { x, y, width: w, height: h } : null; }, sel).catch(e => { if (process.env.GAL_DEBUG) console.log(String(e).slice(0, 200)); return null; });
  if (!r) { if (process.env.GAL_DEBUG) console.log('no box', sel); return false; }
  await page.waitForTimeout(60);
  try { await page.screenshot({ path: path.join(NOW, file), clip: r, timeout: 10000 }); return true; } catch (e) { if (process.env.GAL_DEBUG) console.log(String(e).slice(0, 300)); return false; }
}

async function shoot(browser, who, width, shots) {
  const page = await browser.newPage({ viewport: { width, height: Math.round(width * 2.1) }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 120)));
  await page.addInitScript(u => { try { localStorage.clear(); localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* storage blocked */ } }, who.user);
  await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null,
    null, { timeout: 30000 }).catch(() => {});
  await page.addStyleTag({ content: STILL_CSS });
  await page.waitForTimeout(800);
  const screens = await page.evaluate(() => { try { if (typeof columnsFor_ === 'function') columnsFor_(); } catch (e) { /* the list as it stands */ }
    return (typeof TABS !== 'undefined' ? TABS : []).map(t => t.id); });
  const tag = `${who.as}-${width}`;
  for (const id of screens) {
    if (ONLY && ONLY.indexOf(id) === -1) continue;
    await page.evaluate(sid => { try { go(sid, false, true); } catch (e) { /* the screen stays */ } }, id);
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    const f = `${tag}--${safe(id)}--screen.png`;
    await page.screenshot({ path: path.join(NOW, f) }); shots.push(f);
    const kinds = await page.evaluate(markCards_, 14);
    for (let i = 0; i < kinds.length; i++) {
      const g = `${tag}--${safe(id)}--${safe(kinds[i])}.png`;
      if (await clipShot(page, `[data-gal="${i}"]`, g)) shots.push(g);
    }
  }
  /* FIND'S KINDS, QUESTION TYPES AND THE EMPTY, LOCKED AND OOPS CARDS, on Find. */
  if (!ONLY || ONLY.indexOf('specimens') !== -1) {
    await page.evaluate(() => { try { go('stuff', false, true); } catch (e) { /* stays */ } });
    await page.waitForFunction(() => { try { return stuffItemsAll_().length > 0; } catch (e) { return false; } }, null, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const names = await page.evaluate(drawSpecimens_).catch(e => { console.log('  specimens: ' + String(e).slice(0, 200)); return []; });
    await settle(page);
    for (const k of names) {
      const g = `${tag}--find--${safe(k)}.png`;
      if (await clipShot(page, `.gal-one[data-gal-k="${k}"] > *`, g)) shots.push(g);
    }
  }
  await page.close();
  if (errors.length) console.log(`  ${tag}: ${errors.length} page error(s), first: ${errors[0]}`);
}

(async () => {
  fs.rmSync(NOW, { recursive: true, force: true }); fs.rmSync(DIFF, { recursive: true, force: true });
  [NOW, DIFF, OK].forEach(d => fs.mkdirSync(d, { recursive: true }));
  const server = await serve();
  const browser = await chromium.launch();
  const shots = [];
  try {
    for (const who of PEOPLE) for (const w of WIDTHS) { await shoot(browser, who, w, shots); console.log(`  ${who.as} at ${w}: ${shots.length} shots so far`); }
    const page = await browser.newPage();
    const url = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
    const changed = [], added = [];
    for (const f of shots) {
      const was = path.join(OK, f);
      if (!fs.existsSync(was)) { added.push(f); continue; }
      const r = await page.evaluate(compare_, [url(was), url(path.join(NOW, f))]).catch(e => ({ error: String(e) }));
      if (r.error) { changed.push({ f, note: r.error }); continue; }
      if (r.share >= NOISE || r.sizeMoved) {
        const side = path.join(DIFF, f);
        fs.writeFileSync(side, Buffer.from(r.png.split(',')[1], 'base64'));
        changed.push({ f, share: r.share, note: r.sizeMoved ? `size ${r.was.join('x')} -> ${r.now.join('x')}` : '' });
      }
    }
    const gone = fs.readdirSync(OK).filter(f => /\.png$/.test(f) && shots.indexOf(f) === -1
      && PEOPLE.some(p => f.startsWith(p.as + '-')) && WIDTHS.some(w => f.indexOf('-' + w + '--') !== -1));
    await page.close();
    changed.sort((a, b) => (b.share || 0) - (a.share || 0));
    const lines = [`# Gallery ${new Date().toISOString()}`, '', `${shots.length} shots in ${NOW}; approved set ${OK}.`, '',
      `## Changed (${changed.length}) — side by side in ${DIFF} (approved | now | red = moved)`, '',
      ...changed.map(c => `- ${c.f}  ${c.share !== undefined ? (c.share * 100).toFixed(2) + '%' : ''} ${c.note || ''}`), '',
      `## New, nothing approved to compare (${added.length})`, '', ...added.map(f => '- ' + f), '',
      `## Approved and not taken this time (${gone.length})`, '', ...gone.map(f => '- ' + f), ''];
    fs.writeFileSync(path.join(DIR, 'report.md'), lines.join('\n'));
    console.log(`gallery: ${shots.length} shots, ${changed.length} changed, ${added.length} new, ${gone.length} missing — ${path.join(DIR, 'report.md')}`);
    /* THE GATE: every changed or new shot must be signed with the hash of what was photographed now. */
    const moved = changed.map(c => c.f).concat(added).map(f => ({ f, hash: hash(path.join(NOW, f)) }));
    fs.writeFileSync(path.join(DIR, 'changed.json'), JSON.stringify(moved, null, 1) + '\n');
    if (GATE) { const signed = readSigned().shots || {}, unsigned = moved.filter(m => !signed[m.f] || signed[m.f].hash !== m.hash);
      unsigned.forEach(m => console.log(`  not approved: ${m.f} — look at ${path.join(fs.existsSync(path.join(DIFF, m.f)) ? DIFF : NOW, m.f)}`));
      if (unsigned.length) { console.log(`FAILED — ${unsigned.length} changed shot(s) nobody approved; look, then node tools/gallery.js --sign --dir=${DIR} --by=<who>`); process.exitCode = 1; }
      else console.log(`OK — ${moved.length} changed shot(s), each looked at and approved.`); }
    if (APPROVE) { shots.forEach(f => fs.copyFileSync(path.join(NOW, f), path.join(OK, f))); console.log(`approved ${shots.length} shots into ${OK}`); }
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
