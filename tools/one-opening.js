#!/usr/bin/env node
/* @family. — tools/one-opening.js THE ONE-OPENING CHECK (rule 1.75, owner queue item 9, 24 Nov: "What kind / What for / Which as one question; a chip always has a name"):
   a tutor saw "Practice", "Any which", "Questions" — three questions saying one thing. Find opens on ONE question, What kind, its answers one flat set
   (kinds.json `doors`: Questions, Answers, Inserts, Library, Tools …), and no question after it asks the same again.
   Counted: the funnel's live facets (one kind question: forLabel, kindLabel, kindOwn — only kindLabel asked); every asked facet's label a phrasebook word
   (data/settings/words.json); and, on a phone for a child and for a guest, the opening's answers are the doors, and every chip on the page — the menu's answers,
   the chosen chips, "Doesn't matter" answered — has a name: never empty, never a bare "*" (only sign-in's PIN dots, `.sign-dot`, by design).
   `--prove` breaks each rule in the page and fails unless every break is caught. Run by tools/build.js after `bundle`. */
'use strict';
const { main } = require('./lib/gen.js');
const SB = require('./lib/site-browser.js');
const SD = require('./lib/site-data.js');
/* THE PHRASEBOOK (words.json, its aliases read through) and the facets and doors as written (labels still phrasebook keys). */
const WORDS = SD.phrasebook();
const KINDS = SD.raw('data/settings/kinds.json');
const FACETS = SD.raw('data/settings/facets.json');

/* THE KIND QUESTIONS: of these, only the opening one may be asked. */
const KIND_FIELDS = ['forLabel', 'kindLabel', 'kindOwn'];
const OPENING = 'kindLabel';
const ANY = "Doesn't matter";

/* THE BREAKS --prove makes, each one way the opening could split again or a chip lose its name. */
const BREAKS = [
  { name: 'none' },
  { name: 'Which asked again', js: () => { ITEM_KINDS.facets.find(f => f.field === 'kindOwn').active = true; FACET_LIVE = null; } },
  { name: 'a label off the phrasebook', js: () => { ITEM_KINDS.facets.find(f => f.field === 'subject').label = ''; } },
  { name: 'a bare * chip', js: () => { chipText_ = () => '*'; } },
  { name: 'Practice a door again', js: () => { ITEM_KINDS.doors.unshift({ name: 'Practice' }); } },
];

const COUNT = { chips: 0, doors: 0 };
const words = () => new Set(Object.keys(WORDS));

