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
/* COMMENTS BLANKED, NOT DELETED — each one replaced by the same number of newlines it occupied.

   Removing them outright shifts every line after the first comment, and this file is more comment
   than rule — so a fault reported at "line 1929" was somewhere around line 3400 in the actual
   stylesheet. A line number that does not point at the thing is worse than none: it sends somebody
   to a rule that is fine and teaches them the report cannot be trusted. */
const bare = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
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
    /* A COMMA IS LEFT ALONE, and that is a decision rather than an oversight.

       Splitting `#a, #b { display: none }` into two rules seemed obviously right — it is how the
       browser reads it, and not splitting is how two loading splashes came to be drawn at once: a
       group hid all five and one of them was given a display of its own further down.

       But splitting it reported eight faults and six were the same ordinary idiom: a group sets a
       default and one rule refines it. `.a, .b { opacity: 0 } .b { opacity: 1 }` is how anybody
       writes "these start hidden, this one does not", and calling it an override is calling normal
       CSS a bug. A report that is mostly wrong is a report nobody reads, and the two real faults in
       it would have been lost among the six.

       So this check compares rules with the SAME selector, where a disagreement is unambiguous —
       and the group-versus-member case, which is not mechanically distinguishable from correct
       code, is caught by naming the actual invariant instead. See the splash check at the foot of
       this file. */
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

/* ---------- 6. THE SPLASHES: HIDDEN BY DEFAULT, SHOWN ONLY BY THEIR OWN STATE CLASS -------------
   One loading animation shows and the others are not drawn. That is an invariant of this app rather
   than a fact about CSS, so no general rule can find a breach of it — and a breach is what put two
   splashes on the screen at once: `#splash-torch` set `display: grid` in its own rule, below the
   one that hides all of them, and won by being later.

   Stated as the rule it is: a splash may not have an opinion about whether it is visible. Only the
   two rules that decide — the one that hides them all, and the one that shows the chosen one. */
