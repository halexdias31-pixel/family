#!/usr/bin/env node
/* @family. — check-effort-report.js (rule 12.1): effort (lines and files a round changes) is measured and kept by the full health run only; --changed never fails a change on it. */
'use strict';
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'tools/health.js'), 'utf8'), bad = [];
/* A FUNCTION'S BODY: from its `function name(` to the next top-level `function `. */
const body = name => { const a = src.indexOf('\nfunction ' + name + '('); if (a < 0) return null; const b = src.indexOf('\nfunction ', a + 1); return src.slice(a, b < 0 ? undefined : b); };
const ch = body('changed');
if (ch == null) bad.push('tools/health.js has no changed()');
else {
  ch.split('\n').forEach(l => { if (/bad\.push/.test(l) && /effort|medianLines|medianFiles/i.test(l)) bad.push('changed() fails a change on effort: ' + l.trim().slice(0, 100)); });
  if (/trendAppend\(/.test(ch)) bad.push('changed() writes the trend; only a full run records effort');
}
if (!/trendAppend\(/.test(src.replace(/\nfunction trendAppend\(/, ''))) bad.push('no full run calls trendAppend(), so effort is never recorded');
if (!/effort: h\.aiCost && h\.aiCost\.effort/.test(src)) bad.push('the trend entry no longer carries effort');
if (bad.length) { bad.forEach(b => console.log('FAIL — ' + b + ' (rule 12.1)')); process.exit(1); }
console.log('OK — effort is report-only, kept by the full health run');
