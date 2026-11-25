#!/usr/bin/env node
/* @family. — tools/docket-slots.js FOOD SLOTS (rule 1.75; owner 23 Nov): a Docket item may name a food slot (Protein, Fruit…) in place of a fixed food;
   the Foods list (data/settings/foods.json) tags each option with the slot(s) it fills, and a slot's `need` is how many a day it wants (Fruit 3).
   Run in the backend vm (tools/lib/backend-vm.js) on a made-up docket shaped like the owner's: docketSlots23NovRun_ turns the morning's food items into
   the five morning slots and the evening's into Meat and Carbs (backup tab first), losing no title or note; a slot shows its options (dkSlotOptions_, and
   the private address's do=options); every slot has options and a count; every old food title survives as an option; the takeaway fills Meat and
   Carbs; a second run is a no-op. THE SAME SLOTS AT EVERY MEAL (owner, 24 Nov): foods.json's three meals each name Protein, Carbs, Dairy, Veg and
   Fruit (Grain merged into Carbs, its options kept); docketMeals24NovRun_ then gives the morning, midday and evening lists those five slot items each,
   a food item giving way to its slot (its title in the note), backup tab first, nothing lost, a re-run a no-op; each rule proved by mutation.
   ONE MEAL CYCLE (owner, 25 Nov): docketMealCycle25NovRun_ gives each meal list the fifteen daily items in order, reusing ones it has, Shopping in no
   other list; run twice, the second a no-op; each rule proved by mutation. Data only for now (owner, 23 Nov): the tick is the one tick, unchanged. Counted: every rule. Run by tools/build.js. */
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

/* THE DAY PLAN'S FAULT: three meals, each naming Protein, Carbs, Dairy, Veg and Fruit, every name a slot; Snack only at lunch */
const SAME = ['Protein', 'Carbs', 'Dairy', 'Veg', 'Fruit'];
function mealsFault(F) {
  if (!Array.isArray(F.meals) || F.meals.map(m => m.name).join() !== 'Breakfast,Lunch,Dinner') return 'not Breakfast, Lunch, Dinner';
  const bad = F.meals.find(m => !SAME.every(x => m.slots.includes(x)) || !m.slots.every(t => F.slots.some(x => x.name === t)));
  if (bad) return bad.name + ' is ' + bad.slots.join();
  if (F.meals.find(m => m.name === 'Lunch').slots.join() !== SAME.concat(['Snack']).join()) return 'Lunch is not the five and Snack';
  return '';
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
    () => !!mealsFault(Object.assign({}, FOODS, { meals: FOODS.meals.map(x => (x.name === 'Dinner' ? { name: 'Dinner', slots: ['Protein', 'Carbs', 'Veg'] } : x)) })),
    () => !!grainFault(Object.assign({}, FOODS, { slots: FOODS.slots.concat([{ name: 'Grain', need: 1 }]) })),
    () => !!grainFault(Object.assign({}, FOODS, { foods: FOODS.foods.filter(f => f.name !== 'Bread') })),
    () => !MEAL_RULES[5][1](Object.assign({}, m, { backup: null })),
    () => !MEAL_RULES[6][1](Object.assign({}, m, { again: '1 change(s)' })),
  ].map((f, i) => (f() ? -1 : 'x' + i)).filter(i => i !== -1);
  return missed.concat(other);
}

