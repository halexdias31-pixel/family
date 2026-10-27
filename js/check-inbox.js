#!/usr/bin/env node
/* @family. — check-inbox.js THE EMAIL WIDGET (493): an admin reads the owner's Gmail, read-only; nobody else can, and none of it is kept. No flags. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { JSDOM } = require('jsdom');
const { backend } = require('./check-gas-load.js');

const ROOT = path.join(__dirname, '..');
const bad = [];
const said = [];
const fail = (rule, msg) => bad.push(rule + ' — ' + msg);
const tick = ms => new Promise(ok => setTimeout(ok, ms));
async function until(fn, ms) {
  const end = Date.now() + (ms || 4000);
  while (Date.now() < end) { try { if (fn()) return true; } catch (e) { /* not yet */ } await tick(25); }
  return false;
}

/* ---------- MADE-UP MAIL. Nothing here is anybody's; example.org addresses only. */
const b64 = s => Buffer.from(s, 'utf8').toString('base64url');
const HTML = '<p>Hello <b>there</b></p><img src="https://track.example.org/pixel.gif">'
  + '<script>window.__pwned = 1</script><style>p{color:red}</style>'
  + '<a href="https://example.org/term" onclick="window.__pwned = 2">Term dates</a>'
  + '<a href="javascript:window.__pwned=3">bad</a><div onmouseover="x()" style="position:fixed">styled</div>';
const MSGS = {
  m001aaa: { id: 'm001aaa', threadId: 't001', internalDate: String(Date.UTC(2026, 9, 27, 9, 5)), labelIds: ['INBOX', 'UNREAD'],
    snippet: 'Could we move Thursday to four?', payload: { mimeType: 'multipart/alternative',
      headers: [{ name: 'From', value: '"Ada Sample" <ada@example.org>' }, { name: 'Subject', value: 'Thursday lesson' }, { name: 'To', value: 'owner@example.org' }],
      parts: [{ mimeType: 'text/plain', body: { data: b64('Could we move Thursday to four?') } }, { mimeType: 'text/html', body: { data: b64(HTML) } }] } },
  m002bbb: { id: 'm002bbb', threadId: 't002', internalDate: String(Date.UTC(2026, 9, 26, 15, 0)), labelIds: ['INBOX'],
    snippet: 'Receipt for October', payload: { mimeType: 'text/plain',
      headers: [{ name: 'From', value: 'billing@example.org' }, { name: 'Subject', value: 'Your receipt' }],
      body: { data: b64('Receipt for October.\nThanks.') } } },
};
const THREADS = { t001: ['m001aaa'], t002: ['m002bbb'] };
const asked = [];
const resp = (code, obj) => ({ getResponseCode: () => code, getContentText: () => JSON.stringify(obj) });
function gmail(url) {
  const u = new URL(url);
  const p = u.pathname.replace('/gmail/v1/users/me/', '');
  asked.push({ path: p, q: u.searchParams.get('q'), page: u.searchParams.get('pageToken') });
  if (p === 'threads') {
    const q = u.searchParams.get('q') || '';
    const ids = /is:unread/.test(q) ? ['t001'] : /nothing-matches/.test(q) ? [] : ['t002', 't001'];
    return resp(200, { threads: ids.map(id => ({ id, snippet: '' })), nextPageToken: u.searchParams.get('pageToken') ? '' : 'PAGE2' });
  }
  if (p === 'labels') return resp(200, { labels: [{ name: 'INBOX', type: 'system' }, { name: 'Parents', type: 'user' }] });
  if (p === 'profile') return resp(200, { threadsTotal: 2 });
  let m = /^threads\/(\w+)$/.exec(p);
  if (m) return resp(200, { id: m[1], messages: (THREADS[m[1]] || []).map(id => MSGS[id]) });
  m = /^messages\/(\w+)$/.exec(p);
  if (m) return MSGS[m[1]] ? resp(200, MSGS[m[1]]) : resp(404, {});
  /* ANY OTHER CALL IS A WRITE (modify, trash, send) — refused, and the check fails below. */
  return resp(400, { error: 'unexpected ' + p });
}
const FETCH = { fetch: (url, o) => { if (o && o.method && o.method !== 'get') asked.push({ path: 'WRITE ' + url }); return gmail(url); },
  fetchAll: reqs => reqs.map(r => gmail(r.url)) };
