/* @family. — tools/typeset-src.js THE REAL typeset_ WITH ITS PASSES, for the checks that run it outside the app (split 1150: typeset_ calls four helpers). */
'use strict';
const NAMES = ['typesetKit_', 'typesetTerms_', 'typesetPowers_', 'typesetFracs_', 'typeset_'];
/* The passes write their spans and sups through the one card maker, so the real renderer (and core's esc) comes with them. */
const fs = require('fs'), path = require('path');
const MAKER = () => { const core = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  return (core.match(/^const esc = .*$/m) || [''])[0] + '\n' + fs.readFileSync(path.join(__dirname, '..', 'js', 'cards-render.js'), 'utf8'); };
function typesetFn(src, cutFrom) {
  const parts = NAMES.map(n => cutFrom(src, n));
  if (!parts[parts.length - 1]) return null;
  return new Function(MAKER() + '\n' + parts.filter(Boolean).join('\n') + '\nreturn typeset_;')();
}
/* THE MAKER ALONE, for a check that cuts a function drawing through it (answerBlock_). */
const maker = () => new Function(MAKER() + '\nreturn { cardBlock_, cardBlocks_ };')();
module.exports = { typesetFn, NAMES, maker };
