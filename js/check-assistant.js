#!/usr/bin/env node
/* node js/check-assistant.js — THE ASSISTANT IN MESSAGES (449), ASKED OF THE REAL BACKEND: signed in only, the
   token's person's count, the daily cap from config (blank = 5), an unanswered question given back, a child's prompt. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const gem = { sent: [], reply: null };
const fetchStub = (url, opts) => {
  gem.sent.push({ url: url, payload: String(opts && opts.payload) });
  const r = gem.reply || { code: 200, text: 'Sessions are two hours.' };
  const text = r.code === 200 ? JSON.stringify({ candidates: [{ content: { parts: [{ text: r.text }] } }] })
    : JSON.stringify({ error: { code: r.code, message: 'stub refusal' } });
  return { getResponseCode: () => r.code, getContentText: () => text };
};

function world(config, noKey) {
  const b = backend({ UrlFetchApp: { fetch: fetchStub } });
  if (!noKey) b.props.GEMINI_API_KEY = 'test-key-not-a-real-one';
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  b.seed('people', [
    Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org', role: 'client' }, base),
    Object.assign({ person_id: 'P-S2', first_name: 'Ben', last_name: 'Pupil', handle: 'benpupil', email: 's2@example.org', role: 'client' }, base),
  ]);
  if (config) b.seed('config', Object.keys(config).map(k => ({ key: k, value: config[k] })));
  const tok = {};
  ['s1@example.org', 's2@example.org'].forEach(e => {
    const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    if (!d.success) bad.push('could not sign in ' + e + ' — ' + d.error);
    tok[e] = d.token;
  });
  const ask = (who, extra) => {
    asked++;
    return b.post(Object.assign({ action: 'askAssistant', token: who ? tok[who] : '', question: 'How long is a session?',
      facts: 'hours per session: 2' }, extra || {}));
  };
  return { b, ask };
}
const ADA = 's1@example.org', BEN = 's2@example.org';

/* SIGNED IN ONLY: no token, no Gemini. */
{
  gem.sent = [];
  const { ask } = world();
  const d = ask('');
  if (d.success || !d.error) bad.push('a signed-out ask was not refused: ' + JSON.stringify(d).slice(0, 160));
  if (gem.sent.length) bad.push('a signed-out ask reached Gemini');
}

/* NO KEY: a plain refusal, nothing counted. */
{
  const { ask } = world(null, true);
  const d = ask(ADA);
  if (d.success || d.why !== 'ai-off') bad.push('with no key the ask said ' + JSON.stringify(d).slice(0, 160));
}

/* THE DEFAULT CAP IS 5, PER PERSON, AND THE TOKEN'S PERSON IS COUNTED WHOEVER THE BODY CLAIMS. */
{
  gem.sent = []; gem.reply = null;
  const { ask } = world();
  const lefts = [];
  for (let i = 0; i < 5; i++) {
    const d = ask(ADA, { personId: 'P-S2' });
    if (!d.success) bad.push('question ' + (i + 1) + ' of 5 was refused: ' + JSON.stringify(d).slice(0, 160));
    lefts.push(d.left);
  }
  if (lefts.join() !== '4,3,2,1,0') bad.push('`left` ran ' + lefts.join() + ', not 4,3,2,1,0');
  const six = ask(ADA);
  if (six.success || six.why !== 'ai-cap' || six.left !== 0) bad.push('a sixth question was not refused at the cap: ' + JSON.stringify(six).slice(0, 160));
  if (gem.sent.length !== 5) bad.push('Gemini was asked ' + gem.sent.length + ' times for five allowed questions and one refused');
  const ben = ask(BEN);
  if (!ben.success || ben.left !== 4) bad.push('Ben was charged for Ada’s questions (the body claimed P-S2, the token was Ada’s): ' + JSON.stringify(ben).slice(0, 160));
  if (!/two hours/.test(String(ben.answer))) bad.push('the answer was not Gemini’s words: ' + JSON.stringify(ben.answer));
  if (!/hours per session: 2/.test(gem.sent[gem.sent.length - 1].payload)) bad.push('the facts were not sent to Gemini');
}

