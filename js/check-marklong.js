#!/usr/bin/env node
/* node js/check-marklong.js — A LONG ANSWER MARKED BY CLAUDE HAIKU (owner, 16 Nov), through the real doPost with a stubbed UrlFetchApp:
   a good reply is saved and shown; bad JSON, a mark out of range or a timeout save only; the same answer is not asked twice;
   a missing key says so; no name or id goes to the API; a part with a mechanical key never calls it, and the phone only sends from Save. */
'use strict';
require('../check/quiet');
const fs = require('fs'), path = require('path');
const { backend } = require('./check-gas-load.js');
const REPO = path.join(__dirname, '..');
const bad = [];

/* ---------- THE PHONE: only `qp-send` (a part with no mechanical key) reaches markLong, behind the feature ---------- */
const cells = fs.readFileSync(path.join(REPO, 'js/find-cells.js'), 'utf8');
const send = (/on\('qp-send'[\s\S]*?\n\}\);/.exec(cells) || [''])[0];
if (!/markLongOn_\(\)[\s\S]*markLong_\(/.test(send)) bad.push('the Save tile (qp-send) does not mark with Haiku when the feature is on');
if ((cells.match(/action: 'markLong'/g) || []).length !== 1) bad.push('find-cells.js should call markLong from one place only');
if (!/features\.indexOf\('markLong'\)/.test(cells)) bad.push('the phone does not ask for the markLong feature before marking');
const js = fs.readdirSync(path.join(REPO, 'js')).filter(f => /\.js$/.test(f) && !/^check/.test(f));
js.forEach(f => { if (f !== 'find-cells.js' && /action: 'markLong'/.test(fs.readFileSync(path.join(REPO, 'js', f), 'utf8'))) bad.push(f + ' calls markLong — only the Save tile may'); });
const check = (/on\('qp-check'[\s\S]*?\n\}\);/.exec(cells) || [''])[0];
if (/markLong/.test(check)) bad.push('the mechanical Check calls markLong');

/* ---------- THE BACKEND ---------- */
const sent = [];
let reply = () => ({ code: 500, text: '' });
const files = {};
let n = 0;
const folder = { getFoldersByName: () => ({ hasNext: () => false }), createFolder: () => folder,
  createFile: blob => { const id = 'FILE' + String(++n).padStart(8, '0'); files[id] = blob; return { getId: () => id, setSharing: () => {} }; } };
const b = backend({
  UrlFetchApp: { fetch: (url, o) => { sent.push({ url, o }); const r = reply(); if (r.throw) throw new Error('Timeout: ' + url); return { getResponseCode: () => r.code, getContentText: () => r.text }; } },
  DriveApp: { getFolderById: () => folder, getFileById: () => ({ getBlob: () => ({ getBytes: () => [1] }) }), Access: {}, Permission: {} },
});
const U = b.ev('Utilities');
if (!U.base64Decode) U.base64Decode = s => Array.from(Buffer.from(String(s), 'base64'));
if (!U.base64Encode) U.base64Encode = a => Buffer.from(a).toString('base64');
if (!U.computeDigest) U.computeDigest = (alg, s) => Array.from(require('crypto').createHash('sha256').update(String(s)).digest());
/* THE LEDGER'S PRIVATE HALF, stubbed: a 20-mark writing question and a part with a key. */
b.ev(`libContent_ = function (ids) { const all = {
  'q:Q-ENG-4': { html: '<p>Write a description suggested by this picture.</p>', lead: '', answer: '<p><b>Content and organisation (12 marks)</b> Level 4 (10–12 marks) …</p><p><b>Technical accuracy</b> … (20 marks)</p>' },
  'q:Q-KEY-1': { html: '<p>Name the gas.</p>', answer: 'oxygen', accept: 'oxygen|O2' } };
  const items = {}; ids.forEach(t => { if (all[t]) items[t] = all[t]; }); return { items: items, missing: [] }; }`);
