#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/cascade.js WHICH RULE WINS, AND WHETHER IT IS THE ONE SOMEBODY MEANT. § */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const { statesOf } = require('./states.js');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.CASCADE_PORT || 8133);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const ALL = process.argv.includes('--all');
const ONLY = (process.argv.find(a => a.startsWith('--screen=')) || '').split('=')[1] || '';

const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001',
               role: 'admin', roles: ['admin'], handle: 'testadmin' };

/* ---------- KNOWN, WITH A WRITTEN REASON EACH, AND STILL PRINTED § */
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

  '.card .sub || .thing-body .sub || margin':
    'A SHOP CARD\'S LINE SITS UNDER ITS OWN HEADING. `.card .sub` pulls a subtitle up under a card\'s '
  + 'h3 with a negative top margin; inside `.thing-body` the h3 already carries its own small gap, '
  + 'so the thing card sets the subtitle\'s margin outright and the later rule is meant to win. '
  + 'First reported when the Shop column put shop cards on a screen at all — no fixture had a shop '
  + 'row before it, so this pair had never been rendered for this check to see.',

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
      /* THE LIBRARY WITH ITS WORDS (397): the repository's copy is card metadata, check/lib-full.js puts them back. */
      const libBody = require('./lib-full.js').serve(p);
      if (libBody !== null) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(libBody); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404); return res.end('not here');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(PORT, () => ok(s));
  });
}

/* ---------- THE WHOLE ANALYSIS, RUN IN THE PAGE § */
function analyse(opts) {
  /* ---------- SPECIFICITY, AND `:has()` IS THE PART THAT CAUGHT ME OUT § */
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
    /* THE AT-RULE IT IS IN TRAVELS WITH IT. § */
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
      /* THE SAME SELECTOR IN TWO RULES IS THE CLEAREST CASE OF ALL and needs none of the tests below: § */
      if (a.sel === b.sel) {
        rspec[a.sel] = a.spec;
        /* ---------- AND WHETHER THE TWO SAY THE SAME THING § */
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
      /* AND NOTHING MORE SPECIFIC MAY ALREADY HAVE SETTLED IT. § */
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

  /* EVERY SCREEN AND EVERY DECLARED STATE, because a collision only counts where an element really carries both classes — and the sheet, the receipt, the basket § */
  const found = {}, SAYS = {};
  let rules = 0, pairs = 0, states = 0;
  for (const id of tabs.filter(t => !ONLY || t === ONLY)) {
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
  /* A SCREEN NAMED THAT IS NOT THERE MEASURED NOTHING, which is not a pass. */
  if (!states) {
    console.error('! no state was measured' + (ONLY ? ' — there is no screen called "' + ONLY + '"' : '') + ', so nothing was checked.');
    process.exit(1);
  }

  const keys = Object.keys(found).sort();
  const isKnown = k => k.replace(/-(width|style|color|top|right|bottom|left)$/, '') in ACCEPTED
                    || k in ACCEPTED;
  /* TWO FINDINGS, TWO SEVERITIES. § */
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

  if (!news.length) console.log('\nOK — nothing is decided by file order alone.');
  process.exit(news.length ? 1 : 0);
})();
