#!/usr/bin/env node
/* @family. — tools/docket-slots.js FOOD SLOTS (rule 1.75; owner 23 Nov): a Docket item may name a food slot (Protein, Fruit…) in place of a fixed food;
   the Foods list (data/settings/foods.json) tags each option with the slot(s) it fills, and a slot's `need` is how many a day it wants (Fruit 3).
   Run in the backend vm (tools/lib/backend-vm.js) on a made-up docket shaped like the owner's: docketSlots23NovRun_ turns the morning's food items into
   the five morning slots and the evening's into Meat and Carbs (backup tab first), losing no title or note; a slot shows its options (dkSlotOptions_, and
   the private address's do=options); every slot has options and a count; every old food title survives as an option; the takeaway fills Meat and
   Carbs; a second run is a no-op. THE SAME SLOTS AT EVERY MEAL (owner, 24 Nov): foods.json's three meals each name Protein, Carbs, Dairy, Veg and
   Fruit (Grain merged into Carbs, its options kept); docketMeals24NovRun_ then gives the morning, midday and evening lists those five slot items each,
   a food item giving way to its slot (its title in the note), backup tab first, nothing lost, a re-run a no-op; each rule proved by mutation.
   THE DOCKET IN TWO LISTS (owner, 25 Nov evening): docketMealCycle25NovRun_, on its own made-up docket, leaves "Every 8 hours" (the 21 cycle items in
   order, each ticked once a third of the day: dkOn_, checked browser-free; Prayer and Exercise slots, Prayer's options private in the cell) and "@ Desk"
   (every one-off); the rest removed, named in the backup row; no prayer named in the repo; run twice, the second a no-op; each rule proved by mutation. Data only for now (owner, 23 Nov): the tick is the one tick, unchanged. Counted: every rule. Run by tools/build.js. */
'use strict';
const { report, main } = require('./lib/gen.js');
const { load, book } = require('./lib/backend-vm.js');
const FOODS = require('../data/settings/foods.json');

const OWNER = 'owner@example.test', DAY = '2026-11-20', TAKE = 'Peter\'s Takeaway: sweet and sour chicken with rice box';
const MORNING = ['Protein', 'Fruit', 'Dairy', 'Grain', 'Pack for later'];
/* THE OWNER'S OLD FOOD ITEMS (and the foods named in them), each to be an option of its slot. */
const OLD_FOODS = { Protein: ['Bacon', 'Meat pasty from the shop', 'Eggs', 'Baked beans', 'Tuna', 'Whey shake', 'Sausages'], Fruit: ['Banana', 'Apple', 'Strawberries', 'Dates', 'Avocado'],
  Dairy: ['Plain yoghurt', 'Müller Corner (chocolate balls)', 'Milk', 'Chia on yoghurt'], Carbs: ['Cereal', 'Bread', 'Rice', 'Ready-made sushi rice'], 'Pack for later': ['Nuts', 'Popcorn', 'Tuna salad', 'Sandwich'],
  Snack: ['Popcorn', 'Nuts', 'Apple', 'Banana', 'Strawberries', 'Dates'], Meat: ['Salmon', 'Smoked salmon', 'Beef', 'Chicken', 'Tuna', 'Eggs'] };
const it = (title, x) => Object.assign({ title }, x || {});
const DOCKET = () => [
  { name: 'eyes opend', items: [it('Jesus prayer', { repeat: 'daily' })] },
  { name: 'Out of Shower', start: '07:00', items: [it('Jesus prayer', { repeat: 'daily' }), it('Breakfast', { repeat: 'daily', minutes: 15, note: 'Pick from: banana, Chia, Beans, Whey!' }),
    it('banana', { repeat: 'daily' }), it('Hot food: bacon, or a hot pasty from the corner shop', { repeat: 'daily', minutes: 10 }),
    it('Take your packed food to work', { repeat: 'daily', note: 'Packed the night before' }), it('brush teeth', { repeat: 'daily', minutes: 2 }), it('Charge batteries', { place: 'home' })] },
  { name: 'After brush teeth', items: [it('Yoghurt!', { repeat: 'daily', note: 'the big pot' }), it('get dressed', { repeat: 'daily' }), it('Shopping', { repeat: 'daily', note: 'milk' })] },
  { name: '@ Desk', start: '12:00', items: [it('reply to messages'), it('Small tidy room', { minutes: 5 }), it('Put away dishes')] },
  { name: 'arrived home', start: '18:00', items: [it('Meat!', { repeat: 'daily' }), it('Rice', { repeat: 'daily', note: 'brown if any' }),
    it(TAKE, { repeat: 'daily', covers: ['Meat!', 'Rice'] }), it('kettle'), it('clean room'), it('Brush teeth', { place: 'bathroom' }), it('Shopping', { note: 'bread' })] },
  { name: 'undercovers', items: [it('Evening prayers', { repeat: 'daily' })] },
];

