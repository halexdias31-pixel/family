/* @family. — tools/typeset-src.js THE REAL typeset_ WITH ITS PASSES, for the checks that run it outside the app (split 1150: typeset_ calls four helpers). */
'use strict';
const NAMES = ['typesetKit_', 'typesetTerms_', 'typesetPowers_', 'typesetFracs_', 'typeset_'];
function typesetFn(src, cutFrom) {
  const parts = NAMES.map(n => cutFrom(src, n));
  if (!parts[parts.length - 1]) return null;
  return new Function(parts.filter(Boolean).join('\n') + '\nreturn typeset_;')();
}
module.exports = { typesetFn, NAMES };
