#!/usr/bin/env node
/* @family. — tools/docket-slots.js FOOD SLOTS (rule 1.75; owner 23 Nov): a Docket item may name a food slot (Protein, Fruit…) in place of a fixed food;
   the Foods list (data/settings/foods.json) tags each option with the slot(s) it fills, and a slot's `need` is how many a day it wants (Fruit 3).
   Run in the backend vm (tools/lib/backend-vm.js) on a made-up docket shaped like the owner's: docketSlots23NovRun_ turns the morning's food items into
   the five morning slots and the evening's into Meat and Carbs (backup tab first), losing no title or note; a slot shows its options (dkSlotOptions_, and
   the private address's do=options); every slot has options and a count; every old food title survives as an option; the takeaway fills Meat and
   Carbs; a second run is a no-op. Data only for now (owner, 23 Nov): the tick is the one tick, unchanged. Counted: every rule. Run by tools/build.js. */
'use strict';
const { report, main } = require('./lib/gen.js');
const { load, book } = require('./lib/backend-vm.js');
const FOODS = require('../data/settings/foods.json');

const OWNER = 'owner@example.test', DAY = '2026-11-20', TAKE = 'Peter\'s Takeaway: sweet and sour chicken with rice box';
const MORNING = ['Protein', 'Fruit', 'Dairy', 'Grain', 'Pack for later'];
/* THE OWNER'S OLD FOOD ITEMS (and the foods named in them), each to be an option of its slot. */
const OLD_FOODS = { Protein: ['Bacon', 'Meat pasty from the shop', 'Eggs', 'Baked beans', 'Tuna', 'Whey shake', 'Sausages'], Fruit: ['Banana', 'Apple', 'Strawberries', 'Dates', 'Avocado'],
  Dairy: ['Plain yoghurt', 'Müller Corner (chocolate balls)', 'Milk', 'Chia on yoghurt'], Grain: ['Cereal', 'Bread'], 'Pack for later': ['Nuts', 'Popcorn', 'Tuna salad', 'Sandwich'],
  Snack: ['Popcorn', 'Nuts', 'Apple', 'Banana', 'Strawberries', 'Dates'], Meat: ['Salmon', 'Smoked salmon', 'Beef', 'Chicken', 'Tuna', 'Eggs'], Carbs: ['Rice', 'Ready-made sushi rice', 'Bread', 'Cereal'] };
const it = (title, x) => Object.assign({ title }, x || {});
const DOCKET = () => [
  { name: 'eyes opend', items: [it('Jesus prayer', { repeat: 'daily' })] },
  { name: 'Out of Shower', start: '07:00', items: [it('Jesus prayer', { repeat: 'daily' }), it('Breakfast', { repeat: 'daily', minutes: 15, note: 'Pick from: banana, Chia, Beans, Whey!' }),
    it('banana', { repeat: 'daily' }), it('Hot food: bacon, or a hot pasty from the corner shop', { repeat: 'daily', minutes: 10 }),
    it('Take your packed food to work', { repeat: 'daily', note: 'Packed the night before' })] },
  { name: 'After brush teeth', items: [it('Yoghurt!', { repeat: 'daily', note: 'the big pot' }), it('get dressed', { repeat: 'daily' })] },
  { name: '@ Desk', start: '12:00', items: [it('reply to messages')] },
  { name: 'arrived home', start: '18:00', items: [it('Meat!', { repeat: 'daily' }), it('Rice', { repeat: 'daily', note: 'brown if any' }),
    it(TAKE, { repeat: 'daily', covers: ['Meat!', 'Rice'] }), it('kettle')] },
  { name: 'undercovers', items: [it('Evening prayers', { repeat: 'daily' })] },
];

function world() {
  const ctx = load({ at: true, google: { Utilities: { formatDate: (d, tz, f) => (f === 'yyyy-MM-dd' ? DAY : DAY + ' 10:00'), getUuid: () => 'u' } } }), B = book();
  const person = { person_id: 'P-OWN', role: 'admin', first_name: 'Made', last_name: 'Up', email: OWNER, todo: JSON.stringify({ v: 1, lists: DOCKET() }) };
  B.tabs.items = B.sheet('items', [['id', 'kind', 'data_1'], ['owner_email', 'setting', JSON.stringify({ key: 'owner_email', value: OWNER })],
    ['P-OWN', 'person', JSON.stringify(person)]]);
  ctx.findSheet_ = at => B.tabs[at.names[0]] || null;
  B.tabs.items.getParent = () => B.ss;
  const cell = () => JSON.parse(B.tabs.items.v.find(r => r[0] === 'P-OWN')[2]).todo;
  return { ctx, B, cell, run: () => { ctx.clearCache(); return ctx.docketSlots23NovRun_(); } };
}

function run() {
  const bad = [], checks = [];
  let w, said, out, again, cellAfter, cellAgain;
  try {
    w = world(); said = w.run(); cellAfter = w.cell(); out = JSON.parse(cellAfter).lists;
    again = w.run(); cellAgain = w.cell();
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
      ['the day plan: every meal\'s slots are slots (Lunch: Protein, Carbs, Veg, Snack; Dinner: Protein, Carbs, Veg)', () => FOODS.meals.length === 3
        && FOODS.meals.every(m => m.slots.length && m.slots.every(t => FOODS.slots.some(x => x.name === t)))
        && FOODS.meals.find(m => m.name === 'Lunch').slots.join() === 'Protein,Carbs,Veg,Snack' && FOODS.meals.find(m => m.name === 'Dinner').slots.join() === 'Protein,Carbs,Veg'],
      ['the rush options each fill several slots (porridge, pasty, meal deal, takeaway, doner kebab, pizza)', () => { const r = FOODS.foods.filter(f => f.rush);
        return r.length === 6 && r.every(f => f.slots.length >= 2) && /Supermarket meal deal/.test(r.map(f => f.name).join()) && /Doner kebab/.test(r.map(f => f.name).join()) && FOODS.foods.some(f => f.quick && /microwave sushi rice/i.test(f.name) && f.slots.includes('Carbs')); }],
      ['one option fills two slots: the takeaway is Meat and Carbs', () => ['Meat', 'Carbs'].every(x => w.ctx.$('dkSlotOptions_')(FOODS, x).some(f => f.name === TAKE))],
      ['the private address reads a slot\'s options with its count, and changes nothing', () => { const r = say({ do: 'options', slot: 'fruit' }); return !r.changed && /^Fruit \(pick 3 a day\): .*Banana/.test(r.say); }],
      ['the private address lists the slots', () => { const r = say({ do: 'options' }); return !r.changed && MORNING.concat(['Snack', 'Meat', 'Carbs', 'Veg']).every(x => r.say.includes(x)); }],
      ['slot kept by listTidy_, as-is and whole', () => ['as-is', 'whole'].every(hw => w.ctx.listTidy_('docket', [by('Fruit')], hw)[0].slot === 'Fruit')],
      ['a second run is a no-op', () => /nothing to do/.test(again) && cellAgain === cellAfter && w.B.tabs.backup_docket_slots_23nov.v.length === 1],
      ['under DOCKET_CELL_MAX', () => cellAfter.length <= w.ctx.$('DOCKET_CELL_MAX')]);
  }
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (e) { ok = false; } if (!ok) bad.push(name); });
  console.log('docket-slots: ' + checks.length + ' rules through docketSlots23NovRun_, foods.json and the address' + (said ? ' (' + said + ')' : '') + '; ' + bad.length + ' broken'
    + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('docket-slots', bad, 'food slot rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