/* ONE SOURCE FOR THE CYCLE (owner, 25 Nov evening): the meals collapsed into the one 8-hour cycle (backend DK_CYCLE), so foods.json keeps no `meals`;
   every food slot the cycle names is a foods.json slot. */
const SAME = ['Protein', 'Carbs', 'Dairy', 'Veg', 'Fruit'];
function mealsFault(F) {
  if (F.meals) return 'foods.json still has meals';
  const miss = SAME.concat(['Exercise']).filter(x => !F.slots.some(y => y.name === x));
  return miss.length ? 'not slots: ' + miss.join() : '';
}
const GRAIN_WAS = ['Bread', 'Cereal', 'Meat pasty from the shop', 'Porridge'];
function grainFault(F) {
  if (F.slots.some(x => x.name === 'Grain')) return 'a Grain slot';
  if (F.foods.some(f => (f.slots || []).includes('Grain'))) return 'a food tagged Grain';
  const lost = GRAIN_WAS.filter(n => !F.foods.some(f => f.name === n && (f.slots || []).includes('Carbs')));
  return lost.length ? 'not Carbs: ' + lost.join() : '';
}
/* THE DOCKET AFTER docketMeals24NovRun_: the meal lists, by start time */
const MEAL_LISTS = ['Out of Shower', '@ Desk', 'arrived home'];
const itemsOf = (lists, n) => ((lists || []).find(x => x.name === n) || { items: [] }).items;
const textOf = lists => (lists || []).flatMap(x => x.items).map(i => (i.title || '') + '\n' + (i.note || '')).join('\n');
const MEAL_RULES = [
  ['the morning, midday and evening lists each hold one daily Protein, Carbs, Dairy, Veg and Fruit slot item', m => MEAL_LISTS.every(n => SAME.every(x =>
    itemsOf(m.after, n).filter(i => i.slot === x).length === 1 && itemsOf(m.after, n).some(i => i.slot === x && i.title === x && i.repeat === 'daily')))],
  ['no Grain or Meat slot is left; Snack and Pack for later stay where they were', m => !m.after.some(L => L.items.some(i => /^(grain|meat)$/i.test(i.slot || '')))
    && itemsOf(m.after, '@ Desk').some(i => i.slot === 'Snack') && itemsOf(m.after, 'Out of Shower').some(i => i.slot === 'Pack for later')],
  ['a food item gives way to its slot: no Rice or Meat! left, their titles in the slot\'s note', m => !m.after.some(L => L.items.some(i => /^(rice|meat!)$/i.test(i.title)))
    && /was: Rice — brown if any/.test((itemsOf(m.after, 'arrived home').find(i => i.slot === 'Carbs') || {}).note) && /was: Meat!/.test((itemsOf(m.after, 'arrived home').find(i => i.slot === 'Protein') || {}).note)],
  ['nothing lost: every old title and note is in a title or a note, and no other list changed', m => m.before.every(L => L.items.every(i => textOf(m.after).includes(i.title) && (!i.note || textOf(m.after).includes(i.note))))
    && m.before.filter(L => !MEAL_LISTS.includes(L.name)).every(L => JSON.stringify(L) === JSON.stringify(m.after.find(x => x.name === L.name)))],
  ['the takeaway still covers what it covered, by the new titles', m => { const t = itemsOf(m.after, 'arrived home').find(i => i.title === TAKE); return !!t && !t.slot && t.covers.join() === 'Protein,Carbs'; }],
  ['the backup tab holds the old cell, first and once', m => !!m.backup && m.backup.v.length === 1 && m.backup.v[0][1] === m.was],
  ['a second run is a no-op', m => /nothing to do/.test(m.again) && m.cellAgain === m.cell],
];
/* EACH MEAL RULE MUST CATCH ITS BREAK, made in memory */
function proveMeals(m) {
  const cp = o => JSON.parse(JSON.stringify(o)), L = (lists, n) => lists.find(x => x.name === n);
  const breaks = [
    a => { L(a, 'arrived home').items = L(a, 'arrived home').items.filter(i => i.slot !== 'Dairy'); },
    a => { L(a, '@ Desk').items.find(i => i.slot === 'Carbs').slot = 'Grain'; },
    a => { L(a, 'arrived home').items.push({ title: 'Rice', repeat: 'daily' }); },
    a => { L(a, 'Out of Shower').items.forEach(i => { if (i.slot === 'Carbs') i.note = ''; }); },
    a => { L(a, 'arrived home').items.find(i => i.title === TAKE).covers = ['Meat!', 'Rice']; },
  ];
  const missed = breaks.map((b, i) => { const a = cp(m.after); b(a); return MEAL_RULES.some(([, f]) => { try { return !f(Object.assign({}, m, { after: a })); } catch (e) { return true; } }) ? -1 : i; }).filter(i => i >= 0);
  const other = [
    () => !!mealsFault(Object.assign({}, FOODS, { meals: [{ name: 'Dinner', slots: SAME }] })) && !!mealsFault(Object.assign({}, FOODS, { slots: FOODS.slots.filter(x => x.name !== 'Exercise') })),
    () => !!grainFault(Object.assign({}, FOODS, { slots: FOODS.slots.concat([{ name: 'Grain', need: 1 }]) })),
    () => !!grainFault(Object.assign({}, FOODS, { foods: FOODS.foods.filter(f => f.name !== 'Bread') })),
    () => !MEAL_RULES[5][1](Object.assign({}, m, { backup: null })),
    () => !MEAL_RULES[6][1](Object.assign({}, m, { again: '1 change(s)' })),
  ].map((f, i) => (f() ? -1 : 'x' + i)).filter(i => i !== -1);
  return missed.concat(other);
}

