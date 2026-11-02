/* ================= MECHANICS (548, 570): A PLAIN DATABASE OF PARTS AND CARS, A CARD EACH, IN THE LIBRARY ================= */
/* data/mechanics/: two small files, parts and cars (650), asked for when a finder paints (as pdtexts' index is); each card's words are on the card. */

const MECH = { pix: null, svg: {}, data: null, asking: null, failed: false, items: null, from: null };
const MECH_FILES = { parts: 'Part', models: 'Car' };
const MECH_SUBJECT = 'Mechanics';

function mechIndex_() {
  if (MECH.data) return MECH.data;
  if (MECH.asking || MECH.failed || typeof fetch !== 'function') return null;
  const stamp = deployStamp_();
  const get = f => Promise.resolve().then(() => fetch('data/mechanics/' + f + '.json' + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null).catch(() => null);
  const names = Object.keys(MECH_FILES);
  /* THE PICTURES (tools/mech_pixels.py) come with the cards; a card without them still draws its words. */
  get('pixels').then(p => { MECH.pix = p && p.images && p.palette ? p : null; MECH.svg = {}; });
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

/* ONE ITEM A ROW: the facets read its own fields (`mSystem`…), and a row answers only what it has. */
function mechItems_() {
  const d = MECH.data;
  if (!d) return [];
  if (MECH.items && MECH.from === d) return MECH.items;
  const list = [], brandOf = {};
  (d.models || []).forEach(m => { if (m.car && m.make) brandOf[m.car] = m.make; });
  Object.keys(MECH_FILES).forEach(file => (d[file] || []).forEach(r => {
    list.push({
      kind: 'mech', mKind: MECH_FILES[file], mFile: file, key: 'mech:' + r.id, name: r.name, subject: MECH_SUBJECT, image: '', row: null,
      text: [r.name, r.system, r.make, r.model, r.car, r.engine, r.does, r.part_no].filter(Boolean).join(' '),
      /* BRAND THEN MODEL (650): a car card's own; a part's the cars it fits (`cars`), so Part › Brand › Model narrows to one car's parts by the one rule; a car asks no System. */
      mSystem: file === 'parts' ? (r.system || '') : '', mEngine: r.engine || '',
      mMake: file === 'parts' ? [...new Set((r.cars || []).map(c => brandOf[c]).filter(Boolean))] : (r.make || ''),
      mModel: file === 'parts' ? (r.cars || []) : (r.car || ''),
      mech: r,
    });
  }));
  MECH.items = list; MECH.from = d;
  return list;
}

/* WHOSE PICTURE: a part's own; a car card the car's. */
const mechPicKey_ = (r, file) => file === 'parts' ? r.id : r.model ? 'car:' + r.model : '';

/* 64 ROWS OF PALETTE LETTERS → one inline SVG, a rect a run, drawn crisp (image-rendering: pixelated). */
function mechPic_(r, file) {
  const P = MECH.pix, key = mechPicKey_(r, file), rows = P && P.images[key];
  if (!rows) return '';
  if (MECH.svg[key]) return MECH.svg[key];
  let out = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const ch = row[x]; let e = x;
      while (e < row.length && row[e] === ch) e++;
      if (P.palette[ch]) out += `<rect x="${x}" y="${y}" width="${e - x}" height="1" fill="${P.palette[ch]}"/>`;
      x = e;
    }
  });
  return (MECH.svg[key] = `<svg class="mech-pic" viewBox="0 0 64 64" shape-rendering="crispEdges" aria-hidden="true">${out}</svg>`);
}

/* ONE LINE PER THING (421): label and value rows, then where the facts came from. A number and a price are marked as examples (570). */
function mechCard_(x) {
  const r = x.mech || {};
  const row = (k, v) => v ? `<p><b>${esc(k)}</b> ${esc(Array.isArray(v) ? v.join(', ') : v)}</p>` : '';
  const rows = [
    row('Car', r.make ? [r.make, r.model, r.years].filter(Boolean).join(' · ') : ''),
    row('What it is', r.does), row('Fits', r.fits), row('Part number (example)', r.part_no), row('Typical price (approximate)', r.value),
    (r.facts || []).map(f => row(f[0], f[1])).join(''),
  ].join('');
  /* A CAR'S PARTS ARE A FIND, not a list card (650): Part with this car chosen. */
  const tiles = x.mFile === 'models' && r.car ? `<div class="tile-row">${tile_({ icon: 'search', label: 'Parts', note: 'every part for the ' + [r.make, r.car].join(' '), act: 'mech-parts', data: { make: r.make, car: r.car } })}</div>` : '';
  return `<div class="card fc tx" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="tx-body">${mechPic_(r, x.mFile)}<h3>${esc(x.name)}</h3><div class="tx-text">${rows}</div><p class="wt-credit">${esc(r.source || '')}</p></div>
    ${tiles}
  </div>`;
}

on('mech-parts', el => finderSet_(finderAt_(el), { filters: [{ field: 'kindLabel', value: 'Library' }, { field: 'subject', value: MECH_SUBJECT },
  { field: 'mKind', value: 'Part' }, { field: 'mMake', value: el.dataset.make }, { field: 'mModel', value: el.dataset.car }] }));
