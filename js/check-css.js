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

/* ---------- THE COMMENTS ARE NOT THE APP, AND THIS FILE IS 64% COMMENTS --------------------------
   THE TEST IS "does this name appear anywhere in the code at all", because class names are built
   inside template strings and no parse of the markup would be honest. That is right, and it was
   searching the PROSE as well as the code.

   IN THIS CODEBASE THAT IS NOT A SMALL LEAK. CLAUDE.md's own figure is 64% comments, and the house
   style is that a comment says what went wrong before — so every class this project has ever
   deleted is named in the paragraph explaining why it was deleted. `.post-act` was removed from the
   markup and named four times in the notes about removing it, and stayed off the dead list on the
   strength of its own obituary. The rules it left behind would have sat in the stylesheet for ever,
   invisible to the one check that exists to find them.

   SO THE COMMENTS COME OUT FIRST. Block and line comments both, replaced by their own newlines so
   nothing that reports a line number moves. A name that survives is a name the browser could
   actually see. */
const decomment_ = src => src
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ''))
  /* NOT `//` AT THE START OF A URL. `https://…` inside a string is the common case and eating from
     there to the end of the line takes real code with it. A `//` that follows `:` is a scheme. */
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
const code = fs.readdirSync(path.join(dir, 'js'))
  .filter(f => f.endsWith('.js') && !f.startsWith('check') && f !== '_scope.js')
  .map(f => decomment_(fs.readFileSync(path.join(dir, 'js', f), 'utf8'))).join('\n')
  + (fs.existsSync(path.join(dir, 'index.html'))
     ? fs.readFileSync(path.join(dir, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '') : '');


/* ---------- IS IT EVEN A STYLESHEET ---------------------------------------------------------------
   EVERY OTHER CHECK IN THIS FILE READS DECLARATIONS. That is the right shape for asking whether a
   rule does what it says — and it means the file can be structurally broken and every check still
   passes, because a stray `}` is not a declaration.

   IT HAPPENED TWICE. A regex deleting `@keyframes X { … }` used `[^}]*`, which stops at the first
   closing brace — the end of the first STOP, not of the block — so the header and one stop went and
   four stops and a `}` stayed. A browser discards from an error to the next brace it can resync on,
   which can silently take the rules AFTER the orphan with it. So the damage is never confined to
   the thing that was broken, and nothing on screen points at it.

   COUNTING BRACES IS THE WHOLE CHECK. Comments are blanked first, keeping newlines, because a `}`
   inside a comment is not a brace — I wrote this counter without that and it reported a fault in a
   paragraph of prose. */
function bracesBalance(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  let depth = 0, line = 1;
  const stray = [];
  for (const ch of clean) {
    if (ch === '\n') line++;
    else if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth < 0) { stray.push(line); depth = 0; } }
  }
  return { stray, unclosed: depth };
}

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
    /* AT THE SELECTOR'S FIRST CHARACTER, not at `m.index`: `[^{}]+` starts straight after the last
       `}`, so it carries every blanked comment line between the two rules, and a rule under a twenty-
       line comment was reported twenty lines above itself -- at the rule before it. Found by the tile
       check below sending the reader to `.qpad-aid` for a fault in `.tile.is-lead`. */
    const line = bare.slice(0, m.index + Math.max(0, m[1].search(/\S/))).split('\n').length;
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
/* ---------- A LIST TO LOOK AT IS NOT A BROKEN BUILD ----------------------------------------------
   EVERY SECTION USED TO FAIL, AND ONE OF THEM CANNOT KNOW IT IS RIGHT. "Classes styled but never
   produced" says so in its own title — a name may be built in pieces, `'rc-' + kind`, so the check
   cannot tell a dead rule from one whose writer it cannot see. It had 28 entries, so check-css was
   permanently red, and that is not a check with a finding in it: it is a check people stop opening.

   What it took down with it matters more than the 28. The sections that ARE conclusive — a dead
   declaration, a silent override, a contradiction, a splash that never names the app — were all at
   zero, and nobody could see that past the red. check-all.js already draws this line for check-dead
   and check-doors; drawing it inside this file rather than on the whole check keeps the conclusive
   half hard. */