const find = (lists, n, t) => itemsOf(lists, n).find(i => i.title === t) || {};
/* ONE MEAL CYCLE (owner, 25 Nov evening): docketMealCycle25NovRun_ on a made-up docket shaped like the owner's after the 24 Nov job (prayer-only
   lists, prayer items with long notes, the old routine items, one-offs, an Overdue list). Its prayers are MADE UP: no real prayer is named here. */
const CYCLE = ['Prayer', 'Glass of water', 'Shopping', 'Protein', 'Carbs', 'Dairy', 'Veg', 'Fruit', 'Wash up', 'Floss', 'Brush teeth', '10-minute tidy', 'Short walk',
  'Exercise', 'Shower', 'Minox', 'Laundry', 'Young Giants', 'Read 5 minutes', 'Charge batteries', 'Check the Docket'];
const PRAYERS = { 'Prayer One': 'made-up text one, long enough to be a prayer', 'Litany Two': 'made-up text two', 'Night prayer': 'made-up text three' };
const EXERCISE = ['Jog', 'Push-ups', 'Pull-ups and curls', 'OHP and dips', 'Sit-ups', 'Helms rows and RDL'];
const GONE = ['Remind myself about promise', 'Uni', 'Sandwhich', 'Carb ish', 'Take your packed food to work', 'Pack for later', 'screw in laptop', 'Philosophy time', 'Push-ups',
  'yg', 'laundrey', 'Pack tomorrow\'s food for work', 'Lay out clothes and bag for tomorrow', 'Add floss add brush teeth add shower', 'Helms rows and RDL', 'Remind yourself about it',
  'read church father righting', 'Bible', 'do a web review wholy', 'Plan getting to work without the car', 'floss', 'Put away dishes'];
