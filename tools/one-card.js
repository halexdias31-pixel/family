#!/usr/bin/env node
/* @family. — tools/one-card.js THE ONE-CARD CHECK (rule 1.75, owner 17 Nov): every card a child or parent sees in Find is drawn by the one maker
   (`renderCard` / `findCard`: `.card.fc.kc`, and nothing but its `kc-*` parts as children) and has no CSS keyed on a class of its own.
   Counted site-wide on an iPhone 13, each Find door opened at once on the served bundles with tools/lib/payload.json as the backend's answer.
   Prints the count; a card outside the rule fails the build. Run by tools/build.js after the bundles. */
'use strict';
const fs = require('fs'), path = require('path');
const { ROOT, bare, text } = require('./lib/gen.js');
const SB = require('./lib/site-browser.js'), SD = require('./lib/site-data.js');
/* THE ONE MAKER'S OWN CLASSES, and the state classes every card may wear. */
const BASE = /^(card|fc|kc|kc-[\w-]+|is-empty|is-off|is-locked|tap)$/;
/* NO CARD WAITS ON A LATER SHAPE NOW (owner, 22 Nov, CARD SHAPES: Learning: Question, the last step): the question card's `qcard` and `lib-wait`, a
   receipt's `rc`, `is-done` and a conversation's `msg-fc`, `unread` were styled here; each is now a shape (`[data-shape="Question"]`) or a shape
   state (`data-state`: wait, receipt, done, one, unread) the one maker writes, and the classes stay only as handlers' hooks. Empty, so any card with CSS of its own fails. */
const LATER = {};

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

/* THE ACTIVITY CARDS ARE LOOKED AT TOO (owner, 22 Nov, CARD SHAPES: Record and Thread): the sample payload has no booking of the signed-in user and no
   messages, so Booking gets four of theirs (paid, paying, unpaid, no seats) and Messages two conversations, or the Record and Thread rules would check nothing. */
function withActivity(P) {
  const J = (P.liveJobs || [])[0] || { subject: 'Maths', level: 'GCSE', venue: 'Colliers Wood Library', price: '30', unit: 'hour' }, me = 'Test Admin';
  const job = (id, o) => Object.assign({}, J, { id, job_id: id, client: me, tutor: 'Ada Tutor' }, o);
  P.liveJobs = (P.liveJobs || []).concat(job('J901', { rate: '30', weeks: '6', slots: [{ client: me, status: 'booked' }] }),
    job('J902', { subject: 'English', price: '120', unit: '', weeks: '4', slots: [{ client: me, status: 'paying' }, { client: 'Kid One', status: 'pending' }] }),
    job('J903', { subject: 'Physics', level: 'KS3', tutor: '', price: '', slots: [{ client: me, status: 'pending' }] }), job('J904', { subject: 'Chemistry', slots: [] }));
  P.messages = (P.messages || []).concat({ id: 'M901', withId: 'P902', withName: 'Ada Tutor', body: 'See you on Tuesday', at: '2026-11-18T10:00:00Z', mine: false, read: true },
    { id: 'M902', withId: 'P902', withName: 'Ada Tutor', body: 'Thanks!', at: '2026-11-18T11:00:00Z', mine: true, read: true },
    { id: 'M903', withId: 'P903', withName: 'Bea Parent', body: 'Can we move the lesson?', at: '2026-11-19T09:00:00Z', mine: false, read: false });
  return JSON.stringify(P);
}