const base = { pin: '0000', verified: 'TRUE', role: 'student', city: 'London' };
b.seed('people', [Object.assign({ person_id: 'P-S1', first_name: 'Zebedee', last_name: 'Quartermaine', handle: 'zebq', email: 'zq@example.org' }, base)]);
b.seed('config', [{ key: 'posts_folder', value: 'FOLDER123456789' }]);
const tok = b.post({ action: 'verifyLogin', email: 'zq@example.org', pin: '0000' }).token;
let seq = 0;
const ask = (answer, extra) => b.post(Object.assign({ action: 'markLong', token: tok, personId: 'P-S1', id: Date.now() + '-ml' + (++seq),
  key: 'q:Q-ENG-4', answer: answer, label: 'English · Paper 1 · Q4' }, extra || {}));
const rows = () => b.tabs.submissions.length - 1;
const last = () => { const h = b.tabs.submissions[0], r = b.tabs.submissions[b.tabs.submissions.length - 1]; return { verdict: String(r[h.indexOf('verdict')]), feedback: String(r[h.indexOf('feedback')] || '') }; };
const ok = o => ({ code: 200, text: JSON.stringify({ stop_reason: 'end_turn', content: [{ type: 'text', text: typeof o === 'string' ? o : JSON.stringify(o) }] }) });
const GOOD = { marks: 14, max: 20, level: 'Level 3', strengths: ['Vivid verbs.', 'Clear paragraphs.', 'extra'], next: ['Vary sentence openings.', 'Check commas.'] };

/* THE FEATURE IS DECLARED. */
if (!/'markLong'/.test(fs.readFileSync(path.join(REPO, 'backend/get-start.gs'), 'utf8'))) bad.push('payloadFeatures_ does not name markLong');

/* SIGNED OUT: refused at the gate. */
{ const d = b.post({ action: 'markLong', key: 'q:Q-ENG-4', answer: 'x', id: Date.now() + '-zz1' });
  if (d.success !== false && !d.error) bad.push('markLong answered someone signed out: ' + JSON.stringify(d).slice(0, 120)); }

/* NO KEY: a plain message, saved, no call. */
{ const before = rows(), d = ask('A storm rolled in.');
  if (sent.length) bad.push('with no ANTHROPIC_API_KEY markLong still called the API');
  if (!d.success || d.marked !== false || d.why !== 'ai-off' || !/not switched on/.test(d.message || '')) bad.push('a missing key did not say so plainly: ' + JSON.stringify(d));
  if (rows() !== before + 1 || last().verdict !== 'sent') bad.push('with no key the answer was not saved as `sent`'); }

b.props.ANTHROPIC_API_KEY = 'sk-test-not-real';

/* A GOOD REPLY: saved as ai:14/20 and shown with two strengths and two next steps. */
{ reply = () => ok(GOOD); sent.length = 0;
  const before = rows(), d = ask('The sky bruised purple over the harbour.');
  if (sent.length !== 1) bad.push('a good mark took ' + sent.length + ' calls — wanted 1');
  if (!d.success || !d.marked || d.marks !== 14 || d.max !== 20 || d.level !== 'Level 3' || d.strengths.length !== 2 || d.next.length !== 2) bad.push('a good reply came back ' + JSON.stringify(d));
  if (rows() !== before + 1 || last().verdict !== 'ai:14/20') bad.push('a good mark was not saved as ai:14/20 (got ' + last().verdict + ')');
  if (!/Vivid verbs/.test(last().feedback)) bad.push('the feedback was not saved on the submission row');
  const o = sent[0] && sent[0].o, body = o ? JSON.parse(o.payload) : {};
  if (!sent[0] || sent[0].url !== 'https://api.anthropic.com/v1/messages') bad.push('the request did not go to the Messages API');
  if (body.model !== 'claude-haiku-5-5') bad.push('the model is ' + body.model + ' — wanted claude-haiku-5-5');
  if (!o || o.headers['x-api-key'] !== 'sk-test-not-real' || o.headers['anthropic-version'] !== '2023-06-01' || o.headers['content-type'] !== 'application/json') bad.push('the request headers are wrong');
  if (!/ONLY against the official mark scheme/.test(body.system || '')) bad.push('the system prompt does not tie the marking to the mark scheme');
  /* NO PERSONAL DATA IN THE BODY. */
  const raw = o ? String(o.payload) : '';
  ['Zebedee', 'Quartermaine', 'zebq', 'zq@example.org', 'P-S1', tok, 'English · Paper 1'].forEach(s => { if (raw.indexOf(s) !== -1) bad.push('the request body carries "' + s + '"'); });
  if (!/description suggested by this picture/.test(raw) || !/Technical accuracy/.test(raw) || !/bruised purple/.test(raw)) bad.push('the request lacks the question, the scheme or the answer'); }