const slots5 = () => SAME.map(x => it(x, { repeat: 'daily', slot: x }));
const CYC_DOCKET = () => [
  { name: 'eyes opend', items: [it('Prayer One', { repeat: 'daily', note: PRAYERS['Prayer One'] }), it('Litany Two', { repeat: 'daily', note: PRAYERS['Litany Two'] })] },
  { name: 'Out of Shower', start: '07:00', items: [it('Prayer One', { repeat: 'daily' }), ...slots5(), it('Pack for later', { repeat: 'daily', slot: 'Pack for later' }),
    it('Take your packed food to work', { repeat: 'daily' }), it('brush teeth', { repeat: 'daily', minutes: 2 }), it('Charge batteries', { repeat: 'daily', place: 'home' }),
    it('shower', { repeat: 'daily' }), it('minox', { repeat: 'daily' }), it('Remind myself about promise', { repeat: 'daily' }), it('Uni', { repeat: 'daily' }),
    it('Sandwhich', { repeat: 'daily' }), it('Carb ish', { repeat: 'daily' }), it('get dressed', { repeat: 'daily' })] },
  { name: 'After brush teeth', items: [it('Shopping', { repeat: 'daily', note: 'milk' }), it('floss', { repeat: 'daily' }), it('Push-ups', { repeat: 'daily' }),
    it('Bible', { repeat: 'daily' }), it('Litany Two', { repeat: 'daily' })] },
  { name: '@ Desk', start: '12:00', items: [...slots5(), it('Snack', { repeat: 'daily', slot: 'Snack' }), it('reply to messages'), it('Small tidy room', { repeat: 'daily', minutes: 5 }),
    it('Put away dishes', { repeat: 'daily' }), it('screw in laptop'), it('Philosophy time', { repeat: 'daily' }), it('Instrument', { repeat: 'daily' })] },
  { name: 'arrived home', start: '18:00', items: [...slots5(), it(TAKE, { repeat: 'daily', covers: ['Protein', 'Carbs'] }), it('kettle', { repeat: 'daily' }),
    it('clean room', { repeat: 'daily' }), it('Brush teeth', { repeat: 'daily', place: 'bathroom' }), it('Shopping', { repeat: 'daily', note: 'bread' }), it('yg', { repeat: 'daily' }),
    it('laundrey', { repeat: 'daily' }), it('Pack tomorrow\'s food for work', { repeat: 'daily' }), it('Lay out clothes and bag for tomorrow', { repeat: 'daily' }),
    it('Add floss add brush teeth add shower', { repeat: 'daily' }), it('Helms rows and RDL', { repeat: 'daily' }), it('Remind yourself about it', { repeat: 'daily' }),
    it('read church father righting', { repeat: 'daily' })] },
  { name: 'undercovers', items: [it('Night prayer', { repeat: 'daily', note: PRAYERS['Night prayer'] })] },
  { name: 'Overdue — check', items: [it('Renew passport', { date: '2026-11-01' })] },
  { name: 'Weekend', items: [it('Uni open day', { note: 'one-off' }), it('do a web review wholy', { repeat: 'daily' }), it('Plan getting to work without the car', { repeat: 'daily' })] },
];
/* NO PRAYER IN THE REPO: the code and settings are scanned, two and three words at a time, against the hashes of the owner's prayers' distinctive phrases
   (so this file does not name them either). */
