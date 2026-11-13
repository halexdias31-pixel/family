/* ================= MECHANICS (548, batch E): CARS, CAR PARTS AND PC PARTS, A CARD EACH, IN THE LIBRARY ================= */
/* data/mechanics/: three files written by tools/mech_rows.py (cars, car parts, PC parts), asked for when a finder paints. */
/* Every attribute is its own tag (owner, 6 Nov): a card is its tags, its 8-bit drawing and, for a part, one line of what it does. */

const MECH = { data: null, asking: null, failed: false, items: null, from: null };
const MECH_FILES = { parts: 'Part', models: 'Car', pc: 'PC part' };
const MECH_SUBJECT = 'Mechanics';
/* THE PC PARTS ARE COMPUTER SCIENCE'S, on their own shelf (teaching a build). */
const MECH_FILE_SUBJECT = { pc: 'Computer Science' };
const MECH_FILE_SHELF = { pc: 'PC parts' };
/* A CAR'S ATTRIBUTES, a facet each; a part answers them through the cars it fits. */
const MECH_CAR = { mMake: 'make', mModel: 'model', mGen: 'gen', mEngine: 'code', mPhase: 'phase', mMarket: 'market', mYears: 'years',
  mSize: 'size', mValves: 'valves', mBadge: 'badge', mFuel: 'fuel' };
const MECH_PART = 'Car part', MECH_ONE = 'Car';

function mechIndex_() {
  if (MECH.data) return MECH.data;
  if (MECH.asking || MECH.failed || typeof fetch !== 'function') return null;
  const stamp = deployStamp_();
  const get = f => Promise.resolve().then(() => fetch('data/mechanics/' + f + '.json' + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null).catch(() => null);
  const names = Object.keys(MECH_FILES);
  MECH.asking = Promise.all(names.map(get)).then(all => {
    MECH.asking = null;
    const d = {};
    /* A ROW IS A CARD ONLY WITH AN ID AND A NAME (check-mechanics): any other `parts` list, the payload's, is not ours. */
    const ours = r => r && r.id && r.name && Array.isArray(r.px);
    names.forEach((n, i) => { d[n] = all[i] && Array.isArray(all[i][n]) ? all[i][n].filter(ours) : []; });
    if (!names.some(n => d[n].length)) { MECH.failed = true; return null; }
    MECH.data = d;
    MECH.cars = new Map(d.models.map(c => [c.code, c]));
    /* A SOURCE THAT CAME LATE joins the list at the next paint, as the writings' do (520). */
    if (typeof lateCame_ === 'function') lateCame_();
    return d;
  });
  return null;
}

function mechItems_() {
  const d = MECH.data;
  if (!d) return [];
  if (MECH.items && MECH.from === d) return MECH.items;
  const list = [];
  Object.keys(MECH_FILES).forEach(file => (d[file] || []).forEach(r => {
    list.push({
      kind: 'mech', mKind: MECH_FILES[file], mFile: file, key: 'mech:' + r.id, name: r.name, image: '', row: null,
      subject: MECH_FILE_SUBJECT[file] || MECH_SUBJECT, shelf: MECH_FILE_SHELF[file] || '',
      text: [r.name, r.system, r.does, r.type, r.socket].concat(r.iface || [], r.links || [], file === 'models' ? Object.values(r).filter(v => typeof v === 'string' && v.length < 20) : []).filter(Boolean).join(' '),
      mSystem: r.system || '', mech: r,
    });
  }));
  MECH.items = list; MECH.from = d;
  return list;
}

/* THE CHOSEN CAR FILTERS, Find's own (two finders, one list: `STUFF` is the one being asked). */
function mechChosen_() {
  const out = [];
  ((typeof STUFF !== 'undefined' && STUFF && STUFF.filters) || []).forEach(f => {
    if (f && !f.any && MECH_CAR[f.field]) out.push([MECH_CAR[f.field], spellKey_(f.value)]);
  });
  return out;
}
/* A CAR ATTRIBUTE OF A CARD: a car's own; a part's, every car it fits that the chosen answers leave. */
function mechFit_(x, field) {
  if (!x || x.kind !== 'mech') return '';
  const k = MECH_CAR[field], r = x.mech || {};
  if (x.mFile === 'models') return r[k] || '';
  if (x.mFile !== 'parts') return '';
  const chosen = mechChosen_(), out = [];
  (r.fits || []).forEach(code => {
    const c = MECH.cars && MECH.cars.get(code);
    if (c && c[k] && chosen.every(([ck, v]) => spellKey_(c[ck] || '') === v) && out.indexOf(c[k]) < 0) out.push(c[k]);
  });
  return out;
}
/* ON A PART'S CARD a car's tags are said only for the car chosen: thirty fitments would bury what the part is. */
function mechFitTag_(x, field) { return x && x.mFile === 'parts' && !mechChosen_().length ? '' : mechFit_(x, field); }
/* THE FIRST MECHANICS QUESTION (owner, 7 Nov): Car or Car part; a part still answers the cars it fits after. */
function mechScope_(x) { return !x || x.kind !== 'mech' || x.mFile === 'pc' ? '' : x.mFile === 'models' ? MECH_ONE : MECH_PART; }
const mechOwn_ = (x, file, k) => (x && x.kind === 'mech' && x.mFile === file && x.mech[k]) || '';

/* A CARD IS ITS TAGS AND ITS DRAWING; a part adds one line of what it does. No title: the name is a tag. */
function mechPic_(x) { return `<figure class="mech-pic">${pixSvg_(x.mech.px, x.name, false, ' mech-px')}</figure>`; }
cardKind_('mech', x => { const r = x.mech || {};
  return { look: 'mech', picture: Array.isArray(r.px) ? { svg: mechPic_(x), alt: x.name } : null, tags: typeof tagList_ === 'function' && x.key ? tagList_(x) : [], body: r.does ? [{ type: 'text', text: r.does, look: 'mech-does' }] : [] }; });
/* A CAR'S PARTS ARE A FIND (650): its every part, Car part chosen and the car's make, model and engine (`CARD_EXTRAS_`). */
function mechExtras_(x) { const r = x.mech || {}; return x.mFile === 'models' && r.code ? { icon: 'search', label: 'Parts', note: 'every part for this car', act: 'mech-parts', data: { engine: r.code } } : null; }
window.CARD_EXTRAS_MORE = Object.assign(window.CARD_EXTRAS_MORE || {}, { mech: mechExtras_ });

on('mech-parts', el => {
  const c = (MECH.cars && MECH.cars.get(el.dataset.engine)) || {};
  finderSet_(finderAt_(el), { filters: [{ field: 'kindLabel', value: 'Library' }, { field: 'subject', value: MECH_SUBJECT },
    { field: 'mScope', value: MECH_PART }, { field: 'mMake', value: c.make || '' }, { field: 'mModel', value: c.model || '' },
    { field: 'mEngine', value: el.dataset.engine }, { field: 'mKind', value: 'Part' }].filter(f => f.value) });
});
