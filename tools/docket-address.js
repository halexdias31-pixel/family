#!/usr/bin/env node
/* @family. — tools/docket-address.js THE PRIVATE ADDRESS CHECK (rule 1.75; owner 21 Nov; one list, 25 Nov night): the plain-text address Siri, ChatGPT or
   Gemini read must say the order the site shows, tick and add what is asked, and answer nobody without the token. backend/post-account.gs docketAddress_
   is run as served, over backend/cards-gen.gs's copies of the order (dkSort_ and the rest), on a made-up one-list day, against js/map.js's own
   dkNowNextOf_/dkSay_. Counted: reads with no, an empty, a wrong and a short token, the read at three clock times, "done shower", "done zebra",
   "add milk" (into the one list, `list` ignored), several in one `what` (26 Nov, Siri: "water, protein and floss" — commas, and, &, plus,
   new lines; each its best match; one already done this cycle said so, not re-ticked; one sentence back), each multi rule proved by mutating the served
   docketAnswer_; one wrong fails the build. */
'use strict';
const SD = require('./lib/site-data.js');
const { text, report, main } = require('./lib/gen.js');
const fnOf = (src, name, file) => { const m = new RegExp('\\nfunction ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}\\n').exec(src);
  if (!m) throw new Error('docket-address: no ' + name + ' in ' + file); return m[0]; };
const constOf = (src, name, file) => { const m = new RegExp('\\nconst ' + name + ' = [\\s\\S]*?;\\n(?=const |function |/\\*|\\n)').exec(src);
  if (!m) throw new Error('docket-address: no const ' + name + ' in ' + file); return m[0]; };
const lineOf = (src, name, file) => { const m = new RegExp('\\nconst ' + name + ' = .*;\\n').exec(src);
  if (!m) throw new Error('docket-address: no const ' + name + ' in ' + file); return m[0]; };
const text_ = SD.textOf();
const ORDER = ['dkMin_', 'dkIso_', 'dkEv_', 'dkRep_', 'DK_CYCLE', 'dkOn_', 'dkIsDone_'], FNS = ['clashDays_', 'clashMin_', 'dkOccur_', 'dkSlot_', 'dkSort_', 'dkLeaves_', 'dkOption_', 'dkTitle_', 'dkWhen_', 'dkNowNextOf_', 'dkSay_', 'dkMatch_', 'dkTick_'];
/* THE BACKEND, AS SERVED: one owner, one todo cell, one token; a save writes the cell. */
function backend(state, mut) {
  const gen = text('backend/cards-gen.gs'), be = (mut || (x => x))(text('backend/post-account.gs')), G = 'backend/post-account.gs';
  const src = constOf(gen, 'LIST_KINDS', 'backend/cards-gen.gs') + lineOf(gen, 'CLASH_DAYS', 'backend/cards-gen.gs') + ORDER.map(n => lineOf(gen, n, 'backend/cards-gen.gs')).join('') + FNS.map(n => fnOf(gen, n, 'backend/cards-gen.gs')).join('')
    + constOf(be, 'DOCKET_TOKEN_KEY', G) + constOf(be, 'DOCKET_CELL_MAX', G)
    + ['listTidy_', 'listItemTidy_', 'todoOneList_', 'todoTidy_', 'docketAnswer_', 'docketSame_', 'docketAddress_'].map(n => fnOf(be, n, G)).join('') + lineOf(be, 'docketLeaves_', G)
    + 'return { docketAddress_, docketAnswer_ };';
  const out = s => ({ s, setMimeType() { return this; }, getContent() { return this.s; } });
  const env = {
    S: v => (v == null ? '' : String(v)).trim(), text_, todayIso_: () => state.now.slice(0, 10), docketNow_: () => state.now,
    ContentService: { createTextOutput: out, MimeType: { TEXT: 'TEXT' } },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => state.props[k] || null }) },
    TAB: { people: 'people' }, read: () => ({ rows: [state.owner] }), isOwner_: r => r === state.owner,
    postSavePerson_: (b, f, v) => { state.owner[f] = v; state.saves++; return out(JSON.stringify({ success: true })); },
  };
  return new Function(...Object.keys(env), src)(...Object.values(env));
}
function site() {
  const js = text('js/map.js'), form = text('js/form.js');
  return new Function('text_', lineOf(form, 'CLASH_DAYS', 'js/form.js') + fnOf(form, 'clashDays_', 'js/form.js') + fnOf(form, 'clashMin_', 'js/form.js') + ORDER.map(n => lineOf(js, n, 'js/map.js')).join('')
    + ['dkOccur_', 'dkSlot_', 'dkSort_', 'dkLeaves_', 'dkOption_', 'dkTitle_', 'dkWhen_', 'dkNowNextOf_', 'dkSay_'].map(n => fnOf(js, n, 'js/map.js')).join('')
    + 'return { dkNowNextOf_, dkSay_, dkLeaves_ };')(text_);
}
const DAY = '2026-11-25';
const ITEMS = () => [{ title: 'Read a made-up book' }, { title: 'Brush teeth', repeat: '8h' }, { title: 'Shower', repeat: '8h', doneOn: DAY + '/1' },
  { title: 'Made-up late', date: '2026-11-20' }, { title: 'Made-up soon', date: '2026-11-30' }];
