#!/usr/bin/env node
/* @family. — tools/one-card.js THE ONE-CARD CHECK (rule 1.75, owner 17 Nov): every card a child or parent sees in Find is drawn by the one maker
   (`renderCard` / `findCard`: `.card.fc.kc`, and nothing but its `kc-*` parts as children) and has no CSS keyed on a class of its own.
   Counted site-wide on an iPhone 13, each Find door opened at once on the served bundles with tools/lib/payload.json as the backend's answer.
   Prints the count; a card outside the rule fails the build. Run by tools/build.js after the bundles. */
'use strict';
const fs = require('fs'), http = require('http'), path = require('path');
const { bare, text } = require('./lib/gen.js');
const ROOT = path.join(__dirname, '..'), PORT = 8131;
/* THE ONE MAKER'S OWN CLASSES, and the state classes every card may wear. */
const BASE = /^(card|fc|kc|kc-[\w-]+|is-empty|is-off|is-locked|tap)$/;
/* LOOKS A LATER CARD-SHAPES STEP OWNS (owner, 22 Nov, docs/owner-queue.md CARD SHAPES): Practice's question card (`qcard`, `lib-wait` while its words
   load) becomes the Learning: Question shape. Counted and named every build, not failed, until that step; delete each entry as its shape lands. */
const LATER = { qcard: 'Learning: Question', 'lib-wait': 'Learning: Question' };
const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

/* A SETTINGS CARD IS ORDINARY BLOCKS TOO (unify batch 9): no CSS keyed on `.me-form` (the class stays only as autosave's hook), and the line that says
   what was saved is the maker's `status` block — a `me-said` paragraph written by hand fails, in every file. No `me-form` embed either (unify batch 10):
   a settings card's drawn markup is a `kc-set` group, so any `CARD_EMBEDS['me-form']` or `tool: 'me-form'` fails. */
