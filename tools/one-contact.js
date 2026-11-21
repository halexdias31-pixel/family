#!/usr/bin/env node
/* @family. — tools/one-contact.js THE ONE-CONTACT CHECK (rule 1.75, unify lane D, 21 Nov): a phone, a handle and an email are read and refused
   by js/form.js alone (phoneOut/phoneIn/phoneCodes_, HANDLE_SHAPE/handleTyped_/handleFold_, FORM_TESTS.email), copied to backend/cards-gen.gs.
   Fails the build on a hand-written phone split, a '+44' literal, a handle regex or an email regex anywhere else in js/ or backend/,
   or when the site's copy and the backend's answer a fixed case differently (or wrongly). */
'use strict';
const vm = require('vm');
const { text, srcFiles, report, main } = require('./lib/gen.js');
const SHARED = ['js/form.js', 'backend/cards-gen.gs'];
/* WHAT A SECOND COPY LOOKS LIKE. PHONE_CODES (constants.gs) is the list itself, so its own line may say '+44'. */
const TWINS = [
  [/['"]\+44['"]/, "a '+44' literal (use phoneCodes_()[0])"],
  [/\\\+\\d\{1,4\}/, 'a hand-written phone split (use phoneOut/phoneIn)'],
  [/\[a-z\]\[a-z0-9_-\]/, 'a handle regex (use HANDLE_SHAPE)'],
  [/replace\(\/\^@\/, ?''\)\.toLowerCase\(\)/, 'a handle fold (use handleTyped_)'],
  [/\^\[\^(\\s@|@\\s)\]\+@/, 'an email regex (use FORM_TESTS.email)'],
];
function grabAll(src, file) {
  const a = src.indexOf('const FORM_TESTS = {'), b = src.indexOf('function phoneCodes_('), e = src.indexOf('function handleFold_(');
  if (a < 0 || b < 0 || e < 0) throw new Error('one-contact: ' + file + ' lacks the shared phone/handle/email code (run tools/cards-gen.js)');
  return src.slice(a, src.indexOf('\n};', a) + 3) + '\n' + src.slice(b, src.indexOf('\n}', e) + 2);
}
const CASES = {
  phoneOut: [['', { phone_cc: '+44', phone_no: '' }], ['07700 900123', { phone_cc: '+44', phone_no: '7700 900123' }],
    ['+44 7700 900123', { phone_cc: '+44', phone_no: '7700 900123' }], ['00353 87 123', { phone_cc: '+353', phone_no: '87 123' }],
    ['+1 555 0100', { phone_cc: '+1', phone_no: '555 0100' }]],
  phoneIn: [[{ phone_cc: '+44', phone_no: '07700 900123' }, '+44 7700 900123'], [{ phone_cc: '', phone_no: '7700' }, '+44 7700'],
    [{ phone_cc: '+44', phone_no: '+44 7700-900' }, '+44 7700 900'], [{ phone_cc: '+39', phone_no: '06 123' }, '+39 06 123'], [{ phone_cc: '+44', phone_no: '' }, '']],
  handleShape: [['amy', true], ['ab', false], ['1amy', false], ['amy_b-2', true], ['a'.repeat(31), false]],
  handleTyped_: [['  @Amy ', 'amy']],
  handleFold_: [['B0b_1', 'bobi']],
  email: [['a@b.co', true], ['a@b', false], ['a b@c.d', false], [' x@y.org ', true]],
};
function answers(src, file, globals) {
  const c = Object.assign({}, globals); vm.createContext(c);
  vm.runInContext(grabAll(src, file) + '\nthis.f = { phoneOut, phoneIn, handleShape: v => HANDLE_SHAPE.test(v), handleTyped_, handleFold_, email: FORM_TESTS.email };', c);
  const out = {};
  for (const k in CASES) out[k] = CASES[k].map(([i]) => JSON.stringify(c.f[k](i)));
  return out;
}
function run() {
  const bad = [];
  const codes = eval(text('backend/constants.gs').match(/^const PHONE_CODES = (\[[\s\S]*?\]);/m)[1]);
  const files = srcFiles(['js', 'backend'], /\.(js|gs)$/);
  let n = 0;
  files.filter(f => SHARED.indexOf(f) < 0).forEach(f => text(f).split('\n').forEach((l, i) => {
    if (/^const PHONE_CODES = /.test(l) || /^\s*'\+/.test(l) && f === 'backend/constants.gs') return;
    TWINS.forEach(([re, what]) => { if (re.test(l)) bad.push(f + ':' + (i + 1) + ' has ' + what); });
    n++;
  }));
  const site = answers(text('js/form.js'), 'js/form.js', { DATA: { phoneCodes: codes } });
  const back = answers(text('backend/cards-gen.gs'), 'backend/cards-gen.gs', { PHONE_CODES: codes });
  let asked = 0;
  for (const k in CASES) CASES[k].forEach(([i, want], j) => {
    asked++;
    if (site[k][j] !== back[k][j]) bad.push(k + '(' + JSON.stringify(i) + '): site ' + site[k][j] + ', backend ' + back[k][j]);
    else if (site[k][j] !== JSON.stringify(want)) bad.push(k + '(' + JSON.stringify(i) + ') is ' + site[k][j] + ', not ' + JSON.stringify(want));
  });
  console.log('one-contact: ' + files.length + ' files (' + n + ' lines) read for twins, ' + asked + ' fixed cases asked both sides; ' + bad.length + ' wrong');
  report('one-contact', bad, 'phone/handle/email rule(s) outside js/form.js');
}
module.exports = { run };
main(module, run);
