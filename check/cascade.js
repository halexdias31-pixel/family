#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/cascade.js

   WHICH RULE WINS, AND WHETHER IT IS THE ONE SOMEBODY MEANT.

   THIS STYLESHEET HAS LOST THE SAME ARGUMENT SEVEN TIMES. Every entry is in CLAUDE.md and every one
   was found by a person looking at a screenshot or reading two blocks side by side:

     `.price.faint`                    a blank price was meant to recede. `.faint` and `.price` are
                                       both one class, `.price` is written later, and the shop card
                                       printed a not-yet-priced row in full ink for months.
     `--fly-ink`                       set from a template string, read by a rule that never won.
     `.bk-row.is-blank` → `.is-bare`   the `max-content` repair went on the rule three thousand lines
                                       further down and the rows went back to 481px under a fix that
                                       read as though it had worked.
     `.rc-total` → `.bk-row`           the total row declared its own three-track grid and has been
                                       drawn on the booking form's five-track one since it was
                                       written, with the money in a 7ch track.
     `text-anchor="end"` → `.qsheet .num`   CSS beats an SVG presentation attribute, so ten y-axis
                                       numbers sat centred on the axis line.
     `.gd-sec p` → `.prac-safety`      caught before it was written, by reading the block first.
                                       (both rules have since gone with the guide's risk section)
     `.dock-new .btn` → `.btn.tiny`    the docket's ＋ was written at 1.1rem and has always rendered
                                       at 0.80rem — 11.86px inside a 44px box. Found by this file.

   SEVEN REPAIRS AND NO RULE. That is the sentence this repository writes about `cost: 0`, about
   `paper: true`, about the spelling fold and about `delRow` — a fault repaired in the instance and
   not in the rule comes back. This is the rule.

   ------------------------------------------------------------------------------------------------
   THE QUESTION, AND WHY IT HAD TO BE NARROWED TWICE.

   The honest general form — "two rules set the same property on one element and the later one wins"
   — reported **1,001 findings** on the first run, and nearly all of them are the cascade doing its
   job: a base and its variant, a longhand under a shorthand, `.hr` against `[data-do]` for a cursor.
   That is the `check-rows.js` fault exactly, where the first version had 95 findings and 2 real
   ones, and a report that is mostly noise is a report nobody reads.

   SO IT ASKS THE NARROW QUESTION THE SEVEN FAULTS SHARE. Two rules collide here only when:

     · they set the SAME property, and
     · they have the SAME specificity, so nothing but their ORDER decides it, and
     · they are different rules — two selectors of one rule are one declaration, not a contest, and
     · they share at least one class, so they are talking about the same kind of thing, and
     · neither's class set contains the other's — `.btn` under `.btn.tiny` is an ordinary override
       and this is not about those; `.dock-new .btn` against `.btn.tiny` is two sideways variants
       where the file order is the only reason either wins, and
     · a real element in the rendered app matches BOTH.

   That last one is what makes it a measurement rather than a grep: 1,001 became **five**, and three
   of those are one `border-bottom` shorthand counted per longhand.

   ------------------------------------------------------------------------------------------------
   AND IT IS FAST BECAUSE THE PAIRS COME FIRST. Asking 1,510 elements about 1,916 rules is three
   million `matches()` calls per state. The candidate pairs are computed from the STYLESHEET alone,
   which is cheap and does not change, and only those few selectors are ever put to the document.

     node check/cascade.js
     node check/cascade.js --all   every collision, including the ordinary overrides
================================================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const { statesOf } = require('./states.js');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.CASCADE_PORT || 8133);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const ALL = process.argv.includes('--all');

const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001',
               role: 'admin', roles: ['admin'], handle: 'testadmin' };

