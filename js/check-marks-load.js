/* @family. — check-marks-load.js THE SIX MARKING FUNCTIONS, CUT OUT OF find.js, FOR WHATEVER WANTS TO TEST THEM. § */
const fs = require('fs');
const path = require('path');

const NAMES = ['markNorm_', 'markParts_', 'markNum_', 'MARK_NUM', 'MARK_SYM', 'MARK_POW', 'MARK_BARE', 'markBare_', 'markFrac_',
               'markRange_', 'markRuleNums_', 'markRuleVal_', 'markRuleIs_', 'markRuleSet_', 'markRule_', 'MARK_WORD', 'MARK_UNIT', 'MARK_UNIT_OF', 'markUnitOff_', 'markAnswer_'];

function cutFrom(src, name) {
  let i = src.indexOf('function ' + name + '(');
  if (i < 0) i = src.indexOf('const ' + name + ' =');
  if (i < 0) return null;
  let j = i, depth = 0, seen = false;
  while (j < src.length) {
    const c = src[j];
    if (c === '{') { depth++; seen = true; }
    if (c === '}') { depth--; if (seen && depth === 0) { j++; break; } }
    if (!seen && c === ';') { j++; break; }   /* a `const` arrow with no block */
    j++;
  }
  return src.slice(i, j);
}

/* Returns `{ source, missing }`. § */
function markingSource(root) {
  const src = fs.readFileSync(path.join(root || path.join(__dirname, '..'), 'js', 'find.js'), 'utf8');
  const missing = NAMES.filter(n => !cutFrom(src, n));
  return { source: missing.length ? '' : NAMES.map(n => cutFrom(src, n)).join('\n'), missing: missing };
}

module.exports = { NAMES: NAMES, cutFrom: cutFrom, markingSource: markingSource };
