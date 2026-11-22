#!/usr/bin/env node
/* @family. — tools/docket-address.js THE PRIVATE ADDRESS CHECK (rule 1.75; owner 21 Nov: NOW, NEXT step 3): the plain-text address Siri, ChatGPT or Gemini
   read must say the plan the site shows, tick and add what is asked, and answer nobody without the token. backend/post-account.gs docketAddress_ is run
   as served, over backend/cards-gen.gs's copies of the planner, on tools/docket-plan.js's made-up day, against js/map.js's own dkPhase_/dkNowNextOf_/dkSay_.
   Counted: a read with no token, one with a wrong token, the read at each of docket-plan's clock times, "done shower", "add milk"; one wrong fails the build. */
'use strict';
const SD = require('./lib/site-data.js');
const { text, report, main } = require('./lib/gen.js');
const { fnOf, NOW, DAY, PHASES } = require('./docket-plan.js');
const constOf = (src, name, file) => { const m = new RegExp('\\nconst ' + name + ' = [\\s\\S]*?;\\n(?=const |function |/\\*|\\n)').exec(src);
  if (!m) throw new Error('docket-address: no const ' + name + ' in ' + file); return m[0]; };
const text_ = SD.textOf();
/* THE BACKEND, AS SERVED: one owner, one todo cell, one token; a save writes the cell. */
function backend(state) {
  const gen = text('backend/cards-gen.gs'), be = text('backend/post-account.gs'), G = 'backend/post-account.gs';
  const src = constOf(gen, 'DOCKET_PLAN_FIELDS', 'backend/cards-gen.gs') + constOf(gen, 'LIST_KINDS', 'backend/cards-gen.gs') + ['dkPlan_', 'dkPhase_', 'dkNowNextOf_', 'dkSay_', 'dkMatch_'].map(n => fnOf(gen, n)).join('')
    + constOf(be, 'DOCKET_TOKEN_KEY', G) + constOf(be, 'DOCKET_CELL_MAX', G) + constOf(be, 'docketFill_', G)
    + ['listTidy_', 'listItemTidy_', 'todoTidy_', 'docketAnswer_', 'docketSame_', 'docketAddress_'].map(n => fnOf(be, n)).join('')
    + 'return { docketAddress_, docketAnswer_, docketFill_ };';
  const out = s => ({ s, setMimeType() { return this; }, getContent() { return this.s; } });
  const env = {
    S: v => (v == null ? '' : String(v)).trim(), text_, todayIso_: () => state.now.slice(0, 10), docketNow_: () => state.now,
    ContentService: { createTextOutput: out, MimeType: { TEXT: 'TEXT' } },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => state.props[k] || null }) },
    TAB: { people: 'people' }, read: () => ({ rows: [state.owner] }), isOwner_: r => r === state.owner,
    postSavePerson_: (b, f, v) => { state.owner[f] = v; state.saves++; return out(JSON.stringify({ success: true })); },
  };
  /* docketNow_ is the backend's clock (Utilities); the check's stands in for it. */
  return new Function(...Object.keys(env), src)(...Object.values(env));
}
function site() {
  const js = text('js/map.js');
  return new Function('text_', ['dkPlan_', 'dkPhase_', 'dkNowNextOf_', 'dkSay_'].map(n => fnOf(js, n)).join('') + 'return { dkPhase_, dkNowNextOf_, dkSay_ };')(text_);
}
/* THE SITE'S FILL (js/map.js dkFill_): kinds.json docket-item's defaults under the item's own values. */
const fields = SD.kinds().docket.forms['docket-item'].fields;
const siteFill = it => Object.assign({}, ...fields.filter(x => x.default != null).map(x => ({ [x.f]: x.default })),
  ...Object.keys(it || {}).filter(k => it[k] !== '' && it[k] != null).map(k => ({ [k]: it[k] })));