/* ---------- KNOWN, WITH A WRITTEN REASON EACH, AND STILL PRINTED ----------------------------------
   THE SAME ARGUMENT AS `ACCEPTED_TAP` AND `ACCEPTED`. An order-decided collision is not always a
   fault — sometimes the later rule really is the one meant to win, and it wins for a reason somebody
   can state. What makes the list honest rather than convenient is that each entry says WHY, so a
   reader can disagree with it; an entry that only names a selector is a silencer.

   KEYED ON THE PAIR AND THE PROPERTY, not on the selector alone: `.tile.on` losing its colour to
   `.tile.is-admin` is understood, and `.tile.on` losing its BACKGROUND to something else next month
   is not. */
const ACCEPTED = {
  '.mz-cell.been || .mz-cell.you || background-attachment':
    'WHERE YOU ARE WINS OVER WHERE YOU HAVE BEEN, which is the one square that is both. `.mz-cell.been` is the faint trail and `.mz-cell.you` is the gold marker, and the start square carries both from the first frame — so the later rule winning is the design. Reported here for the first time only because a maze has to be on a screen for the pair to exist, which is what `check/cascade.js` asks of the RENDERED app rather than of the file. Nine entries because `background` is a shorthand and this check reads longhands.',

  '.mz-cell.been || .mz-cell.you || background-clip':
    'WHERE YOU ARE WINS OVER WHERE YOU HAVE BEEN, which is the one square that is both. `.mz-cell.been` is the faint trail and `.mz-cell.you` is the gold marker, and the start square carries both from the first frame — so the later rule winning is the design. Reported here for the first time only because a maze has to be on a screen for the pair to exist, which is what `check/cascade.js` asks of the RENDERED app rather than of the file. Nine entries because `background` is a shorthand and this check reads longhands.',

  '.mz-cell.been || .mz-cell.you || background-color':
    'WHERE YOU ARE WINS OVER WHERE YOU HAVE BEEN, which is the one square that is both. `.mz-cell.been` is the faint trail and `.mz-cell.you` is the gold marker, and the start square carries both from the first frame — so the later rule winning is the design. Reported here for the first time only because a maze has to be on a screen for the pair to exist, which is what `check/cascade.js` asks of the RENDERED app rather than of the file. Nine entries because `background` is a shorthand and this check reads longhands.',

  '.mz-cell.been || .mz-cell.you || background-image':
    'WHERE YOU ARE WINS OVER WHERE YOU HAVE BEEN, which is the one square that is both. `.mz-cell.been` is the faint trail and `.mz-cell.you` is the gold marker, and the start square carries both from the first frame — so the later rule winning is the design. Reported here for the first time only because a maze has to be on a screen for the pair to exist, which is what `check/cascade.js` asks of the RENDERED app rather than of the file. Nine entries because `background` is a shorthand and this check reads longhands.',

  '.mz-cell.been || .mz-cell.you || background-origin':
    'WHERE YOU ARE WINS OVER WHERE YOU HAVE BEEN, which is the one square that is both. `.mz-cell.been` is the faint trail and `.mz-cell.you` is the gold marker, and the start square carries both from the first frame — so the later rule winning is the design. Reported here for the first time only because a maze has to be on a screen for the pair to exist, which is what `check/cascade.js` asks of the RENDERED app rather than of the file. Nine entries because `background` is a shorthand and this check reads longhands.',

  '.mz-cell.been || .mz-cell.you || background-position-x':
    'WHERE YOU ARE WINS OVER WHERE YOU HAVE BEEN, which is the one square that is both. `.mz-cell.been` is the faint trail and `.mz-cell.you` is the gold marker, and the start square carries both from the first frame — so the later rule winning is the design. Reported here for the first time only because a maze has to be on a screen for the pair to exist, which is what `check/cascade.js` asks of the RENDERED app rather than of the file. Nine entries because `background` is a shorthand and this check reads longhands.',

  '.mz-cell.been || .mz-cell.you || background-position-y':
    'WHERE YOU ARE WINS OVER WHERE YOU HAVE BEEN, which is the one square that is both. `.mz-cell.been` is the faint trail and `.mz-cell.you` is the gold marker, and the start square carries both from the first frame — so the later rule winning is the design. Reported here for the first time only because a maze has to be on a screen for the pair to exist, which is what `check/cascade.js` asks of the RENDERED app rather than of the file. Nine entries because `background` is a shorthand and this check reads longhands.',

  '.mz-cell.been || .mz-cell.you || background-repeat':
    'WHERE YOU ARE WINS OVER WHERE YOU HAVE BEEN, which is the one square that is both. `.mz-cell.been` is the faint trail and `.mz-cell.you` is the gold marker, and the start square carries both from the first frame — so the later rule winning is the design. Reported here for the first time only because a maze has to be on a screen for the pair to exist, which is what `check/cascade.js` asks of the RENDERED app rather than of the file. Nine entries because `background` is a shorthand and this check reads longhands.',

  '.mz-cell.been || .mz-cell.you || background-size':
    'WHERE YOU ARE WINS OVER WHERE YOU HAVE BEEN, which is the one square that is both. `.mz-cell.been` is the faint trail and `.mz-cell.you` is the gold marker, and the start square carries both from the first frame — so the later rule winning is the design. Reported here for the first time only because a maze has to be on a screen for the pair to exist, which is what `check/cascade.js` asks of the RENDERED app rather than of the file. Nine entries because `background` is a shorthand and this check reads longhands.',

  '.page .card || .card.is-widget || border-bottom':
    'A WIDGET DRAWS ITS OWN BODY. `.page .card` takes the bottom hairline off a card in a list — '
  + '"a hairline across the bottom of a screen reads as a list that has been cut off" — and '
  + '`.card.is-widget` asks for a border on all four sides, because "a hairline between a '
  + 'calculator and a notepad is not enough to say where one ends and the other begins". The '
  + 'widget is the one that should win and it does.',

  '.page .card || .card:has(> .msg-body) || border-bottom':
    'THE SAME ARGUMENT AS THE WIDGET, one screen along. A conversation is a body in its own right — '
  + '`border: 1px solid var(--line-soft)` on all four sides, its own background and its own radius — '
  + 'so the hairline rule for a card in a list is the one that should give way, and it does.',

  '.bk-row.is-bare || .bk-row.is-blank || grid-template-columns':
    'A ROW THAT IS BOTH GETS THE FIVE-TRACK GRID, deliberately. `is-bare` is two tracks for a row '
  + 'with no figures; `is-blank` keeps the three trailing tracks empty so the dash ends where every '
  + 'other value ends, which is the fix for the card having two right edges. CLAUDE.md records both '
  + 'and the second is the later decision.',

  '.tile.on || .tile.is-admin || color':
    'AN ADMIN TILE KEEPS ITS YELLOW WHEN IT IS ON. `.tile.is-admin.on` sets the background and the '
  + 'border for exactly that state and deliberately does not set the colour, so the yellow carrying '
  + 'through is the design rather than an accident — "unmistakably yellow, and unmistakably not the '
  + 'trolley beside it".',
};

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
               '.ico': 'image/x-icon' };

