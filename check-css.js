#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-css.js

   WHAT A COMPILER WOULD HAVE DONE FOR THE STYLESHEET. `check.js` reads the JavaScript and has
   caught real faults; nothing has ever read style.css, and that is where most of the damage has
   come from — because a wrong CSS rule does not throw, does not log, and does not fail. It simply
   loses to another rule, or does something different from what its comment says, and the app looks
   subtly broken in a way nobody can connect to an edit.

   Every check here is a fault that has actually happened in this file:

     DECLARED TWICE      `border` and `box-shadow` were each written twice in `.pane`, four lines
                         apart. The second won. The first pair was dead text that read as though it
                         were doing something, and it took a screenshot to notice.

     SAME SELECTOR TWICE two `.page > .pane:has(.widget-full)` blocks setting `min-height` to 12rem
                         and 13rem. Whichever came last won, silently.

     ORDER FAULT         `#top { display: none }` was written ABOVE `#top { display: flex }`, so the
                         header stayed on screen. Same specificity, later rule wins — which is
                         obvious once you know and invisible when you are reading a 2,000 line file.

     CONTRADICTION       `contain: paint` on an element asking for `overflow: visible`. Paint
                         containment clips regardless, so the column was cut off at the fold. Both
                         declarations looked right on their own.

     DEAD SELECTOR       a class no JavaScript or HTML ever produces. `arrive()` cost four rounds
                         because `from-left` and `from-right` had no rules at all — the reverse of
                         this, and the same lesson: code and stylesheet drifting apart in silence.

     node check-css.js
================================================================================================== */
const fs = require('fs'), path = require('path');

const dir = path.join(__dirname, '..');
const cssPath = path.join(dir, 'style.css');
if (!fs.existsSync(cssPath)) { console.log('no style.css beside this folder'); process.exit(1); }
const css = fs.readFileSync(cssPath, 'utf8');

/* Everything the app can actually produce: every file's source, plus index.html. Class names are
   built inside template strings, so the honest test is "does this name appear anywhere in the
   code at all" rather than any attempt to parse the markup. */
const code = fs.readdirSync(path.join(dir, 'js'))
  .filter(f => f.endsWith('.js') && !f.startsWith('check') && f !== '_scope.js')
  .map(f => fs.readFileSync(path.join(dir, 'js', f), 'utf8')).join('\n')
  + (fs.existsSync(path.join(dir, 'index.html')) ? fs.readFileSync(path.join(dir, 'index.html'), 'utf8') : '');

/* ---------- strip comments, then read the rules ------------------------------------------------ */
const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');
const rules = [];
{
  /* A hand-rolled reader rather than a parser from npm: it has to run with nothing installed, and
     the shapes it must understand are the ones this file actually uses. Nested at-rules are read as
     a block whose inner rules are read too. */
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(bare))) {
    const sel = m[1].trim().replace(/\s+/g, ' ');
    if (!sel || sel.startsWith('@')) continue;
    const line = bare.slice(0, m.index).split('\n').length;
    /* IS THIS RULE CONDITIONAL? A rule inside `@media` or `@supports` does not simply override the
       one above it — it applies on some screens or in some browsers and not others, so calling it
       an override would be wrong and would train somebody to ignore this report.
       Found by counting braces backwards to see whether an at-block is still open. */
    let depth = 0, cond = '';
    {
      const before = bare.slice(0, m.index);
      let open = 0;
      for (let k = before.length - 1; k >= 0; k--) {
        const ch = before[k];
        if (ch === '}') open++;
        else if (ch === '{') { if (open) open--; else { 
          const head = before.lastIndexOf('@', k);
          const nl = before.lastIndexOf('\n', k);
          if (head > nl - 1 && head !== -1 && head < k) { depth++; cond = before.slice(head, k).trim().replace(/\s+/g, ' ').slice(0, 60); }
          break;
        } }
      }
    }
    const decls = m[2].split(';').map(d => d.trim()).filter(Boolean)
      .map(d => { const i = d.indexOf(':'); return i < 0 ? null : { prop: d.slice(0, i).trim(), val: d.slice(i + 1).trim() }; })
      .filter(Boolean);
    rules.push({ sel, decls, line, cond });
  }
}

