#!/usr/bin/env node
/* node js/check-voice.js — THE READ-ALOUD VOICE (453): the best device voice is ranked first, robotic ones last,
   a kept choice wins, maths symbols become words and long text is spoken a sentence at a time. No flags, no port. */
'use strict';
require('../check/quiet');
const fs = require('fs'), path = require('path'), vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, 'shell.js'), 'utf8');
const a = src.indexOf('/* ---------- SPEAKING, ONE VOICE'), b = src.indexOf('/* ---------- ONE CLICK HANDLER');
if (a < 0 || b < a) { console.error('check-voice: cannot find the SPEAKING section in js/shell.js'); process.exit(1); }

const store = {};
const spoken = [];
const V = (name, lang) => ({ name, lang });
let voices = [];
const win = {
  speechSynthesis: { getVoices: () => voices, speak: u => spoken.push(u), cancel() {} },
  SpeechSynthesisUtterance: function (t) { this.text = t; },
};
const ctx = { window: win, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } } };
vm.createContext(ctx);
vm.runInContext(src.slice(a, b) + '\n;this.api={voiceScore_,voicesRanked_,voicePick_,sayMaths_,sayChunks_,say_,VOICE_KEY};', ctx);
const api = ctx.api;

const bad = [];
let n = 0;
const eq = (got, want, said) => { n++; if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(said + ': got ' + JSON.stringify(got) + ', wanted ' + JSON.stringify(want)); };

/* ---------- RANKING ---------- */
const list = [V('eSpeak English', 'en-GB'), V('Fred', 'en-US'), V('Daniel (compact)', 'en-GB'), V('Samantha', 'en-US'),
  V('Google UK English Female', 'en-GB'), V('Microsoft Sonia Online (Natural) - English (United Kingdom)', 'en-GB'),
  V('Microsoft Aria Online (Natural) - English (United States)', 'en-US'), V('Thomas', 'fr-FR'), V('Kate', 'en_GB')];
const names = api.voicesRanked_('en-GB', list).map(v => v.name);
eq(names[0], 'Microsoft Sonia Online (Natural) - English (United Kingdom)', 'a natural en-GB voice is first');
eq(names[1], 'Google UK English Female', 'Google UK English is next');
eq(names.indexOf('Microsoft Aria Online (Natural) - English (United States)') < names.indexOf('Kate'), true, 'a natural en-US voice beats a plain en-GB one');
eq(names.slice(-3).sort(), ['Daniel (compact)', 'Fred', 'eSpeak English'].sort(), 'eSpeak, Fred and compact voices are last');
eq(names.indexOf('Thomas'), -1, 'another language is not offered for English');
eq(api.voicePick_('fr-FR', list).name, 'Thomas', 'French takes the French voice');
eq(api.voicePick_('en-GB', []), null, 'no voices yet is null, and lang alone chooses');
store[api.VOICE_KEY] = 'Samantha';
eq(api.voicePick_('en-GB', list).name, 'Samantha', 'the kept choice wins');
store[api.VOICE_KEY] = 'Gone Voice';
eq(api.voicePick_('en-GB', list).name, names[0], 'a kept voice the device no longer has falls back to the best');
delete store[api.VOICE_KEY];

/* ---------- MATHS ---------- */
eq(api.sayMaths_('x² + y³'), 'x squared + y cubed', 'squares and cubes');
eq(api.sayMaths_('2⁵'), '2 to the power of 5', 'other powers');
eq(api.sayMaths_('12 ÷ 3 × 2'), '12 divided by 3 times 2', 'divide and times');
eq(api.sayMaths_('3/4 of 1/2'), 'three quarters of one half', 'common fractions as words');
eq(api.sayMaths_('7/12'), '7 over 12', 'other fractions as over');
eq(api.sayMaths_('25/10/2026'), '25/10/2026', 'a date is not a fraction');
eq(api.sayMaths_('a ≤ b ≥ c ≠ d'), 'a is less than or equal to b is greater than or equal to c is not equal to d', 'inequalities');
eq(api.sayMaths_('√9 and ½'), 'the square root of 9 and one half', 'roots and vulgar fractions');
eq(api.sayMaths_('Three quarters.'), 'Three quarters.', 'words pass unchanged');

/* ---------- CHUNKS AND THE QUEUE ---------- */
eq(api.sayChunks_('One. Two? Three!'), ['One. Two? Three!'], 'a short text is one utterance');
eq(api.sayChunks_('One. Two? Three!', 10), ['One.', 'Two?', 'Three!'], 'a long one is a sentence each');
eq(api.sayChunks_('It costs 3.50 today.'), ['It costs 3.50 today.'], 'a decimal point is not a sentence end');
const long = Array(60).fill('word').join(' ') + '.';
eq(api.sayChunks_(long).every(c => c.length <= 181), true, 'a long sentence is cut short of Chrome\'s limit');
voices = list;
let ended = 0;
api.say_('First, a sentence long enough to matter here. ' + 'Second, another one of the same kind and size, which takes the whole text well past the limit of one hundred and eighty characters, as a long question would.', { onend: () => ended++ });
eq(spoken.length, 2, 'two sentences queue two utterances');
eq([spoken[0].rate, spoken[0].pitch, spoken[0].voice && spoken[0].voice.name], [0.95, 1, names[0]], 'gentle rate, plain pitch, the best voice');
eq([typeof spoken[0].onend, typeof spoken[1].onend], ['undefined', 'function'], 'onend on the last only');

if (bad.length) { console.error('check-voice: ' + bad.length + ' of ' + n + ' failed\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('check-voice: all ' + n + ' voice and maths rules hold');