function dayOf(c) {
  const day = NOW.slice(0, 10), lists = DAY();
  lists.forEach(L => L.items.forEach(it => { if ((c.tick || []).includes(it.title)) { it.doneOn = c.tickOn || day; if (it.repeat !== 'daily') it.done = true; } }));
  return lists;
}
function run() {
  const bad = [], day = NOW.slice(0, 10), TOKEN = 'a'.repeat(32) + 'b'.repeat(32), S = site();
  const make = (lists, at) => { const state = { now: day + ' ' + at, props: { DOCKET_TOKEN: TOKEN }, saves: 0, owner: { person_id: 'p1', todo: JSON.stringify({ v: 1, lists }) } };
    return { state, be: backend(state) }; };
  const ask = (k, q) => k.be.docketAddress_(q).getContent();
  const refused = text_('err-docket-token');
  let n = 0;
  /* NO TOKEN, AN EMPTY ONE, A WRONG ONE, ONE A CHARACTER SHORT: refused, and nothing saved. */
  [{}, { docket: '' }, { docket: 'x'.repeat(64) }, { docket: TOKEN.slice(1) }, { do: 'done', what: 'shower' }].forEach(q => {
    const k = make(dayOf({}), '07:10'); n++;
    const got = ask(k, q);
    if (got !== refused || k.state.saves) bad.push('a read with ' + JSON.stringify(q) + ' was answered: ' + got);
  });
  if (ask(make(dayOf({}), '07:10'), { docket: TOKEN }) === refused) bad.push('the right token is refused');
  /* THE READ SAYS WHAT THE SITE SHOWS, at each of docket-plan's clock times. */
  PHASES.forEach(c => {
    const lists = dayOf(c), k = make(dayOf(c), c.at), want = S.dkSay_(S.dkNowNextOf_(lists, S.dkPhase_(lists, day + ' ' + c.at, siteFill)));
    const got = ask(k, { docket: TOKEN }); n++;
    if (got !== want || !/^Now: /.test(got) || k.state.saves) bad.push(c.name + ' (' + c.at + '): the address says "' + got + '", the site "' + want + '"');
  });
  /* "DONE SHOWER" at 07:35 (the Shower list): the shower is ticked today, saved, and the answer is the new plan. */
  { const k = make(dayOf({}), '07:35'); n++;
    const got = ask(k, { docket: TOKEN, do: 'done', what: 'Shower' }), lists = JSON.parse(k.state.owner.todo).lists;
    const sh = lists.find(L => L.name === 'Shower').items.find(i => i.title === 'shower');
    const want = text_('dk-say-ticked', { title: 'shower' }) + ' ' + S.dkSay_(S.dkNowNextOf_(lists, S.dkPhase_(lists, day + ' 07:35', siteFill)));
    if (!sh || sh.doneOn !== day || k.state.saves !== 1 || got !== want) bad.push('"done shower" did not tick the shower: ' + got); }
  /* "DONE" WITH NOTHING THAT MATCHES: nothing ticked, nothing saved. */
  { const k = make(dayOf({}), '07:35'); n++;
    if (ask(k, { docket: TOKEN, do: 'done', what: 'zebra' }).indexOf(text_('dk-say-no-match', { what: 'zebra' })) !== 0 || k.state.saves) bad.push('"done zebra" ticked something'); }
  /* "ADD MILK": to the current list, no repeat; and to a named one. */
  { const k = make(dayOf({}), '07:10'); n++;
    const got = ask(k, { docket: TOKEN, do: 'add', what: 'milk' }), L = JSON.parse(k.state.owner.todo).lists.find(x => x.name === 'Feet on floor');
    const it = L && L.items.find(i => i.title === 'milk');
    if (!it || it.repeat || k.state.saves !== 1 || got.indexOf(text_('dk-say-added', { title: 'milk', name: 'Feet on floor' })) !== 0) bad.push('"add milk" did not add to the current list: ' + got); }
  { const k = make(dayOf({}), '07:10'); n++;
    ask(k, { docket: TOKEN, do: 'add', what: 'eggs', list: 'shopping' });
    if (!JSON.parse(k.state.owner.todo).lists.find(x => x.name === 'Shopping').items.some(i => i.title === 'eggs')) bad.push('"add eggs" with list=shopping did not add to Shopping'); }
  console.log('docket-address: ' + n + ' asks of the private address on docket-plan\'s day; ' + bad.length + ' wrong');
  report('docket-address', bad, 'private-address answer(s) wrong');
  return { n, bad: bad.length };
}
module.exports = { run };
main(module, run);
