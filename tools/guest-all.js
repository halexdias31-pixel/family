#!/usr/bin/env node
/* @family. — tools/guest-all.js THE GUEST CHECK (rule 1.84 by 1.75, owner 28 Nov: "make sure guest has access to everything ... The only thing that
   doesn't happen is none of their work gets saved"). On an iPhone 13, signed out, against a student's phone:
   (1) Find holds every kind a student's does that kinds.json opens to `anyone`, and nothing of a kind it keeps from `anyone` (Settings' Make an account aside);
   (2) a generated maths question, answered, is marked (right and wrong) as a student's is;
   (3) that answer, and every other save a student makes (submissions, a saved answer, working, a work file, a docket item, a booking), is never posted;
   (4) no price (`may_('prices')`, settings.json roles.may.prices); (5) no admin and nobody's own data (person, profile, answers read refused to `anyone`).
   Counted: kinds compared, saves tried, rules held. `--prove` breaks each in the page and fails unless every break is caught. Run by tools/build.js. */
'use strict';
const { main } = require('./lib/gen.js');
const SB = require('./lib/site-browser.js');

/* EVERY SAVE A STUDENT MAKES, as the phone posts it (actions.json names; item doors by kind). */
const SAVES = [
  { action: 'submitAnswer', personId: '', items: [{ key: 'q:ZZ-GUEST-1', answer: '6' }] },
  { action: 'item', door: 'save', item: 'answer', key: 'q:ZZ-GUEST-1', answer: '6' },
  { action: 'markWorking', key: 'q:ZZ-GUEST-1' },
  { action: 'workFileSave', name: 'zz.txt' },
  { action: 'item', door: 'save', item: 'todo', todo: { title: 'zz' } },
  { action: 'item', door: 'save', item: 'favourite' },
  { action: 'createJob', subject: 'Maths' },
];
const SAVE_NAMES = SAVES.map(b => b.action === 'item' ? b.item + ':' + b.door : b.action);
const nameOf = b => b && (b.action === 'item' ? (b.item || b.kind) + ':' + (b.door || '') : b.action);

const BREAKS = [
  { name: 'none' },
  { name: 'a guest sees prices', js: () => { ROLES_.may.prices.notTiers = ['child']; } },
  { name: 'a guest\'s answer is posted', js: () => { guestUnkept_ = () => false; } },
  { name: 'Learn shut to guests', js: () => { findSignedOut_ = x => kindTop_(x) === 'Settings'; } },
  { name: 'a guest is an admin', js: () => { ROLES_.may.admin.tiers.push('anyone'); } },
  { name: 'marking needs a sign-in', js: () => { const m = mark_; mark_ = (x, a, s) => (USER ? m(x, a, s) : markResult_(0, 1, '', { state: 'empty' })); } },
];

const ready = () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().length > 0 && typeof mark_ === 'function';
const kindsIn = () => [...new Set(stuffItemsBuild_().map(x => x.kind))];