async function look(as, brk) {
  const pg = await SB.open({ as, ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().length > 0 && typeof facetList === 'function' });
  const bad = [];
  try {
    if (brk && brk.js) await pg.evaluate(brk.js);
    const W = words();
    const live = await pg.evaluate(() => ({ asked: facetList().map(f => f.field), rows: ITEM_KINDS.facets.filter(f => f.active !== false).map(f => [f.field, f.label]), doors: ITEM_KINDS.doors.map(d => d.name) }));
    const kinds = live.asked.filter(f => KIND_FIELDS.indexOf(f) !== -1);
    if (kinds.length !== 1 || kinds[0] !== OPENING) bad.push(as + ': the kind is asked as ' + (kinds.join(' + ') || 'nothing') + ', not one question (' + OPENING + ')');
    /* THE LABEL'S WORD (facets.json, a words.json key) and what the page shows for it (that word, said). */
    live.rows.forEach(([f, shown]) => { const r = FACETS.find(x => x.field === f) || {}, l = r.label;
      if (!l || !W.has(l) || !shown || shown !== WORDS[l]) bad.push(as + ': facet ' + f + "'s label \"" + (l || '') + '" (shown "' + (shown || '') + '") is no phrasebook word'); });
    const own = KINDS.doors.map(d => d.name);
    live.doors.filter(d => own.indexOf(d) === -1).forEach(d => bad.push(as + ': door "' + d + '" is not in kinds.json doors'));
    /* EVERY CHIP ON THE PAGE, named. */
    const chips = () => pg.evaluate(() => {
      const menu = document.querySelector('[id$="-groups"]');
      const els = [...document.querySelectorAll('.chip')].concat(menu ? [...menu.querySelectorAll('button,a,[role=button],[data-value]')] : []);
      return { q: ((STUFF.filters || []).length ? '' : ((nextFacet(stuffFiltered()) || facetBy('kindLabel') || {}).field || '')),
        ask: menu ? [...menu.querySelectorAll('button,a,[role=button]')].filter(e => e.offsetParent).map(e => e.textContent.trim()) : [],
        all: [...new Set(els)].filter(e => e.offsetParent).map(e => ({ t: e.textContent.replace(/\s+/g, ' ').replace(/[✕×]/g, '').trim(), dot: e.matches('.sign-dot') })) };
    });
    const named = (c, where) => c.all.forEach(x => { COUNT.chips++; if (!x.dot && (!x.t || /^\*+$/.test(x.t))) bad.push(as + ': a chip with no name ("' + x.t + '") ' + where); });
    const open = await chips();
    named(open, 'at the opening');
    /* SIGNED OUT, THE WELCOME SCREEN: its sign-in chips ("@name * * * *", by design) are named or PIN dots; Find's doors are asked once signed in. */
    if (as === 'none') return bad;
    if (open.q && open.q !== OPENING) bad.push(as + ': Find opens on ' + open.q + ', not ' + OPENING);
    const front = open.ask.filter(t => t !== ANY);
    const doorsOn = front.filter(t => live.doors.indexOf(t) !== -1);
    if (!doorsOn.length || doorsOn.length !== front.length) bad.push(as + ': the opening\'s answers are not the doors (' + front.join(', ') + ')');
    /* EACH OPENING ANSWER: the next question never says an opening answer again (Practice › Questions). */
    COUNT.doors = Math.max(COUNT.doors, doorsOn.length);
    for (const d of doorsOn) {
      await pg.evaluate(() => inFinder_(FINDERS.stuff, () => { STUFF.filters = []; paintStuff(); })).catch(() => {}); await pg.waitForTimeout(600);
      await SB.tap(pg, d);
      const c = await chips();
      named(c, 'under ' + d);
      const again = c.ask.filter(t => t !== d && front.indexOf(t) !== -1);
      if (again.length) bad.push(as + ': under ' + d + ' the next question offers ' + again.join(', ') + ' — an opening answer asked twice');
    }
    /* "Doesn't matter" ANSWERED: its chip says the question by name. */
    await pg.evaluate(() => inFinder_(FINDERS.stuff, () => { STUFF.filters = []; paintStuff(); })).catch(() => {}); await pg.waitForTimeout(600); await SB.tap(pg, ANY);
    await pg.waitForTimeout(800);
    named(await chips(), 'after ' + ANY);
  } finally { await pg.close(); }
  return bad;
}

async function check(brk) {
  const out = await SB.pool(['child', 'admin', 'none'], 3, as => look(as, brk));
  return [].concat(...out);
}

async function run() {
  if (process.argv.indexOf('--prove') > 0) {
    const missed = [];
    for (const b of BREAKS) {
      const bad = await check(b);
      if (b.name === 'none' && bad.length) throw new Error('one-opening --prove: the unbroken site already fails (' + bad[0] + ')');
      if (b.name !== 'none' && !bad.length) missed.push(b.name);
      if (b.name !== 'none') console.log('  break "' + b.name + '": ' + (bad.length ? 'caught — ' + bad[0] : 'MISSED'));
    }
    await SB.done();
    if (missed.length) throw new Error('one-opening --prove: missed ' + missed.join(', '));
    console.log('one-opening --prove: every break caught (' + (BREAKS.length - 1) + ')');
    return;
  }
  const bad = await check(null);
  console.log('one-opening: Find opens on one question (What kind), answers the kinds.json doors, every chip named — for a child, an admin and the welcome screen: ' + COUNT.doors + ' opening answers walked, ' + COUNT.chips + ' chips read' + (bad.length ? '' : ' — ok'));
  bad.forEach(b => console.log('  ' + b));
  await SB.done();
  if (bad.length) throw new Error('one-opening: ' + bad.length + ' problem(s)');
}
module.exports = { run };
main(module, run);