const UTIL = {
  getUuid: () => crypto.randomUUID(), sleep: () => {},
  formatDate: (d, tz, fmt) => (fmt === 'yyyy-MM-dd' ? new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'UTC' }).format(new Date(d)) : new Date(d).toISOString()),
  base64Encode: s => Buffer.from(Array.isArray(s) ? s.map(x => x & 255) : String(s)).toString('base64'),
  base64EncodeWebSafe: s => Buffer.from(Array.isArray(s) ? s.map(x => x & 255) : String(s)).toString('base64url'),
  base64Decode: s => Array.from(Buffer.from(String(s), 'base64')).map(x => (x > 127 ? x - 256 : x)),
  newBlob: s => ({ getBytes: () => (Array.isArray(s) ? s : Array.from(Buffer.from(String(s)))),
    getDataAsString: () => (Array.isArray(s) ? Buffer.from(s.map(x => x & 255)).toString('utf8') : String(s)) }),
  computeDigest: (alg, s) => Array.from(crypto.createHash('sha256').update(String(s)).digest()).map(x => (x > 127 ? x - 256 : x)),
  DigestAlgorithm: { MD5: 'MD5', SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' },
};

/* ---------- THE BACKEND ---------- */
const b = backend({ UrlFetchApp: FETCH, Utilities: UTIL });
const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London', xp: 0, credits: 0, last_name: 'Inboxtest' };
const PEOPLE = [
  { person_id: 'I-ADM', role: 'admin', first_name: 'Ottilie', handle: 'ottilie_ib1', email: 'adm@example.org' },
  { person_id: 'I-CLI', role: 'client', first_name: 'Barnaby', handle: 'barnaby_ib2', email: 'cli@example.org' },
  { person_id: 'I-TUT', role: 'tutor', first_name: 'Cosmo', handle: 'cosmo_ib3', email: 'tut@example.org' },
].map(p => Object.assign({}, base, p));
b.seed('people', PEOPLE);
const tok = {};
PEOPLE.forEach(p => { const d = b.post({ action: 'verifyLogin', email: p.email, pin: '0000' }); if (d && d.success) tok[p.person_id] = d; });
if (Object.keys(tok).length !== PEOPLE.length) {
  console.log('FAILED — only ' + Object.keys(tok).length + ' of ' + PEOPLE.length + ' invented people could sign in, so NOTHING was checked.');
  process.exit(1);
}
const as = (pid, body) => b.post(Object.assign({ token: tok[pid].token, name: tok[pid].name, personId: pid }, body));
const writesBefore = JSON.stringify(b.tabs);

{
  const l = as('I-ADM', { action: 'inboxList', q: '', page: '' });
  if (!l.success || (l.rows || []).length !== 2) fail('inboxList', 'an admin did not get two rows: ' + JSON.stringify(l).slice(0, 200));
  else {
    if (l.rows[0].id !== 'm001aaa') fail('inboxList', 'not newest first: ' + l.rows.map(r => r.id).join());
    if (l.rows[0].from !== 'Ada Sample' || l.rows[0].subject !== 'Thursday lesson' || !l.rows[0].unread || l.rows[1].unread)
      fail('inboxList', 'the summary is wrong: ' + JSON.stringify(l.rows[0]));
    if (l.next !== 'PAGE2') fail('inboxList', 'no page token for more');
    if ((l.labels || []).join() !== 'Parents') fail('inboxList', 'labels: ' + JSON.stringify(l.labels));
  }
  if ((asked.find(a => a.path === 'threads') || {}).q !== 'in:inbox') fail('inboxList', 'an empty query did not default to in:inbox');
  asked.length = 0;
  as('I-ADM', { action: 'inboxList', q: 'from:ada', page: 'PAGE2' });
  const t = asked.find(a => a.path === 'threads') || {};
  if (t.q !== 'from:ada' || t.page !== 'PAGE2') fail('inboxList', 'q and page did not reach Gmail: ' + JSON.stringify(t));
  const r = as('I-ADM', { action: 'inboxRead', id: 'm001aaa' });
  if (!r.success || !/Hello/.test(r.html || '') || /<script|onclick|<style/i.test(r.html)) fail('inboxRead', 'the message: ' + JSON.stringify(r).slice(0, 240));
  if (as('I-ADM', { action: 'inboxRead', id: '../labels' }).success) fail('inboxRead', 'an id that is a path was fetched');
  ['I-CLI', 'I-TUT'].forEach(pid => {
    asked.length = 0;
    const x = as(pid, { action: 'inboxList', q: '' }), y = as(pid, { action: 'inboxRead', id: 'm001aaa' });
    if (x.success || y.success || !x.error || !y.error || asked.length) fail('refused', pid + ' was answered: ' + JSON.stringify([x, y]).slice(0, 200));
  });
  const anon = b.post({ action: 'inboxList', q: '' });
  if (anon.success) fail('refused', 'a request with no token was answered');
  /* NOTHING ABOUT THE INBOX IN doGet, signed in as the admin, and nothing written to any tab. */
  const g = JSON.stringify(b.get({ token: tok['I-ADM'].token }));
  if (/Thursday lesson|Ada Sample|m001aaa|Could we move/.test(g)) fail('doGet', 'the payload carries the inbox');
  if (/Thursday lesson|Ada Sample|Could we move/.test(JSON.stringify(b.tabs)) || JSON.stringify(b.tabs).length !== writesBefore.length && /Ada|Thursday/.test(JSON.stringify(b.tabs)))
    fail('kept', 'a sheet holds mail');
  if (/Thursday lesson|Could we move/.test(JSON.stringify(b.log || {}))) fail('kept', 'mail reached the log');
  if (asked.some(a => /^WRITE|modify|trash|send/.test(a.path))) fail('read-only', 'a write reached Gmail');
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'backend', 'appsscript.json'), 'utf8'));
  if ((manifest.oauthScopes || []).indexOf('https://www.googleapis.com/auth/gmail.readonly') < 0) fail('manifest', 'gmail.readonly is not listed');
  if ((manifest.oauthScopes || []).some(s => /mail\.google\.com|gmail\.(modify|send|compose)/.test(s))) fail('manifest', 'a Gmail scope wider than read-only is listed');
  if (!bad.length) said.push('backend: admin lists (newest first, unread, labels, page token), reads one sanitised; client and tutor refused before Gmail is asked; nothing in doGet or a sheet');
}

