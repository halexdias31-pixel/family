/* ================= CHEMISTRY (550): ELEMENTS, SUBSTANCES AND REACTIONS, A CARD EACH, IN THE LIBRARY ================= */
/* data/chemistry/: three files asked for when a finder paints, as mechanics' are (548); groundwork for a lab simulator. */

const CHEM = { data: null, asking: null, failed: false, items: null, from: null };
const CHEM_FILES = { elements: 'Element', substances: 'Substance', reactions: 'Reaction' };
const CHEM_SUBJECT = 'Chemistry';

/* A ROW IS A CARD ONLY WITH AN ID AND A SOURCE (check-chemistry). */
const chemIndex_ = () => libFilesIndex_(CHEM, 'chemistry', CHEM_FILES, r => r && r.id && r.source);

/* ONE ITEM A ROW: Card type is `mKind`, the Library's one card-type question (548); the rest read the row's own fields. */
function chemItems_() {
  const d = CHEM.data;
  if (!d) return [];
  if (CHEM.items && CHEM.from === d) return CHEM.items;
  const list = [];
  Object.keys(CHEM_FILES).forEach(file => (d[file] || []).forEach(r => {
    list.push({
      kind: 'chem', mKind: CHEM_FILES[file], key: 'chem:' + r.id, name: r.name, subject: CHEM_SUBJECT, image: '', row: null,
      text: [r.name, r.symbol, r.also, r.formula, r.category, r.type, r.use, r.pattern].filter(Boolean).join(' '),
      cCategory: r.category || r.type || '', cGroup: r.group || '', cPeriod: r.period || '', cState: r.state || '',
      chem: r,
    });
  }));
  CHEM.items = list; CHEM.from = d;
  return list;
}


/* ================= FOOD (owner, 18 Nov): data/settings/foods.json's kind tree, read once here for both of its readers — Find › Library
   (a card a kind and a card a food) and Docket (an item named for a kind offers its foods as tags). ================= */
const FOOD = { data: null, asking: null, failed: false, items: null };
function foodIndex_() {
  if (FOOD.data) return FOOD.data;
  if (FOOD.asking || FOOD.failed || typeof fetch !== 'function') return null;
  FOOD.asking = Promise.resolve(dataFile_('data/settings/foods.json')).then(d => {
    FOOD.asking = null;
    if (!d || !Array.isArray(d.kinds) || !Array.isArray(d.foods)) { FOOD.failed = true; return null; }
    FOOD.data = d;
    if (typeof lateCame_ === 'function') lateCame_();
    if (typeof dkPaint_ === 'function') dkPaint_();
    return d;
  }).catch(() => { FOOD.asking = null; FOOD.failed = true; return null; });
  return null;
}
/* A KIND BY ANY OF ITS SPELLINGS, case and a plural `s` forgiven. */
const foodSay_ = t => String(t || '').trim().toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ');
function foodKindOf_(title) {
  const d = foodIndex_(), t = foodSay_(title);
  if (!d || !t) return null;
  return d.kinds.find(k => [k.name, k.id].concat(k.spellings || []).some(s => { const w = foodSay_(s); return w === t || w + 's' === t || w === t + 's'; })) || null;
}
/* A KIND'S PATH ("Protein › Meat") and its foods, its children's included. */
const foodPath_ = k => { const d = FOOD.data, out = []; for (let at = k, n = 0; at && n < 9; n++) { out.unshift(at.name); at = d.kinds.find(p => p.id === at.parent); } return out.join(' › '); };
function foodsOf_(k) {
  const d = FOOD.data; if (!d || !k) return [];
  const ids = [k.id];
  for (let i = 0; i < ids.length; i++) d.kinds.forEach(c => { if (c.parent === ids[i] && ids.indexOf(c.id) < 0) ids.push(c.id); });
  return d.foods.filter(f => ids.indexOf(f.kind) >= 0);
}
/* FIND'S ITEMS: a card a kind (its foods its tags) and a card a food (its kind's path its tag). */
function foodItems_() {
  const d = foodIndex_();
  if (!d) return [];
  if (FOOD.items) return FOOD.items;
  const byId = {}; d.kinds.forEach(k => { byId[k.id] = k; });
  FOOD.items = d.kinds.map(k => ({ kind: 'fooddb', key: 'fooddb:k:' + k.id, name: k.name, image: '', row: null,
    text: [k.name].concat(k.spellings || []).join(' '), food: { name: k.name, path: foodPath_(k), foods: foodsOf_(k).map(f => f.name) } }))
    .concat(d.foods.filter(f => f.kind).map(f => ({ kind: 'fooddb', key: 'fooddb:f:' + foodSay_(f.name).replace(/ /g, '-'), name: f.name, image: '', row: null,
      text: f.name + ' ' + (byId[f.kind] ? byId[f.kind].name : ''), food: { name: f.name, path: byId[f.kind] ? foodPath_(byId[f.kind]) : '', note: f.note || '' } })));
  return FOOD.items;
}