const PRAYER_HASHES = ['f32995b352045208', '3ff699530f8672e0', '3b5e7f844019850b', '8396db0f7c08e87b', '1845efa2fdd7bcde'];
function prayerLeaks(texts, hashes) {
  const crypto = require('crypto'), hit = [];
  Object.entries(texts).forEach(([f, s]) => { const w = String(s).toLowerCase().match(/[a-z]+/g) || [];
    for (let i = 0; i < w.length; i++) for (let n = 2; n <= 3 && i + n <= w.length; n++) {
      if ((hashes || PRAYER_HASHES).includes(crypto.createHash('sha256').update(w.slice(i, i + n).join(' ')).digest('hex').slice(0, 16))) hit.push(f); } });
  return [...new Set(hit)];
}
function repoTexts() {
  const { srcFiles, text } = require('./lib/gen.js'), out = {};
  srcFiles(['backend', 'js', 'data/settings'], /\.(gs|js|json|md|html)$/, { deep: true }).concat(srcFiles(['tools'], /^docket.*\.js$/)).forEach(f => { out[f] = text(f); });
  return out;
}
const titlesOf = lists => (lists || []).flatMap(L => L.items.map(i => i.title));
const EVERY = 'Every 8 hours';
const CYCLE_RULES = [
  ['two lists only: Every 8 hours and @ Desk', m => m.after.map(L => L.name).join() === EVERY + ',@ Desk'],
  ['Every 8 hours holds the 21, in order, each once, each repeating every 8 hours; Shopping and Read 5 minutes carry their notes', m => {
    const its = itemsOf(m.after, EVERY);
    return its.map(i => i.title).join() === CYCLE.join() && its.every(i => i.repeat === '8h')
      && /^only what's missing for the next meal/.test(find(m.after, EVERY, 'Shopping').note) && /^Bible or Church Fathers/.test(find(m.after, EVERY, 'Read 5 minutes').note); }],
  ['Prayer and Exercise are slot items, filled by ticking any option: Exercise\'s from foods.json, Prayer\'s from the private cell, each prayer\'s text kept', m => {
    const fd = m.ctx.$('dkFoodsWith_')(FOODS, m.cellObj.slots), opt = s => m.ctx.$('dkSlotOptions_')(fd, s), its = itemsOf(m.after, EVERY);
    return its.some(i => i.title === 'Prayer' && i.slot === 'Prayer') && its.some(i => i.title === 'Exercise' && i.slot === 'Exercise')
      && SAME.every(x => its.some(i => i.title === x && i.slot === x))
      && opt('Exercise').map(f => f.name).join() === EXERCISE.join() && Object.entries(PRAYERS).every(([k, v]) => opt('Prayer').some(f => f.name === k && f.note === v))
      && opt('Prayer').length === 3 && m.tickable(); }],
  ['the private Prayer options are in the cell only: not in foods.json nor the backend\'s DOCKET_FOODS, and no prayer item is left in a list', m =>
    !FOODS.slots.some(s => s.name === 'Prayer') && !m.ctx.$('DOCKET_FOODS').slots.some(s => s.name === 'Prayer')
    && !titlesOf(m.after).some(t => Object.keys(PRAYERS).includes(t)) && !JSON.stringify(FOODS).includes('made-up text')],
  ['every removed title is gone and named in the backup row (the other once-a-day items too); Sandwich and Carb ish are Carbs options', m => GONE.every(g => !titlesOf(m.after).includes(g))
    && !!m.backup && GONE.concat(Object.keys(PRAYERS), ['get dressed', 'kettle', 'Snack', TAKE, 'list arrived home']).every(g => m.backup.v[0][2].includes(g))
    && ['Sandwich', 'Carb ish'].every(n => m.ctx.$('dkSlotOptions_')(FOODS, 'Carbs').some(f => f.name === n))],
  ['@ Desk holds every one-off and only those, Instrument one now', m => { const d = itemsOf(m.after, '@ Desk');
    return d.map(i => i.title).join() === 'reply to messages,Instrument,Renew passport,Uni open day' && d.every(i => !i.repeat); }],
  ['an item that is one of the 21 is reused (was: …, minutes and place kept)', m => find(m.after, EVERY, 'Brush teeth').minutes === 2
    && /was: brush teeth/.test(find(m.after, EVERY, 'Brush teeth').note) && find(m.after, EVERY, 'Charge batteries').place === 'home'
    && /was: shower/.test(find(m.after, EVERY, 'Shower').note) && /was: minox/.test(find(m.after, EVERY, 'Minox').note)
    && /was: Put away dishes/.test(find(m.after, EVERY, 'Wash up').note) && /milk/.test(find(m.after, EVERY, 'Shopping').note)
    && /was: Small tidy room/.test(find(m.after, EVERY, '10-minute tidy').note) && /was: read church father|was: yg/.test(textOf(m.after))],
  ['every 8 hours: a tick holds for its third of the day and is back unticked in the next, through the one tick and the planner', m => m.thirds()],
  ['no prayer\'s name or text anywhere in the code or settings', m => m.leaks.length === 0],
  ['the backup tab holds the old cell and the removed titles, first and once', m => !!m.backup && m.backup.v.length === 1 && m.backup.v[0][1] === m.was && /^removed or merged \(\d+\)/.test(m.backup.v[0][2])],
  ['a second run is a no-op', m => /nothing to do/.test(m.again) && m.cellAgain === m.cell],
  ['under DOCKET_CELL_MAX', m => m.cell.length <= m.ctx.$('DOCKET_CELL_MAX')],
];
/* EVERY 8 HOURS, browser-free: dkOn_'s thirds, a tick through dkTick_ read back by dkPhase_ at later times; and map.js's dkDone_ reads it the same way. */
function thirdsOk(ctx, mapSrc) {
  const on = ctx.$('dkOn_'), tick = ctx.$('dkTick_'), phase = ctx.$('dkPhase_');
  const it = () => [{ title: 'Floss', repeat: '8h' }, { title: 'Minox', repeat: 'daily' }];
  if (on({ repeat: '8h' }, '2026-11-25 07:59') !== '2026-11-25/1' || on({ repeat: '8h' }, '2026-11-25 08:00') !== '2026-11-25/2' || on({ repeat: '8h' }, '2026-11-25 23:30') !== '2026-11-25/3') return false;
  if (on({ repeat: 'daily' }, '2026-11-25 23:30') !== '2026-11-25') return false;
  const x = it(); tick(x, 0, true, '2026-11-25 09:10'); tick(x, 1, true, '2026-11-25 09:10');
  const open = now => { const p = phase([{ name: EVERY, start: '00:00', items: x }], now); return p ? p.rows.map(r => x[r.i].title).join() : '?'; };
  return x[0].doneOn === '2026-11-25/2' && open('2026-11-25 15:59') === '' && open('2026-11-25 16:00') === 'Floss' && open('2026-11-26 00:10') === 'Floss,Minox'
    && /const dkDone_ = i => \(dkRep_\(i\) \? i\.doneOn === dkOn_\(i, dkNow_\(\)\)/.test(mapSrc) && /dkTick_\(dkList_\(\)\.items, \+el\.getAttribute\('data-dk'\), el\.checked, dkNow_\(\)\)/.test(mapSrc);
}
function proveCycle(m) {
  const cp = o => JSON.parse(JSON.stringify(o)), L = (lists, n) => lists.find(x => x.name === n), with_ = o => Object.assign({}, m, o);
  const breaks = [
    a => { const x = L(a, EVERY).items, i = x.findIndex(t => t.title === 'Floss'); x.splice(i, 2, x[i + 1], x[i]); },
    a => { L(a, EVERY).items.find(i => i.title === 'Exercise').slot = ''; },
    a => { L(a, EVERY).items.find(i => i.title === 'Laundry').repeat = 'daily'; },
    a => { L(a, '@ Desk').items.push({ title: 'Litany Two', repeat: 'daily' }); },
    a => { L(a, '@ Desk').items.push({ title: 'yg' }); },
    a => { L(a, '@ Desk').items.push({ title: 'kettle', repeat: 'daily' }); },
    a => { a.push({ name: 'eyes opend', items: [] }); },
    a => { L(a, EVERY).items.find(i => i.title === 'Brush teeth').minutes = 15; },
    a => { L(a, '@ Desk').items.find(i => i.title === 'Instrument').repeat = 'daily'; },
  ];
  const missed = breaks.map((b, i) => { const a = cp(m.after); b(a); return CYCLE_RULES.some(([, f]) => { try { return !f(with_({ after: a })); } catch (e) { return true; } }) ? -1 : i; }).filter(i => i >= 0);
  const priv = cp(m.cellObj.slots); priv[0].options[1].note = 'cut';
  const broken = Object.assign({}, m.ctx, { $: n => (n === 'dkOn_' ? (i, now) => String(now).slice(0, 10) : m.ctx.$(n)) });
  const other = [() => !CYCLE_RULES[2][1](with_({ cellObj: { slots: priv } })), () => !CYCLE_RULES[2][1](with_({ tickable: () => false })),
    () => !thirdsOk(broken, m.mapSrc) && !thirdsOk(m.ctx, m.mapSrc.replace('dkNow_())', 'dkDay_())')),
    () => prayerLeaks({ x: 'some made up words' }, [require('crypto').createHash('sha256').update('made up').digest('hex').slice(0, 16)]).length === 1 && !CYCLE_RULES[8][1](with_({ leaks: ['x'] })),
    () => !CYCLE_RULES[4][1](with_({ backup: { v: [[0, m.was, 'removed or merged (1): Uni']] } })),
    () => !CYCLE_RULES[9][1](with_({ backup: null })), () => !CYCLE_RULES[10][1](with_({ again: 'two lists' }))]
    .map((f, i) => (f() ? -1 : 'x' + i)).filter(i => i !== -1);
  return missed.concat(other);
}

function world(docket) {
  const ctx = load({ at: true, google: { Utilities: { formatDate: (d, tz, f) => (f === 'yyyy-MM-dd' ? DAY : DAY + ' 10:00'), getUuid: () => 'u' } } }), B = book();
  const person = { person_id: 'P-OWN', role: 'admin', first_name: 'Made', last_name: 'Up', email: OWNER, todo: JSON.stringify({ v: 1, lists: (docket || DOCKET)() }) };
  B.tabs.items = B.sheet('items', [['id', 'kind', 'data_1'], ['owner_email', 'setting', JSON.stringify({ key: 'owner_email', value: OWNER })],
    ['P-OWN', 'person', JSON.stringify(person)]]);
  ctx.findSheet_ = at => B.tabs[at.names[0]] || null;
  B.tabs.items.getParent = () => B.ss;
  const cell = () => JSON.parse(B.tabs.items.v.find(r => r[0] === 'P-OWN')[2]).todo;
  return { ctx, B, cell, run: () => { ctx.clearCache(); return ctx.docketSlots23NovRun_(); }, meals: () => { ctx.clearCache(); return ctx.docketMeals24NovRun_(); },
    cycle: () => { ctx.clearCache(); return ctx.docketMealCycle25NovRun_(); } };
}

function run() {
  const bad = [], checks = [];
  let w, w2, said, out, again, cellAfter, cellAgain, m1, m2, mealCell, mealAgain, c1, c2, cycCell, cycAgain;
  try {
    w = world(); said = w.run(); cellAfter = w.cell(); out = JSON.parse(cellAfter).lists;
    again = w.run(); cellAgain = w.cell();
    m1 = w.meals(); mealCell = w.cell(); m2 = w.meals(); mealAgain = w.cell();
    w2 = world(CYC_DOCKET); c1 = w2.cycle(); cycCell = w2.cell(); c2 = w2.cycle(); cycAgain = w2.cell();
  } catch (e) { console.log(e.stack); checks.push(['docketSlots23NovRun_ ran', () => false]); }
  if (out) {
    const all = out.flatMap(x => x.items), text = all.map(i => (i.title || '') + '\n' + (i.note || '')).join('\n');
    const by = t => all.find(i => i.title === t) || {}, L = n => (out.find(x => x.name === n) || { items: [] }).items;
    const say = (q, l) => w.ctx.docketAnswer_(l || JSON.parse(cellAfter).lists, DAY + ' 10:00', q, w.ctx.docketFill_);
    checks.push(
      ['the backup tab holds the old cell, first', () => { const bk = w.B.tabs.backup_docket_slots_23nov; return !!bk && bk.v.length === 1 && bk.v[0][1] === JSON.stringify({ v: 1, lists: DOCKET() }); }],
      ['nothing lost: every old title and note is in a title or a note', () => DOCKET().every(x => x.items.every(i => text.includes(i.title) && (!i.note || text.includes(i.note))))],
      ['the morning: five daily slots in Out of Shower, the food items gone, the rest kept', () => {
        const os = L('Out of Shower'); return JSON.stringify(os.filter(i => i.slot).map(i => i.slot)) === JSON.stringify(MORNING)
          && os.filter(i => i.slot).every(i => i.repeat === 'daily' && i.title === i.slot) && !os.some(i => /^(breakfast|banana|hot food)/i.test(i.title))
          && os.some(i => i.title === 'Take your packed food to work') && os.some(i => i.title === 'Jesus prayer')
          && !L('After brush teeth').some(i => i.title === 'Yoghurt!') && L('After brush teeth').some(i => i.title === 'get dressed'); }],
      ['each old morning item is kept in its slot\'s note; Pack for later says snack and lunch', () => /Yoghurt! — the big pot/.test(by('Dairy').note) && /banana/.test(by('Fruit').note)
        && /Hot food/.test(by('Protein').note) && /Breakfast — Pick from/.test(by('Grain').note) && /snack: nuts.*lunch: tuna salad, sandwich/.test(by('Pack for later').note)],
      ['the evening: Meat! and Rice are the Meat and Carbs slots where they stand', () => by('Meat!').slot === 'Meat' && by('Rice').slot === 'Carbs' && by('Rice').note === 'brown if any' && !by('kettle').slot && !by(TAKE).slot],
      ['one daily Snack slot, in the midday list', () => all.filter(i => i.slot === 'Snack').length === 1 && L('@ Desk').some(i => i.title === 'Snack' && i.slot === 'Snack' && i.repeat === 'daily')],
      ['every slot has options, and a count (Fruit 3, the rest 1)', () => FOODS.slots.every(x => w.ctx.$('dkSlotOptions_')(FOODS, x.name).length > 0)
        && w.ctx.$('dkSlotNeed_')(FOODS, 'fruit') === 3 && FOODS.slots.filter(x => x.name !== 'Fruit').every(x => w.ctx.$('dkSlotNeed_')(FOODS, x.name) === 1)],
      ['every option is tagged with slots that exist', () => FOODS.foods.filter(f => f.slots).every(f => f.slots.length && f.slots.every(t => FOODS.slots.some(x => x.name === t))) ],
      ['every old food title survives as an option, under the slot it filled', () => Object.entries(OLD_FOODS).every(([slot, names]) => names.every(n =>
        w.ctx.$('dkSlotOptions_')(FOODS, slot).some(f => f.name === n)))],
      ['one source for the cycle: foods.json has no meals, and the cycle\'s food and Exercise slots are its slots', () => mealsFault(FOODS) === ''],
      ['Grain merged into Carbs: no Grain slot, no food tagged Grain, every old Grain option a Carbs one', () => grainFault(FOODS) === ''],
      ['the rush options each fill several slots (porridge, pasty, meal deal, takeaway, doner kebab, pizza)', () => { const r = FOODS.foods.filter(f => f.rush);
        return r.length === 6 && r.every(f => f.slots.length >= 2) && /Supermarket meal deal/.test(r.map(f => f.name).join()) && /Doner kebab/.test(r.map(f => f.name).join()) && FOODS.foods.some(f => f.quick && /microwave sushi rice/i.test(f.name) && f.slots.includes('Carbs')); }],
      ['one option fills two slots: the takeaway is Meat and Carbs', () => ['Meat', 'Carbs'].every(x => w.ctx.$('dkSlotOptions_')(FOODS, x).some(f => f.name === TAKE))],
      ['the private address reads a slot\'s options with its count, and changes nothing', () => { const r = say({ do: 'options', slot: 'fruit' }); return !r.changed && /^Fruit \(pick 3 a day\): .*Banana/.test(r.say); }],
      ['the private address lists the slots', () => { const r = say({ do: 'options' }); return !r.changed && MORNING.filter(x => x !== 'Grain').concat(['Snack', 'Meat', 'Carbs', 'Veg']).every(x => r.say.includes(x)); }],
      ['slot kept by listTidy_, as-is and whole', () => ['as-is', 'whole'].every(hw => w.ctx.listTidy_('docket', [by('Fruit')], hw)[0].slot === 'Fruit')],
      ['a second run is a no-op', () => /nothing to do/.test(again) && cellAgain === cellAfter && w.B.tabs.backup_docket_slots_23nov.v.length === 1],
      ['under DOCKET_CELL_MAX', () => cellAfter.length <= w.ctx.$('DOCKET_CELL_MAX')]);
    const meals = { before: JSON.parse(cellAfter).lists, after: JSON.parse(mealCell).lists, backup: w.B.tabs.backup_docket_meals_24nov, was: cellAfter, again: m2, cellAgain: mealAgain, cell: mealCell };
    checks.push(['the 24 Nov job ran (' + m1 + ')', () => /change/.test(m1)]);
    MEAL_RULES.forEach(([name, f]) => checks.push(['every meal: ' + name, () => f(meals)]));
    checks.push(['every meal: proved by mutation, ' + MEAL_RULES.length + ' rules each catch their break', () => proveMeals(meals).length === 0]);
    const mapSrc = require('fs').readFileSync(require('path').join(__dirname, '../js/map.js'), 'utf8'), cobj = JSON.parse(cycCell);
    const tickable = () => /if \(it\.slot && it\.pick && !dkDone_\(it\)\) dkTick_\(/.test(mapSrc) && (() => { const x = [{ title: 'Prayer', slot: 'Prayer', repeat: 'daily' }];
      w2.ctx.$('dkTick_')(x, 0, true, DAY); return x[0].doneOn === DAY; })();
    const cyc25 = { ctx: w2.ctx, before: CYC_DOCKET(), after: cobj.lists, cellObj: cobj, backup: w2.B.tabs.backup_docket_cycle_25nov, was: JSON.stringify({ v: 1, lists: CYC_DOCKET() }),
      again: c2, cellAgain: cycAgain, cell: cycCell, tickable, mapSrc, thirds: () => thirdsOk(w2.ctx, mapSrc), leaks: prayerLeaks(repoTexts()) };
    checks.push(['the 25 Nov meal cycle ran (' + c1 + ')', () => /^two lists: Every 8 hours \(the 21-item cycle/.test(c1)]);
    CYCLE_RULES.forEach(([name, f]) => checks.push(['meal cycle: ' + name, () => f(cyc25)]));
    checks.push(['meal cycle: proved by mutation, ' + CYCLE_RULES.length + ' rules each catch their break', () => { const p = proveCycle(cyc25); if (p.length) console.log('missed', p); return p.length === 0; }]);
  }
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (e) { ok = false; } if (!ok) bad.push(name); });
  console.log('docket-slots: ' + checks.length + ' rules through docketSlots23NovRun_, foods.json and the address' + (said ? ' (' + said + ')' : '') + '; ' + bad.length + ' broken'
    + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('docket-slots', bad, 'food slot rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run, world, CYC_DOCKET };
main(module, run);