function run() {
  const bad = [], TOKEN = 'a'.repeat(32) + 'b'.repeat(32), S = site();
  const make = (at, lists, mut) => { const state = { now: DAY + ' ' + at, props: { DOCKET_TOKEN: TOKEN }, saves: 0, owner: { person_id: 'p1', todo: JSON.stringify({ v: 1, lists: lists || [{ name: 'Docket', items: ITEMS() }] }) } };
    return { state, be: backend(state, mut) }; };
  const ask = (k, q) => k.be.docketAddress_(q).getContent();
  const items = k => JSON.parse(k.state.owner.todo).lists[0].items;
  const refused = text_('err-docket-token');
  let n = 0;
  /* NO TOKEN, AN EMPTY ONE, A WRONG ONE, ONE A CHARACTER SHORT: refused, and nothing saved. */
  [{}, { docket: '' }, { docket: 'x'.repeat(64) }, { docket: TOKEN.slice(1) }, { do: 'done', what: 'shower' }].forEach(q => {
    const k = make('07:10'); n++;
    const got = ask(k, q);
    if (got !== refused || k.state.saves) bad.push('a read with ' + JSON.stringify(q) + ' was answered: ' + got);
  });
  if (ask(make('07:10'), { docket: TOKEN }) === refused) bad.push('the right token is refused');
  /* THE READ SAYS WHAT THE SITE SHOWS, at three clock times (Shower is back in the 12:00 cycle). */
  ['07:10', '13:00', '18:30'].forEach(at => {
    const k = make(at), want = S.dkSay_(S.dkNowNextOf_(ITEMS(), DAY + ' ' + at)), got = ask(k, { docket: TOKEN }); n++;
    if (got !== want || k.state.saves) bad.push(at + ': the address says "' + got + '", the site "' + want + '"');
  });
  /* OVERDUE IS NO REASON TO GO FIRST (the plan, owner 27 Nov): the missed one-off is said last, never next. */
  if (!/^Docket: Read a made-up book next, 4 left\.$/.test(ask(make('07:10'), { docket: TOKEN }))) bad.push('at 07:10 the overdue item is first, or the count is wrong');
  /* THE OWNER'S LEAVE TIMES ARE THE BACKEND'S TOO: an outing (an event away from home) at 10:00 keeps the laundry (it must stay home an hour) off the top at 09:30. */
  { const k = make('09:30', [{ name: 'Docket', items: [{ title: 'Laundry', repeat: '8h', minutes: 5, runs: 60, stay: true, place: 'home' }, { title: 'Floss', repeat: '8h', minutes: 2 },
    { title: 'Made-up outing', start: DAY + 'T10:00', minutes: 120, place: 'out' }] }]); n++;
    const lone = make('09:30', [{ name: 'Docket', items: [{ title: 'Laundry', repeat: '8h', minutes: 5, runs: 60, stay: true, place: 'home' }, { title: 'Floss', repeat: '8h', minutes: 2 }] }]);
    if (ask(k, { docket: TOKEN }) !== 'Docket: Floss next, 3 left.' || ask(lone, { docket: TOKEN }) !== 'Docket: Laundry next, 2 left.') bad.push('the address does not read the owner\'s leave times'); }
  /* THE SAME ORDER WITHIN NOW (runs, the minutes it runs by itself, most first): the address names the laundry first. */
  { const k = make('13:00', [{ name: 'Docket', items: [{ title: 'Floss', repeat: '8h' }, { title: 'Laundry', repeat: '8h', runs: 60 }, { title: 'Charge batteries', repeat: '8h', runs: 120 }] }]); n++;
    if (ask(k, { docket: TOKEN }) !== 'Docket: Charge batteries next, 3 left.') bad.push('the address does not put the longest-running Now item first'); }
  /* "DONE SHOWER" at 13:00: the shower is ticked for this cycle, saved, and the answer is the new order. */
  { const k = make('13:00'); n++;
    const got = ask(k, { docket: TOKEN, do: 'done', what: 'Shower' }), sh = items(k).find(i => i.title === 'Shower');
    const want = text_('dk-say-ticked', { title: 'Shower' });
    if (!sh || sh.doneOn !== DAY + '/2' || k.state.saves !== 1 || got !== want) bad.push('"done shower" did not tick the shower: ' + got); }
  /* "DONE" WITH NOTHING THAT MATCHES: nothing ticked, nothing saved. */
  { const k = make('13:00'); n++;
    if (ask(k, { docket: TOKEN, do: 'done', what: 'zebra' }).indexOf(text_('dk-say-no-match', { what: 'zebra' })) !== 0 || k.state.saves) bad.push('"done zebra" ticked something'); }
  /* SEVERAL IN ONE `what` (Siri, 26 Nov): each rule a function of a mutation of the served source; every mutation must break at least one. */
  const AND = text_('dk-say-and'), T = t => text_('dk-say-ticked', { title: t }), A = t => text_('dk-say-already', { title: t }), N = w => text_('dk-say-no-match', { what: w });
  const DAY8 = () => [{ title: 'Water', repeat: '8h' }, { title: 'Protein', repeat: '8h' }, { title: 'Floss', repeat: '8h' }, { title: 'Shower', repeat: '8h', doneOn: DAY + '/2' }, { title: 'Read a made-up book' }];
  const MULTI = [
    ['commas and "and": three ticked, one sentence', mut => { const k = make('13:00', [{ name: 'Docket', items: DAY8() }], mut), got = ask(k, { docket: TOKEN, do: 'done', what: 'water, protein and floss' });
      return got === T('Water, Protein ' + AND + ' Floss') && items(k).slice(0, 3).every(i => i.doneOn === DAY + '/2') && k.state.saves === 1; }],
    ['&, plus and a new line split too', mut => { const k = make('13:00', [{ name: 'Docket', items: DAY8() }], mut), got = ask(k, { docket: TOKEN, do: 'done', what: 'water & protein plus book\nfloss' });
      return got === T('Water, Protein, Read a made-up book ' + AND + ' Floss') && items(k)[4].done === true; }],
    ['one not found is named, the rest ticked', mut => { const k = make('13:00', [{ name: 'Docket', items: DAY8() }], mut), got = ask(k, { docket: TOKEN, do: 'done', what: 'water and flos' });
      return got === T('Water') + ' ' + N('flos') && !items(k)[2].doneOn && k.state.saves === 1; }],
    ['already done this cycle: said so, not re-ticked, nothing saved', mut => { const k = make('13:00', [{ name: 'Docket', items: DAY8() }], mut), got = ask(k, { docket: TOKEN, do: 'done', what: 'shower' });
      return got === A('Shower') && k.state.saves === 0; }],
    ['done last cycle counts as open again', mut => { const k = make('18:30', [{ name: 'Docket', items: DAY8() }], mut), got = ask(k, { docket: TOKEN, do: 'done', what: 'shower' });
      return got === T('Shower') && items(k)[3].doneOn === DAY + '/3'; }],
    ['the same thing twice: ticked once, then already done', mut => { const k = make('13:00', [{ name: 'Docket', items: DAY8() }], mut), got = ask(k, { docket: TOKEN, do: 'done', what: 'water, shower and water' });
      return got === T('Water') + ' ' + A('Shower'); }],
    ['nothing found at all: nothing saved', mut => { const k = make('13:00', [{ name: 'Docket', items: DAY8() }], mut), got = ask(k, { docket: TOKEN, do: 'done', what: 'zebra, yak' });
      return got === N('zebra ' + AND + ' yak') && k.state.saves === 0; }],
  ];
  MULTI.forEach(([name, f]) => { n++; let ok = false; try { ok = f(); } catch (e) { ok = false; } if (!ok) bad.push('several in one what: ' + name); });
  const MUTS = [
    ['no "and" split', s => s.replace('|\\band\\b', '')], ['no comma split', s => s.replace('(?:,|&', '(?:&')], ['no & split', s => s.replace(',|&|', ',|')],
    ['no plus split', s => s.replace('|\\bplus\\b', '')], ['no new-line split', s => s.replace('|\\n|', '|')],
    ['re-tick what is done', s => s.replace('if (d < 0) missed.push(w);', 'if (d < 0) missed.push(w); else { dkTick_(items, done[d], true, now); changed = true; }')],
    ['already done said as not found', s => s.replace('const done = items.map((it, i) => i).filter(i => items[i] && dkIsDone_(items[i], now))', 'const done = []')],
    ['missed dropped', s => s.replace("missed.length ? text_('dk-say-no-match', { what: list(missed) }) : ''", "''")],
    ['only the first part', s => s.replace('.map(w => w.trim()).filter(Boolean),', '.map(w => w.trim()).filter(Boolean).slice(0, 1),')],
    ['list joined without "and"', s => s.replace("' ' + text_('dk-say-and') + ' '", "', '")],
  ];
  MUTS.forEach(([name, mut]) => { n++; const src = text('backend/post-account.gs');
    if (mut(src) === src) { bad.push('mutation "' + name + '" no longer applies to the served source'); return; }
    const missed = MULTI.every(([, f]) => { try { return f(mut); } catch (e) { return false; } });
    if (missed) bad.push('mutation "' + name + '" of docketAnswer_ not caught'); });
  /* "ADD MILK": an undated one-off at the end of the one list, whatever `list` says; an older two-list cell is saved as one list. */
  { const k = make('07:10', [{ name: 'Every 8 hours', items: [{ title: 'Floss', repeat: '8h' }] }, { name: '@ Desk', items: [{ title: 'Desk thing' }] }]); n++;
    const got = ask(k, { docket: TOKEN, do: 'add', what: 'milk', list: 'shopping' }), L = JSON.parse(k.state.owner.todo).lists;
    if (L.length !== 1 || L[0].name !== 'Docket' || L[0].items.map(i => i.title).join('|') !== 'Floss|Desk thing|milk' || L[0].items[2].repeat || L[0].items[2].date
      || k.state.saves !== 1 || got.indexOf(text_('dk-say-added', { title: 'milk', name: 'Docket' })) !== 0) bad.push('"add milk" did not add to the one list: ' + got); }
  /* do=list (the desk e-paper screen, tools/docket-screen): `docket-list`, then each item in the site's order, "- " the open and later, "! " the missed (last);
     nothing saved; a wrong token is still refused (the screen then keeps its last list). Two clock times and the all-done list. */
  ['07:10', '18:30'].forEach(at => { const k = make(at), m = S.dkNowNextOf_(ITEMS(), DAY + ' ' + at); n++;
    const want = ['docket-list'].concat(m.rows.map(r => (r.missed ? '! ' : '- ') + r.title)).join('\n'), got = ask(k, { docket: TOKEN, do: 'list' });
    if (got !== want || k.state.saves || !/^docket-list\n- [\s\S]*\n! Made-up late$/.test(got)) bad.push(at + ': do=list says ' + JSON.stringify(got) + ', the site ' + JSON.stringify(want)); });
  { const k = make('13:00', [{ name: 'Docket', items: [{ title: 'Done one', done: true, doneOn: DAY }] }]); n++;
    if (ask(k, { docket: TOKEN, do: 'list' }) !== 'docket-list') bad.push('do=list with nothing open is not the heading alone'); }
  { n++; if (ask(make('13:00'), { docket: 'x'.repeat(64), do: 'list' }) !== refused) bad.push('do=list answered a wrong token'); }
  /* do=options IS GONE: it reads as a plain read, changing nothing. */
  { const k = make('07:10'); n++;
    if (ask(k, { docket: TOKEN, do: 'options' }) !== ask(make('07:10'), { docket: TOKEN }) || k.state.saves) bad.push('do=options still answers something of its own'); }
  console.log('docket-address: ' + n + ' asks of the private address on a made-up day; ' + bad.length + ' wrong');
  report('docket-address', bad, 'private-address answer(s) wrong');
  return { n, bad: bad.length };
}
module.exports = { run };
main(module, run);