/* ONE MEAL CYCLE (owner, 25 Nov): docketMealCycle25NovRun_ after the 24 Nov job, the same fifteen in order at every meal */
const CYCLE = ['Jesus prayer', 'Glass of water', 'Shopping', 'Protein', 'Carbs', 'Dairy', 'Veg', 'Fruit', 'Wash up', 'Brush teeth', '10-minute tidy', 'Short walk', 'Exercise set', 'Charge batteries', 'Check the Docket'];
const SETS = ['push-ups', 'pull-ups', 'sit-ups'], REUSED = ['brush teeth', 'Brush teeth', 'Charge batteries', 'Small tidy room', 'Put away dishes', 'clean room', 'Shopping'];
const cyc = i => CYCLE.includes(i.title), find = (lists, n, t) => itemsOf(lists, n).find(i => i.title === t) || {};
const CYCLE_RULES = [
  ['each meal list holds the fifteen, in order, together, each once and daily; Shopping and the exercise set carry their notes', m => MEAL_LISTS.every((n, k) => {
    const its = itemsOf(m.after, n), at = its.findIndex(cyc), blk = its.slice(at, at + CYCLE.length);
    return at >= 0 && blk.map(i => i.title).join() === CYCLE.join() && its.filter(cyc).length === CYCLE.length && blk.every(i => i.repeat === 'daily')
      && /^only what's missing for the next meal/.test(find(m.after, n, 'Shopping').note) && new RegExp('^' + SETS[k]).test(find(m.after, n, 'Exercise set').note); })],
  ['the five food slot items are the ones that were there, untouched', m => MEAL_LISTS.every(n => SAME.every(x =>
    JSON.stringify(itemsOf(m.before, n).find(i => i.slot === x)) === JSON.stringify(itemsOf(m.after, n).find(i => i.slot === x))))],
  ['no Shopping in any other list, and the backup row says what went', m => m.after.filter(L => !MEAL_LISTS.includes(L.name)).every(L => !L.items.some(i => /^(shopping|morning shop)$/i.test(i.title)))
    && !!m.backup && /After brush teeth: Shopping — milk/.test(m.backup.v[0][2])],
  ['an item that is one of the fifteen is reused (was: …, minutes and place kept), not doubled', m => find(m.after, 'Out of Shower', 'Brush teeth').minutes === 2
    && /was: brush teeth/.test(find(m.after, 'Out of Shower', 'Brush teeth').note) && find(m.after, 'Out of Shower', 'Charge batteries').place === 'home'
    && find(m.after, '@ Desk', '10-minute tidy').minutes === 5 && /was: Small tidy room/.test(find(m.after, '@ Desk', '10-minute tidy').note)
    && /was: Put away dishes/.test(find(m.after, '@ Desk', 'Wash up').note) && /was: clean room/.test(find(m.after, 'arrived home', '10-minute tidy').note)
    && find(m.after, 'arrived home', 'Brush teeth').place === 'bathroom' && /bread/.test(find(m.after, 'arrived home', 'Shopping').note)],
  ['nothing else moved or went: every other item as it was, in its order, in its list', m => m.before.every(L => {
    const meal = MEAL_LISTS.includes(L.name), keep = L.items.filter(i => (meal ? !cyc(i) && !REUSED.includes(i.title) : !/^(shopping|morning shop)$/i.test(i.title)));
    return JSON.stringify(keep) === JSON.stringify(itemsOf(m.after, L.name).filter(i => !meal || !cyc(i))); }) && m.after.length === m.before.length],
  ['the backup tab holds the old cell, first and once', m => !!m.backup && m.backup.v.length === 1 && m.backup.v[0][1] === m.was],
  ['a second run is a no-op', m => /nothing to do/.test(m.again) && m.cellAgain === m.cell],
];
function proveCycle(m) {
  const cp = o => JSON.parse(JSON.stringify(o)), L = (lists, n) => lists.find(x => x.name === n);
  const breaks = [
    a => { const x = L(a, '@ Desk').items, i = x.findIndex(t => t.title === 'Wash up'); x.splice(i, 2, x[i + 1], x[i]); },
    a => { L(a, 'arrived home').items.find(i => i.slot === 'Veg').note = 'changed'; },
    a => { L(a, 'After brush teeth').items.push({ title: 'Shopping' }); },
    a => { L(a, 'Out of Shower').items.find(i => i.title === 'Brush teeth').minutes = 15; },
    a => { L(a, 'arrived home').items = L(a, 'arrived home').items.filter(i => i.title !== 'kettle'); },
    a => { L(a, 'Out of Shower').items.push({ title: 'Glass of water', repeat: 'daily' }); },
    a => { L(a, '@ Desk').items.find(i => i.title === 'Exercise set').note = 'push-ups'; },
    a => { L(a, 'eyes opend').items = []; },
  ];
  const missed = breaks.map((b, i) => { const a = cp(m.after); b(a); return CYCLE_RULES.some(([, f]) => { try { return !f(Object.assign({}, m, { after: a })); } catch (e) { return true; } }) ? -1 : i; }).filter(i => i >= 0);
  const other = [() => !CYCLE_RULES[5][1](Object.assign({}, m, { backup: null })), () => !CYCLE_RULES[6][1](Object.assign({}, m, { again: 'Out of Shower each hold' }))]
    .map((f, i) => (f() ? -1 : 'x' + i)).filter(i => i !== -1);
  return missed.concat(other);
}

function world() {
  const ctx = load({ at: true, google: { Utilities: { formatDate: (d, tz, f) => (f === 'yyyy-MM-dd' ? DAY : DAY + ' 10:00'), getUuid: () => 'u' } } }), B = book();
  const person = { person_id: 'P-OWN', role: 'admin', first_name: 'Made', last_name: 'Up', email: OWNER, todo: JSON.stringify({ v: 1, lists: DOCKET() }) };
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
  let w, said, out, again, cellAfter, cellAgain, m1, m2, mealCell, mealAgain, c1, c2, cycCell, cycAgain;
  try {
    w = world(); said = w.run(); cellAfter = w.cell(); out = JSON.parse(cellAfter).lists;
    again = w.run(); cellAgain = w.cell();
    m1 = w.meals(); mealCell = w.cell(); m2 = w.meals(); mealAgain = w.cell();
    c1 = w.cycle(); cycCell = w.cell(); c2 = w.cycle(); cycAgain = w.cell();
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
      ['the day plan: every meal\'s slots are slots, and every meal has the same five (Protein, Carbs, Dairy, Veg, Fruit)', () => mealsFault(FOODS) === ''],
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
    const cyc25 = { before: JSON.parse(mealCell).lists, after: JSON.parse(cycCell).lists, backup: w.B.tabs.backup_docket_cycle_25nov, was: mealCell, again: c2, cellAgain: cycAgain, cell: cycCell };
    checks.push(['the 25 Nov meal cycle ran (' + c1 + ')', () => /each hold/.test(c1)], ['meal cycle: under DOCKET_CELL_MAX', () => cycCell.length <= w.ctx.$('DOCKET_CELL_MAX')]);
    CYCLE_RULES.forEach(([name, f]) => checks.push(['meal cycle: ' + name, () => f(cyc25)]));
    checks.push(['meal cycle: proved by mutation, ' + CYCLE_RULES.length + ' rules each catch their break', () => { const p = proveCycle(cyc25); if (p.length) console.log('missed', p); return p.length === 0; }]);
  }
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (e) { ok = false; } if (!ok) bad.push(name); });
  console.log('docket-slots: ' + checks.length + ' rules through docketSlots23NovRun_, foods.json and the address' + (said ? ' (' + said + ')' : '') + '; ' + bad.length + ' broken'
    + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('docket-slots', bad, 'food slot rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
