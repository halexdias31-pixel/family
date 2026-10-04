#!/usr/bin/env node
/* ==================================================================================================
   node js/check-aimark.js — "MARK WITH AI", ASKED OF THE REAL BACKEND

   ASKED FOR AS "add gemini marking system for worded questions." The phone half is `keypad.js` and
   `check-flow.js` presses it; this is the half that holds a key and spends money, and every rule in
   it is one that fails quietly if it fails at all:

     · NO KEY IS A SENTENCE AND A CODE. `why: 'ai-off'` is what the phone greys the button on, and a
       handler that threw instead would put "Backend: TypeError" under a student's answer.
     · THE KEY NEVER LEAVES IN A URL. Google's examples put it in `?key=`, which writes it into every
       log that records an address. It goes in `x-goog-api-key`, and this reads the request to see.
     · THE MARK IS CLAMPED. A model can answer seven out of three; the reply must not.
     · THE CAP IS PER PERSON PER DAY, against the id the TOKEN resolved to — and 0 is off.
     · THE MODEL IS THE CONFIG CELL, and a blank cell is the fallback rather than an empty URL.
     · A REFUSAL FROM GOOGLE DOES NOT CARRY GOOGLE'S WORDS, which for a bad key name the key's
       project, back to a student.

   THROUGH THE REAL `doPost`, gate and all, over `check-gas-load.js` — the harness `check-profile.js`
   wrote. Gemini is a stub that records what it was sent and answers what each case needs; nothing
   here touches the network. The people are invented and their PINs are 0000.
================================================================================================== */
'use strict';
const { backend } = require('./check-gas-load.js');

const KEY = 'test-key-not-a-real-one';
const bad = [];
let asked = 0;

/* GEMINI, AS A STUB. `reply` is what the next request gets; `sent` is every request it received. */
const gem = { reply: null, sent: [] };
const fetchStub = (url, opts) => {
  gem.sent.push({ url: url, opts: opts });
  const r = gem.reply || { code: 200, body: { awarded: 1, feedback: 'Fine.' } };
  const text = r.code === 200
    ? JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(r.body) }] } }] })
    : JSON.stringify({ error: { message: 'API key not valid. Please pass a valid API key. ' + KEY } });
  return { getResponseCode: () => r.code, getContentText: () => text };
};

