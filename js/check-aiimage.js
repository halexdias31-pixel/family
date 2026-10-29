#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* node js/check-aiimage.js — THE PEN'S DRAWING AND THE PHOTOS REACH THE AI (round 3), stubbed both ends, no network. */
/* Phone: an AI part's Check sends `images` (drawing PNG, then photos) only to a backend listing `aiMarkImages`. */
/* Backend: `aiMark` hands them to Gemini as inlineData, refuses bad ones whole, keeps the daily cap. */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { backend } = require('./check-gas-load.js');
const LIB_FULL = require('../check/lib-full.js');

const ROOT = path.join(__dirname, '..');
const bad = [];
const PNG = 'data:image/png;base64,' + Buffer.from('a png, near enough').toString('base64');
const JPG = 'data:image/jpeg;base64,' + Buffer.from('a jpeg, near enough').toString('base64');

/* ---------- THE BACKEND: `aiMark` with pictures ---------- */
const sent = [];
const quiet = () => {};
const b = backend({ console: { log: quiet, warn: quiet, error: quiet, info: quiet }, UrlFetchApp: { fetch: (url, o) => { sent.push(o); return { getResponseCode: () => 200,
  getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ awarded: 1, feedback: 'The line is drawn through both points.' }) }] } }] }) }; } } });
const base = { pin: '0000', verified: 'TRUE', role: 'student', city: 'London' };
b.seed('people', [Object.assign({ person_id: 'P-S1', first_name: 'Ann', last_name: 'Aa', handle: 'anna', email: 's1@example.org' }, base)]);
b.seed('config', [{ key: 'ai_marks_per_day', value: '4' }]);
const tok = b.post({ action: 'verifyLogin', email: 's1@example.org', pin: '0000' }).token;
const ask = extra => b.post(Object.assign({ action: 'aiMark', token: tok, personId: 'P-S1', question: 'Draw the line y = x.',
  scheme: 'a straight line through (0,0) and (4,4) (1)', answer: '', marks: 1 }, extra || {}));
b.props.GEMINI_API_KEY = 'test-key-not-a-real-one';
const partsOf = o => { try { return JSON.parse(o.payload).contents[0].parts; } catch (e) { return []; } };
const sysOf = o => { try { return JSON.parse(o.payload).systemInstruction.parts[0].text; } catch (e) { return ''; } };

let d = ask({ images: [PNG, JPG] });
const last = sent[sent.length - 1] || {};
const inl = partsOf(last).filter(p => p.inlineData).map(p => p.inlineData);
if (!d.success || d.awarded !== 1) bad.push('a drawing with an empty box was not marked: ' + JSON.stringify(d));
if (inl.length !== 2 || inl[0].mimeType !== 'image/png' || inl[0].data !== PNG.split(',')[1] || inl[1].mimeType !== 'image/jpeg' || inl[1].data !== JPG.split(',')[1])
  bad.push('Gemini was not sent the drawing then the photo as inlineData: ' + JSON.stringify(inl).slice(0, 200));
if (!/drawing/.test(sysOf(last)) || !/photo/.test(sysOf(last))) bad.push('the instructions do not say which picture is the drawing and which the photo');
/* THE PROMPT SAYS THE FIRST PICTURE IS THE DRAWING, so a drawing sent after a photo is put first on the server (Review B) */
d = ask({ images: [JPG, PNG] });
const inl2 = partsOf(sent[sent.length - 1] || {}).filter(p => p.inlineData).map(p => p.inlineData.mimeType);
if (!d.success || inl2.join(' ') !== 'image/png image/jpeg') bad.push('a photo then a drawing reached Gemini as ' + JSON.stringify(inl2) + ', not the drawing first');
let n = sent.length;
[['a GIF', ['data:image/gif;base64,R0lGOD']], ['two drawings', [PNG, PNG]], ['five pictures', [PNG, JPG, JPG, JPG, JPG]], ['four photos', [JPG, JPG, JPG, JPG]],
 ['a picture over the ceiling', ['data:image/png;base64,' + 'A'.repeat(760001)]], ['a picture that is not base64', ['data:image/png;base64,<svg>']]].forEach(([what, images]) => {
  const r = ask({ images });
  if (r.success !== false || !/could not be sent/.test(String(r.message))) bad.push(what + ' was not refused whole: ' + JSON.stringify(r).slice(0, 160));
});
if (sent.length !== n) bad.push('a refused picture still reached Gemini');
d = ask({ images: [] });
if (d.success !== false || !/Write something first/.test(String(d.message)) || sent.length !== n) bad.push('nothing typed and no picture was not refused before Gemini: ' + JSON.stringify(d));
/* THE CAP STILL COUNTS a press with pictures: four a day here, two used above */
ask({ images: [JPG] }); ask({ images: [JPG] });
d = ask({ images: [JPG] });
if (d.why !== 'ai-cap') bad.push('the daily cap did not hold for marks with pictures: ' + JSON.stringify(d));

