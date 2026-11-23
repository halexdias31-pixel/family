/* @family. — tools/lib/keypad-taps.js A KEY'S ANSWER AS THE TAPS A CHILD MAKES ON THE ONE KEYBOARD (owner 23 Nov: "Hegarty Maths always worked";
   ONE KEYBOARD: no key does another key's job). One function, self-contained so tools/keypad-taps.js runs it in node and hands its source to
   the browser: the template keys (fraction, power, root), → to leave a box, a mixed number as its whole, a space and the fraction, every
   other character its own key -- a point is ( x , y ), standard form × 1 0 and the power. */
'use strict';
function kpTapsOf(way, words) {
  const w = String(way).replace(/[−–]/g, '-').replace(/\*/g, '×').trim();
  const chars = s => s.split('');
  if (words) return chars(w);
  let m;
  /* a mixed number: the whole, a space, the fraction key, the top, → into the bottom */
  if ((m = /^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(w))) return chars(m[1]).concat([' ', '!frac'], chars(m[2]), ['!right'], chars(m[3]), ['!right']);
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
      if (tpl === '!pow' && /.[-+×÷]/.test(inner)) out.push(tpl, '(', ...kpTapsOf(inner, false), ')');
      else out.push(tpl, ...kpTapsOf(inner, false), '!right');
      i = next;
    } else { out.push(c); i++; }
  }
  return out;
}
module.exports = { kpTapsOf };