let fail = 0;
const say = (title, list) => {
  console.log('');
  console.log(title + '  (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  list.forEach(x => console.log('  ' + x));
  fail = 1;
};

/* ---------- 1. the same property twice in one rule --------------------------------------------- */
const twice = [];
rules.forEach(r => {
  const seen = {};
  r.decls.forEach(d => {
    const k = d.prop.toLowerCase();
    if (seen[k] !== undefined && seen[k] !== d.val) {
      twice.push('line ' + r.line + '  ' + r.sel + '  →  ' + d.prop
        + ' set to "' + seen[k] + '" and then "' + d.val + '"; the first is dead');
    }
    seen[k] = d.val;
  });
});

/* ---------- 2. the same selector in two places, both setting the same property ------------------ */
const bySel = {};
rules.forEach(r => { (bySel[r.sel] = bySel[r.sel] || []).push(r); });
const dupSel = [];
Object.keys(bySel).forEach(sel => {
  const rs = bySel[sel];
  if (rs.length < 2) return;
  const props = {};
  rs.forEach(r => r.decls.forEach(d => {
    const k = d.prop.toLowerCase();
    (props[k] = props[k] || []).push({ line: r.line, val: d.val });
  }));
  Object.keys(props).forEach(k => {
    const hits = props[k];
    if (hits.length < 2) return;
    if (new Set(hits.map(h => h.val)).size < 2) return;   // saying the same thing twice is untidy, not wrong
    /* A rule inside @media or @supports applies conditionally, so it is not an override. */
    if (rs.some(r => r.cond)) return;
    dupSel.push(sel + '  →  ' + k + ' set at line ' + hits.map(h => h.line + ' ("' + h.val + '")').join(' and line ')
      + '; the last one wins');
  });
});

/* ---------- 3. an earlier rule losing to an identical later one --------------------------------- */
const order = [];
Object.keys(bySel).forEach(sel => {
  const rs = bySel[sel].slice().sort((a, b) => a.line - b.line);
  if (rs.length < 2) return;
  for (let i = 0; i < rs.length - 1; i++) {
    rs[i].decls.forEach(d => {
      const k = d.prop.toLowerCase();
      const beaten = rs.slice(i + 1).find(r => !r.cond
        && r.decls.some(x => x.prop.toLowerCase() === k && x.val !== d.val));
      if (beaten && !order.some(o => o.indexOf(sel + '  →  ' + k) === 0)) {
        order.push(sel + '  →  ' + k + ' at line ' + rs[i].line + ' never applies; line ' + beaten.line + ' overrides it');
      }
    });
  }
});

/* ---------- 4. contradictions between properties in one rule ------------------------------------ */
const clash = [];
rules.forEach(r => {
  const get = p => (r.decls.find(d => d.prop.toLowerCase() === p) || {}).val;
  const contain = get('contain') || '';
  const overflow = get('overflow') || get('overflow-y') || get('overflow-x') || '';
  if (/paint|content|strict/.test(contain) && /visible/.test(overflow)) {
    clash.push('line ' + r.line + '  ' + r.sel + '  →  contain: ' + contain
      + ' CLIPS the box, so overflow: ' + overflow + ' cannot happen');
  }
  const pos = get('position');
  if (pos === 'static' && (get('top') || get('left') || get('inset'))) {
    clash.push('line ' + r.line + '  ' + r.sel + '  →  position: static ignores top/left/inset');
  }
  if (/%\s*$/.test(get('max-height') || '') && get('height') === 'auto') {
    clash.push('line ' + r.line + '  ' + r.sel
      + '  →  max-height in % with height: auto resolves to no cap at all');
  }
});

/* ---------- 5. classes the stylesheet dresses that nothing ever produces ------------------------ */
const IGNORE = new Set(['hidden', 'on', 'far', 'no-anim', 'active', 'is-off', 'solid']);
const seenClass = new Set();
bare.replace(/\.(-?[A-Za-z_][\w-]*)/g, (_, c) => { seenClass.add(c); return _; });
/* PLAIN CONTAINMENT, not a pattern. A class name is very often built with a placeholder stuck to
   it — `class="widget-full${wgt.solid ? ' solid' : ''}"` — and any rule about what may follow the
   name gets that wrong and calls a live class dead. Eleven were reported that way, and a report
   that is mostly wrong is a report nobody reads.
   So the question is only: does this name appear in the code at all? That can still be fooled — a
   name assembled from pieces, `'is-' + kind` — which is why the heading says to check before
   deleting. It is a list to look at, not a list to act on blindly. */
const dead = [...seenClass].filter(c => !IGNORE.has(c) && !code.includes(c));

say('THE SAME PROPERTY TWICE IN ONE RULE — the first never applies', twice);
say('ONE SELECTOR IN TWO PLACES, disagreeing about a property', dupSel);
say('A RULE OVERRIDDEN BY A LATER COPY OF ITSELF', order);
say('PROPERTIES THAT CONTRADICT EACH OTHER', clash);
say('CLASSES STYLED BUT NEVER PRODUCED — check before deleting; a name may be built in pieces', dead);

console.log('');
console.log('rules read: ' + rules.length);
console.log(fail ? 'FAILED — read each line above; every one is a rule that does not do what it says'
                 : 'OK — no dead declarations, no silent overrides, no contradictions.');
process.exit(fail ? 1 : 0);