function settingsByHand(css) {
  const bad = [];
  css.replace(/[^{}]+\{/g, sel => { if (/\.me-form(?![\w-])/.test(sel)) bad.push('style.css: ' + sel.replace(/\s+/g, ' ').trim().slice(0, 100)); return sel; });
  fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f) && !/\.min\.js$/.test(f) && f !== 'cards-render.js').forEach(f => {
    text('js/' + f).split('\n').forEach((l, i) => { if (/['"`][^'"`]*(?<![.\w-])me-said\b/.test(l)) bad.push('js/' + f + ':' + (i + 1) + ' a hand me-said paragraph (use a `status` block)');
      if (/CARD_EMBEDS\s*\[\s*['"`]me-form['"`]|tool\s*:\s*['"`]me-form['"`]/.test(l)) bad.push('js/' + f + ':' + (i + 1) + ' the me-form embed (use a `kc-set` group)'); });
  });
  return bad;
}

async function run() {
  const css = bare(text('style.css'), { comments: true });
  const hand = settingsByHand(css);
  hand.forEach(x => console.log('  ' + x));
  if (hand.length) throw new Error('one-card: ' + hand.length + ' settings part(s) drawn by hand');
  const styled = c => new RegExp('\\.' + c.replace(/-/g, '\\-') + '(?![\\w-])').test(css);
  const payload = fs.readFileSync(path.join(ROOT, 'tools/lib/payload.json'), 'utf8');
  const { chromium, devices } = require('playwright');
  const srv = http.createServer((q, s) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    fs.readFile(path.join(ROOT, p), (e, b) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); s.end(b); });
  }).listen(PORT);
  const b = await chromium.launch();
  const open = async () => {
    const c = await b.newContext({ ...devices['iPhone 13']});
    const pg = await c.newPage();
    await pg.addInitScript(() => { try { localStorage.setItem('familyUser', JSON.stringify({ name: 'Test Admin', handle: 'testadmin', personId: 'P001', role: 'admin', token: 'tok' })); } catch (e) {} });
    await pg.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: payload }));
    await pg.goto('http://localhost:' + PORT + '/');
    await pg.waitForFunction(() => typeof DATA !== 'undefined' && DATA && (DATA.tutors || []).length, null, { timeout: 90000 });
    await pg.waitForTimeout(1500);
    return pg;
  };
  const click = async (pg, t) => { try { await pg.getByText(t, { exact: true }).locator('visible=true').first().click({ timeout: 4000 }); await pg.waitForTimeout(1500); } catch (e) { /* a door with no second step */ } };
  try {
    const first = await open();
    await first.waitForSelector('#stuff-groups [data-value]', { state: 'attached', timeout: 30000 }).catch(() => {});
    const doors = await first.evaluate(() => [...document.querySelectorAll('#stuff-groups [data-value]')].map(e => e.dataset.value).filter(Boolean));
    await first.context().close();
    /* THREE DOORS AT ONCE: more and a phone-sized page under load misses its taps. */
    const look = async d => {
      const pg = await open();
      /* EVERY STEP SKIPPED (22 Nov): Practice, Library and Shop ask several steps before their cards, so "Doesn't matter" is tapped until it is gone. */
      await click(pg, d);
      for (let i = 0; i < 16 && await pg.getByText("Doesn't matter", { exact: true }).locator('visible=true').count(); i++) await click(pg, "Doesn't matter");
      /* SETTLED: the same number of cards twice, half a second apart (eight seconds at most). */
      for (let i = 0, last = -1; i < 16; i++) { const n = await pg.evaluate(() => document.querySelectorAll('#screen .card').length); if (n && n === last) break; last = n; await pg.waitForTimeout(500); }
      const cards = await pg.evaluate(() => [...document.querySelectorAll('#screen .card')].filter(e => !e.parentElement.closest('.card')).slice(0, 60)
        .map(e => ({ n: e.getAttribute('aria-label') || e.innerText.slice(0, 30), c: e.className, sh: e.dataset.shape || '', ik: e.dataset.itemKind || '', set: e.matches('.kc-setting'),
          kc: e.matches('.fc.kc') && [...e.children].every(k => /^kc-/.test(k.className)) })));
      await pg.context().close();
      return cards.filter(x => x.n !== 'Find').map(x => ({ door: d, n: x.n, kc: x.kc, sh: x.sh, ik: x.ik, set: x.set, own: x.c.split(/\s+/).filter(c => c && !BASE.test(c) && styled(c)) }));
    };
    const per = [], todo = doors.slice();
    await Promise.all([0, 1, 2].map(async () => { while (todo.length) per.push(await look(todo.shift())); }));
    if (!doors.length) throw new Error('one-card: Find showed no doors — the app did not start');
    const all = [].concat(...per), later = all.filter(x => x.kc && x.own.length && x.own.every(c => LATER[c])), bad = all.filter(x => (!x.kc || x.own.length) && later.indexOf(x) < 0);
    console.log('one-card: ' + (all.length - bad.length - later.length) + '/' + all.length + ' cards drawn by the one maker with no CSS of their own');
    [...new Set(later.map(x => LATER[x.own[0]]))].forEach(h => console.log('  ' + later.filter(x => LATER[x.own[0]] === h).length + ' card(s) waiting on the ' + h + ' shape: '
      + [...new Set(later.filter(x => LATER[x.own[0]] === h).map(x => x.door + ' [' + x.own.join(' ') + ']'))].join(', ')));
    console.log('  by door: ' + doors.map(d => d + ' ' + all.filter(x => x.door === d).length).join(', '));
    bad.forEach(x => console.log('  ' + x.door + ' › ' + String(x.n).replace(/\n/g, ' ') + ' [' + (x.kc ? '' : 'not one maker; ') + x.own.join(' ') + ']'));
    if (bad.length) throw new Error('one-card: ' + bad.length + ' card(s) outside the one maker');
    /* THE SETTINGS SHAPES (owner, 22 Nov, CARD SHAPES): every settings card wears its shape (`data-shape`, kinds.json setting.shapes), and Settings uses four at most. */
    const sets = all.filter(x => x.door === 'Settings' && !x.ik && (x.set || x.sh)), shapes = [...new Set(sets.map(x => x.sh).filter(Boolean))].sort();
    const unshaped = sets.filter(x => !x.sh);
    console.log('one-card: Settings draws ' + sets.length + ' settings cards in ' + shapes.length + ' shape(s): '
      + shapes.map(h => h + ' ' + sets.filter(x => x.sh === h).length).join(', '));
    unshaped.forEach(x => console.log('  Settings › ' + String(x.n).replace(/\n/g, ' ') + ' [no shape]'));
    if (unshaped.length) throw new Error('one-card: ' + unshaped.length + ' settings card(s) with no shape');
    if (shapes.length > 4) throw new Error('one-card: Settings uses ' + shapes.length + ' shapes; four at most');
    /* THE PERSON AND ITEM SHAPES (owner, 22 Nov, CARD SHAPES): every card of a kind kinds.json gives a Person or Item `shape` wears exactly that one. */
    const KINDS = require('../data/settings/kinds.json').kinds;
    ['Person', 'Item'].forEach(h => {
      const kinds = Object.keys(KINDS).filter(k => KINDS[k].shape === h), mine = all.filter(x => kinds.indexOf(x.ik) >= 0);
      const worn = [...new Set(mine.map(x => x.sh))], wrong = mine.filter(x => x.sh !== h);
      console.log('one-card: ' + h + ' — ' + mine.length + ' card(s) of ' + [...new Set(mine.map(x => x.ik))].sort().join(', ') + ' in ' + worn.length + ' shape(s)');
      wrong.forEach(x => console.log('  ' + x.door + ' › ' + String(x.n).replace(/\n/g, ' ') + ' [' + x.ik + ' wears ' + (x.sh || 'no shape') + ']'));
      if (wrong.length || worn.length > 1) throw new Error('one-card: ' + h + ' kinds draw in ' + worn.length + ' shapes; exactly one');
    });
    const loose = all.filter(x => (x.sh === 'Person' || x.sh === 'Item') && (!x.ik || KINDS[x.ik].shape !== x.sh));
    loose.forEach(x => console.log('  ' + x.door + ' › ' + String(x.n).replace(/\n/g, ' ') + ' [' + x.sh + ' on ' + (x.ik || 'no kind') + ']'));
    if (loose.length) throw new Error('one-card: ' + loose.length + ' card(s) wear a shape their kind does not declare');
    if (!all.length) throw new Error('one-card: no cards drawn — the app did not start');
    /* EVERY DOOR DRAWS (22 Nov): a door with no cards is a door the check never looked behind. */
    const none = doors.filter(d => !all.some(x => x.door === d));
    if (none.length) throw new Error('one-card: ' + none.join(', ') + ' drew no cards');
  } finally { await b.close(); srv.close(); }
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e.message || e); process.exit(1); });
