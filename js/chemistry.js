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
    if (typeof lateCame_ === 'function') lateCame_();
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

/* ONE LINE PER THING (421): a fact a line, its examples, then where the facts came from (a spec, master template). */
cardKind_('chem', x => { const r = x.chem || {}, has = v => v || v === 0;
  const facts = [['Symbol', r.symbol], ['Atomic number', r.number], ['Relative atomic mass', r.mass], ['Block', r.block], ['Electron configuration', r.config],
    ['Discovered', r.discovered], ['Also called', r.also], ['Formula', r.formula], ['Use', r.use], ['Hazard', r.hazard], ['Pattern', r.pattern],
    ['Conditions', r.conditions], ['Observations', r.observations]].filter(f => has(f[1])).map(([k, v]) => k + ' ' + v);
  return { look: 'tx kc-facts', tags: kcFacetTags_(x), body: [{ type: 'text', paras: facts.concat((r.examples || []).map(e => String(e.equation || '')), r.source || '') }] }; });
