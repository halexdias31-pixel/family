#!/usr/bin/env node
/* @family. — check-changed.js ONLY THE CHECKS A CHANGE AFFECTS (780). § */
'use strict';
const { execFileSync, spawnSync } = require('child_process');
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
const arg = k => (process.argv.find(a => a.startsWith('--' + k + '=')) || '').slice(k.length + 3);
const BASE = arg('base') || 'origin/main';
const LIST = process.argv.includes('--list');

/* ALWAYS: the name check and the cheap whole-repo readers. */
const ALWAYS = ['js/check.js', 'js/check-comments.js', 'js/check-secrets.js', 'js/check-markers.js', 'js/check-stability.js'];
/* GLOB → CHECKS. First match wins; `*` is one path segment, `**` any. */
const MAP = [
  ['docs/**', []],
  ['*.md', []],
  ['.github/**', []],
  ['backend/**', ['js/check-backend.js', 'js/check-manifest.js', 'js/check-tabs.js', 'js/check-columns.js', 'js/check-rows.js', 'js/check-payload.js',
                  'js/check-access.js', 'js/check-actions.js', 'js/check-replies.js', 'js/check-post.js', 'js/check-booking.js', 'js/check-lifecycle.js',
                  'js/check-accounts.js', 'js/check-visibility.js', 'js/check-surnames.js', 'js/check-digest.js', 'js/check-library-ledger.js']],
  ['style.css', ['js/check-css.js', 'check/motion.js', 'js/check-cache.js', 'check/cascade.js', 'check/ui.js --part=1/3', 'check/ui.js --part=2/3', 'check/ui.js --part=3/3']],
  ['index.html', ['js/check-cache.js', 'js/check-loading.js', 'check/bootslow.js', 'check/arrival.js']],
  ['data/questions.json', ['js/check-library.js', 'js/check-schema.js', 'js/check-qtypes.js', 'js/check-marking.js', 'js/check-typeset.js', 'js/check-answers.js',
                           'js/check-typeable.js', 'js/check-diagram-png.js', 'tools/finder-tags.js --check', 'check/cards.js']],
  ['data/textbooks.json', ['js/check-textbooks.js', 'js/check-anims.js', 'js/check-schema.js', 'js/check-library.js', 'tools/finder-tags.js --check', 'check/anims.js']],
  ['data/practicals.json', ['js/check-practicals.js', 'js/check-schema.js', 'js/check-library.js']],
  ['data/projects.json', ['js/check-projects.js', 'js/check-schema.js', 'js/check-library.js']],
  ['data/settings/**', ['js/check-settings.js', 'js/check-doors.js', 'js/check-widgets.js']],
  ['data/diagrams/**', ['js/check-diagram-png.js']],
  ['data/stability.json', ['js/check-stability.js']],
  ['data/**', ['js/check-payload.js', 'js/check-secrets.js']],
  ['tools/*.py', ['js/check-anims.js', 'js/check-textbooks.js']],
  ['js/book.js', ['js/check-booking.js', 'js/check-lifecycle.js', 'js/check-flow.js']],
  ['js/find.js', ['js/check-finder.js', 'js/check-funnel.js', 'js/check-flow.js', 'check/centred.js', 'check/chip-feel.js']],
  ['js/check-*.js', ['$self']],
  ['check/*.js', ['$self']],
  ['js/*.js', ['js/check-strings.js', 'js/check-scope.js', 'js/check-const.js', 'js/check-payload.js', 'js/check-doors.js', 'js/check-catches.js',
               'js/check-errors.js', 'js/check-loading.js', 'js/check-flow.js']],
];
const re = g => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*') + '$');
const git = a => { try { return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { return null; } };

let names = git(['diff', '--name-only', BASE + '...HEAD']);
if (names === null) { console.log('no ' + BASE + ' to compare with — running everything'); names = null; }
const changed = names === null ? null : [...new Set((names + (git(['diff', '--name-only', 'HEAD']) || '') + (git(['ls-files', '--others', '--exclude-standard']) || ''))
  .split('\n').map(s => s.trim()).filter(Boolean))];

let all = changed === null;
const want = new Set(ALWAYS);
const unknown = [];
(changed || []).forEach(f => {
  const hit = MAP.find(([g]) => re(g).test(f));
  if (!hit) { unknown.push(f); all = true; return; }
  hit[1].forEach(c => want.add(c === '$self' ? f : c));
});
if (changed && !changed.length) console.log('nothing changed against ' + BASE + ' — the always-run checks only');
if (unknown.length) console.log('not in the map, so everything runs: ' + unknown.slice(0, 8).join(', ') + (unknown.length > 8 ? ', …' : ''));
const cmds = all ? ['js/check-all.js'] : [...want].filter(c => fs.existsSync(path.join(ROOT, c.split(' ')[0])));
if (LIST) { cmds.forEach(c => console.log('  ' + c)); process.exit(0); }

let failed = 0;
for (const c of cmds) {
  const [file, ...args] = c.split(' ');
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(ROOT, file)].concat(args, process.argv.filter(a => a === '-v')), { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const ok = r.status === 0;
  const secs = ((Date.now() - t0) / 1000).toFixed(1) + 's';
  if (!ok) { failed++; console.log('  FAIL  ' + c + '  ' + secs); console.log(String((r.stdout || '') + (r.stderr || '')).split('\n').slice(-20).map(l => '          ' + l).join('\n')); }
  else console.log('  PASS  ' + c + '  ' + secs);
}
console.log(failed ? 'FAILED — ' + failed + ' of ' + cmds.length + ' affected checks.' : 'OK — ' + cmds.length + ' affected check(s) pass (npm run check before pushing).');
process.exit(failed ? 1 : 0);