function world(config) {
  const b = backend({ UrlFetchApp: { fetch: fetchStub } });
  const base = { pin: '0000', verified: 'TRUE', role: 'student', city: 'London' };
  b.seed('people', [
    Object.assign({ person_id: 'P-S1', first_name: 'Sam', last_name: 'Student', handle: 'samstudent', email: 's1@example.org' }, base),
    Object.assign({ person_id: 'P-S2', first_name: 'Sam', last_name: 'Student', handle: 'samother', email: 's2@example.org' }, base),
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
    return b.post(Object.assign({ action: 'aiMark', token: tok[who], personId: 'P-S1',
      question: 'Explain why the rate of reaction increases with temperature.',
      scheme: 'particles move faster (1); more frequent successful collisions (1); more have the activation energy (1)',
      answer: 'The particles have more energy so they collide more often and harder.', marks: 3 }, extra || {}));
  };
  return { b, ask };
}

/* ---------- NO KEY ------------------------------------------------------------------------------ */
{
  const { b, ask } = world();
  const d = ask('s1@example.org');
  if (d.success !== false || d.why !== 'ai-off') bad.push('with no GEMINI_API_KEY, aiMark answered ' + JSON.stringify(d) + ' — wanted why: "ai-off"');
  if (!/switched on/i.test(String(d.message || ''))) bad.push('with no key the sentence was "' + d.message + '" — wanted "AI marking isn’t switched on"');
  if (gem.sent.length) bad.push('with no key Gemini was still asked');
  const p = b.get({});
  if (p.aiMarking !== false) bad.push('the payload says aiMarking: ' + JSON.stringify(p.aiMarking) + ' with no key — wanted false');
  if (!(p.features || []).includes('aiMark')) bad.push('`features` does not list aiMark, so the phone will never draw the button');
  b.props.GEMINI_API_KEY = KEY;
  b.ev('clearCache()');
  b.cache.clear();
  const q = b.get({});
  if (q.aiMarking !== true) bad.push('the payload says aiMarking: ' + JSON.stringify(q.aiMarking) + ' with a key — wanted true');
  if (JSON.stringify(q).includes(KEY)) bad.push('THE KEY IS IN THE PAYLOAD — it goes to every phone');
}

/* ---------- SIGNED OUT -------------------------------------------------------------------------- */
{
  const { b, ask } = world();
  b.props.GEMINI_API_KEY = KEY;
  gem.sent.length = 0;
  const d = ask('nobody', { token: '' });
  if (!d.error || !/sign in/i.test(d.error)) bad.push('aiMark with no token answered ' + JSON.stringify(d) + ' — the gate should refuse it');
  if (gem.sent.length) bad.push('a signed-out request reached Gemini');
}

/* ---------- A MARK ------------------------------------------------------------------------------ */
{
  const { b, ask } = world({ gemini_model: 'gemini-test-model', ai_marks_per_day: 5 });
  b.props.GEMINI_API_KEY = KEY;
  gem.sent.length = 0;
  gem.reply = { code: 200, body: { awarded: 7, feedback: 'You named the faster particles. You missed activation energy.' } };
  const d = ask('s1@example.org');
  if (!d.success) bad.push('a marked answer was refused — ' + JSON.stringify(d));
  else {
    if (d.awarded !== 3 || d.available !== 3) bad.push('Gemini said 7 of 3 and the reply said ' + d.awarded + ' of ' + d.available + ' — a mark must be clamped to what the question is worth');
    if (d.feedback !== 'You named the faster particles.') bad.push('the feedback was "' + d.feedback + '" — wanted its first sentence only');
    if (d.left !== 4) bad.push('one mark used of five and the reply says ' + d.left + ' left');
  }
  const s = gem.sent[0];
  if (!s) bad.push('Gemini was never asked');
  else {
    if (!/\/models\/gemini-test-model:generateContent$/.test(s.url)) bad.push('the request went to ' + s.url + ' — wanted the model the config tab names');
    if (s.url.includes(KEY) || /[?&]key=/.test(s.url)) bad.push('THE KEY IS IN THE URL, where every log that records an address keeps it');
    if (!s.opts.headers || s.opts.headers['x-goog-api-key'] !== KEY) bad.push('the key was not sent in x-goog-api-key');
    let body = {};
    try { body = JSON.parse(s.opts.payload); } catch (e) { bad.push('the request body was not JSON'); }
    const gc = body.generationConfig || {};
    if (gc.responseMimeType !== 'application/json') bad.push('responseMimeType is ' + gc.responseMimeType + ' — wanted application/json');
    const text = JSON.stringify(body.contents || []);
    if (!/<student_answer>\\n.*collide more often.*\\n<\/student_answer>/.test(text)) bad.push('the student’s answer is not fenced in <student_answer> — it can be read as an instruction');
    if (!/activation energy/.test(text)) bad.push('the mark scheme did not reach Gemini');
  }
  /* A REFUSAL FROM GOOGLE: a number for the owner, never Google's sentence (which names the key). */
  gem.reply = { code: 400 };
  const e = ask('s1@example.org');
  if (e.success !== false || !/400/.test(String(e.message))) bad.push('a 400 from Gemini answered ' + JSON.stringify(e) + ' — wanted a sentence with the status');
  if (JSON.stringify(e).includes(KEY) || /API key not valid/.test(JSON.stringify(e))) bad.push('Google’s own error text was passed back to the student');
  gem.reply = null;
}

/* ---------- THE CAP ----------------------------------------------------------------------------- */
{
  const { b, ask } = world({ ai_marks_per_day: 2 });
  b.props.GEMINI_API_KEY = KEY;
  ask('s1@example.org'); ask('s1@example.org');
  const third = ask('s1@example.org');
  if (third.success !== false || third.why !== 'ai-cap') bad.push('a third mark with a cap of 2 answered ' + JSON.stringify(third) + ' — wanted why: "ai-cap"');
  /* THE OTHER SAM, who shares a display name and has a token of their own: the cap is the id the
     token resolved to, so their first mark is their first — and the `personId: 'P-S1'` the request
     claims is overwritten by the gate rather than believed. */
  const other = ask('s2@example.org');
  if (!other.success) bad.push('a second student who shares a name was refused by the first one’s cap — ' + JSON.stringify(other));
}
{
  const { b, ask } = world();
  b.props.GEMINI_API_KEY = KEY;
  gem.sent.length = 0;
  let n = 0, last = null;
  for (let i = 0; i < 21; i++) { last = ask('s1@example.org'); if (last.success) n++; }
  if (n !== 20 || last.why !== 'ai-cap') bad.push('with the cap cell blank, ' + n + ' of 21 were marked — the fallback is 20');
  if (!gem.sent.length || !/\/models\/gemini-flash-latest:generateContent$/.test(gem.sent[0].url)) bad.push('with the model cell blank the request went to ' + (gem.sent[0] || {}).url + ' — wanted gemini-flash-latest');
}
{
  const { b, ask } = world({ ai_marks_per_day: 0 });
  b.props.GEMINI_API_KEY = KEY;
  gem.sent.length = 0;
  const d = ask('s1@example.org');
  if (d.success !== false || d.why !== 'ai-cap' || gem.sent.length) bad.push('a cap of 0 still marked — 0 is how the owner switches it off without the key');
}

console.log('');
console.log('AI MARKING, THROUGH THE REAL doPost  (' + bad.length + ')');
bad.forEach(x => console.log('  ' + x));
console.log('\nrequests made: ' + asked);
if (bad.length) {
  console.log('FAILED — "Mark with AI" holds a key and spends money, and each line above is it doing so wrongly.');
  process.exit(1);
}
console.log('OK — no key is a sentence, the key stays in a header, the mark is clamped, the cap is per person per day.');
