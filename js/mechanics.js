/* ================= MECHANICS (548, 570): A PLAIN DATABASE OF PARTS AND CARS, A CARD EACH, IN THE LIBRARY ================= */
/* data/mechanics/: two small files, parts and cars (650), asked for when a finder paints (as pdtexts' index is); each card's words are on the card. */

const MECH = { data: null, asking: null, failed: false, items: null, from: null };
const MECH_FILES = { parts: 'Part', models: 'Car' };
const MECH_SUBJECT = 'Mechanics';

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
    /* A ROW IS A CARD ONLY WITH AN ID AND A SYSTEM (check-mechanics): any other `parts` list, the payload's, is not ours. */
    const ours = r => r && r.id && r.system;
    names.forEach((n, i) => { d[n] = all[i] && Array.isArray(all[i][n]) ? all[i][n].filter(ours) : []; });
    if (!names.some(n => d[n].length)) { MECH.failed = true; return null; }
    MECH.data = d;
    /* A SOURCE THAT CAME LATE joins the list at the next paint, as the writings' do (520). */
    if (typeof stuffForget_ === 'function') stuffForget_();
    if (typeof finderEach_ === 'function') finderEach_(F => { if ($(F.id + '-controls')) paintStuff(true); });
    return d;
  });
  return null;
}

/* ONE ITEM A ROW: the facets read its own fields (`mSystem`, `mEngine`), and a row answers only what it has. */
function mechItems_() {
  const d = MECH.data;
  if (!d) return [];
  if (MECH.items && MECH.from === d) return MECH.items;
  const list = [];
  Object.keys(MECH_FILES).forEach(file => (d[file] || []).forEach(r => {
    list.push({
      kind: 'mech', mKind: MECH_FILES[file], mFile: file, key: 'mech:' + r.id, name: r.name, subject: MECH_SUBJECT, image: '', row: null,
      text: [r.name, r.system, r.make, r.model, r.engine, r.does, r.part_no].filter(Boolean).join(' '),
      /* ONE CAR, THE CLIO (740): a car card answers its engine, a part every engine it fits, so Part › Engine narrows to one engine's parts. */
      mSystem: file === 'parts' ? (r.system || '') : '', mEngine: file === 'parts' ? (r.engines || []) : (r.engine || ''),
      mech: r,
    });
  }));
  MECH.items = list; MECH.from = d;
  return list;
}

/* MINIMAL (740): a car is brand, model, years, engine; a part what it is, its example number, its price and the engines it fits. No pictures. */
function mechCard_(x) {
  const r = x.mech || {};
  const row = (k, v) => v ? `<p><b>${esc(k)}</b> ${esc(v)}</p>` : '';
  const rows = x.mFile === 'models'
    ? row('Car', [r.make, r.model, r.years].filter(Boolean).join(' · ')) + row('Engine', r.engine)
    : row('What it is', r.does) + row('Part number (example)', r.part_no) + row('Typical price (approximate)', r.value) + row('Fits', r.fits);
  return `<div class="card fc tx" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="tx-body"><h3>${esc(x.name)}</h3><div class="tx-text">${rows}</div></div>
  </div>`;
}
/* A CAR'S PARTS ARE A FIND (650): Part with this engine chosen, on the card's one row (`CARD_EXTRAS_`). */
function mechExtras_(x) { const r = x.mech || {}; return x.mFile === 'models' && r.engine ? { icon: 'search', label: 'Parts', note: 'every part for the ' + r.name, act: 'mech-parts', data: { engine: r.engine } } : null; }
CARD_EXTRAS_.mech = mechExtras_;

on('mech-parts', el => finderSet_(finderAt_(el), { filters: [{ field: 'kindLabel', value: 'Library' }, { field: 'subject', value: MECH_SUBJECT },
  { field: 'mKind', value: 'Part' }, { field: 'mEngine', value: el.dataset.engine }] }));
