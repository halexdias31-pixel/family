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
  const box = { DATA: {}, USER: { name: 'x' }, esc: s => String(s == null ? '' : s).replace(/[<>&"]/g, c => '&#' + c.charCodeAt(0) + ';'), norm: s => String(s || '').trim().toLowerCase(),
    tile_: o => `<b data-do="${o.act}">${o.label}</b>`, loading_: () => '<i>loading</i>', bizNeed_: () => '', on: () => {}, isAdmin: () => true,
    setTimeout: () => 0, fetch: () => new Promise(() => {}), api: () => new Promise(() => {}), document: { querySelectorAll: () => [] } };
  try { vm.runInNewContext(src + '\n;this.BC = BC; this.BC_RULES = BC_RULES; this.BC_DOMAINS = BC_DOMAINS; this.bcInner_ = bcInner_; this.bcRuleOf_ = bcRuleOf_; this.bizCheckCard_ = bizCheckCard_;', box); }
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
  } catch (e) { add('js/biz-check.js', 'the card threw with an empty payload: ' + e.message); }
  return W;
}
module.exports = { work };

if (require.main === module) {
  require('../check/quiet');
  const W = work();
  W.forEach(w => console.log('FAIL ' + w.where + ' — ' + w.say));
  if (W.length) process.exit(1);
  console.log('OK — the business checker: every item has why, how and an official link, every rule exists, and it draws with nothing loaded.');
}
