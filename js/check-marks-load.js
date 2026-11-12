/* @family. — check-marks-load.js THE SIX MARKING FUNCTIONS, CUT OUT OF find.js, FOR WHATEVER WANTS TO TEST THEM. § */
const fs = require('fs');
const path = require('path');

const NAMES = ['MARK_SYNONYMS', 'markNorm_', 'markParts_', 'markNum_', 'MARK_NUM', 'MARK_SYM', 'MARK_POW', 'MARK_BARE', 'markBare_', 'markFrac_',
               'markRange_', 'markRuleNums_', 'markRuleVal_', 'markNear_', 'markPrime_', 'MARK_RULE_TESTS', 'markRuleIs_', 'markRuleSet_', 'markRuleSeq_', 'markExprParse_', 'MARK_EXPR_OPS', 'markExprVal_', 'MARK_NUM_WORDS', 'MARK_TENS', 'MARK_OP_WORDS', 'markSpoken_', 'markExprRead_', 'markExprGrad_', 'markExpr_', 'markRule_', 'MARK_WORD', 'MARK_UNIT', 'MARK_UNIT_OF', 'markUnitOff_', 'markTerms_', 'markAnswer_',
               'multiSplit_', 'multiOf_', 'multiVals_', 'multiJoin_'];

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
  const src = require('../tools/find-src.js').findSrc(root || path.join(__dirname, '..'));
  const missing = NAMES.filter(n => !cutFrom(src, n));
  return { source: missing.length ? '' : NAMES.map(n => cutFrom(src, n)).join('\n'), missing: missing };
}

module.exports = { NAMES: NAMES, cutFrom: cutFrom, markingSource: markingSource };
