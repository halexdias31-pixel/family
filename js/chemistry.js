/* ================= CHEMISTRY (550): ELEMENTS, SUBSTANCES AND REACTIONS, A CARD EACH, IN THE LIBRARY ================= */
/* data/chemistry/: three files asked for when a finder paints, as mechanics' are (548); groundwork for a lab simulator. */

const CHEM = { data: null, asking: null, failed: false, items: null, from: null };
const CHEM_FILES = { elements: 'Element', substances: 'Substance', reactions: 'Reaction' };
const CHEM_SUBJECT = 'Chemistry';

function chemIndex_() {
  if (CHEM.data) return CHEM.data;
  if (CHEM.asking || CHEM.failed || typeof fetch !== 'function') return null;
  const stamp = deployStamp_();
  const get = f => Promise.resolve().then(() => fetch('data/chemistry/' + f + '.json' + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null).catch(() => null);
  const names = Object.keys(CHEM_FILES);
  CHEM.asking = Promise.all(names.map(get)).then(all => {
    CHEM.asking = null;
    const d = {};
    /* A ROW IS A CARD ONLY WITH AN ID AND A SOURCE (check-chemistry): a payload's list of the same name is not ours. */
    const ours = r => r && r.id && r.source;
    names.forEach((n, i) => { d[n] = all[i] && Array.isArray(all[i][n]) ? all[i][n].filter(ours) : []; });
    if (!names.some(n => d[n].length)) { CHEM.failed = true; return null; }
    CHEM.data = d;
    if (typeof stuffForget_ === 'function') stuffForget_();
    if (typeof finderEach_ === 'function') finderEach_(F => { if ($(F.id + '-controls')) paintStuff(true); });
    return d;
  });
  return null;
}

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

/* ONE LINE PER THING (421): label and value rows, then where the facts came from. */
function chemCard_(x) {
  const r = x.chem || {};
  const row = (k, v) => (v || v === 0) ? `<p><b>${esc(k)}</b> ${esc(v)}</p>` : '';
  const rows = [
    row('Symbol', r.symbol), row('Atomic number', r.number), row('Relative atomic mass', r.mass), row('Block', r.block),
    row('Electron configuration', r.config), row('Discovered', r.discovered),
    row('Also called', r.also), row('Formula', r.formula), row('Use', r.use), row('Hazard', r.hazard),
    row('Pattern', r.pattern), row('Conditions', r.conditions), row('Observations', r.observations),
    r.examples ? '<ol>' + r.examples.map(e => '<li>' + esc(e.equation) + '</li>').join('') + '</ol>' : '',
  ].join('');
  return `<div class="card fc tx" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="tx-body"><h3>${esc(x.name)}</h3><div class="tx-text">${rows}</div><p class="wt-credit">${esc(r.source || '')}</p></div>
  </div>`;
}
