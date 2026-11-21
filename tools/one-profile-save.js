#!/usr/bin/env node
/* @family. — tools/one-profile-save.js THE ONE-PROFILE-SAVE CHECK (rule 1.75, unify batch 9 job A): a person's details are saved one way,
   so Settings, the card editor, Cancel's picture and the people editor refuse, send and say alike. Fails the build on: a send of
   `item: 'profile'` anywhere in js/ but `profileSave_` (js/me-settings.js); a second `profileSave_` or `fieldReadonly_`; and
   `extra_seat_cut`'s read-only rule (`may_('admin')` beside it) written out again outside `fieldReadonly_`. Run by tools/build.js. */
'use strict';
const { text, srcFiles, report, main, bare } = require('./lib/gen.js');

function run() {
  const bad = [];
  let sends = 0, saves = 0, ros = 0;
  for (const f of srcFiles('js', /\.js$/)) {
    const src = bare(text(f), { comments: true });
    const fn = /^function (profileSave_|fieldReadonly_)\(/mg;
    for (const m of src.matchAll(fn)) { if (m[1] === 'profileSave_') saves++; else ros++; if (f !== 'js/me-settings.js') bad.push(f + ': ' + m[1] + ' defined outside js/me-settings.js'); }
    const lines = src.split('\n');
    /* WHICH FUNCTION EACH LINE IS IN: the last top-level `function name(` above it. */
    let inFn = '';
    lines.forEach((l, i) => {
      const h = /^function (\w+)\(/.exec(l); if (h) inFn = h[1]; else if (/^\S/.test(l) && !/^[}\])]/.test(l)) inFn = '';
      if (/\bitem:\s*['"]profile['"]/.test(l)) {
        sends++;
        if (inFn !== 'profileSave_') bad.push(f + ':' + (i + 1) + ': a profile save outside profileSave_ — call profileSave_(form, { target, base, auto }) instead');
      }
      if (/extra_seat_cut['"]\s*&&\s*!may_\('admin'\)/.test(l) && inFn !== 'fieldReadonly_') bad.push(f + ':' + (i + 1) + ': the read-only rule written again — ask fieldReadonly_(f)');
    });
  }
  if (sends !== 1) bad.push('js/: ' + sends + ' profile sends, not the one in profileSave_');
  if (saves !== 1) bad.push('js/: ' + saves + ' profileSave_ functions, not one');
  if (ros !== 1) bad.push('js/: ' + ros + ' fieldReadonly_ functions, not one');
  console.log('one-profile-save: ' + sends + ' profile send, ' + saves + ' profileSave_, ' + ros + ' fieldReadonly_');
  report('one-profile-save', bad, 'second path(s)', console.error);
}
module.exports = { run };
main(module, run);