/* ---------- THE SCREEN: the real app, every post answered by the real backend ---------- */
const html0 = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const FILES = [...(/window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html0) || ['', ''])[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
if (FILES.indexOf('inbox') < 0) { console.log('FAILED — inbox is not in index.html\'s FILES, so the screen was NOT checked.'); process.exit(1); }
const SRC = FILES.map(n => fs.readFileSync(path.join(ROOT, 'js', n + '.js'), 'utf8')).join('\n');
const FIXTURE = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8'));
const opened = [];
function app(pid) {
  const html = html0.replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.org/' });
  const w = dom.window;
  opened.push(w);
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLMediaElement.prototype.pause = () => {};
  w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  w.HTMLMediaElement.prototype.load = () => {};
  w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  const t = tok[pid];
  w.localStorage.setItem('familyUser', JSON.stringify(Object.assign({}, t, { personId: pid, role: PEOPLE.find(p => p.person_id === pid).role })));
  const sent = [];
  const features = b.get({ token: t.token }).features;
  w.fetch = (url, o) => {
    const reply = x => Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(x)), json: () => Promise.resolve(x) });
    if (o && o.body) {
      let body = {}; try { body = JSON.parse(o.body); } catch (e) {}
      sent.push(body);
      let d; try { d = b.post(body); } catch (e) { d = { error: 'backend threw: ' + e.message }; }
      return reply(d);
    }
    const f = /(data\/[a-z0-9_\-\/]+\.json)/.exec(String(url));
    if (f) { try { return reply(JSON.parse(require('../check/lib-full.js').serve(path.join(ROOT, f[1])) || fs.readFileSync(path.join(ROOT, f[1]), 'utf8'))); } catch (e) {} }
    return reply(Object.assign({}, FIXTURE, { features }));
  };
  const errs = [];
  w.onerror = m => errs.push(String(m));
  try { w.eval(SRC + '\n;window.__u = { go, ACTIONS, widgetsOf_, LOADED: () => LOADED, setToast: f => { toast = f; } };'); }
  catch (e) { return { err: 'the app did not load: ' + e.message }; }
  w.__u.setToast(() => {});
  return { w, d: w.document, u: w.__u, sent, errs };
}

