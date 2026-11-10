#!/usr/bin/env node
/* node js/check-biz.js — THE BUSINESS CHECKER (1050): every item has why, how and an official link, every auto rule exists, and the card draws with an empty payload. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');

function work() {
  const W = [], add = (where, say) => W.push({ kind: 'biz-checker', where, say });
  let j = null;
  try { j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/biz-checklist.json'), 'utf8')); } catch (e) { add('data/settings/biz-checklist.json', 'unreadable: ' + e.message); return W; }
  const src = fs.readFileSync(path.join(ROOT, 'js/biz-check.js'), 'utf8');
  /* A SANDBOX WITH NOTHING IN IT BUT STUBS: no payload, no ticks, no records — the card must still draw. */
  const NEED = {}, ADMIN = { on: true };
  const box = { DATA: {}, USER: { name: 'x' }, esc: s => String(s == null ? '' : s).replace(/[<>&"]/g, c => '&#' + c.charCodeAt(0) + ';'), norm: s => String(s || '').trim().toLowerCase(),
    tile_: o => `<b data-do="${o.act}">${o.label}</b>`, loading_: () => '<i>loading</i>', bizNeed_: (k, n, say, now) => { NEED[k] = { n, now }; return ''; }, on: () => {}, isAdmin: () => ADMIN.on,
    money_: x => '£' + Number(x).toFixed(2), date_: iso => String(iso).slice(8, 10) + '/' + String(iso).slice(5, 7) + '/' + String(iso).slice(2, 4),
    setTimeout: () => 0, fetch: () => new Promise(() => {}), api: () => new Promise(() => {}), document: { querySelectorAll: () => [] } };
  try { vm.runInNewContext(src + '\n;this.BC = BC; this.BC_RULES = BC_RULES; this.BC_DOMAINS = BC_DOMAINS; this.bcInner_ = bcInner_; this.bcRuleOf_ = bcRuleOf_; this.bizCheckCard_ = bizCheckCard_; this.bcNextFixed_ = bcNextFixed_; this.bcDueOf_ = bcDueOf_; this.bcState_ = bcState_; this.bcTaxPot_ = bcTaxPot_; this.bcIso_ = bcIso_;', box); }
  catch (e) { add('js/biz-check.js', 'would not load: ' + e.message); return W; }
  const items = Array.isArray(j.items) ? j.items : [];
  if (items.length < 30) add('data/settings/biz-checklist.json', 'only ' + items.length + ' items — the list was cut');
  const seen = {};
  items.forEach((it, i) => {
    const at = 'biz-checklist.json item ' + (it.id || i);
    if (!/^[a-z][a-z0-9_]{1,39}$/.test(it.id || '')) add(at, 'id is not a slug the biz_checks tab accepts');
    if (seen[it.id]) add(at, 'id appears twice'); seen[it.id] = 1;
    ['group', 'title', 'why', 'how', 'link'].forEach(k => { if (!String(it[k] || '').trim()) add(at, 'has no ' + k); });
    if (it.link && !box.BC_DOMAINS.test(it.link)) add(at, 'link is not gov.uk, ico.org.uk or nspcc.org.uk: ' + it.link);
    if (it.sense !== 'manual' && !box.bcRuleOf_(it.sense)) add(at, 'sense "' + it.sense + '" is no rule in BC_RULES');
    if (it.renew != null && !(Number(it.renew) > 0)) add(at, 'renew is not a number of months');
    Object.keys(it.when || {}).forEach(k => { if (!(k in (j.facts || {}))) add(at, 'when names "' + k + '", which facts does not'); });
  });
  try {
    const empty = box.bcInner_();
    if (!/Business checker/.test(empty) || !/loading/.test(empty)) add('js/biz-check.js', 'the card did not draw its title and loader with nothing loaded');
    box.BC.list = items; box.BC.facts = j.facts; box.BC.ticks = {};
    const full = box.bcInner_();
    if (!/\d+ of \d+ sorted/.test(full)) add('js/biz-check.js', 'with an empty sheet the card does not say "N of M sorted"');
    if (!/data-do="bc-open"/.test(full)) add('js/biz-check.js', 'with an empty sheet the card draws no items');
    if (!box.bizCheckCard_()) add('js/biz-check.js', 'an admin is drawn no card');
    ADMIN.on = false;
    if (box.bizCheckCard_()) add('js/biz-check.js', 'a non-admin is drawn the business checker');
    ADMIN.on = true;
    renewals(box, items, NEED, add);
  } catch (e) { add('js/biz-check.js', 'the card threw with an empty payload: ' + e.message); }
  return W;
}
/* RENEWALS (10 Nov): the date maths, the glow and the dot's count, and the tax pot. */
function renewals(box, items, NEED, add) {
  const at = 'js/biz-check.js renewals', want = (got, exp, say) => { if (got !== exp) add(at, say + ': got ' + JSON.stringify(got) + ', wanted ' + JSON.stringify(exp)); };
  const byId = id => items.find(i => i.id === id) || {};
  ['pub_liability', 'prof_indemnity', 'home_visit_cover', 'ico_fee', 'dbs_owner'].forEach(id => want((byId(id).cycle || {}).months, 12, id + ' is not yearly'));
  want((byId('safeguarding_training').cycle || {}).months, 36, 'safeguarding_training is not every 3 years');
  want(String((byId('tax_return').cycle || {}).dates), '01-31', 'tax_return is not 31 Jan');
  want(String((byId('payments_on_account').cycle || {}).dates), '01-31,07-31', 'payments on account are not 31 Jan + 31 Jul');
  want(!!(byId('vat_watch').cycle || {}).continuous, true, 'vat_watch is not continuous');
  want(box.bcNextFixed_(['01-31', '07-31'], '2026-11-10'), '2027-01-31', 'next fixed date after 10 Nov');
  want(box.bcNextFixed_(['01-31', '07-31'], '2026-01-31'), '2026-07-31', 'next fixed date after 31 Jan itself');
  want(box.bcDueOf_({ cycle: { months: 12 } }, { done_on: '2026-03-15' }), '2027-03-15', 'yearly from 15 Mar');
  want(box.bcDueOf_({ cycle: { months: 36 } }, { done_on: '2026-03-15' }), '2029-03-15', 'three-yearly from 15 Mar');
  want(box.bcDueOf_({ cycle: { months: 12 } }, { done_on: '2026-03-15', expires_on: '2026-12-01' }), '2026-12-01', 'Renewed\'s expiry wins');
  want(box.bcDueOf_({ cycle: { continuous: true } }, null), '', 'continuous has no due date');
  const day = n => box.bcIso_(new Date(Date.now() + n * 864e5));
  const ins = { id: 'pub_liability', cycle: { months: 12 }, sense: 'manual' };
  const st = tick => { box.BC.ticks = { pub_liability: tick }; return box.bcState_(ins); };
  const far = st({ id: 'pub_liability', done_on: day(-10), expires_on: day(200) });
  if (far.soon || far.expired || !far.sorted) add(at, '200 days off is not plainly sorted');
  const soon = st({ id: 'pub_liability', done_on: day(-300), expires_on: day(20) });
  if (!soon.soon || soon.expired) add(at, '20 days off does not glow');
  const over = st({ id: 'pub_liability', done_on: day(-400), expires_on: day(-2) });
  if (!over.expired || over.sorted) add(at, 'two days past expiry is not overdue');
  /* THE DOT: one soon, one overdue → 2 to renew, 1 of them overdue. */
  box.BC.list = [ins, Object.assign({}, ins, { id: 'ico_fee' })];
  box.BC.facts = {};
  box.BC.ticks = { pub_liability: { done_on: day(-300), expires_on: day(20) }, ico_fee: { done_on: day(-400), expires_on: day(-2) } };
  const html = box.bcInner_();
  const nd = NEED.bizcheck || {};
  if (nd.n !== 2 || nd.now !== 1) add(at, 'the Business dot counts ' + JSON.stringify(nd) + ', wanted 2 to renew, 1 overdue');
  if (!/is-over/.test(html) || !/is-soon/.test(html)) add(at, 'the items do not glow (is-soon / is-over)');
  /* THE TAX POT: a £400 booked job, two dates in this month (past), two next year → £200 in, £50 aside. */
  const now = new Date(), d1 = new Date(now.getFullYear(), now.getMonth(), 1, 9), far2 = new Date(now.getFullYear() + 2, 0, 1);
  box.DATA.clientClasses = [{ status: 'Booked', price: 400, dates: [d1, d1, far2, far2] }, { status: 'Waiting', price: 999, dates: [d1] }];
  box.jobDates_ = j => j.dates;
  box.BC.money = { tax_set_aside: 0.25 };
  const pot = box.bcTaxPot_();
  if (Math.abs(pot.month - 50) > 0.01 || Math.abs(pot.year - 50) > 0.01) add(at, 'tax pot reads ' + JSON.stringify(pot) + ', wanted £50 this month and tax year');
  if (!/Put aside £50\.00 this month · £50\.00 this tax year \(25%\)/.test(box.bcInner_())) add(at, 'the card does not say "Put aside £50.00 this month · £50.00 this tax year (25%)"');
  box.DATA.constants = { vars: { tax_set_aside: 0.2 } };
  if (Math.abs(box.bcTaxPot_().month - 40) > 0.01) add(at, 'config tax_set_aside does not override the data rate');
}
module.exports = { work };

if (require.main === module) {
  require('../check/quiet');
  const W = work();
  W.forEach(w => console.log('FAIL ' + w.where + ' — ' + w.say));
  if (W.length) process.exit(1);
  console.log('OK — the business checker: every item has why, how and an official link, every rule exists, and it draws with nothing loaded.');
}
