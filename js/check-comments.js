#!/usr/bin/env node
const { VERBOSE } = require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
// A comment says WHY in a line or two: none over 240 characters, outside the list tools/comments.js keeps verbatim.
// The story goes in docs/history; a shortened comment's full text is in docs/notes/<path>.md.
'use strict';
const { files, plan, kept, LIMIT } = require('../tools/comments.js');

let total = 0, nfiles = 0, held = 0;
const bad = [];
for (const rel of files()) {
  let p;
  try { p = plan(rel); } catch (e) { bad.push(rel + ': cannot be read or parsed: ' + e.message); continue; }
  nfiles++;
  total += p.all.length;
  held += p.all.filter(c => c.end - c.start > LIMIT && kept(c.body)).length;
  for (const c of p.long) {
    const line = p.src.slice(0, c.start).split('\n').length;
    bad.push(rel + ':' + line + ': a comment of ' + (c.end - c.start) + ' characters');
  }
}
if (nfiles === 0) { console.log('FAILED — check-comments found no files to read.'); process.exit(1); }
if (bad.length) {
  const show = VERBOSE ? bad : bad.slice(0, 20);   // the first twenty say what is wrong; -v for all
  for (const b of show) console.log('  FAIL ' + b);
  if (show.length < bad.length) console.log('  … and ' + (bad.length - show.length) + ' more (-v for all)');
  console.log('FAILED — ' + bad.length + ' comment(s) over ' + LIMIT + ' characters. Fix: node tools/comments.js '
    + '(it keeps the headline and moves the full text to docs/notes), then put the story in docs/history.');
  process.exit(1);
}
console.log('OK — all ' + total + ' comments in ' + nfiles + ' files are ' + LIMIT + ' characters or fewer'
  + (held ? ' (' + held + ' longer one(s) kept verbatim on purpose)' : '') + '.');