/* THE SHAPES THE CARDS WEAR, each once */
const shapesOf = all => [...new Set(all.map(x => x.sh).filter(Boolean))].sort();
const PROVE = process.argv.includes('--prove');
async function run() {
  const css = bare(text('style.css'), { comments: true });
  const hand = settingsByHand(css);
  hand.forEach(x => console.log('  ' + x));
  if (hand.length) throw new Error('one-card: ' + hand.length + ' settings part(s) drawn by hand');
  const styled = c => new RegExp('\\.' + c.replace(/-/g, '\\-') + '(?![\\w-])').test(css);
  const payload = withActivity(JSON.parse(SB.PAYLOAD()));
  /* THE LIBRARY WITH ITS WORDS where this machine has them (tools/lib/site-browser.js serves it): Practice then draws its question cards, not only
     their waiting cards, so the Question shape is looked at as a child sees it (Learning: Question, 22 Nov). */
  const open = () => SB.open({ user: { name: 'Test Admin', handle: 'testadmin', personId: 'P001', role: 'admin', token: 'tok' }, payload });
  const click = SB.tap;
  try {
    const first = await open();
    await first.waitForSelector('#stuff-groups [data-value]', { state: 'attached', timeout: 30000 }).catch(() => {});
    const doors = await first.evaluate(() => [...document.querySelectorAll('#stuff-groups [data-value]')].map(e => e.dataset.value).filter(Boolean));
    await first.close();
    /* THREE DOORS AT ONCE: more and a phone-sized page under load misses its taps. */
    const MUST_DRAW = { Posts: 'kc-post', Practice: 'kc-question', Booking: 'kc-receipt', Messages: 'kc-msg' };
    const look = async d => {
      const pg = await open();
      /* EVERY STEP SKIPPED (22 Nov): Practice, Library and Shop ask several steps before their cards, so "Doesn't matter" is tapped until it is gone (17 steps since 24 Nov: no tag skipped). */
      await click(pg, d);
      for (let i = 0; i < 40 && await pg.getByText("Doesn't matter", { exact: true }).locator('visible=true').count(); i++) await click(pg, "Doesn't matter");
      /* SETTLED: the same number of cards twice, half a second apart (eight seconds at most). */
      for (let i = 0, last = -1; i < 16; i++) { const n = await pg.evaluate(() => document.querySelectorAll('#screen .card').length); if (n && n === last) break; last = n; await pg.waitForTimeout(500); }
      /* PRACTICE'S WORDS ARRIVE AFTER ITS WAITING CARDS (a loaded build is slow): its question cards are waited for, 45 seconds at most. */
      if (d === 'Practice') await pg.waitForFunction(() => document.querySelector('#screen .kc-question') && !document.querySelector('#screen .lib-wait'), null, { timeout: 45000 }).catch(() => {});
      /* A DOOR THAT MUST DRAW ITS OWN KIND IS WAITED FOR (22 Nov: Posts and Practice sometimes came back empty under load — a missed tap, not the site). */
      const must = MUST_DRAW[d];
      const cards = await pg.evaluate(() => [...document.querySelectorAll('#screen .card')].filter(e => !e.parentElement.closest('.card')).slice(0, 60)
        .map(e => ({ n: e.getAttribute('aria-label') || e.innerText.slice(0, 30), c: e.className, sh: e.dataset.shape || '', ik: e.dataset.itemKind || '', set: e.matches('.kc-setting'),
          kc: e.matches('.fc.kc') && [...e.children].every(k => /^kc-/.test(k.className)) })));
      await pg.close();
      return cards.filter(x => x.n !== 'Find').map(x => ({ door: d, n: x.n, c: x.c, kc: x.kc, sh: x.sh, ik: x.ik, set: x.set, own: x.c.split(/\s+/).filter(c => c && !BASE.test(c) && styled(c)) }));
    };
    /* A MISSED TAP IS TRIED AGAIN, twice at most (SB.retry); a door that never draws its kind counts no cards. */
    const per = await SB.pool(doors, 3, async d => (await SB.retry(() => look(d), r => r !== null, 2)) || []);
    if (!doors.length) throw new Error('one-card: Find showed no doors — the app did not start');
    const all = [].concat(...per), later = all.filter(x => x.kc && x.own.length && x.own.every(c => LATER[c])), bad = all.filter(x => (!x.kc || x.own.length) && later.indexOf(x) < 0);
    console.log('one-card: ' + (all.length - bad.length - later.length) + '/' + all.length + ' cards drawn by the one maker with no CSS of their own');
    [...new Set(later.map(x => LATER[x.own[0]]))].forEach(h => console.log('  ' + later.filter(x => LATER[x.own[0]] === h).length + ' card(s) waiting on the ' + h + ' shape: '
      + [...new Set(later.filter(x => LATER[x.own[0]] === h).map(x => x.door + ' [' + x.own.join(' ') + ']'))].join(', ')));
    console.log('  by door: ' + doors.map(d => d + ' ' + all.filter(x => x.door === d).length).join(', '));
    bad.forEach(x => console.log('  ' + x.door + ' › ' + String(x.n).replace(/\n/g, ' ') + ' [' + (x.kc ? '' : 'not one maker; ') + x.own.join(' ') + ']'));
    if (bad.length) throw new Error('one-card: ' + bad.length + ' card(s) outside the one maker');
    const KINDS = SD.kinds();
    /* ONE CARD TYPE (owner, 25 Nov): every card wears the one shape, the question card's frame; more than one shape seen fails. */
    const shapes = shapesOf(all);
    console.log('one-card: ' + shapes.length + ' card shape(s) drawn: ' + shapes.map(h => h + ' (' + [...new Set(all.filter(x => x.sh === h).map(x => x.ik).filter(Boolean))].sort().join(', ') + ')').join('; '));
    if (shapes.length !== 1 || shapes[0] !== 'Card') throw new Error('one-card: ' + shapes.length + ' card shapes (' + shapes.join(', ') + '); one, Card');
    if (PROVE) { const two = shapesOf(all.concat([Object.assign({}, all[0], { sh: 'Person' })])); console.log('  --prove a second shape: ' + (two.length > 1 ? 'caught' : 'MISSED')); if (two.length < 2) throw new Error('one-card --prove: a second shape was not caught'); }
    const unshaped = Object.keys(KINDS).filter(k => KINDS[k].shape && KINDS[k].shape !== 'Card');
    if (unshaped.length) throw new Error('one-card: kinds.json gives ' + unshaped.join(', ') + ' a shape other than Card');
    /* EVERY ACTIVITY CARD is seen, in the one card, as its kind */
    const ACT = { 'kc-post': 'post', 'kc-receipt': 'booking', 'kc-msg': 'msg', 'kc-question': 'question' };
    Object.keys(ACT).forEach(c => { const of = all.filter(x => x.c.split(/\s+/).indexOf(c) >= 0), bare = of.filter(x => x.sh !== 'Card' || x.ik !== ACT[c]);
      bare.forEach(x => console.log('  ' + x.door + ' › ' + String(x.n).replace(/\n/g, ' ') + ' [' + c + ' wears ' + (x.sh || 'no shape') + ']'));
      if (!of.length || bare.length) throw new Error('one-card: ' + (of.length ? bare.length + ' ' + c + ' card(s) not in the one card' : 'no ' + c + ' card drawn'));
    });
    /* a kindless card in the one card (Find's menu, a Settings card) is in it by its maker, not by kinds.json */
    const loose = all.filter(x => x.sh && x.ik && (!KINDS[x.ik] || KINDS[x.ik].shape !== x.sh));
    loose.forEach(x => console.log('  ' + x.door + ' › ' + String(x.n).replace(/\n/g, ' ') + ' [' + x.sh + ' on ' + (x.ik || 'no kind') + ']'));
    if (loose.length) throw new Error('one-card: ' + loose.length + ' card(s) wear a shape their kind does not declare');
    if (!all.length) throw new Error('one-card: no cards drawn — the app did not start');
    /* EVERY DOOR DRAWS (22 Nov): a door with no cards is a door the check never looked behind. */
    const none = doors.filter(d => !all.some(x => x.door === d));
    if (none.length) throw new Error('one-card: ' + none.join(', ') + ' drew no cards');
  } finally { await SB.done(); }
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e.message || e); process.exit(1); });
