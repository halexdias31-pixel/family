/* ================= MECHANICS (548): PARTS, MODELS, JOBS AND SYMPTOMS, A CARD EACH, IN THE LIBRARY ================= */
/* data/mechanics/: four small files asked for when a finder paints (as pdtexts' index is); each card's words are on the card. */

const MECH = { pix: null, svg: {}, data: null, asking: null, failed: false, items: null, from: null };
const MECH_FILES = { parts: 'Part', models: 'Model', fits: 'Parts list', jobs: 'Job', symptoms: 'Symptom' };
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
    /* A ROW IS A CARD ONLY WITH AN ID AND A SYSTEM (check-mechanics): any other `jobs` or `parts` list, the payload's, is not ours. */
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
  const list = [];
  Object.keys(MECH_FILES).forEach(file => (d[file] || []).forEach(r => {
    list.push({
      kind: 'mech', mKind: MECH_FILES[file], mFile: file, key: 'mech:' + r.id, name: r.name, subject: MECH_SUBJECT, image: '', row: null,
      text: [r.name, r.system, r.make, r.model, r.engine, r.does, r.signs].filter(Boolean).join(' '),
      mSystem: r.system || '', mMake: r.make || '', mModel: r.model || '', mEngine: r.engine || '', mDifficulty: r.difficulty || '',
      mech: r,
    });
  }));
  MECH.items = list; MECH.from = d;
  return list;
}

/* WHOSE PICTURE: a part's or car's own; a parts list the car's; a job or symptom its first named part's, else the car's. */
function mechPicKey_(r, file) {
  const byName = n => ((MECH.data && MECH.data.parts) || []).find(p => p.name === n);
  const car = r.model ? 'car:' + r.model : '';
  if (file === 'parts') return r.id;
  if (file === 'models' || file === 'fits') return car;
  const first = byName([].concat(r.parts || [], r.causes || [])[0]);
  return first ? first.id : car;
}

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

/* ONE LINE PER THING (421): label and value rows, then where the facts came from. */
function mechCard_(x) {
  const r = x.mech || {};
  const row = (k, v) => v ? `<p><b>${esc(k)}</b> ${esc(Array.isArray(v) ? v.join(', ') : v)}</p>` : '';
  const rows = [
    row('Car', r.make ? [r.make, r.model, r.years].filter(Boolean).join(' · ') : ''),
    row('What it does', r.does), row('Signs of wear', r.signs), row('Interval', r.interval),
    row('Difficulty', r.difficulty), row('Time', r.time), row('Tools', r.tools),
    (r.facts || []).map(f => row(f[0], f[1])).join(''),
    r.steps ? '<ol>' + r.steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' : '',
    row('Likely causes', r.causes), row('Parts', r.parts), row('Check first', r.check),
  ].join('');
  return `<div class="card fc tx" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="tx-body">${mechPic_(r, x.mFile)}<h3>${esc(x.name)}</h3><div class="tx-text">${rows}</div><p class="wt-credit">${esc(r.source || '')}</p></div>
  </div>`;
}