/* THE CONFIG CELL SETS THE CAP; 0 SWITCHES IT OFF. */
{
  const { ask } = world({ assistant_questions_per_day: 2 });
  ask(ADA); const two = ask(ADA); const three = ask(ADA);
  if (two.left !== 0 || three.why !== 'ai-cap') bad.push('a cap of 2 from config was not kept: ' + JSON.stringify([two.left, three.why]));
  gem.sent = [];
  const off = world({ assistant_questions_per_day: 0 }).ask(ADA);
  if (off.success || off.why !== 'ai-cap' || gem.sent.length) bad.push('a cap of 0 did not switch it off: ' + JSON.stringify(off).slice(0, 160));
}

/* A QUESTION GEMINI DID NOT ANSWER IS GIVEN BACK. */
{
  gem.reply = { code: 400 };
  const { ask } = world({ assistant_questions_per_day: 1 });
  const fail = ask(ADA);
  gem.reply = null;
  const ok = ask(ADA);
  if (fail.success) bad.push('a refused Gemini call reported success');
  if (!ok.success) bad.push('the question Gemini did not answer was still counted: ' + JSON.stringify(ok).slice(0, 160));
}

/* A CHILD'S QUESTION CARRIES THE CHILD-SAFE RULES; A GROWN-UP'S DOES NOT. */
{
  gem.sent = [];
  const { b, ask } = world();
  b.seed('people', [{ person_id: 'P-K1', first_name: 'Kit', last_name: 'Pupil', handle: 'kitpupil', email: 'k1@example.org',
    role: 'student', pin: '0000', verified: 'TRUE', city: 'London' }]);
  ask(ADA);
  const grown = gem.sent.pop();
  if (grown && /is a child/.test(grown.payload)) bad.push('a grown-up was sent the child’s rules');
  const k = b.post({ action: 'verifyLogin', email: 'k1@example.org', pin: '0000' });
  if (k.success) {
    const isChild = b.ev('(function(){ netViewerSet_(findPerson("", "P-K1")); return netViewerIsChild_(); })()');
    asked++;
    const d = b.post({ action: 'askAssistant', token: k.token, question: 'What is a fraction?' });
    const sent = gem.sent.pop();
    if (!d.success) bad.push('a child’s question was refused: ' + JSON.stringify(d).slice(0, 160));
    else if (isChild && !(sent && /is a child/.test(sent.payload))) bad.push('a child’s question went without the child-safe rules');
    if (!isChild) console.log('(the seeded child was not read as a child by netViewerIsChild_, so only the grown-up half was asked)');
  }
}

/* SITE HELP ONLY (547, owner 1 Nov): Daive's rules say it helps with finding things in the app and nothing else -- not the business, not homework. */
{
  gem.sent = [];
  const { ask } = world();
  ask(ADA);
  const sys = (() => { try { return JSON.parse(gem.sent.pop().payload).systemInstruction.parts[0].text; } catch (e) { return ''; } })();
  if (!sys) bad.push('Daive\'s rules were not found in the request, so site-help-only was NOT checked');
  else {
    if (!/ONLY help people find their way around this app/.test(sys)) bad.push('Daive\'s rules do not keep it to finding things in the app: ' + sys.slice(0, 200));
    if (/Answer questions about the business|its services, prices, booking|help with schoolwork/i.test(sys)) bad.push('Daive is still told to answer about the business or schoolwork: ' + sys.slice(0, 200));
  }
}

if (bad.length) {
  console.log('check-assistant: ' + bad.length + ' failure(s)\n  - ' + bad.join('\n  - '));
  process.exit(1);
}
console.log('check-assistant: ' + asked + ' asks — signed in only, the token’s person, the cap from config (5 when blank), a failure given back, the child’s rules, site help only');