async function screens() {
  const A = app('I-ADM');
  if (A.err) return fail('the app', A.err);
  await until(() => A.u.LOADED(), 45000);
  if (!A.u.widgetsOf_('tool').some(x => x.id === 'inbox')) return fail('admin', 'an admin\'s Tools has no Email');
  A.u.go('tools');
  if (!(await until(() => A.d.querySelectorAll('#s-tools .ib-box .ib-row').length === 2, 20000))) {
    return fail('admin', 'the list did not draw two rows: ' + ((A.d.querySelector('#s-tools .ib-box') || {}).textContent || '(no box)').replace(/\s+/g, ' ').slice(0, 200));
  }
  const first = A.d.querySelector('#s-tools .ib-row');
  if (!first.classList.contains('is-unread') || !/Ada Sample/.test(first.textContent) || !/Thursday lesson/.test(first.textContent)) fail('admin', 'the first row reads "' + first.textContent.replace(/\s+/g, ' ').trim() + '"');
  if (!A.d.querySelector('#s-tools .ib-box .search-pill input.ib-q')) fail('admin', 'no search pill');
  if (!A.d.querySelector('#s-tools .ib-chips [data-k="label:Parents"]')) fail('admin', 'no label chip');
  if (!A.d.querySelector('#s-tools .ib-box [data-do="inbox-more"]')) fail('admin', 'no More');
  /* OPEN ONE */
  A.u.ACTIONS['inbox-open'](first);
  if (!(await until(() => A.d.querySelector('#s-tools .ib-body'), 15000))) return fail('open', 'the message never drew');
  const body = A.d.querySelector('#s-tools .ib-body');
  if (!/Hello/.test(body.textContent)) fail('open', 'the body reads "' + body.textContent.slice(0, 80) + '"');
  if (body.querySelector('script,style,[onclick],[onmouseover],[style]') || A.w.__pwned) fail('open', 'something live survived: ' + body.innerHTML.slice(0, 200));
  const img = body.querySelector('img');
  if (!img || img.getAttribute('src')) fail('open', 'a remote image was not blocked by default: ' + (img ? img.outerHTML : 'no img'));
  const links = [...body.querySelectorAll('a')];
  if (links.some(a => /^javascript/i.test(a.getAttribute('href') || '')) || links.some(a => a.getAttribute('href') && (a.target !== '_blank' || !/noopener/.test(a.rel)))) fail('open', 'a link is unsafe: ' + links.map(a => a.outerHTML).join(' '));
  const gm = A.d.querySelector('#s-tools .ib-msg a.tile[href^="https://mail.google.com/"]');
  if (!gm) fail('open', 'no Open in Gmail tile');
  const show = A.d.querySelector('#s-tools [data-do="inbox-images"]');
  if (!show) fail('open', 'no Show images tile');
  else { A.u.ACTIONS['inbox-images'](show); const im = A.d.querySelector('#s-tools .ib-body img'); if (!im || !/^https:/.test(im.getAttribute('src') || '')) fail('open', 'Show images did not show it'); }
  A.u.ACTIONS['inbox-back'](A.d.querySelector('#s-tools [data-do="inbox-back"]'));
  /* SEARCH */
  const q = A.d.querySelector('#s-tools .ib-q');
  q.value = 'from:ada';
  q.dispatchEvent(new A.w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await until(() => A.sent.some(s => s.action === 'inboxList' && /from:ada/.test(s.q)), 10000);
  const s = A.sent.filter(x => x.action === 'inboxList').pop() || {};
  if (s.q !== 'in:inbox from:ada') fail('search', 'the search sent q=' + JSON.stringify(s.q));
  await until(() => A.d.querySelectorAll('#s-tools .ib-row').length, 10000);
  A.u.ACTIONS['inbox-chip'](A.d.querySelector('#s-tools [data-k="unread"]'));
  await until(() => A.sent.filter(x => x.action === 'inboxList').pop().q === 'in:inbox is:unread from:ada', 10000);
  if (A.sent.filter(x => x.action === 'inboxList').pop().q !== 'in:inbox is:unread from:ada') fail('search', 'the Unread chip did not narrow the query');
  if (A.sent.some(x => /^inbox/.test(x.action) && !/^inbox(List|Read)$/.test(x.action))) fail('read-only', 'the widget sent something else');
  if (!bad.some(x => /^(admin|open|search)/.test(x))) said.push('screen: admin sees the list, opens a message (images blocked, links safe, Show images, Open in Gmail), search and chips reach q');

  const C = app('I-CLI');
  if (C.err) return fail('the app', C.err);
  await until(() => C.u.LOADED(), 45000);
  C.u.go('tools');
  await tick(300);
  if (C.u.widgetsOf_('tool').some(x => x.id === 'inbox') || C.d.querySelector('.ib-box .ib-row, .ib-q')) fail('client', 'a client sees the Email widget');
  if (C.sent.some(x => /^inbox/.test(x.action))) fail('client', 'a client\'s phone asked for mail');
  if (!bad.some(x => /^client/.test(x))) said.push('screen: a client has no Email widget and sends nothing');
  [A, C].forEach(X => X.errs.length && fail('the app', 'script errors: ' + X.errs.slice(0, 3).join(' | ')));
}

screens().catch(e => fail('the app', 'threw: ' + (e && e.stack || e))).then(() => {
  opened.forEach(w => { try { w.close(); } catch (e) {} });
  said.forEach(x => console.log('  ' + x));
  if (bad.length) {
    console.log('\nFAILED — ' + bad.length + ':');
    bad.forEach(x => console.log('  ✗ ' + x));
    process.exit(1);
  }
  console.log('check-inbox: OK — the Email widget is admin-only, read-only and kept nowhere');
  process.exit(0);
});