async function look(brk) {
  const posted = [];
  const child = await SB.open({ as: 'child', ready });
  let student = [];
  try { student = await child.evaluate(kindsIn); } finally { await child.close(); }
  const pg = await SB.open({ as: 'none', ready, answer: q => { posted.push(q); return null; } });
  const bad = [];
  let r;
  try {
    if (brk && brk.js) await pg.evaluate(brk.js);
    const before = posted.length;
    r = await pg.evaluate(([student, saves]) => {
      const who = k => String((((ITEM_KINDS.kinds || {})[k] || {}).see || {}).who || '');
      const open = k => who(k).split(',').map(w => w.trim()).indexOf('anyone') !== -1;
      const mine = kindsIn_();
      function kindsIn_() { return [...new Set(stuffItemsBuild_().map(x => x.kind))]; }
      const missing = student.filter(k => (open(k) || !who(k)) && k !== 'setting' && mine.indexOf(k) === -1);
      const shut = mine.filter(k => who(k) && !open(k) && k !== 'setting');
      /* A GENERATED MATHS QUESTION, its words made up (the library's words need not be on this machine): typed 6, then 5. */
      const base = stuffItemsBuild_().find(x => x.kind === 'question' && /^Math/.test(String(x.subject)) && typeof libGenRow_ === 'function' && libGenRow_(x))
        || stuffItemsBuild_().find(x => x.kind === 'question' && /^Math/.test(String(x.subject)));
      const x = base && Object.assign({}, base, { key: 'q:ZZ-GUEST-1', html: '<p>Work out 2 × 3.</p>', accept: '6', answer: '6', marks: '1', choices: [], choiceRight: [], choiceWays: [],
        drawAnswer: '', orderEnds: [], cells: '', markWords: '', answerType: '' });
      const right = x ? mark_(x, '6').verdict : 'none', wrong = x ? mark_(x, '5').verdict : 'none';
      /* AND THE ANSWER GOES THROUGH THE SITE'S OWN SAVE: recorded, then the queue pushed, then every save a student makes asked of the backend. */
      try { if (x) subRecord_(ansKey_(x), '6', right); } catch (e) { /* a guest's record is the device's */ }
      try { subPush_(Date.now()); } catch (e) { /* nothing to push */ }
      saves.forEach(b => { try { api(b).catch(() => {}); } catch (e) { /* a refusal is no post */ } });
      return { missing, shut, kinds: mine.length, gen: !!(base && typeof libGenRow_ === 'function' && libGenRow_(base)), right, wrong,
        prices: may_('prices'), admin: may_('admin'), privateOpen: ['person:read', 'profile:read', 'answer:read', 'card:read'].filter(a => can_('anyone', 'item', a)) };
    }, [student, SAVES]);
    await pg.waitForTimeout(1500);
    const sent = posted.slice(before).map(nameOf).filter(n => SAVE_NAMES.indexOf(n) !== -1);
    r.missing.forEach(k => bad.push('a guest\'s Find has no ' + k + ' cards, which a student\'s has'));
    r.shut.forEach(k => bad.push('a guest\'s Find shows ' + k + ' cards, which kinds.json keeps from anyone'));
    if (r.right !== 'right' || r.wrong !== 'wrong') bad.push('a guest\'s maths answer is not marked (6 → ' + r.right + ', 5 → ' + r.wrong + ')');
    sent.forEach(n => bad.push('a guest\'s ' + n + ' was posted: nothing a guest does is kept'));
    if (r.prices) bad.push('a guest sees prices (a child may be behind the screen)');
    if (r.admin) bad.push('a guest is let into the admin\'s tools');
    r.privateOpen.forEach(a => bad.push('a guest may ' + a + ', somebody\'s own'));
    r.student = student.length;
  } finally { await pg.close(); }
  return { bad, r };
}

async function run() {
  if (process.argv.indexOf('--prove') > 0) {
    const missed = [];
    for (const b of BREAKS) {
      const { bad } = await look(b);
      if (b.name === 'none' && bad.length) throw new Error('guest-all --prove: the unbroken site already fails (' + bad[0] + ')');
      if (b.name !== 'none' && !bad.length) missed.push(b.name);
      if (b.name !== 'none') console.log('  break "' + b.name + '": ' + (bad.length ? 'caught — ' + bad[0] : 'MISSED'));
    }
    await SB.done();
    if (missed.length) throw new Error('guest-all --prove: missed ' + missed.join(', '));
    console.log('guest-all --prove: every break caught (' + (BREAKS.length - 1) + ')');
    return;
  }
  const { bad, r } = await look(null);
  await SB.done();
  console.log('guest-all: signed out, Find holds ' + r.kinds + ' kinds (a student\'s ' + r.student + ', own kinds aside), a generated maths answer marked ('
    + r.right + '/' + r.wrong + (r.gen ? '' : ', no generated set on this machine: a maths question') + '), ' + SAVES.length + ' saves tried and none posted, no price, no admin, nobody\'s own data'
    + (bad.length ? '' : ' — ok'));
  bad.forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('guest-all: ' + bad.length + ' problem(s)');
}
module.exports = { run };
main(module, run);