/* THE CACHE: the same answer to the same part, no second call. */
{ sent.length = 0; reply = () => { bad.push('the cache was missed'); return ok(GOOD); };
  const d = ask('The sky bruised purple over the harbour.');
  if (sent.length) bad.push('the same answer called the API again');
  if (!d.marked || !d.cached || d.marks !== 14) bad.push('a cache hit came back ' + JSON.stringify(d)); }

/* SAVE-ONLY CASES: bad JSON, out of range, a fractional mark, a timeout (one retry), a 5xx twice. */
[['bad JSON', () => ok('{"marks": 14, oops'), 1],
 ['marks over the max', () => ok(Object.assign({}, GOOD, { marks: 21 })), 1],
 ['negative marks', () => ok(Object.assign({}, GOOD, { marks: -1 })), 1],
 ['a refusal', () => ({ code: 200, text: JSON.stringify({ stop_reason: 'refusal', content: [] }) }), 1],
 ['a timeout', () => ({ throw: true }), 2],
 ['a 529', () => ({ code: 529, text: '{"type":"error"}' }), 2],
 ['a 400', () => ({ code: 400, text: '{"type":"error"}' }), 1]].forEach(([what, r, calls], i) => {
  reply = r; sent.length = 0;
  const before = rows(), d = ask('Answer number ' + i + ' for ' + what + '.');
  if (sent.length !== calls) bad.push(what + ': ' + sent.length + ' calls — wanted ' + calls);
  if (!d.success || d.marked !== false || d.marks !== undefined || !d.message) bad.push(what + ' showed a mark or no plain message: ' + JSON.stringify(d));
  if (rows() !== before + 1 || last().verdict !== 'sent') bad.push(what + ' was not saved as `sent`');
});

/* A TIMEOUT THEN A GOOD REPLY: the one retry marks it. */
{ let t = 0; reply = () => (t++ === 0 ? { throw: true } : ok(GOOD)); sent.length = 0;
  const d = ask('Retry me please.');
  if (sent.length !== 2 || !d.marked) bad.push('one retry after a timeout did not mark it: ' + JSON.stringify(d)); }

/* A MECHANICAL KEY: never sent to Haiku. */
{ reply = () => ok(GOOD); sent.length = 0;
  const d = ask('oxygen', { key: 'q:Q-KEY-1' });
  if (sent.length) bad.push('a part with a mechanical key called Haiku');
  if (d.success !== false || d.why !== 'mechanical') bad.push('a part with a mechanical key came back ' + JSON.stringify(d)); }

/* NO KEY IN THE REPO. */
const tracked = require('child_process').execSync('git ls-files backend js', { cwd: REPO }).toString().split('\n').filter(Boolean);
tracked.forEach(f => { try { if (/sk-ant-[A-Za-z0-9_-]{10,}/.test(fs.readFileSync(path.join(REPO, f), 'utf8'))) bad.push(f + ' holds what looks like an Anthropic key'); } catch (e) { /* gone */ } });

if (bad.length) { bad.forEach(x => console.log('  ✗ ' + x)); console.log('FAILED — long answers marked by Haiku: ' + bad.length + ' problem(s).'); process.exit(1); }
console.log('OK — long answers: Haiku marks against the scheme, a bad reply or timeout only saves, the cache holds, no key says so, no personal data is sent, and only keyless parts ask.');