function serve() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404); return res.end('not here');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(PORT, () => ok(s));
  });
}

/* ---------- THE WHOLE ANALYSIS, RUN IN THE PAGE --------------------------------------------------
   IT READS THE RENDERED STYLESHEET, NOT THE FILE. `check/ui.js` says at length why that matters and
   the seven dead custom properties are its example: a scan of the source and a scan of the runtime
   both produced the same wrong answer, in mirror image. Here the browser has already parsed the
   selectors, expanded every shorthand into its longhands and put the rules in order, and getting
   any one of those three wrong by hand is the whole fault this file is about. */
function analyse(opts) {
  /* ---------- SPECIFICITY, AND `:has()` IS THE PART THAT CAUGHT ME OUT --------------------------
     `:has()`, `:is()` and `:not()` DO NOT COUNT AS PSEUDO-CLASSES. Each takes the specificity of
     its own argument, and `:where()` takes none at all. Counted as an ordinary `:pseudo`, as the
     first version did, `.pane:has(.rc)` scores three where it really scores two — so it tied with
     `.screen.on .pane` and this file confidently reported a contest that specificity had already
     settled. Two findings, both about the check.

     UNWRAPPING IS EXACT FOR ONE ARGUMENT and slightly generous for a list, where the real answer is
     the most specific of them. Every use in this stylesheet takes one. */
  const spec = sel => {
    let s = String(sel).replace(/:where\([^()]*\)/g, ' ');
    for (let i = 0; i < 4 && /:(has|is|not|matches)\(/.test(s); i++) {
      s = s.replace(/:(?:has|is|not|matches)\(([^()]*)\)/g, ' $1 ');
    }
    const a = (s.match(/#[\w-]+/g) || []).length;
    const b = (s.match(/\.[\w-]+/g) || []).length
            + (s.match(/\[[^\]]*\]/g) || []).length
            + (s.match(/:(?!:)[\w-]+/g) || []).length;
    const c = (s.match(/(^|[\s>+~])[a-zA-Z][\w-]*/g) || []).length
            + (s.match(/::[\w-]+/g) || []).length;
    return a * 10000 + b * 100 + c;
  };

  const rules = [];
  for (const sheet of document.styleSheets) {
    let list; try { list = sheet.cssRules; } catch (e) { continue; }
    if (!list) continue;
    /* THE AT-RULE IT IS IN TRAVELS WITH IT. A selector repeated inside `@media (prefers-color-scheme:
       dark)` is the whole mechanism this stylesheet is built on — see the theme tokens — and
       reporting it as written twice would be reporting the design. Only two rules in the SAME
       context are two places to edit one fact. */
    const walk = (l, ctx) => {
      for (const r of l) {
        if (r.type === 1) {
          const props = []; const vals = {};
          for (let i = 0; i < r.style.length; i++) { props.push(r.style[i]); vals[r.style[i]] = r.style.getPropertyValue(r.style[i]); }
          const rid = rules.length;
          String(r.selectorText || '').split(',').map(x => x.trim()).filter(Boolean)
            .forEach(sel => rules.push({ sel, props, vals, rid, ctx, i: rules.length, spec: spec(sel) }));
        } else if (r.cssRules) walk(r.cssRules, ctx + ' @ ' + (r.conditionText || r.media || r.name || r.type));
      }
    };
    walk(list, '');
  }

  const classes = sel => new Set(sel.match(/\.[\w-]+/g) || []);
  const byProp = {};
  rules.forEach(r => r.props.forEach(p => { (byProp[p] = byProp[p] || []).push(r); }));

  const pairs = [];
  const rspec = {};
  Object.keys(byProp).forEach(prop => {
    const rs = byProp[prop];
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
      const a = rs[i], b = rs[j];
      if (a.spec !== b.spec) continue;                 // specificity decides it, not the order
      if (a.rid === b.rid) continue;                   // two selectors of ONE rule
      if (a.ctx !== b.ctx) continue;                   // a rule inside a media query is a different question
      /* THE SAME SELECTOR IN TWO RULES IS THE CLEAREST CASE OF ALL and needs none of the tests
         below: identical selectors are identical specificity by definition, they are obviously
         about the same thing, and neither contains the other. `.page .card { border-bottom: 0 }`
         was in this stylesheet twice, word for word, nine hundred lines apart, with the same
         comment over each. A selector written twice for DIFFERENT properties is ordinary and is
         not reported — 158 of them here, and every one is somebody grouping their rules. */
      if (a.sel === b.sel) {
        rspec[a.sel] = a.spec;
        /* ---------- AND WHETHER THE TWO SAY THE SAME THING --------------------------------------
           A VAGUE 87 IS NOT A NUMBER ANYBODY CAN ACT ON. Written twice with the SAME value is dead
           text — `.ag-a { fill: #f0b45f }` appears twice seven lines apart, and `.page .card
           { border-bottom: 0 }` appeared twice nine hundred lines apart. Written twice with a
           DIFFERENT value is an override that only the file order decides, which is the sharper
           half: 47 of these are `.mu-grid i:nth-child(N)` where the multiples of three and the
           multiples of five are two separate lists and every multiple of fifteen is in both. That
           is a designed overlap, and saying so needs the values. */
        pairs.push({ prop, lose: (a.i < b.i ? a : b).sel, win: (a.i < b.i ? b : a).sel, same: true,
                     agree: String(a.vals[prop]) === String(b.vals[prop]) });
        continue;
      }
      const ca = classes(a.sel), cb = classes(b.sel);
      if (!ca.size || !cb.size) continue;
      let shares = false; ca.forEach(x => { if (cb.has(x)) shares = true; });
      if (!shares) continue;                           // unrelated rules meeting on one element
      if (!opts.all) {
        let subset = true; ca.forEach(x => { if (!cb.has(x)) subset = false; });
        let superset = true; cb.forEach(x => { if (!ca.has(x)) superset = false; });
        if (subset || superset) continue;              // a base and its variant: an ordinary override
      }
      const [lose, win] = a.i < b.i ? [a, b] : [b, a];
      rspec[lose.sel] = lose.spec;
      pairs.push({ prop, lose: lose.sel, win: win.sel });
    }
  });

  /* AND ONLY NOW IS THE DOCUMENT ASKED. The pairs come out of the stylesheet, which is cheap and
     fixed; putting 1,916 selectors to 1,510 elements would be three million tests per state. */
  const hit = {}, agree = {};
  pairs.forEach(p => {
    let els; try { els = document.querySelectorAll(p.lose); } catch (e) { return; }
    let n = 0;
    els.forEach(el => {
      try { if (!el.matches(p.win)) return; } catch (e) { return; }
      /* AND NOTHING MORE SPECIFIC MAY ALREADY HAVE SETTLED IT. `.tile.on` and `.tile.is-admin`
         both set a background, and `.tile.is-admin.on` — three classes — sets it for exactly the
         element that matches both. The order between the first two decides nothing there, and
         reporting it would be a finding about a contest neither rule is in. The first version did
         report it, on six properties, and the giveaway was that `color` was real while `background`
         beside it was not: the three-class rule sets the background and deliberately does not set
         the colour. */
      let top = 0;
      for (const r of byProp[p.prop]) {
        if (r.spec <= top) continue;
        try { if (el.matches(r.sel)) top = r.spec; } catch (e) {}
      }
      if (top > rspec[p.lose]) return;
      n++;
    });
    if (!n) return;
    const key = p.lose + ' || ' + p.win + ' || ' + p.prop;
    hit[key] = Math.max(hit[key] || 0, n);
    if (p.same) agree[key] = !!p.agree;
  });
  return { rules: rules.length, pairs: pairs.length, hit, agree };
}

(async () => {
  const server = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
  await page.route('**://script.google.com/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);

  const tabs = await page.evaluate(() => (typeof TABS !== 'undefined' ? TABS.map(t => t.id) : []));
  if (!tabs.length) {
    console.error('! no screens — TABS came back empty, so this measured nothing.');
    await browser.close(); server.close(); process.exit(1);
  }

  /* EVERY SCREEN AND EVERY DECLARED STATE, because a collision only counts where an element really
     carries both classes — and the sheet, the receipt, the basket, the guide and the message thread
     are on no screen `go()` lands on. Same list `check/ui.js` and `check/press.js` read. */
  const found = {}, SAYS = {};
  let rules = 0, pairs = 0, states = 0;
  for (const id of tabs) {
    for (const st of statesOf(id)) {
      await page.evaluate(sid => { try { closeSheet(); } catch (e) {} go(sid, false, true); }, id);
      await page.waitForTimeout(220);
      if (st.only) {
        const mine = await page.evaluate(src => { try { return !!eval('(' + src + ')')(); } catch (e) { return false; } }, String(st.only));
        if (!mine) continue;
      }
      if (st.enter) {
        await page.evaluate(src => { try { eval('(' + src + ')')(); } catch (e) {} }, String(st.enter));
        await page.waitForTimeout(280);
      }
      states++;
      const res = await page.evaluate(analyse, { all: ALL });
      rules = res.rules; pairs = res.pairs;
      Object.entries(res.hit).forEach(([k, n]) => { found[k] = Math.max(found[k] || 0, n); });
      Object.assign(SAYS, res.agree);
      if (st.leave) await page.evaluate(src => { try { eval('(' + src + ')')(); } catch (e) {} }, String(st.leave));
    }
  }

  await browser.close();
  server.close();

  const keys = Object.keys(found).sort();
  const isKnown = k => k.replace(/-(width|style|color|top|right|bottom|left)$/, '') in ACCEPTED
                    || k in ACCEPTED;
  /* TWO FINDINGS, TWO SEVERITIES. A selector written twice in one context, both times setting the
     same property, is two places to edit one fact — real, and repairing ninety of them is editorial
     work on a 448 KB stylesheet rather than a build error. Two DIFFERENT selectors that only the
     file order separates is the fault this file exists for, and that fails. Same split as the
     library's `figure` count and the practicals' blank `needs`: a number somebody can act on beats
     a silence, and a red that is always red is a red nobody reads. */
  const dup = keys.filter(k => { const [a, b] = k.split(' || '); return a === b; });
  const news = keys.filter(k => !isKnown(k) && !dup.includes(k));
  const known = keys.filter(isKnown);

  console.log('\n' + rules + ' selectors, ' + pairs + ' order-decided pair(s) in the stylesheet, '
            + 'measured across ' + states + ' declared state(s)');

  if (dup.length) {
    const dead = dup.filter(k => SAYS[k]);
    const over = dup.filter(k => !SAYS[k]);
    console.log('\nWRITTEN TWICE, SAME PROPERTY  (' + dup.length + ')');
    console.log('   ' + dead.length + ' say the same thing twice — dead text, two places to edit one fact');
    dead.slice(0, 14).forEach(k => { const [sel, , prop] = k.split(' || ');
      console.log('      ' + sel + '  ·  ' + prop); });
    if (dead.length > 14) console.log('      …and ' + (dead.length - 14) + ' more');
    console.log('   ' + over.length + ' say different things, so the later rule wins on file order alone');
    over.slice(0, 14).forEach(k => { const [sel, , prop] = k.split(' || ');
      console.log('      ' + sel + '  ·  ' + prop); });
    if (over.length > 14) console.log('      …and ' + (over.length - 14) + ' more');
  }

  if (news.length) {
    console.log('\nORDER DECIDES IT, AND NOTHING SAYS WHY  (' + news.length + ')');
    news.forEach(k => {
      const [lose, win, prop] = k.split(' || ');
      console.log('   ' + prop + ':  ' + lose + '  is overruled by  ' + win
                + '\n      ' + (lose === win ? 'the same selector in two rules, both setting it — the later one wins, on '
                                             : 'same specificity, the later one wins, on ')
                + found[k] + ' element(s).');
    });
  }

  if (known.length) {
    console.log('\nKNOWN, WITH A REASON  (' + known.length + ')');
    const said = new Set();
    known.forEach(k => {
      const base = k.replace(/-(width|style|color|top|right|bottom|left)$/, '');
      const why = ACCEPTED[k] || ACCEPTED[base];
      if (said.has(why)) return;
      said.add(why);
      const [lose, win, prop] = base.split(' || ');
      console.log('   ' + prop + ':  ' + lose + '  →  ' + win + '\n      ' + why);
    });
  }

  if (!news.length) console.log('\nnothing is decided by file order alone.');
  process.exit(news.length ? 1 : 0);
})();