const splashBad = [];
{
  /* WHICH ONES ARE SPLASHES, taken from the rule that hides them rather than from every id that
     happens to start with `splash-`. `#splash-line` and `#splash-mist` are PARTS of the tag, not
     splashes of their own, and a check that guesses from a name prefix calls them faults — which
     is the same "mostly wrong report" that made the last version of this unusable.
     The hide rule is the list. If something is not in it, it is not one of these. */
  const hideRule = rules.find(r => /^#splash-\w+(, #splash-\w+)+$/.test(r.sel)
    && r.decls.some(d => d.prop === 'display' && d.val === 'none'));
  const names = hideRule
    ? hideRule.sel.split(',').map(x => x.trim().replace('#splash-', ''))
    : [];
  names.forEach(n => {
    const own = rules.filter(r => r.sel === '#splash-' + n);
    own.forEach(r => {
      if (r.decls.some(d => d.prop.toLowerCase() === 'display')) {
        splashBad.push('line ' + r.line + '  #splash-' + n + ' sets its own `display` — it will '
          + 'fight the rule that hides the unchosen ones, and two splashes will show at once');
      }
    });
    const shown = rules.some(r => /^#splash\.is-\w+ #splash-/.test(r.sel) && r.sel.endsWith('#splash-' + n));
    if (!shown) splashBad.push('#splash-' + n + ' is never shown by any `.is-` rule — it can only '
      + 'ever be hidden');
  });
}

/* ---------- 7. EVERYTHING TAPPABLE MUST LOOK TAPPABLE --------------------------------------------
   `[data-do]` is what makes a thing respond to a press in this app — one delegated listener reads
   that attribute and nothing else. So the rule that gives every one of them a visible signal is
   load-bearing: without it a card, a row and a paragraph look identical and only one of them does
   anything.

   It is one rule and it is easy to lose — to a refactor, to a tidy-up, to somebody deciding a bare
   attribute selector looks untidy. This says so if it goes. */
const tapBad = [];
{
  const has = (sel, prop) => rules.some(r => r.sel === sel && r.decls.some(d => d.prop === prop));
  if (!has('[data-do]', 'cursor')) {
    tapBad.push('`[data-do]` no longer sets a cursor — every tappable thing that is not a button '
      + 'now looks exactly like text that is not');
  }
  /* THIS USED TO REQUIRE `[data-do]:active` — a press state on everything — and that was the wrong
     thing to check for. An affordance you only see once you have pressed is not an affordance: it
     answers the question after it has been asked. What tells somebody a thing can be pressed is
     what it looks like SITTING STILL.
     So the check is for the standing signals instead: the chevron on the block-shaped ones and the
     dotted underline on the ones inside a line of text. Losing either is losing the answer. */
  if (!rules.some(r => /\.card\.tap::after/.test(r.sel))) {
    tapBad.push('the chevron on `.card.tap` is gone — a card the width of the screen with nothing '
      + 'at the end of it reads as a paragraph rather than a door');
  }
  if (!rules.some(r => r.decls.some(d => d.prop === 'text-decoration-style' && d.val === 'dotted'))) {
    tapBad.push('the dotted underline is gone — a word inside a line of text that acts when pressed '
      + 'now looks exactly like the words around it');
  }
}

/* ---------- 7. A RULE THAT SAYS NOTHING --------------------------------------------------------
   An empty ruleset does nothing at all, which is exactly why it should not be left in: it reads as
   a rule somebody started and meant to come back to, and the next person either fills it in or
   spends a minute working out whether it matters. Every editor flags them, so leaving one is also
   leaving a warning that trains you to ignore warnings.
   This one turned up where a duplicate rule had been emptied instead of deleted. */
const hollow = rules.filter(r => !r.decls.length)
  .map(r => 'line ' + r.line + '  ' + r.sel + '  is empty — delete it rather than leave it');

say('THE SAME PROPERTY TWICE IN ONE RULE — the first never applies', twice);
say('ONE SELECTOR IN TWO PLACES, disagreeing about a property', dupSel);
say('A RULE OVERRIDDEN BY A LATER COPY OF ITSELF', order);
say('PROPERTIES THAT CONTRADICT EACH OTHER', clash);
say('CLASSES STYLED BUT NEVER PRODUCED — check before deleting; a name may be built in pieces', dead);
say('A LOADING SPLASH THAT COULD SHOW WHEN IT WAS NOT CHOSEN', splashBad);
say('A RULE WITH NOTHING IN IT', hollow);
say('TAPPABLE THINGS THAT WOULD LOOK LIKE PLAIN TEXT', tapBad);

/* ---------- 8. A LOADING SCREEN THAT DOES NOT SAY WHOSE APP IT IS --------------------------------
   The Pythagoras one shipped without the name on it — a lovely thing to look at that did not tell
   anybody whose app they had opened. It was noticed because somebody watched it, which is the wrong
   way to find out.
   Every splash gets a random one-in-seven of somebody's first impression. All of them have to say
   it, and the check is one line rather than seven pairs of eyes. */
{
  const html = path.join(dir, 'index.html');
  const nameless = [];
  if (fs.existsSync(html)) {
    const h = fs.readFileSync(html, 'utf8');
    h.split(/<div id="splash-|<svg id="splash-/).slice(1).forEach(part => {
      const name = part.slice(0, part.indexOf('"'));
      if (name === 'say') return;                      // the screen-reader line, not a splash

      /* COMMENTS STRIPPED FIRST, and the block cut at the comment that introduces the NEXT one.

         Without this the check passed a splash with no name on it, because the block ran on into
         the next splash's explanation — and that explanation happens to contain the word. So it was
         reading somebody else's prose and calling it a pass, which is the worst kind of check:
         one that is green for a reason unrelated to the thing it claims to be testing.

         Found by breaking a splash on purpose and watching the check not notice. Worth doing to
         every check at least once. */
      let body = part.split('<!-- ----------')[0];
      body = body.replace(/<!--[\s\S]*?-->/g, '');

      /* Case-insensitively: the readout says it in capitals, and a check that flagged that would be
         reporting a fault that is not there — which is how a report stops being read. */
      if (!/@family\./i.test(body)) {
        nameless.push('#splash-' + name + ' never says @family. — a one-in-seven chance of a first '
          + 'impression that does not name the app');
      }
    });
  }
  say('A LOADING SCREEN THAT DOES NOT SAY WHOSE APP IT IS', nameless);
}

console.log('');
console.log('rules read: ' + rules.length);
console.log(fail ? 'FAILED — read each line above; every one is a rule that does not do what it says'
                 : 'OK — no dead declarations, no silent overrides, no contradictions.');
process.exit(fail ? 1 : 0);