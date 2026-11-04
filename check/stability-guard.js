#!/usr/bin/env node
/* @family. — check/stability-guard.js THE SCORE MAY NOT DROP (780). `node check/stability-guard.js BASE_DIR` compares
   tools/stability.js here (the PR head) against BASE_DIR's; prints both and every signal that moved, as Markdown. */
'use strict';
const fs = require('fs'), path = require('path');
const base = process.argv[2];
const head = require(path.join(__dirname, '..', 'tools', 'stability.js')).stability();
const tool = base && path.join(path.resolve(base), 'tools', 'stability.js');
const out = [];
if (!tool || !fs.existsSync(tool)) {
  out.push('### Stability: ' + head.score + '% (no tools/stability.js on the base, nothing to compare)');
  console.log(out.join('\n'));
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