/* ---------- THE PHONE: an AI part's Check, with ink on its pen and a photo ---------- */
function order_() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
  return m ? [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : [];
}
function boot(rows, features, posts) {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.org/' });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  const fixture = Object.assign(JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8')), { features, aiMarking: true });
  const ok = v => ({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(v)), json: () => Promise.resolve(v) });
  w.fetch = (url, o) => {
    if (o && o.body) {
      let body = {};
      try { body = JSON.parse(o.body); } catch (e) {}
      if (body.action === 'aiMark') { posts.push(body); return Promise.resolve(ok({ success: true, awarded: 1, available: 1, feedback: 'Fine.' })); }
      return Promise.resolve(ok({ success: true }));
    }
    if (/data\/questions\.json/.test(String(url))) return Promise.resolve(ok(rows));
    return Promise.resolve(ok(fixture));
  };
  w.__aheadHold = true;
  const files = order_();
  if (!files.length) return null;
  w.eval(files.map(f => fs.readFileSync(path.join(__dirname, f + '.js'), 'utf8')).join('\n') + '\n;window.__t = { ACTIONS, WORK_PICS, padKey: padKey_, ansKey: ansKey_, setUser: u => { USER = u; } };');
  return w;
}
const tick = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  let LIB = [];
  try { LIB = LIB_FULL.rows('questions'); } catch (e) { bad.push('the library could not be read: ' + e.message); }
  /* AN AI-MARKED DRAWN PART with a scheme and a figure, and the rest of its paper so Find files it as it would */
  const vm = require('vm');
  const Q = vm.runInContext(fs.readFileSync(path.join(__dirname, 'qtypes.js'), 'utf8') + ';({ qtMarker_, qtDrawn_ })', vm.createContext({}));
  const row = LIB.find(r => r.kind === 'question' && !LIB_FULL.pending(r) && Q.qtDrawn_(r) && Q.qtMarker_(r) === 'ai' && String(r.answer || '').trim() && String(r.diagram || '').trim());
  if (!row) { bad.push('no AI-marked drawn part with a scheme and a figure in the library — the phone leg could NOT be checked'); return finish(); }
  const rows = LIB.filter(r => r.paper_id === row.paper_id);
  for (const [features, want] of [[['aiMark', 'aiMarkWhole', 'aiMarkImages'], 'images'], [['aiMark', 'aiMarkWhole'], 'words only']]) {
    const posts = [];
    const w = boot(rows, features, posts);
    if (!w) { bad.push('index.html lists no files — the phone leg could NOT be checked'); break; }
    await tick(400);
    const t = w.__t;
    const x = (w.stuffItemsAll_ ? w.stuffItemsAll_() : []).find(i => i.row && i.row.row_id === row.row_id);
    if (!x || !t || typeof w.penPng_ !== 'function' || typeof w.aiImages_ !== 'function') { bad.push(row.row_id + ' did not reach Find, or penPng_/aiImages_ are not in the app — NOT checked'); w.close(); break; }
    t.setUser({ token: 'tok', personId: 'P-S1', name: 'Ann' });
    let padSeen = null;
    const realPng = w.penPng_;
    w.penPng_ = pad => { padSeen = pad; return Promise.resolve(PNG); };
    w.localStorage.setItem(t.padKey(x), JSON.stringify([[30, 30, 120, 90]]));
    t.WORK_PICS[t.ansKey(x)] = [{ url: JPG }];
    const host = w.document.createElement('div');
    w.document.body.appendChild(host);
    host.innerHTML = w.questionCard_(x, 0);
    const go = host.querySelector('.qt-row [data-do="qp-ai"]');
    const how = (host.querySelector('.qt-how') || {}).textContent || '';
    if (!go || go.disabled) { bad.push(want + ': ' + row.row_id + ' has no pressable AI Check'); w.close(); continue; }
    if (!/AI/.test(how)) bad.push(want + ': the line under Check says ' + JSON.stringify(how) + ', not that the AI marks it');
    t.ACTIONS['qp-ai'](go);
    await tick(50);
    const out = (host.querySelector('.qp-ai .qp-verdict') || {}).textContent || '';
    if (want === 'images') {
      const p = posts[0] || {};
      if (posts.length !== 1) bad.push('images: Check with ink and a photo and an empty box sent ' + posts.length + ' aiMark requests, wanted 1 (said ' + JSON.stringify(out) + ')');
      else if (!Array.isArray(p.images) || p.images[0] !== PNG || p.images[1] !== JPG || p.images.length !== 2) bad.push('images: the request carried ' + String(JSON.stringify(p.images)).slice(0, 120) + ', wanted [the drawing PNG, the photo]');
      if (!padSeen || !padSeen.classList.contains('qpad')) bad.push('images: the drawing was not rendered from the card\'s own pad');
      if (!/1 of 1 mark/.test(out)) bad.push('images: the verdict line says ' + JSON.stringify(out));
    } else {
      if (posts.length) bad.push('words only: a backend that does not read pictures was sent ' + posts.length + ' request(s) for an empty box');
      if (!/Write your answer in the box too/.test(out)) bad.push('words only: an empty box with a drawing says ' + JSON.stringify(out));
      /* and with words typed, the request carries no pictures that backend would drop */
      const inp = host.querySelector('.qp-ans-in');
      inp.value = 'a straight line';
      t.ACTIONS['qp-ai'](go);
      await tick(50);
      if (posts.length !== 1 || 'images' in posts[0]) bad.push('words only: the request was ' + JSON.stringify(posts[0] || null).slice(0, 120));
    }
    /* WHAT THE PNG IS DRAWN FROM (Review B): the figure, the Grid tool's axes as lines (on screen they are CSS), the ink last, and an <img> figure for the canvas */
    if (want === 'images') {
      const pad = host.querySelector('.qpad'), art = pad && pad.querySelector('.qpad-art');
      if (!art || typeof w.penSvg_ !== 'function') bad.push('images: no pad art, or penSvg_ is not in the app — the PNG\'s contents NOT checked');
      else {
        w.Element.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, width: 340, height: 340, right: 340, bottom: 340 });
        art.classList.add('qt-over-coord');
        const pic = w.document.createElement('img');
        art.insertBefore(pic, art.firstChild);
        const made = w.penSvg_(pad);
        const kids = made ? [...made.out.children] : [];
        const overAt = kids.findIndex(c => c.classList && c.classList.contains('qt-over'));
        const inkAt = kids.findIndex(c => c.querySelector && c.querySelector('.qpad-g path, path'));
        const lines = overAt >= 0 ? kids[overAt].querySelectorAll('line').length : 0;
        if (!made) bad.push('images: penSvg_ made nothing from a pad with ink');
        else {
          if (lines < 40) bad.push('images: the Grid tool\'s axes are not in the PNG (' + lines + ' lines drawn for them)');
          if (overAt < 0 || kids.length < 3 || overAt === kids.length - 1) bad.push('images: the grid is not drawn between the figure and the ink');
          if (made.imgs.length !== 1 || made.imgs[0].el !== pic) bad.push('images: a picture figure is not passed to the canvas (' + made.imgs.length + ')');
        }
        if (inkAt < 0) bad.push('images: the ink is not in the PNG');
        pic.remove(); art.classList.remove('qt-over-coord');
      }
    }
    /* THE REAL RENDERER IN A DOM WITH NO CANVAS gives '' and never throws: the words still go */
    try { const r = await realPng(host.querySelector('.qpad')); if (r !== '') bad.push(want + ': penPng_ with no canvas gave ' + JSON.stringify(String(r).slice(0, 40))); }
    catch (e) { bad.push(want + ': penPng_ with no canvas threw ' + e.message); }
    w.close();
  }
  finish();
})();

function finish() {
  if (bad.length) { bad.forEach(x => console.log('  ✗ ' + x)); console.log('FAILED — the AI\'s pictures: ' + bad.length + ' problem(s).'); process.exit(1); }
  console.log('OK — the pen\'s drawing (PNG) and the photos reach aiMark and Gemini as inlineData, bad pictures are refused whole, the cap holds, and an old backend is sent words only.');
}
