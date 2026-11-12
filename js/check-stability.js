#!/usr/bin/env node
/* @family. — check-stability.js THE ONE STABILITY CHECK (730, 780), read off tools/stability.js. */
/* Bare: data/stability.json is current. `--base DIR`: the score may not drop against DIR's (the PR base), printed as Markdown. */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const TOOL = path.join(__dirname, '..', 'tools', 'stability.js');
const at = process.argv.indexOf('--base');
if (at < 0) {
  try { process.stdout.write(execFileSync(process.execPath, [TOOL, '--check'], { encoding: 'utf8' })); }
  catch (e) { process.stdout.write(String(e.stdout || e.message)); process.exit(1); }
  process.exit(0);
}
const base = process.argv[at + 1];
const head = require(TOOL).stability();
const tool = base && path.join(path.resolve(base), 'tools', 'stability.js');
const out = [];
if (!tool || !fs.existsSync(tool)) {
  console.log('### Stability: ' + head.score + '% (no tools/stability.js on the base, nothing to compare)');
  process.exit(0);
}
const was = require(tool).stability();
const by = s => Object.fromEntries(s.signals.map(x => [x.id, x]));
const a = by(was), b = by(head);
const moved = Object.keys(Object.assign({}, a, b)).filter(id => !a[id] || !b[id] || a[id].count !== b[id].count || a[id].off !== b[id].off);
const drop = head.score < was.score;
out.push('### Stability: ' + was.score + '% → ' + head.score + '% ' + (drop ? '❌ dropped' : '✅'));
if (moved.length) {
  out.push('', '| signal | before | after | points off |', '|---|---|---|---|');
  moved.forEach(id => out.push('| ' + ((b[id] || a[id]).label) + ' | ' + (a[id] ? a[id].count : '—') + ' | ' + (b[id] ? b[id].count : '—')
    + ' | ' + (a[id] ? a[id].off : 0) + ' → ' + (b[id] ? b[id].off : 0) + ' |'));
} else out.push('', 'No signal moved.');
console.log(out.join('\n'));
process.exit(drop ? 1 : 0);
