#!/usr/bin/env node
/* node js/check-speak.js — READ ALOUD'S NATURAL VOICE (463), the real backend: no key is tts-off, signed in only, a daily
   character cap, a cached line costs no fetch, a failure gives back. No flags, no port. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
let n = 0;
const tts = { sent: [], code: 200 };
const fetchStub = (url, opts) => {
  tts.sent.push({ url: url, opts: opts });
  const body = tts.code === 200 ? JSON.stringify({ audioContent: Buffer.from('mp3:' + JSON.parse(opts.payload).input.text).toString('base64') })
    : JSON.stringify({ error: { code: tts.code, message: 'stub refusal' } });
  return { getResponseCode: () => tts.code, getContentText: () => body };
};
function world(config, noKey) {
  tts.sent = []; tts.code = 200;
  const b = backend({ UrlFetchApp: { fetch: fetchStub } });
  if (!noKey) b.props.TTS_API_KEY = 'test-key-not-a-real-one';
  b.seed('people', [{ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org',
    role: 'student', pin: '0000', verified: 'TRUE', city: 'London' }]);
  if (config) b.seed('config', Object.keys(config).map(k => ({ key: k, value: config[k] })));
  const d = b.post({ action: 'verifyLogin', email: 's1@example.org', pin: '0000' });
  if (!d.success) bad.push('could not sign in — ' + d.error);
  const say = (text, signedOut) => { n++; return b.post({ action: 'speak', token: signedOut ? '' : d.token, personId: 'P-S1', text: text }); };
  return { b, say };
}
const want = (ok, what) => { if (!ok) bad.push(what); };

{ const { say } = world(null, true); const d = say('Hello.');
  want(!d.success && d.why === 'tts-off' && !tts.sent.length, 'no key: tts-off and no fetch, got ' + JSON.stringify(d)); }
{ const { say } = world(); const d = say('Hello.', true);
  want(!d.success && !tts.sent.length, 'signed out: refused and no fetch, got ' + JSON.stringify(d).slice(0, 120)); }
{ const { say } = world(); const d = say('Hello there.');
  want(d.success && Buffer.from(String(d.audio), 'base64').toString() === 'mp3:Hello there.', 'a line comes back as base64 MP3, got ' + JSON.stringify(d).slice(0, 120));
  const s = tts.sent[0] || { opts: {} };
  let p = {}; try { p = JSON.parse(s.opts.payload || '{}'); } catch (e) {}
  want(/texttospeech\.googleapis\.com\/v1\/text:synthesize$/.test(s.url), 'asks text:synthesize, key not in the URL: ' + s.url);
  want((s.opts.headers || {})['x-goog-api-key'] === 'test-key-not-a-real-one', 'the key goes in the header');
  want(p.voice && p.voice.name === 'en-GB-Neural2-B' && p.audioConfig.speakingRate === 0.92 && p.audioConfig.pitch < 0
    && p.audioConfig.audioEncoding === 'MP3', 'the calm British neural voice: ' + JSON.stringify(p));
  const again = say('Hello there.');
  want(again.success && again.cached && tts.sent.length === 1, 'a line heard before is a cache hit, no second fetch'); }
{ const { say } = world(); const d = say('x'.repeat(601));
  want(!d.success && d.why === 'tts-long' && !tts.sent.length, 'over 600 characters is refused before any fetch'); }
{ const { say } = world({ tts_chars_per_day: 20 });
  want(say('Twelve chars').success, 'under the cap speaks');
  const d = say('Twelve again');
  want(!d.success && d.why === 'tts-cap' && tts.sent.length === 1, 'past the day\'s characters: tts-cap, no fetch, got ' + JSON.stringify(d)); }
{ const { say } = world({ tts_chars_per_day: 0 }); const d = say('Hi.');
  want(d.why === 'tts-cap' && !tts.sent.length, '0 is the device voice only'); }
{ const { say } = world({ tts_chars_per_day: 20 });
  tts.code = 403; const d = say('Twelve chars');
  want(!d.success && d.why === 'tts-failed', 'a refusal from Google is tts-failed');
  tts.code = 200;
  want(say('Twelve again').success, 'and its characters were given back'); }

if (bad.length) { console.error('check-speak: ' + bad.length + ' failed of ' + n + ' asks\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('check-speak: all ' + n + ' asks of speak behave (key, sign-in, cap, cache, give-back)');