let noted = 0;

const say = (title, list, soft) => {
  console.log('');
  console.log(title + '  (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  list.forEach(x => console.log('  ' + x));
  if (soft) noted = 1; else fail = 1;
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
/* ---------- PLAIN CONTAINMENT HID EVERY CLASS WHOSE NAME IS A PREFIX OF A LIVE ONE ----------------
   IT WAS `code.includes(c)`, and the note defending it was right about what it was defending
   against: a class name is very often built with a placeholder stuck to it —
   `class="widget-full${wgt.solid ? ' solid' : ''}"` — and a rule about what may follow the name
   calls a live class dead. Eleven were reported that way once, and a report that is mostly wrong is
   a report nobody reads.

   WHAT IT ALSO DID was answer yes for `post-act` because the file contains `post-acts`. Any name
   that is a prefix of another name in this stylesheet is unreportable: `.post-act`, `.tile` against
   `.tile-row`, `.bk` against `.bk-row`. The check could not have found them in any state of the
   codebase, which is worse than a false negative — it is a blind spot with no edge.

   SO: THE NAME, NOT FOLLOWED BY MORE NAME. `(?![\w-])` rejects `post-acts` and accepts every case
   the old note defends, because what follows a built name is `$`, a quote or a space — none of
   which is a name character. The one it still cannot see is a name assembled from pieces,
   `'is-' + kind`, which is why the heading says to check before deleting. A list to look at. */
/* ---------- AND THE ONE CASE THE HEADING HAS ALWAYS WARNED ABOUT, NOW ACTUALLY FOUND -------------
   "A name may be built in pieces" is in the title of this section, and until now that was all it
   was: a caveat asking the reader to be careful, with no way to tell WHICH of the entries it
   applied to. `is-buy` sat in the list looking exactly as dead as `post-ok`, and it is written by
   `tile_` as `'is-' + o.tone` with `tone: 'buy'` in half a dozen callers. Deleting it would have
   taken the gold off every affirmative tile in the app, and the list would have been right about
   the twenty entries either side of it.

   THE ASSEMBLY IS VISIBLE IN THE SOURCE. A name built in pieces is a string literal followed by a
   `+`, so every such literal that is a PREFIX of a class name makes that class unprovable — `'is-'`
   covers `is-buy`, `is-admin`, `is-tutor`; `'rc-'` covered `rc-receipt` before that stopped being
   built at all. Found rather than assumed, and named in the report so the reader knows which of the
   two lists they are looking at.

   IT STAYS A LIST TO LOOK AT. A name assembled the other way round — `kind + '-row'` — is still
   invisible, and so is one built from a variable with no literal at all. What changed is that the
   entries this check CAN be sure about are no longer mixed in with the ones it cannot. */
const builtPrefix = new Set();
/* THE LEADING SPACE IS PART OF THE LITERAL. `tile_` writes ` ' is-' + o.tone` — a space, because
     the name is being appended to a class list — so a pattern anchored to a letter right after the
     quote missed every one of them, which is how `is-buy` reached the provably-dead list. */
for (const m of code.matchAll(/(['"`])\s*([A-Za-z][\w-]*-)\1\s*\+/g)) builtPrefix.add(m[2]);
const maybeBuilt = c => [...builtPrefix].some(p => c.startsWith(p) && c !== p);
const present = c => new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, m => '\\' + m)
                                + '(?![\\w-])').test(code);
const dead  = [...seenClass].filter(c => !IGNORE.has(c) && !present(c) && !maybeBuilt(c));
const built = [...seenClass].filter(c => !IGNORE.has(c) && !present(c) && maybeBuilt(c));

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

/* ---------- 7b. A TILE'S COLOUR WRITTEN OUT BY HAND -------------------------------------------------
   `.tile.is-lead` -- the pen's lock, gold because arming is the first step -- was copied from
   `.tile.is-admin` and only its `color` changed. Its border kept `rgb(242 210 75 / .35)`, which is
   `--admin` (#f2d24b, "only you can see this") thinned, so a gold padlock sat in an admin-yellow frame
   on a tile every student sees. Nothing read it, because a literal cannot say which token it meant:
   two yellows a few steps apart look like one decision in the source and two on the screen.

   SO A `.tile` RULE MAY NOT SPELL OUT A `:root` TOKEN'S COLOUR, as a hex or as `rgb()` at any alpha;
   `color-mix(in srgb, var(--admin) 22%, transparent)` paints the same thing and names it. SCOPED TO
   TILES, and that is the reach of the fault rather than a reluctance: one renderer draws every action
   in the app, so a tile's tone is the one look that is copied most and checked least. The rest of the
   stylesheet holds ~100 such literals (the paper's cream thinned over the black, mostly), each in its
   own component, listed by nobody -- a wider version of this is worth having and is not this fix.
   White and black washes are not tokens and pass: `rgb(255 255 255 / .08)` is a press, not a colour.
   The tokens are read off `:root` itself, so a token added tomorrow is covered tomorrow. */
const handTone = [];
{
  const root = rules.find(r => r.sel === ':root' && !r.cond);
  const tok = {};
  (root ? root.decls : []).forEach(d => {
    const m = /^--[\w-]+$/.test(d.prop) && /^#([0-9a-f]{6})\b/i.exec(d.val);
    if (m && !/^(000000|ffffff)$/i.test(m[1])) (tok[m[1].toLowerCase()] = tok[m[1].toLowerCase()] || []).push(d.prop);
  });
  if (!Object.keys(tok).length) handTone.push(':root holds no hex colour tokens this check can read — the tiles were NOT checked');
  const hex = (a, b, c) => [a, b, c].map(n => (+n).toString(16).padStart(2, '0')).join('');
  rules.filter(r => /\.tile(?![\w-])/.test(r.sel)).forEach(r => r.decls.forEach(d => {
    if (/^--/.test(d.prop)) return;
    const seen = [];
    for (const m of d.val.matchAll(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/g)) seen.push([m[0], hex(m[1], m[2], m[3])]);
    for (const m of d.val.matchAll(/#([0-9a-f]{6})\b/gi)) seen.push([m[0], m[1].toLowerCase()]);
    seen.forEach(([lit, h]) => {
      if (tok[h]) handTone.push('line ' + r.line + '  ' + r.sel + '  ' + d.prop + ': `' + lit + '…` is '
        + tok[h].join(' / ') + ' written out — say `color-mix(in srgb, var(' + tok[h][0] + ') N%, transparent)`');
    });
  }));
}

/* FIRST, because everything below it reads a file it assumes is well formed. A stylesheet with a
   stray brace is not a stylesheet with a fault in it; it is a stylesheet whose later rules the
   browser may have thrown away, and no amount of checking declarations will say so. */
const bal = bracesBalance(css);
say('A STRAY CLOSING BRACE — the browser discards from here to wherever it can resync, '
    + 'which can take the rules after it too',
    bal.stray.map(n => 'style.css line ' + n));
say('A BLOCK THAT IS NEVER CLOSED — everything after it is inside it',
    bal.unclosed ? [bal.unclosed + ' unclosed ' + (bal.unclosed === 1 ? 'block' : 'blocks')] : []);

/* ---------- ONE ID, ONE ELEMENT ---------------------------------------------------------------
   `splash-line` WAS TWO THINGS: the outline text that gets written on inside the tag splash, and
   the whole number-line splash. Every rule for either landed on both — so the tag's stroked, dashed
   `tag-write` animation was painting the number line, and the hide-by-default rule could take the
   outline out of the wordmark. On a phone it showed as text from one splash appearing over another.

   NOTHING CAUGHT IT. `check-doors` matches handlers to `data-do`, `check-css` reads declarations,
   and a duplicate id is legal HTML that no browser complains about — `getElementById` simply
   returns the first and everything downstream is quietly wrong.

   The whole page is swept, not just the splashes: an id is a promise of uniqueness and this is the
   only place that checks it. */
{
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const seen = {};
  for (const m of html.matchAll(/id="([^"]+)"/g)) seen[m[1]] = (seen[m[1]] || 0) + 1;
  say('THE SAME ID ON TWO ELEMENTS — every rule for either lands on both, and '
      + 'getElementById returns whichever came first',
      Object.keys(seen).filter(k => seen[k] > 1).map(k => k + ' appears ' + seen[k] + ' times'));
}

say('THE SAME PROPERTY TWICE IN ONE RULE — the first never applies', twice);
say('ONE SELECTOR IN TWO PLACES, disagreeing about a property', dupSel);
say('A RULE OVERRIDDEN BY A LATER COPY OF ITSELF', order);
say('PROPERTIES THAT CONTRADICT EACH OTHER', clash);
say('A TILE THAT WRITES A TOKEN\'S COLOUR OUT BY HAND — a literal cannot say which token it meant', handTone);
/* SOFT: this is the one section that cannot prove its own findings — see `say` above. */
say('CLASSES STYLED AND NOWHERE PRODUCED — no literal in the code could assemble these', dead, true);
say('CLASSES A LITERAL COULD BE ASSEMBLING — ' + [...builtPrefix].sort().join(' ')
    + ' appear before a `+`, so these may well be live', built, true);
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
      /* COMMENTS OUT FIRST, THEN THE SPLIT. This cut at the first `<!-- ----------` and then stripped
         comments — so a divider-styled comment INSIDE a splash truncated the body before its own
         signature, and the check reported a missing `@family.` that was plainly in the markup. A
         check that cries wolf about a fault that is not there is a check people learn to skip.
         Stripping comments first means no comment of any shape can split a splash in half. */
      let body = part.replace(/<!--[\s\S]*?-->/g, '');

      /* Case-insensitively: the readout says it in capitals, and a check that flagged that would be
         reporting a fault that is not there — which is how a report stops being read. */
      /* AND AS IT READS ON THE SCREEN, tags and spaces out. The blocks splash spells the name one
         letter to a block — `<i>@</i>` … `<i>.</i>` — so the raw markup never holds the word, and it
         passed only because it was the LAST splash and its body ran on into `#splash-say`. The
         boxing ring was added after it and the blocks went red for a fault that is not there. */
      /* AND THE LAST SPLASH IS CUT AT `#splash-say`, which is a `<p>` and so not a split point: the
         last one's body ran on into that line's own @family. and passed whatever it drew. */
      body = body.split(/<p id="splash-say"/)[0];
      const shown = body.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
      if (!/@family\./i.test(body) && !/@family\./i.test(shown)) {
        nameless.push('#splash-' + name + ' never says @family. — a one-in-seven chance of a first '
          + 'impression that does not name the app');
      }
    });
  }
  say('A LOADING SCREEN THAT DOES NOT SAY WHOSE APP IT IS', nameless);
}

/* ---------- 9. A SPLASH BUILT AS ONE SEAMLESS LOOP STAYS ONE ---------------------------------------
   THREE SPLASHES WERE REBUILT TOGETHER — the coin, the sieve and the blocks — and each had failed in
   one of the same three ways:
     A ONE-SHOT WITH A GLOW AFTER IT. The sieve struck its numbers once in 1.2s and then pulsed; the
     blocks bumped once and then hovered. Because the glow was `infinite`, index.html's replay loop
     ("IF ANYTHING HERE LOOPS, NOTHING IS TOUCHED") never ran the story again, so a slow load showed
     the ending and a shimmer for the rest of its life.
     A PROPERTY THE COMPOSITOR CANNOT RUN. The sieve's strike grew `width` and faded `color`; the
     blocks' hover animated `box-shadow` and the coin spun by animating `width`. docs/history 055
     measured that this did not stutter, and that is not a licence: transform and opacity are the
     only two that cannot.
     A STILL THAT WAS NOT THE ANSWER. Each has a reduced-motion rule, and it must stay.
   So a splash named here must: animate only `transform` and `opacity`; give every animation
   `infinite` (one cycle that ends where it began, rather than a story and an encore); and have a
   reduced-motion rule that switches its animations off. Then each states the one thing about it
   that was wrong and is easy to undo — those are below, with what they guard against.

   A REGISTRY RATHER THAN EVERY SPLASH, because 23 of the 39 still animate something else and most
   of them are fine (055 again). A splash joins this list when it is rebuilt as a loop. */
{
  const h = fs.readFileSync(path.join(dir, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  /* THE MARKUP OF ONE SPLASH: from its opening tag to the next splash's, or to `#splash-say`, which
     follows the last one. */
  const markup = id => {
    const a = h.search(new RegExp('<(div|svg) id="splash-' + id + '"'));
    if (a < 0) return null;
    const rest = h.slice(a + 10);
    const b = rest.search(/<(div|svg|p) id="splash-/);
    return h.slice(a, b < 0 ? h.length : a + 10 + b);
  };
  /* KEYFRAMES BY NAME, read off the comment-blanked text so a keyframe described in prose is not a
     keyframe. Brace-matched, because a regex to the first `}` stops at the end of the first stop —
     the fault the brace check at the top of this file was written for. */
  const frames = {};
  for (const m of bare.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    let i = m.index + m[0].length, depth = 1;
    while (i < bare.length && depth) { if (bare[i] === '{') depth++; else if (bare[i] === '}') depth--; i++; }
    const body = bare.slice(m.index + m[0].length, i - 1);
    const props = new Set();
    for (const s of body.matchAll(/\{([^{}]*)\}/g)) {
      s[1].split(';').forEach(d => { const k = d.split(':')[0].trim().toLowerCase(); if (k) props.add(k); });
    }
    frames[m[1]] = props;
  }
  const WORDS = new Set(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'infinite', 'both',
    'forwards', 'backwards', 'none', 'alternate', 'reverse', 'alternate-reverse', 'normal',
    'running', 'paused', 'step-start', 'step-end', 'end', 'start', 'jump-none', 'jump-both']);
  const namesIn = val => val.replace(/[\w-]*\([^()]*\)/g, '').split(/[\s,]+/)
    .filter(t => /^[a-z][\w-]*$/i.test(t) && !WORDS.has(t));
  const loopBad = [];

  const LOOPED = {
    /* THE COIN'S FACES ARE ONE METAL, AND IT HAS AN EDGE. It was gold one side and mint the other
       — a counter, not a coin — and paper-thin edge-on. The look lives in `.cn-coin b`, so a face
       rule that sets its own background or colour is the mint side coming back; and the thickness
       is the stack of discs inside the coin, so fewer than four is a coin that vanishes when it
       turns. */
    coin: (m) => {
      const bad = [];
      rules.filter(r => /^\.cn-[ht]$/.test(r.sel) && !r.cond).forEach(r => r.decls
        .filter(d => /^(background|background-color|color|border|border-color)$/.test(d.prop))
        .forEach(d => bad.push('line ' + r.line + '  ' + r.sel + ' sets its own ' + d.prop
          + ' — the two faces of the coin are one metal, drawn once in `.cn-coin b`')));
      const coin = (m.match(/<div class="cn-coin">([\s\S]*?)<\/div>/) || [])[1] || '';
      const discs = (coin.match(/<i><\/i>/g) || []).length;
      if (discs < 4) bad.push('the coin holds ' + discs + ' edge discs — fewer than four and it is '
        + 'a hairline whenever it is edge-on (tools/coin.py prints them)');
      return bad;
    },
    /* THE SIEVE IS A SIEVE. tools/sieve.py writes it, and the markup is the only place the maths
       lives: every composite struck in the colour of its SMALLEST prime factor (that is the prime
       that removes it), every prime ringed and never struck, nothing struck by a prime above 3
       (5 × 5 = 25 is past 17, which is why it stops), and the second, lower line only on a number
       a later prime also divides. A hand edit that moved one strike would still animate perfectly
       and teach the wrong thing. And the row stays ONE line: `nowrap` on the run. */
    sieve: (m) => {
      const bad = [];
      const least = n => { for (let p = 2; p <= n; p++) if (n % p === 0) return p; };
      const cells = [...m.matchAll(/<i[^>]*><b[^>]*>(\d+)<\/b>([\s\S]*?)<\/i>/g)];
      const seen = cells.map(c => +c[1]);
      if (seen.join() !== '2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17') {
        bad.push('the row reads ' + seen.join(' ') + ' — it is 2 to 17, in order');
      }
      cells.forEach(([, num, rest]) => {
        const n = +num, p = least(n);
        const strikes = [...rest.matchAll(/<s class="sv-(\d+)( sv-again)?"/g)].map(s => ({ by: +s[1], again: !!s[2] }));
        const ringed = /<u class="sv-/.test(rest);
        if (p === n) {
          if (strikes.length) bad.push(n + ' is prime and is struck through');
          if (!ringed) bad.push(n + ' is prime and is not ringed');
          return;
        }
        if (ringed) bad.push(n + ' is not prime and is ringed');
        const first = strikes.find(s => !s.again);
        if (!first) bad.push(n + ' is not prime and nothing strikes it');
        else if (first.by !== p) bad.push(n + ' is struck by ' + first.by + ' — its smallest factor is ' + p
          + ', so ' + p + ' is the prime that removes it');
        strikes.filter(s => s.again).forEach(s => {
          if (n % s.by || s.by === p) bad.push(n + ' has a second line for ' + s.by + ', which does not also divide it');
        });
        strikes.forEach(s => { if (s.by > 3) bad.push(n + ' is struck by ' + s.by + ' — the sieve stops at 3, since 5 × 5 > 17'); });
      });
      if (!rules.some(r => r.sel === '#splash-sieve .sv-grid' && r.decls.some(d => d.prop === 'flex-wrap' && d.val === 'nowrap'))) {
        bad.push('`#splash-sieve .sv-grid` no longer says `flex-wrap: nowrap` — at 320px 17 wraps alone onto a second line');
      }
      return bad;
    },
    /* THE BLOCKS: THE COIN COMES OUT OF THE LAST ONE, THE LETTERS FROM BEHIND, AND SOMETHING HITS
       THEM. The coin was pinned to the stage by `left: 50%` + 6.2rem while flexbox centred the
       blocks, so it rose between the seventh and the eighth; inside the eighth it cannot drift. The
       letters painted over the face because a child paints over its parent's background; the face
       is `::before` with a z-index now, and a background back on `.mb-block` is that fault again.
       And the runner is what bumps them — without it the rhythm is blocks twitching on their own. */
    blocks: (m) => {
      const bad = [];
      const blocks = [...m.matchAll(/<span class="mb-block">([\s\S]*?)<\/span>/g)].map(x => x[1]);
      if (blocks.length !== 8) bad.push(blocks.length + ' blocks — @family. is eight');
      const holder = blocks.findIndex(b => /class="mb-coin"/.test(b));
      if (holder !== blocks.length - 1) bad.push(holder < 0
        ? 'the coin is not inside any block — positioned on the stage, it drifts off the last one'
        : 'the coin is inside block ' + (holder + 1) + ', not the last one');
      rules.filter(r => r.sel === '.mb-block' && !r.cond).forEach(r => r.decls
        .filter(d => /^background/.test(d.prop))
        .forEach(d => bad.push('line ' + r.line + '  .mb-block paints its own ' + d.prop
          + ' — the letter, its child, paints over that; the face belongs on `.mb-block::before`')));
      if (!rules.some(r => r.sel === '.mb-block::before' && r.decls.some(d => d.prop === 'z-index' && +d.val > 0))) {
        bad.push('`.mb-block::before` has no positive z-index — the face is under the letter, '
          + 'so the letter shows through the block instead of coming out from behind it');
      }
      if (!/class="mb-run"/.test(m)) bad.push('no runner (`.mb-run`) — nothing bumps the blocks');
      return bad;
    },
  };

  Object.keys(LOOPED).forEach(id => {
    const m = markup(id);
    if (!m) { loopBad.push('#splash-' + id + ' is not in index.html — this check cannot see it'); return; }
    const classes = new Set();
    for (const c of m.matchAll(/class="([^"]+)"/g)) c[1].split(/\s+/).forEach(x => x && classes.add(x));
    const ours = r => r.sel.includes('#splash-' + id)
      || [...classes].some(c => new RegExp('\\.' + c + '(?![\\w-])').test(r.sel));
    const mine = rules.filter(r => ours(r) && !/^\d|^from$|^to$/.test(r.sel));
    const moving = mine.filter(r => !/reduced-motion/.test(r.cond));
    const used = new Set();
    moving.forEach(r => r.decls.forEach(d => {
      const p = d.prop.toLowerCase();
      if (p === 'animation' && d.val !== 'none') {
        d.val.split(/,(?![^()]*\))/).forEach(part => {
          namesIn(part).forEach(n => used.add(n));
          if (!/\binfinite\b/.test(part) && !r.decls.some(x => x.prop === 'animation-iteration-count'
              && /infinite/.test(x.val))) {
            loopBad.push('line ' + r.line + '  ' + r.sel + '  →  `' + part.trim() + '` ends — a splash '
              + 'built as a loop must not have an animation that stops');
          }
        });
      }
      if (p === 'animation-name') namesIn(d.val).forEach(n => used.add(n));
      if (p === 'animation-duration' && !r.decls.some(x => x.prop === 'animation-iteration-count'
          && /infinite/.test(x.val))) {
        loopBad.push('line ' + r.line + '  ' + r.sel + '  gives a duration and no `infinite` — it plays once');
      }
    }));
    /* AN INLINE `animation-name` BEATS THE REDUCED-MOTION RULE. tools/coin.py wrote one on each of
       twenty elements, and `animation: none` in the stylesheet lost to every one of them — so with
       less movement asked for, the coin stood still and the tally and the count went on animating.
       The generators now write `--kf: name` and a rule reads `animation-name: var(--kf)`. */
    for (const s of m.matchAll(/style="[^"]*animation[\w-]*:\s*([\w-]+)/g)) {
      loopBad.push('#splash-' + id + ' sets `animation…: ' + s[1] + '` inline — an inline declaration '
        + 'beats `animation: none` under reduced motion; write `--kf: ' + s[1] + '` instead');
      used.add(s[1]);
    }
    for (const s of m.matchAll(/--kf:\s*([\w-]+)/g)) used.add(s[1]);
    used.forEach(n => {
      if (!frames[n]) { loopBad.push('#splash-' + id + ' names `' + n + '` and no @keyframes has that name'); return; }
      const other = [...frames[n]].filter(p => p !== 'transform' && p !== 'opacity'
        && p !== 'animation-timing-function');
      if (other.length) loopBad.push('@keyframes ' + n + ' (#splash-' + id + ') animates ' + other.join(', ')
        + ' — only transform and opacity run on the compositor');
    });
    if (!used.size) loopBad.push('#splash-' + id + ' has no animation at all that this check can find');
    if (!mine.some(r => /reduced-motion/.test(r.cond) && r.decls.some(d => d.prop === 'animation' && d.val === 'none'))) {
      loopBad.push('#splash-' + id + ' has no reduced-motion rule turning its animation off');
    }
    LOOPED[id](m).forEach(x => loopBad.push('#splash-' + id + ': ' + x));
  });
  say('A SPLASH BUILT AS ONE LOOP THAT IS NOT ONE — ' + Object.keys(LOOPED).join(', '), loopBad);
}

console.log('');
console.log('rules read: ' + rules.length);
console.log(fail
  ? 'FAILED — read each line above; every one is a rule that does not do what it says'
  : noted
    ? 'OK — no dead declarations, no silent overrides, no contradictions. The list above is worth '
      + 'reading and is not a failure: the check cannot see a class name built in pieces.'
    : 'OK — no dead declarations, no silent overrides, no contradictions.');
process.exit(fail ? 1 : 0);