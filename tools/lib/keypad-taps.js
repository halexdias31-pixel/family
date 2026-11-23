/* @family. — tools/lib/keypad-taps.js A KEY'S ANSWER AS THE TAPS A CHILD MAKES ON THE KEYPAD (owner 23 Nov: "Hegarty Maths always worked").
   One function, self-contained so tools/keypad-taps.js runs it in node and hands its source to the browser: the keypad's own template keys
   for each form (mixed number, point, ×10ⁿ, fraction, power, root), → to leave a box, every other character its own key. */
'use strict';
function kpTapsOf(way, words) {
  const w = String(way).replace(/[−–]/g, '-').replace(/\*/g, '×').trim();
  const chars = s => s.split('');
  if (words) return chars(w);
  let m;
  /* a mixed number: the whole, the mixed key, the top, → into the bottom */
  if ((m = /^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(w))) return chars(m[1]).concat(['!mixed'], chars(m[2]), ['!right'], chars(m[3]));
  /* a point, or several: the point key, x, → over the comma, y, → out */
  if (/^\(\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\)(\s*,?\s*\(\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\))*$/.test(w)) {
    const out = [];
    w.replace(/\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/g, (z, x, y) => { if (out.length) out.push(','); out.push('!pt', ...chars(x), '!right', ...chars(y), '!right'); return z; });
    return out;
  }
  /* standard form: the number, the ×10ⁿ key, the power */
  if ((m = /^(-?[\d.]+)\s*×\s*10\s*\^\s*\(?(-?\d+)\)?$/.exec(w))) return chars(m[1]).concat(['!x10'], chars(m[2]), ['!right']);
  const out = [];
  /* a box's contents: a bracketed group (its brackets are the box's) or a run of one term */
  const box = (s, i) => {
    if (s[i] === '(') { let d = 0, j = i; for (; j < s.length; j++) { d += s[j] === '(' ? 1 : s[j] === ')' ? -1 : 0; if (!d) break; } return [s.slice(i + 1, j), j + 1]; }
    const r = /^-?[\w.π]+/.exec(s.slice(i)); return r ? [r[0], i + r[0].length] : ['', i];
  };
  for (let i = 0; i < w.length;) {
    const c = w[i];
    const tpl = { '/': '!frac', '^': '!pow', '√': '!sqrt' }[c];
    if (tpl) {
      let j = i + 1; while (w[j] === ' ') j++;
      const [inner, next] = box(w, j);
      /* a power of several terms is opened with its own bracket, as a child does, or an operator brings the caret down (kpPowOut_) */
      if (tpl === '!pow' && /.[-+\u00d7\u00f7]/.test(inner)) out.push(tpl, '(', ...kpTapsOf(inner, false), ')');
      else out.push(tpl, ...kpTapsOf(inner, false), '!right');
      i = next;
    } else { out.push(c); i++; }
  }
  return out;
}
module.exports = { kpTapsOf };
