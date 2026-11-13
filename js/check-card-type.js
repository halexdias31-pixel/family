#!/usr/bin/env node
/* @family. — check-card-type.js A CARD'S TEXT AND FIGURES, EACH ONE TOKEN (owner, 13 Nov): content reads at the tag's size, a figure fills to --pic-w. */
'use strict';
const fs = require('fs');
const path = require('path');
const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const bad = [];
const root = (/:root\s*\{([^}]*)\}/.exec(css) || [, ''])[1];
/* ONE TEXT SIZE: the tag's size is --fs-tag in :root, the tag reads it, and a card's content redefines body and small to it. */
if (!/--fs-tag\s*:/.test(root)) bad.push(':root has no --fs-tag, the tag text size');
if (!/--tp-fs\s*:\s*var\(--fs-tag\)/.test(root)) bad.push('--tp-fs (a tag\'s font) is not var(--fs-tag)');
const content = /\.card\.kc > :is\(\.kc-lines, \.kc-form\) \{([^}]*)\}/.exec(css);
if (!content) bad.push('no `.card.kc > :is(.kc-lines, .kc-form)` rule sets the content size');
else ['--fs-body: var(--fs-tag)', '--fs-small: var(--fs-tag)', 'font-size: var(--fs-tag)'].forEach(d => {
  if (content[1].replace(/\s+/g, ' ').indexOf(d) < 0) bad.push('the card content rule lacks `' + d + '`'); });
/* ONE FIGURE WIDTH: --pic-w in :root; a figure's width rule says min(100%, var(--pic-w)), never a rem of its own. */
if (!/--pic-w\s*:/.test(root)) bad.push(':root has no --pic-w, the one figure width');
const re = /([^{}]+)\{([^{}]*)\}/g;
for (let m; (m = re.exec(css));) {
  const sel = m[1].trim(), body = m[2];
  if (!/(figure|qpad-art|kc-fig)[^,]*svg|qpad-art\s*$|qpad-art:has/.test(sel)) continue;
  const w = /(?:^|;)\s*(max-)?width\s*:\s*min\(100%,\s*(\d[\d.]*rem)/.exec(body);
  if (w) bad.push('`' + sel.replace(/\s+/g, ' ').slice(0, 70) + '` sizes a figure at ' + w[2] + ' — say var(--pic-w)');
}
if (bad.length) { bad.forEach(b => console.log('  ' + b)); console.log('check-card-type.js: FAILED — ' + bad.length + ' finding(s)'); process.exit(1); }
console.log('check-card-type.js: card content at the tag size, figures at --pic-w');
