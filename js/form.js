/* @family. — form.js ONE FORM MAKER (84a): every Settings card is drawn here from a spec, so spacing, buttons and labels cannot drift card to card. */

/* THE SPECS ARE data/settings/forms.json (field kinds, rules, Settings cards), copied in below. An item's forms are its kind's, in kinds.json (ITEM_KINDS). */
/* FORMS:BEGIN — data/settings/forms.json, written by `node tools/build.js` (tools/cards-gen.js); edit the json, never this. */
const FORM_SPECS = {"kinds":["text","number","money","choice","toggle","date","time","picture","list","pin","slider","phone","file","tick","hidden","long","ticks","toggles","search","timetable","many","doc","head","subjects","shelf","dob","shown"],"rules":[{"kind":"list","match":"^(qual_\\d+|job_\\d+|lib\\d+_|photo_\\d+)|^video$|^venues_ok$"},{"kind":"picture","match":"^photo$"},{"kind":"toggle","match":"^(dbs|active|listed|is_|has_|allow|paid|trackable|stealable)"},{"kind":"date","match":"_date$|^date_of_birth$|^dob_[dmy]$"},{"kind":"time","match":"^(m|tu|w|th|f|sa|su)\\d\\d$"},{"kind":"money","match":"rate|price|cost|fee|seat_cut"},{"kind":"number","match":"hours|km|fraction|pages|year|students|days|weeks|count|level_required|age_|_cut$"},{"kind":"choice","match":"^(borough|city|town|focus|favourite_colour)$"},{"kind":"text","match":""}],"cards":{"signing-in":{"title":"Signing in","ask":"pin-change","said":"pin-said"}}};
/* FORMS:END */
/* WHAT A FORM STILL LACKS (job G: one form engine): its kind's form `gaps` in kinds.json, each a `say` and `all` (or `any` of lists) of "field:test". */
/* The phone asks it before sending and the backend again on receipt (tools/cards-gen.js copies these two into backend/cards-gen.gs, with FORM_GAPS). */
const FORM_TESTS = {
  filled: v => String(v == null ? '' : v).trim() !== '',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim()),
  postcode: v => /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(String(v || '').trim()),
  isodate: v => /^\d{4}-\d\d-\d\d$/.test(String(v || '').trim()),
  image: v => /^data:image\//i.test(String(v || '')),
  pics: v => [].concat(v || []).some(x => /^data:image\//i.test(String(x || ''))),
  yes: v => v === true || /^true$/i.test(String(v || '')),
  yesno: v => /^(yes|no)$/i.test(String(v || '').trim()),
  rate: v => Number(v) > 0 && Number(v) < 1000,
};
function formGaps_(gaps, body) {
  const ok = t => { const [f, test] = t.split(':'); return FORM_TESTS[test](body[f]); };
  return (gaps || []).filter(g => !(g.any ? g.any.some(l => l.every(ok)) : (g.all || []).every(ok))).map(g => g.say);
}
/* ONE CLASH RULE (owner, 26 Nov: the timetable as a tool, no double-booking): a kind's kinds.json `clash` names its id, name, days, start, end */
/* and term fields; an item sharing a day with another row whose times cross (17:00–18:00 then 18:00–19:00 is fine), the same term or either */
/* without one, is refused with the clash named. The phone asks it (storeWrite_), the backend again (items.gs itemWrite_; cards-gen.gs copies these). */
const CLASH_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
function clashDays_(v) {
  const s = String(v == null ? '' : v).toLowerCase(), out = [];
  if (/\b(daily|every ?day)\b/.test(s)) return [0, 1, 2, 3, 4, 5, 6];
  const day = w => { w = w.replace(/[^a-z]/g, '').replace(/(..)s$/, '$1'); return w.length < 2 ? -1 : CLASH_DAYS.findIndex(d => d.indexOf(w) === 0); };
  s.replace(/\s*(?:-|–|\bto\b)\s*/g, '-').split(/[\s,;/&+]+|\band\b/).filter(Boolean).forEach(t => {
    if (/^weekdays?$/.test(t)) { out.push(0, 1, 2, 3, 4); return; }
    if (/^weekends?$/.test(t)) { out.push(5, 6); return; }
    const [a, b] = t.split('-').map(day);
    if (a < 0) return;
    if (b == null || b < 0) { out.push(a); return; }
    for (let i = a; ; i = (i + 1) % 7) { out.push(i); if (i === b) break; }
  });
  return out.filter((d, i) => out.indexOf(d) === i);
}
function clashMin_(v) {
  const m = String(v == null ? '' : v).trim().toLowerCase().match(/^(\d{1,2})(?:[:.](\d\d))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = Number(m[1]) % (m[3] ? 12 : 24);
  if (m[3] === 'pm') h += 12;
  return h * 60 + Number(m[2] || 0);
}
function clashOf_(rule, item, rows) {
  if (!rule || !item) return '';
  const days = clashDays_(item[rule.days]), s = clashMin_(item[rule.start]), e = clashMin_(item[rule.end]);
  if (!days.length || s == null || e == null) return '';
  const term = x => String(x == null ? '' : x).trim().toLowerCase(), t = term(item[rule.term]), id = String(item[rule.id] == null ? '' : item[rule.id]);
  const hm = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  for (const r of rows || []) {
    if (id && String(r[rule.id]) === id) continue;
    const rs = clashMin_(r[rule.start]), re = clashMin_(r[rule.end]), rt = term(r[rule.term]);
    if (rs == null || re == null || !(s < re && rs < e) || (t && rt && t !== rt)) continue;
    const d = clashDays_(r[rule.days]).find(x => days.indexOf(x) !== -1);
    if (d == null) continue;
    const name = String(r[rule.name] == null ? '' : r[rule.name]).trim() || 'another session';
    return 'Overlaps ' + CLASH_DAYS[d][0].toUpperCase() + CLASH_DAYS[d].slice(1) + ' ' + hm(rs) + '–' + hm(re) + ' with ' + name + '.';
  }
  return '';
}
/* ONE PHONE, HANDLE AND EMAIL RULE (unify lane D, 21 Nov): the site and the backend (cards-gen.gs copies these) read and refuse by these alone; tools/one-contact.js fails a second copy. */
/* THE CODES OFFERED, the first the default: constants.gs PHONE_CODES on the backend, get-start's `phoneCodes` on the site. */
function phoneCodes_() {
  const c = typeof PHONE_CODES !== 'undefined' ? PHONE_CODES : (typeof DATA !== 'undefined' && DATA ? DATA.phoneCodes : null);
  return Array.isArray(c) && c.length ? c : ['+44'];
}
/* THE PHONE CELL AS TWO BOXES (code, number). */
function phoneOut(cellValue) {
  const codes = phoneCodes_();
  let v = String(cellValue == null ? '' : cellValue).trim().replace(/^00/, '+');
  if (!v) return { phone_cc: codes[0], phone_no: '' };
  if (v[0] === '+') {
    const digits = v.slice(1).replace(/\D/g, '');
    const cc = codes.filter(c => digits.indexOf(c.slice(1)) === 0).sort((a, b) => b.length - a.length)[0];
    if (cc) return { phone_cc: cc, phone_no: v.replace(/^\+\s*/, '').replace(new RegExp('^' + cc.slice(1)), '').trim() };
    const m = v.match(/^\+(\d{1,4})\s*(.*)$/);
    return { phone_cc: m ? '+' + m[1] : codes[0], phone_no: m ? m[2].trim() : v };
  }
  return { phone_cc: codes[0], phone_no: v.replace(/^0(?=\d)/, '') };
}
/* TWO BOXES BACK AS ONE CELL: digits and spaces, a code typed twice dropped, one trunk 0 off (Italy keeps it). */
function phoneIn(fields) {
  const t = x => String(x == null ? '' : x).trim();
  const cc = /^\+\d{1,4}$/.test(t(fields.phone_cc)) ? t(fields.phone_cc) : phoneCodes_()[0];
  let no = t(fields.phone_no);
  const ccd = cc.slice(1);
  if (/^(\+|00)/.test(no)) no = no.replace(/^(\+|00)\s*/, '').replace(new RegExp('^' + ccd + '\\s*'), '');
  no = no.replace(/[^\d ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cc !== '+39') no = no.replace(/^0(?=\d)/, '');
  return no ? cc + ' ' + no : '';
}
/* A HANDLE: 3 to 30, a letter first, then letters, numbers, _ and -. As typed (no @, lower case), and as meant (look-alike digits folded). */
const HANDLE_SHAPE = /^[a-z][a-z0-9_-]{2,29}$/;
const handleTyped_ = v => String(v == null ? '' : v).trim().replace(/^@/, '').toLowerCase();
function handleFold_(v) {
  return String(v == null ? '' : v).toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a')
    .replace(/5/g, 's').replace(/7/g, 't').replace(/8/g, 'b').replace(/9/g, 'g');
}

/* WHICH OF THE KINDS A FIELD IS, by the first rule its name matches; the last rule catches everything as text. */
/* EVERY FORM IS ITS KIND'S (data/settings/kinds.json `forms`): read from KINDS, each told the kind it fills. */
FORM_SPECS.forms = Object.assign({}, ...Object.keys(ITEM_KINDS.kinds).map(k => Object.fromEntries(Object.entries(ITEM_KINDS.kinds[k].forms || {}).map(([id, f]) => [id, Object.assign({ item: k }, f)]))));
/* A FORM ASKED IN FIND, ONE FIELD A STEP (`ask: "find"`): its fields in order, and one field's spec (many, need, given, ask). */
const formAsks_ = id => ((FORM_SPECS.forms[id] || {}).fields || []).map(x => x.f);
const formAsk_ = (id, f) => ((FORM_SPECS.forms[id] || {}).fields || []).find(x => x.f === f) || {};
/* A FORM'S QUESTIONS AS DATA (kinds.json `step` on a field, rows in `rows`): where each one's options come from, which it keeps,
   how each reads, and why one is refused. `fns` holds the named pieces that cannot be data (the hour grid's maths, a seat range);
   every name is looked up there first, else read as a row field. One step object per row, the shape the booking code reads. */
const formArr_ = v => v == null ? [] : Array.isArray(v) ? v : [v];
function formSteps_(id, fns) {
  const spec = FORM_SPECS.forms[id] || {}, fn = n => typeof n === 'string' && typeof fns[n] === 'function' ? fns[n] : null;
  const pick = (row, by) => { const f = fn(by); if (f) return f(row); if (row == null || typeof row !== 'object') return row;
    return formArr_(by).map(k => row[k]).find(v => v != null && v !== '') || ''; };
  const holds = c => { const f = fn(c); return f ? !!f() : !!(typeof BOOKING === 'object' && BOOKING[c]); };
  return (spec.rows || []).map(f => {
    const s = (formAsk_(id, f).step) || {}, st = { id: f, label: text_(s.q || f), short: s.short ? text_(s.short) : '' };
    ['only', 'wrap', 'week', 'grid'].forEach(k => { if (s[k] != null) st[k] = s[k]; });
    ['fallback', 'lock', 'set', 'off'].forEach(k => { if (fn(s[k])) st[k] = fn(s[k]); });
    if (fn(s.check)) st.why = fn(s.check);
    if (fn(s.say)) st.label_ = fn(s.say);
    else if (s.say && typeof s.say === 'object') st.label_ = v => text_(s.say[v] || v);
    st.options = () => {
      if (formArr_(s.when).some(c => !holds(c)) || formArr_(s.unless).some(holds)) return [];
      if (s.may && !(typeof may_ === 'function' && may_(s.may))) return [];
      let rows = s.list ? s.list.map(w => text_(w)) : s.from ? (fns.from[s.from] || (() => []))() || [] : [];
      if (s.filter) rows = rows.filter(r => !!pick(r, s.filter));
      if (s.sort) rows = rows.slice().sort((a, b) => String(pick(a, s.sort)).localeCompare(String(pick(b, s.sort))));
      let out = rows.map(r => s.label ? pick(r, s.label) : r);
      out = formArr_(s.first).map(w => text_(w)).concat(out, formArr_(s.last).map(w => text_(w)));
      return fn(s.then) ? fn(s.then)(out) : out;
    };
    return st;
  });
}
const FORM_RULES_ =FORM_SPECS.rules.map(r => ({ kind: r.kind, re: new RegExp(r.match) }));
const formKind_ = f => (FORM_RULES_.find(r => r.re.test(String(f || ''))) || { kind: 'text' }).kind;

/* ONE FIELD, ONE LINE: every kind but a box with no column behind it goes through `fieldHtml`, the one line-drawer. */
function formField_(f, value, o) {
  return fieldHtml(f, value, o);
}
/* A TICK THAT SAVES THE MOMENT IT IS TICKED, with a bold name and a faint note: `t.act` is its handler, `t.data` its data- attributes. */
const formToggle_ = t => cardBlock_(formToggleB_(t));
function formToggleB_(t) {
  const attrs = { type: 'checkbox', 'data-do': t.act == null ? '' : String(t.act) };
  Object.keys(t.data || {}).forEach(k => { attrs['data-' + k] = String(t.data[k] == null ? '' : t.data[k]); });
  attrs.checked = !!t.on;
  if (t.off) attrs.disabled = true;
  return ({ type: 'group', tag: 'label', look: 'check role-pick' + (t.cls ? ' ' + t.cls : ''), blocks: [{ type: 'control', attrs },
    { type: 'group', tag: 'span', look: 'box' },
    { type: 'group', tag: 'span', look: 'role-pick-say', text: [{ b: t.label }, ' ', { span: 'qtag', text: t.note || '' }] }] });
}

/* THE CARD: a title, then `groups` (backend field lists, forms.json's `settings` form), `ask` (a kinds.json form asked a field a step) or `toggles`; `spec.id` fills it from FORM_SPECS.cards. */
/* Saving as you type is `autosaveHear_`, which hears every `.set-typed .me-form` this draws. */
/* `mode`: 'edit' (the default: boxes that save as you type) or 'read' (every box shown and none taken, no Save, no status line). */
function formCard_(spec) {
  return setCard_(formCardSpec_(spec));
}
/* THE SAME CARD AS DATA: setCard_'s spec, its `form` or `body` a block list (the field lines, the ticks, the status line). */
function formCardSpec_(spec) {
  const s = Object.assign({}, (spec && spec.id && FORM_SPECS.cards[spec.id]) || {}, spec || {});
  const read = s.mode === 'read';
  const all = read ? [].concat(...Object.keys(s.groups || {}).map(g => s.groups[g] || [])) : null;
  const opts = Object.assign({ head: false, attr: 'data-me', groups: s.groups }, s.fieldOpts || {}, read ? { readonly: all } : {});
  const fields = s.groups ? formOf_('settings', null, opts) : '';
  /* A CARD THAT IS A FORM ASKED A FIELD A STEP (`ask`, kinds.json): the same chips and menu as Find's, its send the last step. */
  const asked = s.ask ? askArea_(s.ask) : '';
  const ticks = (s.toggles || []).map(t => formToggleB_(read ? Object.assign({}, t, { off: true }) : t));
  const save = read ? '' : s.save && s.save.act ? tile_(s.save) : s.save;
  const after = [s.said ? { type: 'status', id: s.said } : '', s.after || ''];
  const card = { card: s.card, title: s.title, attrs: s.attrs, state: s.state, lead: s.lead, save: save, after: after };
  if (s.groups) return Object.assign(card, { form: [fields], formAttrs: s.formAttrs, foot: read ? '' : s.foot });
  return Object.assign(card, { body: [s.body || '', asked, ticks, s.tail || ''] });
}

/* THE RAW BOXES: every input, menu and text area on a Settings screen is written by these, so a box has one shape everywhere. `a` is its attribute text. */
/* Each is a `control` block, its attribute text read into data by `cardAttrsOf_` (cards-render.js). */
const formInput_ = a => cardBlock_({ type: 'control', attrs: cardAttrsOf_(a) });
const formSelect_ = (a, opts) => cardBlock_({ type: 'control', tag: 'select', attrs: cardAttrsOf_(a), inner: opts });
const formArea_ = (a, text) => cardBlock_({ type: 'control', tag: 'textarea', attrs: cardAttrsOf_(a), value: text == null ? '' : String(text) });
const formHidden_ = (a, v, more) => formInput_(`type="hidden" ${a} value="${esc(v == null ? '' : String(v))}"${more || ''}`);
const formFile_ = (cls, accept) => formInput_(`type="file" class="${cls}" accept="${accept}" hidden`);
/* A LABELLED LINE: a faint name over its box; `cls` adds to class="field". */
const formLine_ = (label, box, cls) => cardBlock_({ type: 'field', look: cls || '', cap: label, inner: box });
/* A TICK: `a` is the checkbox's attributes, `say` the html beside the box. */
const formTick_ = (a, say, cls, la) => cardBlock_({ type: 'group', tag: 'label', look: 'check' + (cls ? ' ' + cls : ''), attrs: cardAttrsOf_(la),
  blocks: [{ type: 'control', attrs: cardAttrsOf_('type="checkbox" ' + a) }, { type: 'group', tag: 'span', look: 'box' }], inner: say });
/* A PHONE: the country-code menu and the number, side by side, saved as you type under `cc` and `no`. */
function formPhone_(cc, no, ccOpts, noAttrs) {
  return formLine_('', formSelect_(`data-me="${cc}" aria-label="Country code"`, ccOpts))
    + formLine_('', formInput_(`type="tel" data-me="${no}" inputmode="tel" autocomplete="off" ${noAttrs || ''}`));
}

/* ---------- A FORM FROM THE ITEM SHAPE (foundation 2): `formOf_(id, values, o)` draws forms.json's `forms[id]` — an item kind and its field list, in order. */
/* A field with `may` shows only if may_(may); a money field also needs may_('prices'), so a child never sees a price. */
/* o: options {f: list}, kid, skip, only, vars ({x} in a name), was (the saved values a draft is kept against; default `values`), draftId (whose), */
/* locked (ticks drawn disabled), with(f, x) (more for one box: label, readonly, extra), fields (the names, for a "list" or "groups" form), docs (picked photos by slot). */
const formMay_ = x => (!x.may || (typeof may_ === 'function' && may_(x.may))) && (x.type !== 'money' || typeof may_ !== 'function' || may_('prices'));
/* WHICH KINDS A "form" DRAFT HOLDS: what is typed or picked; a doc's photo, a search and a hidden twin hold none. */
const FORM_DRAFTS_ = { text: 1, number: 1, money: 1, date: 1, choice: 1, long: 1, phone: 1 };
const formDraftKey_ = (id, o, f) => id + ':' + ((o && o.draftId) || '') + ':' + f;
/* AND A SAVED FORM'S DRAFTS GO: its handler calls this on success, so a new blank form never shows the last one's words. */
function formDraftDrop_(id, o) {
  if (typeof draftDrop_ !== 'function' || typeof draftKey_ !== 'function') return;
  try {
    const pre = draftKey_('form', formDraftKey_(id, o, '')), keys = [];
    keys.push(...keep_.keys(pre));
    keys.forEach(k => draftDrop_('form', k.slice(draftKey_('form', '').length)));
  } catch (e) { /* storage blocked: nothing was kept */ }
}
const formName_ = (f, o) => String(f || '').replace(/\{(\w+)\}/g, (m, k) => String(((o && o.vars) || {})[k] == null ? '' : o.vars[k]));
/* WHAT A `shown` BOX'S TYPED VALUE IS STORED AS: its spec's `store(f, typed, ctx, was)`. */
function formShownStore_(id, f, typed, ctx, was) {
  const x = ((FORM_SPECS.forms[id] || {}).fields || []).find(y => y.type === 'shown' && y.f === f);
  return x ? window[x.store](f, typed, ctx, was) : typed;
}
/* ONE BOX OF A FORM, by its type. `v` is what is saved; a "form" draft is kept against `o.was`, and drawn back here. */
function formFieldOf_(spec, x, v, o, id) {
  const a = x.attr || spec.attr, f = formName_(x.f, o), val = v == null ? '' : String(v), ro = x.readonly ? ' disabled' : '';
  const more = (o.with && o.with(f, x)) || {};
  if (more.label) x = Object.assign({}, x, { label: more.label });
  /* ONE VALUE SHOWN, ANOTHER STORED (kinds.json `type: "shown"`): the box of type `as` shows `show(f, o.ctx, stored)`, its hidden twin (`twin`) holds
     the stored value, and `formShownStore_` turns what is typed back by `store`. Without the right to see `as` (a price), only the twin. */
  if (x.type === 'shown') {
    const seen = Object.assign({}, x, { type: x.as || 'text' });
    return (formMay_(seen) ? formFieldOf_(spec, seen, window[x.show](f, o.ctx, val), o, id) : '') + formHidden_(`${x.twin}="${esc(f)}"`, val);
  }
  const draw = FORM_TYPE_[x.type];
  if (draw) return draw(spec, x, f, val, o, more);
  /* WHAT IS TYPED: a "form" draft is drawn back into the box (draftVal_), and kept as it is typed (data-draft). */
  const dk = spec.draft === 'form' && x.draft !== false && !x.readonly && FORM_DRAFTS_[x.type] ? formDraftKey_(id, o, f) : '';
  const was = dk && o.was ? String(o.was(f) == null ? '' : o.was(f)) : val;
  const da = dk ? draftAttr_('form', dk, was) : '';
  const dv = dk ? draftVal_('form', dk, was) : was;
  const shown = dk && dv !== was ? dv : val;
  /* A SETTINGS LINE (any form but a "form"-draft one): `fieldHtml` keeps its own "set" draft, ticks, lists, dates and keyboards; `more` (o.with) adds a caption, a lock or attributes. */
  const ph = (o.kid && x.phKid) || x.ph;
  if (spec.draft !== 'form') {
    const extra = [more.extra || '', x.input ? `type="${x.input}"` : '', x.quiet ? 'spellcheck="false"' : '', 'autocomplete="off"',
      x.max ? `maxlength="${x.max}"` : '', x.pad ? `inputmode="${x.pad}" size="${x.max}"` : '', x.blank ? 'placeholder=" "' : '',
      x.quiet && ph ? `aria-label="${esc(ph)}"` : ''].filter(Boolean).join(' ');
    return formField_(f, val, Object.assign({ attr: a, draft: spec.draft === 'set' ? undefined : false, readonly: !!x.readonly, label: x.label,
      placeholder: ph, options: typeof o.options === 'function' ? o.options(f) : null }, more, { extra }));
  }
  if (x.type === 'choice') return formLine_(x.label || '', cardBlock_({ type: 'control', tag: 'select', attrs: Object.assign({ [a]: f }, cardAttrsOf_(da)),
    options: (x.options || (o.options || {})[f] || []).map(c => Array.isArray(c) ? { value: c[0], text: c[1], on: c[0] === shown } : c) }));
  if (x.type === 'date') return formLine_(x.label || '', formInput_(`type="date" ${a}="${f}" value="${esc(shown)}"${ro}${da}`));
  if (x.type === 'long') return formLine_(x.label || '', formArea_(`${a}="${f}" rows="3"${ro}${da}`, shown));
  /* A BOX OF ITS OWN: the caption, the keyboard and the bounds the spec gives. */
  const kind = x.input || (x.type === 'money' || x.type === 'number' ? 'number' : '');
  const bounds = (x.min ? ` min="${x.min}"` : '') + (x.step ? ` step="${x.step}"` : '') + (x.type === 'money' ? ' inputmode="decimal"' : '')
    + (x.caps ? ' autocapitalize="characters"' : '');
  return formLine_(x.label || (ph ? '' : fieldLabel(f)), formInput_(`${a}="${f}"${ph ? ` placeholder="${esc(ph)}"` : ''} autocomplete="off"${kind ? ` type="${kind}"` : ''}${bounds} value="${esc(shown)}"${ro}${da}`));
}
/* SEVERAL TICKS, ONE A CHOICE: `o.options[f]` as [value, words, on]; a "form" draft keeps each tick's yes or no. */
function formTicksOf_(spec, x, f, o, id) {
  const a = x.attr || spec.attr, keep = spec.draft === 'form' && x.draft !== false;
  const ticks = ((o.options || {})[f] || []).map(c => {
    const on = c[2] ? '1' : '0', dk = keep ? formDraftKey_(id, o, f + '.' + c[0]) : '';
    const da = dk ? draftAttr_('form', dk, on) : '';
    const now = dk ? draftVal_('form', dk, on) : on;
    return formTick_(`${a}="${esc(c[0])}"${now === '1' ? ' checked' : ''}${x.readonly || o.locked ? ' disabled' : ''}${da}`,
      typeof c[1] === 'string' ? cardRuns_({ span: '', text: c[1] }) : c[1].html, x.tickLook == null ? 'many-opt' : x.tickLook);
  }).join('');
  return cardBlock_({ type: 'group', look: x.look || 'f-ticks', attrs: { role: 'group', 'aria-label': x.label || f }, inner: ticks });
}
/* ONE TICK, a yes or a no (apply to teach's consents). */
function formTickOf_(spec, x, f, val, o, id) {
  const a = x.attr || spec.attr, on = TRUEish_(val) ? '1' : '0';
  const dk = spec.draft === 'form' && x.draft !== false ? formDraftKey_(id, o, f) : '';
  const da = dk ? draftAttr_('form', dk, on) : '';
  const now = dk ? draftVal_('form', dk, on) : on;
  return formTick_(`${a}="${esc(f)}"${now === '1' ? ' checked' : ''}${da}`, cardRuns_({ span: '', text: x.label || '' }));
}
/* THE OTHER TYPES, each a drawer (spec, field, name, value, o, more). */
const FORM_TYPE_ = {
  head: (s, x) => cardBlock_({ type: 'group', tag: 'h4', look: null, text: x.label }),
  hidden: (s, x, f, v) => formHidden_(`${x.attr || s.attr}="${esc(f)}"`, v),
  search: (s, x, f, v, o) => formLine_(x.label || o.label || '', formInput_(`${x.attr || s.attr}="${esc(f)}" data-fam-want="${esc(formName_(x.want, o))}" type="search" autocomplete="off" placeholder="${esc(x.ph || '')}"`)),
  toggles: (s, x, f, v, o) => ((o.options || {})[f] || []).map(formToggle_).join(''),
  ticks: (s, x, f, v, o) => formTicksOf_(s, x, f, o, o.formId),
  tick: (s, x, f, v, o) => formTickOf_(s, x, f, v, o, o.formId),
  /* A DOCUMENT PHOTO: its name, Choose photo, what was picked, and the hidden file box; the photo lives in `o.docs` until sent. */
  doc: (s, x, f, v, o) => cardBlock_({ type: 'group', look: 'field apply-doc', attrs: { 'data-doc': f }, blocks: [
    { type: 'group', tag: 'span', look: null, text: x.label },
    { type: 'group', look: 'btn-row', tiles: [{ form: true, kind: 'quiet', label: (o.docs || {})[f] ? text_('change-photo') : 'Choose photo', act: x.act || 'apply-pick' }] },
    { type: 'group', tag: 'p', look: 'note apply-doc-said', text: (o.docs || {})[f] ? text_('photo-ready') : '' },
    { type: 'control', attrs: { type: 'file', class: 'apply-in', accept: 'image/*', hidden: true } }] }),
  /* THE WEEK'S HOURS (availGrid_, me-roles.js), else a line of words when the backend sent no hour codes. */
  timetable: (s, x, f, v, o) => {
    const codes = o.codes || (typeof availCodes_ === 'function' ? availCodes_() : []);
    return codes.length ? cardBlock_({ type: 'group', look: 'app-week', inner: availGrid_(codes, o.raw || {}, o.readonly || [], !!o.mine) })
      : '';
  },
  /* SUBJECT AND LEVEL, a row each (qualPick_, me-shelves.js), without Something else…. */
  subjects: (s, x, f, v, o) => Array.from({ length: x.rows || (typeof APP_SUBJECT_ROWS !== 'undefined' ? APP_SUBJECT_ROWS : 3) }, (_, i) => {
    const noOther = b => { b.blocks[0].options = b.blocks[0].options.filter(c => c.value !== QUAL_OTHER); return b; };
    return cardBlock_({ type: 'group', look: 'q-row', blocks: [noOther(qualPick_({ 'data-app-subj': String(i) }, '', QUAL_SUBJECTS, i ? 'Another subject' : 'Subject', 'Choose')),
      noOther(qualPick_({ 'data-app-level': String(i) }, '', QUAL_LEVELS, 'Level', 'Choose'))] });
  }).join(''),
};
/* THE FIELD LIST: the spec's own, else the names the caller has (`o.fields`), each typed by the rules. */
const formListOf_ = (spec, o) => Array.isArray(spec.fields) ? spec.fields : (o.fields || []).map(f => ({ f, type: formKind_(f) }));
function formOf_(id, values, o) {
  o = Object.assign({}, o || {}, { formId: id });
  const spec = FORM_SPECS.forms[id];
  if (!spec) return '';
  if (spec.fields === 'groups') return formGroupsOf_(spec, o.groups || {}, o);
  const get = typeof values === 'function' ? values : f => (values || {})[f];
  const list = formListOf_(spec, o).filter(x => formMay_(x) && (o.skip || []).indexOf(x.f) === -1 && (!o.only || o.only.indexOf(x.f) !== -1));
  const one = x => {
    /* AN EMPTY TIMETABLE IS A LINE OF WORDS: the spec's caption over a text area. */
    if (x.type === 'timetable' && !FORM_TYPE_.timetable(spec, x, x.f, '', o)) return formFieldOf_(spec, Object.assign({}, x, { type: 'long' }), get(x.f, x), o, id);
    const box = formFieldOf_(spec, x, get(formName_(x.f, o), x), o, id);
    return x.look && x.type !== 'ticks' ? cardBlock_({ type: 'group', look: x.look, inner: box }) : box;
  };
  const out = [];
  list.forEach((x, i) => {
    if (x.row && list[i - 1] && list[i - 1].row === x.row) return;
    const row = x.row ? list.filter(y => y.row === x.row) : null;
    out.push(row ? cardBlock_({ type: 'group', look: 'f-row', attrs: { style: '--n:' + row.length }, inner: row.map(one).join('') }) : one(x));
  });
  return out.join('');
}
/* ---------- THE SETTINGS FORM: the backend's field groups (formCard_'s `groups`), each name drawn by its type (it was fieldsHtml, me-fields.js). */
/* A heading per group unless `o.head` is false; a timetable group is the week; lib/qual/job/photo names their shelves; dob_* three boxes; phone the code and number; photo the picture. */
function formGroupsOf_(spec, groups, o) {
  const head = o.head === false ? '' : o.head || 'h2';
  const value = o.value || (() => '');
  const plain = (f, extra) => {
    const x = { f, type: formKind_(f) };
    if (!formMay_(x)) return '';
    return formField_(f, value(f), Object.assign({ attr: o.attr || spec.attr, label: ROW_LABEL[f], options: o.options ? o.options(f) : null,
      suggest: o.suggest ? o.suggest(f) : null, readonly: (o.readonly || []).indexOf(f) !== -1 }, extra));
  };
  const own = (o.attr || spec.attr) === 'data-me';
  return Object.keys(groups).map(g => {
    const list = (groups[g] || []).filter(f => RETIRED_FIELDS_.indexOf(f) === -1);
    const timetable = isTimetable_(list);
    const library = !timetable && isLibrary_(list);
    const quals = !timetable && isQuals_(list);
    const jobs = !timetable && isJobs_(list);
    const wantsDob = !timetable && (list.indexOf('date_of_birth') !== -1 || isDob_(list));
    const wantsPhone = !timetable && list.indexOf('phone') !== -1;
    const photos = !timetable && isPhotos_(list);
    const picture = !timetable && own && list.indexOf('photo') !== -1;
    const rest = list.filter(f => !(library && isLibraryCard_(f)) && !(quals && isQualField_(f)) && !(jobs && isJobField_(f))
                              && !(photos && (isPhotoField_(f) || f === 'video')) && !(picture && f === 'photo')
                              && !(wantsDob && (f === 'date_of_birth' || isDobBox_(f))));
    const body = timetable
      ? availGrid_(list, o.raw || {}, o.readonly || [], own)
      : (picture ? photoPicker_(value) : '')
      + (library ? libraryShelf_(list, value) : '')
      + (quals ? qualShelf_(list, value) : '')
      + (jobs ? jobShelf_(list, value) : '')
      + (wantsDob ? dobBoxes_(value) : '')
      + fieldRows_(rest, (f, extra) => f === 'phone' && wantsPhone ? phoneField_(value) : plain(f, extra))
      + (photos ? videoPicker_(value) + photoShelf_(list, value) : '');
    return (head ? cardBlock_({ type: 'group', tag: head, look: null, blocks: [{ type: 'group', tag: 'span', look: null, text: g }] }) : '') + body;
  }).join('');
}

/* ---------- A FORM ASKED IN ITS CARD, BOUND TO ITS BOXES (owner, 16 Nov: one form for any item) ---------- */
/* Each asked field keeps a hidden twin box (the form's `attr`) where its box was. An answer, and what is typed, goes into the twin with an `input` */
/* event, so the page's own listeners (drafts, saving 0.8s after typing stops, a card's dirty flag) and its Save read it as they read the old box. */
/* A FIELD'S OWN PROPERTIES are kinds.json `fields` (caption `label`, `min`, `max`, `step`), the same for every form that asks it. */
const FORM_FIELDS_ = Object.assign({}, ...Object.keys(ITEM_KINDS.kinds).map(k => ITEM_KINDS.kinds[k].fields || {}));
const askProps_ = f => FORM_FIELDS_[f] || {};
/* ---------- A FORM ASKED IN FIND, ONE FIELD A STEP (`ask: "find"` in kinds.json; owner, 16 Nov: one form for any item) ---------- */
/* A choice is its tags, a text field the blank tag typed on, a PIN the ten digit tags; each answer is a chip whose tap asks it (and every field after it) again. */
/* A `many` field ticks on a tap, then shows "and" (another) and "." (done) as tags with the answers; `need` is how many before "." moves on; `given` is answered by the site, still a chip. */
/* The answers live in memory (`ASK[id]`), never the URL or a chip's words; a form with `draft: "ask"` keeps every answer but a PIN as a draft (data.js). */
/* A FORM'S OWN CODE (`FORM_ASK_[id]`) IS ONLY ITS SOURCES: where its answers live (`state`: {v, done, more}), whether a field is asked now (`asks`), */
/* a field's tags (`options`: [{v, text, on, off, note}]), its question and chip words (`label`, `said`), why an answer is refused (`off`), */
/* and what an answer does besides being kept (`pick` true when it handled it, `toggle`, `set`, `had`, `next`, `and`, `clear`, `paint`). */
const FORM_ASK_ = {};
const askHook_ = id => FORM_ASK_[id] || {};
const ASK = {};
const askKeeps_ = (id, x) => (FORM_SPECS.forms[id] || {}).draft === 'ask' && x.type !== 'pin' && !draftNever_(x.f);
const askDrafts_ = id => ((FORM_SPECS.forms[id] || {}).fields || []).filter(x => askKeeps_(id, x));
function askReset_(id, pre) {
  const s = { v: Object.assign({}, pre || {}), done: {}, pin: [], more: '' };
  askDrafts_(id).forEach(x => { const d = draftRead_('ask', id + ':' + x.f); if (d !== null && d !== undefined) { s.v[x.f] = d; s.done[x.f] = true; } });
  ASK[id] = s;
}
const askOf_ = id => (askHook_(id).state ? askHook_(id).state() : ASK[id] || (askReset_(id), ASK[id]));
/* SENT: its drafts go, so a new blank form never shows the last one's answers. */
const askDone_ = id => { askDrafts_(id).forEach(x => draftDrop_('ask', id + ':' + x.f)); ASK[id] = { v: {}, done: {}, pin: [], more: '' }; };
const askSpecs_ = id => (FORM_SPECS.forms[id] || {}).fields || [];
/* THE FIELDS ASKED NOW: in order, each `only` met by the answers above it, and each its form's code asks. */
const askFields_ = id => askSpecs_(id).filter(x => (!x.only || Object.keys(x.only).every(k => String(askOf_(id).v[k]) === String(x.only[k])))
  && (!askHook_(id).asks || askHook_(id).asks(x)));
const askPassed_ = (id, x) => !!askOf_(id).done[x.f] || (!!x.given && !!askOf_(id).v[x.f]);
const askAt_ = id => askFields_(id).find(x => !askPassed_(id, x)) || null;
const askSay_ = c => (c.say ? text_(c.say) : c.t || c.v);
/* A FORM ASKED IN A CARD (`askArea_`: a Settings card) redraws there; else Find repaints. */
const askEls_ = id => [...document.querySelectorAll('.ask-set')].filter(el => el.dataset.ask === id);
function askPaint_(id) {
  if (askHook_(id).paint) return askHook_(id).paint();
  const els = askEls_(id);
  if (els.length) els.forEach(el => { el.innerHTML = askAreaInner_(id); });
  else finderEach_(() => paintStuff());
}
/* THE SAME CHIPS AND MENU AS FIND'S MENU CARD, drawn inside a card. */
const askAreaInner_ = id => renderTags(askChips_(id), 'chips', true) + cardBlocks_(askMenu_(id) || []);
const askArea_ = id => cardBlock_({ type: 'group', look: 'ask-set', attrs: { 'data-ask': id }, inner: askAreaInner_(id) });
const askLook_ = id => (FORM_SPECS.forms[id] || {}).look || 'ask-pick';
/* ONE FIELD'S TAGS, the one tag maker for every asked form; `o.act`, `o.id`, `o.cls` and `o.value` let a form keep its own handler, box and answer (sign-in's). */
function askTags_(id, x, o) {
  o = o || {};
  const h = askHook_(id), val = o.value != null ? o.value : askOf_(id).v[x.f];
  if (x.type === 'pin') return { look: 'is-grid sign-pin', options: '0123456789'.split('').map(d => ({ text: d, act: o.act || 'ask-digit', data: { form: id, f: x.f, d: d, repeat: true } })) };
  /* TYPED: one line, a date (the calendar), or several lines (`long`); a field with bounds is a number box with them. */
  if (x.type === 'text' || x.type === 'date' || x.type === 'time' || x.type === 'long') return { look: 'sign-type', box: { id: o.id != null ? o.id : 'ask-' + id + '-' + x.f, cls: o.cls || 'ask-box',
    value: val || '', label: x.label || x.ph || '', placeholder: x.ph || '', inputmode: x.pad || (x.input === 'email' ? 'email' : 'text'),
    type: x.type === 'date' || x.type === 'time' ? x.type : x.min != null || x.max != null ? 'number' : 'text', min: x.min, max: x.max, step: x.step, lines: x.type === 'long' ? 3 : 0 } };
  const list = h.options ? h.options(x) : (x.options || []).map(c => ({ v: c.v, text: askSay_(c), on: String(val) === String(c.v) }));
  /* SEVERAL ANSWERS ARE CHOSEN ONE WAY ONLY, "and" / "." (owner, 17 Nov): no ticks — a chosen answer is a tag at the top and leaves the menu.
     An hour grid (`grid`) is a timetable, not a choice of several, and keeps its marks. */
  const shown = x.many && !x.grid ? list.filter(c => !c.on) : list;
  return { look: askLook_(id) + (x.grid ? ' is-grid' : ''), options: shown.map(c => ({
    text: (x.grid && c.on ? '✓ ' : '') + c.text + (c.off ? ' · ' + c.off : c.note ? ' · ' + c.note : ''), act: o.act || 'ask-pick',
    data: { form: id, f: x.f, v: c.v }, pressed: !!c.on, disabled: !!c.off, look: ((c.on ? 'is-on' : '') + (c.off ? ' is-off' : '')).trim() })) };
}
const askSaid_ = (id, x) => {
  if (askHook_(id).said) return askHook_(id).said(x);
  const c = (x.options || []).find(k => String(k.v) === String(askOf_(id).v[x.f]));
  return x.type === 'pin' ? '*'.repeat(SIGN_PIN_LEN) : c ? askSay_(c) : String(askOf_(id).v[x.f] || '');
};
/* THE MENU FOR THE FIELD BEING ASKED; once every field is answered, the send (`o.done` says what sending does), or nothing when the form has none. */
function askMenu_(id, o) {
  o = o || {};
  const spec = FORM_SPECS.forms[id] || {}, x = askAt_(id), h = askHook_(id);
  if (!x) return spec.send ? [{ type: 'choices', ask: o.done || '', rows: [{ look: 'sign-more', options: [{ text: spec.send.say ? text_(spec.send.say) : spec.send.t, act: 'ask-send', data: { form: id } }] }] }] : null;
  /* AFTER EACH CHOICE ON A SEVERAL-ANSWER FIELD: exactly two tags, "and" (another of this) and "." (done, move on). */
  /* THE TWO TAGS ARE AT THE TOP WITH THE ANSWERS (`askChips_`; owner, 17 Nov), so the menu only says what is ticked. */
  /* FIND ASKS NO QUESTIONS (owner, 17 Nov): no heading over any step — the tags are the step, as everywhere else in Find. */
  if (askOf_(id).more === x.f) return [{ type: 'choices', rows: [] }];
  const pin = x.type === 'pin' ? askOf_(id).pin.length : 0, tags = askTags_(id, x);
  /* A FORM WHOSE FIELDS MAY STAY EMPTY (`skip`) offers Skip beside each. */
  const skip = spec.skip ? [{ text: 'Skip', act: 'ask-skip', data: { form: id, f: x.f }, label: 'Leave this empty for now' }] : [];
  return [{ type: 'choices', ask: x.note || '',
    rows: [tags.box ? { look: 'sign-who', options: [tags].concat(skip) } : Object.assign({}, tags, { options: tags.options.concat(skip) })] }];
}
/* THE ANSWERS AS CHIPS: a PIN is a * per digit, never the digits. */
function askChips_(id, look) {
  return askFields_(id).filter(x => askPassed_(id, x)).map(x => {
    const h = askHook_(id), text = askSaid_(id, x) || 'None', label = 'Change ' + (x.label || (h.label && h.label(x)) || x.ph || x.f);
    return { base: 'chip', look: look || 'sm ask-chip', text: text, act: 'ask-back', data: { form: id, f: x.f }, label: label, x: { label: label }, colour: false };
  }).concat(askMoreChips_(id, look));
}
/* AFTER EACH CHOICE ON A SEVERAL-ANSWER FIELD: exactly two tags, "and" (another of this) and "." (done, move on), at the end of the answers' row. */
function askMoreChips_(id, look) {
  const x = askAt_(id);
  if (!x || askOf_(id).more !== x.f) return [];
  const tag = (text, act, label) => ({ base: 'chip', look: (look || 'sm ask-chip') + ' ask-more', text: text, act: act, data: { form: id, f: x.f }, label: label, colour: false });
  return [tag('and', 'ask-and', 'And another'), tag('.', 'ask-next', 'Done, move on')];
}
/* A FIELD ANSWERED, and on to the next. */
function askSet_(id, f, v) {
  const s = askOf_(id), x = formAsk_(id, f), h = askHook_(id);
  if (!askOk_(x, v)) return;
  s.v[f] = v; s.done[f] = true;
  if (askKeeps_(id, x)) draftKeep_('ask', id + ':' + f, v);
  if (h.set) h.set(x, v);
  askPaint_(id);
}
/* BACK TO A FIELD: it and every field after it are asked again, from empty (a PIN always). */
function askBack_(id, f) {
  const s = askOf_(id), h = askHook_(id), all = askSpecs_(id), at = all.findIndex(x => x.f === f);
  if (at === -1) return;
  s.more = ''; s.pin = [];
  ((FORM_SPECS.forms[id] || {}).back === 'one' ? [all[at]] : all.slice(at)).forEach(x => { delete s.done[x.f]; if (h.clear) h.clear(x); else if (x.type === 'pin') delete s.v[x.f]; });
  askPaint_(id);
}
/* WHAT SENDING A FORM DOES: its kind's code sets `FORM_SEND_[id](values, button)`, an existing backend action, never a new one. */
const FORM_SEND_ = {};
/* ONE ANSWER: chosen and on to the next field; one of several: ticked or unticked, the field stays. */
on('ask-pick', el => {
  const id = el.dataset.form, f = el.dataset.f, v = el.dataset.v, x = formAsk_(id, f), h = askHook_(id), s = askOf_(id);
  if (h.pick && h.pick(x, v)) return askPaint_(id);
  if (x.many) {
    /* NOT A TICK: picking again never takes it off; its tag at the top does (`ask-back`). */
    const had = h.had ? h.had(x) : (s.v[f] || []);
    if (!x.grid && had.map(String).indexOf(String(v)) >= 0) { s.more = f; return askPaint_(id); }
    if (h.toggle) h.toggle(x, v);
    else { const list = s.v[f] || [], at = list.indexOf(v); if (at === -1) list.push(v); else list.splice(at, 1); s.v[f] = list; }
    s.more = f;
    return askPaint_(id);
  }
  const no = h.off && v ? String(h.off(x, v) || '') : '';
  if (no) { toast(v + ' ' + no); return; }
  askSet_(id, f, v || '');
});
/* ".": the several answers are done, once there are as many as `need`. */
on('ask-next', el => {
  const id = el.dataset.form, x = formAsk_(id, el.dataset.f), h = askHook_(id), s = askOf_(id);
  const had = h.had ? h.had(x) : (s.v[x.f] || []);
  if (had.length < (x.need || 0)) { toast(text_('pick-at-least-one-first')); return; }
  s.done[x.f] = true; s.more = '';
  if (h.next) h.next(x);
  askPaint_(id);
});
/* "and": the same field's tags again. */
on('ask-and', el => {
  const id = el.dataset.form, x = formAsk_(id, el.dataset.f), h = askHook_(id);
  askOf_(id).more = '';
  if (h.and) h.and(x);
  askPaint_(id);
});
on('ask-back', el => askBack_(el.dataset.form, el.dataset.f));
/* SKIP: the field stays as it is (empty) and the next is asked. */
on('ask-skip', el => { const id = el.dataset.form; askOf_(id).done[el.dataset.f] = true; askOf_(id).more = ''; askPaint_(id); });
on('ask-digit', el => {
  const id = el.dataset.form, x = askAt_(id), s = askOf_(id), d = String(el.dataset.d || '');
  if (!x || x.type !== 'pin' || x.f !== el.dataset.f || !/^\d$/.test(d)) return;
  s.pin.push(d);
  if (s.pin.length < SIGN_PIN_LEN) { askPaint_(id); return; }
  const pin = s.pin.join('');
  s.pin = [];
  askSet_(id, x.f, pin);
});
on('ask-send', el => { const id = el.dataset.form; if (FORM_SEND_[id]) FORM_SEND_[id](Object.assign({}, askOf_(id).v), el); });
/* WHAT IS TYPED IN A KEPT FORM'S BLANK TAG is kept as it is typed, as the old boxes' drafts were. */
document.addEventListener('input', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('ask-box')) return;
  const rest = String(t.id || '').slice(4), cut = rest.lastIndexOf('-'), id = rest.slice(0, cut), f = rest.slice(cut + 1);
  const x = formAsk_(id, f);
  /* A DRAFT OF WHAT IS BEING TYPED. */
  if (askKeeps_(id, x)) draftKeep_('ask', id + ':' + f, t.value);
});
/* ENTER IN A TEXT FIELD'S BLANK TAG (the keypad's ✓ is its Enter) ANSWERS IT, as a tap answers a tag. */
document.addEventListener('keydown', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('ask-box') || !/^Enter$/.test(e.key)) return;
  /* SEVERAL LINES: Enter is a new line, Ctrl or Cmd+Enter answers. */
  if (t.tagName === 'TEXTAREA' && !(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  const rest = String(t.id || '').slice(4), cut = rest.lastIndexOf('-'), v = String(t.value || '').trim();
  /* AN EMPTY ANSWER EMPTIES A BOUND FORM'S FIELD, as clearing its old box did; elsewhere it asks again. */
  if (!v) { toast(text_('type-your-name-username-or-email')); return; }
  askSet_(rest.slice(0, cut), rest.slice(cut + 1), v);
});
/* A DATE PICKED ON THE CALENDAR (or a time on the clock) ANSWERS IT, as Enter does. */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('ask-box') || (t.type !== 'date' && t.type !== 'time') || !t.value) return;
  const rest = String(t.id || '').slice(4), cut = rest.lastIndexOf('-');
  askSet_(rest.slice(0, cut), rest.slice(cut + 1), t.value);
});
/* A FIELD'S BOUNDS (kinds.json `min`, `max`), held on every answer as the old box's were. */
function askOk_(x, v) {
  if (!x || (x.min == null && x.max == null) || v === '' || v == null) return true;
  const n = Number(v);
  if (isFinite(n) && (x.min == null || n >= Number(x.min)) && (x.max == null || n <= Number(x.max))) return true;
  toast(x.max != null ? 'A number from ' + (x.min != null ? x.min : 0) + ' to ' + x.max + ', please.' : 'A number from ' + x.min + ' up, please.');
  return false;
}

/* ---------- THE KINDS FIND READS STRAIGHT FROM THE STORE (kinds.json `find.from: "store"`; owner, 17 Nov: the owner's life and business) ---------- */
/* Listed only to whom `see.who` lists them (kindSees_). Rows come by the one action `item` (mode read), once a viewer; the kind's `store` form is */
/* asked on its `new` card and sent as `item` mode write, an id made when none was typed. Nothing here names a kind: kinds.json says it all. */
const STORE_KINDS_ = Object.keys(ITEM_KINDS.kinds).filter(k => (ITEM_KINDS.kinds[k].find || {}).from === 'store');
const STORE_ROWS_ = {};
const storeWho_ = () => (typeof USER === 'object' && USER ? String(USER.personId || USER.name || '') : '');
const storeFormOf_ = k => Object.keys(ITEM_KINDS.kinds[k].forms || {}).find(id => ITEM_KINDS.kinds[k].forms[id].store) || '';
const storeFacets_ = () => STORE_KINDS_.flatMap(k => Object.keys(ITEM_KINDS.kinds[k].find.facetCols || {}));
function storePull_(k) {
  const who = storeWho_();
  if ((STORE_ROWS_[k] && STORE_ROWS_[k].who === who) || typeof api !== 'function') return;
  STORE_ROWS_[k] = { who, rows: [] };
  Promise.resolve(api({ action: 'item', mode: 'read', kind: k })).then(d => {
    if (!STORE_ROWS_[k] || STORE_ROWS_[k].who !== who) return;
    STORE_ROWS_[k].rows = d && d.ok && Array.isArray(d.items) ? d.items : [];
    if (STORE_ROWS_[k].rows.length && typeof lateCame_ === 'function') lateCame_();
  }).catch(() => { delete STORE_ROWS_[k]; });
}
function storeItems_() {
  return STORE_KINDS_.filter(k => typeof kindSees_ === 'function' && kindSees_({ kind: k })).flatMap(k => {
    const f = ITEM_KINDS.kinds[k].find, cols = f.facetCols || {};
    storePull_(k);
    const entry = (row, id) => { const shape = item_(row, k);
      return Object.assign({ kind: k, name: shape.name, key: k + ':' + id, sub: '', image: '', row, shape, text: Object.values(row).join(' ') },
        ...Object.keys(cols).map(c => ({ [c]: String(row[cols[c]] == null ? '' : row[cols[c]]) }))); };
    const fresh = Object.assign(entry({}, 'new'), { name: f.new, storeNew: true });
    fresh.shape = Object.assign({}, fresh.shape, { name: f.new });
    return [fresh].concat(((STORE_ROWS_[k] || {}).rows || []).map(it => entry(it.data || {}, it.id)));
  });
}
/* A ROW'S CARD: its form's fields as lines, a choice said in its own words; the `new` card is the form itself, asked a field a step. */
function itemLines_(r, k) {
  const fields = (FORM_SPECS.forms[storeFormOf_(k)] || {}).fields || [];
  return [{ type: 'list', items: fields.map(x => { const v = String(r[x.f] == null ? '' : r[x.f]), c = (x.options || []).find(o => String(o.v) === v);
    return { label: x.label || x.f, value: c ? c.t : v }; }).filter(l => l.value.trim()) }];
}
/* A ROW BEING EDITED (its Edit tile): the kind's own form under `form@id`, every field answered from the row, so Save is there at once */
/* and a chip's tap asks that field again; it saves under the same id. */
const STORE_EDIT_ = {};
function storeEditForm_(k, id, row) {
  const base = storeFormOf_(k), fid = base + '@' + id;
  if (!FORM_SPECS.forms[fid]) {
    FORM_SPECS.forms[fid] = Object.assign({}, FORM_SPECS.forms[base]);
    FORM_SEND_[fid] = v => storeSend_(fid, v, id);
  }
  if (!ASK[fid]) {
    const pre = {};
    FORM_SPECS.forms[base].fields.forEach(x => { if (row[x.f] != null && row[x.f] !== '') pre[x.f] = String(row[x.f]); });
    askReset_(fid, pre);
    FORM_SPECS.forms[base].fields.forEach(x => { ASK[fid].done[x.f] = true; });
  }
  return fid;
}
function storeSheet_(it, x) {
  const k = it.kind, id = x && x.key ? String(x.key).slice(k.length + 1) : '';
  if (x && !x.storeNew && !STORE_EDIT_[k + ':' + id]) return it.body;
  const fid = x && x.storeNew ? storeFormOf_(k) : storeEditForm_(k, id, it.raw || {});
  return fid ? [{ type: 'group', look: 'store-form', inner: askArea_(fid) }] : [];
}
/* A ROW'S TILES: Edit, and the kind's one-tap tick (kinds.json `card.tick`: {f, on, off, label}) when it has one. */
function storeTiles_(it, x) {
  if (!x || x.storeNew) return [];
  const k = it.kind, id = String(x.key).slice(k.length + 1), t = (ITEM_KINDS.kinds[k].card || {}).tick, on = t && String((it.raw || {})[t.f]) === String(t.on);
  return [{ icon: 'edit', label: STORE_EDIT_[k + ':' + id] ? 'Close' : 'Edit', act: 'store-edit', data: { kind: k, id } }]
    .concat(t ? [{ label: (on ? '✓ ' : '') + t.label, act: 'store-tick', pressed: on, data: { kind: k, id } }] : []);
}
const storeRow_ = (k, id) => (((STORE_ROWS_[k] || {}).rows || []).find(r => String(r.id) === String(id)) || {}).data || {};
function storeWrite_(k, item) {
  /* A KIND WITH A `clash` (the timetable): the whole row as it would be, held against the rows Find holds; a clash is named and nothing sent. */
  const rule = ITEM_KINDS.kinds[k].clash;
  if (rule) {
    const say = clashOf_(rule, Object.assign({}, storeRow_(k, item[rule.id]), item),
      ((STORE_ROWS_[k] || {}).rows || []).map(r => Object.assign({}, r.data, { [rule.id]: r.id })));
    if (say) { toast(say); return Promise.resolve(false); }
  }
  return Promise.resolve(api({ action: 'item', mode: 'write', kind: k, item })).then(d => {
    if (!d || !d.ok) { toast((d && d.error) || 'Not saved.'); return false; }
    delete STORE_ROWS_[k];
    if (typeof lateCame_ === 'function') lateCame_();
    return true;
  }).catch(e => { toast(String((e && e.message) || e)); return false; });
}
function storeSend_(fid, v, id) {
  const k = FORM_SPECS.forms[fid].item, key = [].concat(ITEM_KINDS.kinds[k].sheet.id)[0], item = Object.assign({}, v);
  item[key] = id || item[key] || k + '-' + Date.now().toString(36);
  /* AN EDIT SENDS EVERY FIELD, so one emptied (back, then Skip) is emptied in the row too. */
  if (id) FORM_SPECS.forms[fid].fields.forEach(x => { if (item[x.f] == null) item[x.f] = ''; });
  return storeWrite_(k, item).then(ok => { if (!ok) return; askDone_(fid); if (id) { delete ASK[fid]; delete STORE_EDIT_[k + ':' + id]; } toast(text_('saved')); });
}
STORE_KINDS_.forEach(k => { const id = storeFormOf_(k); if (id) FORM_SEND_[id] = v => storeSend_(id, v); });
on('store-edit', el => { const key = el.dataset.kind + ':' + el.dataset.id;
  if (STORE_EDIT_[key]) delete STORE_EDIT_[key]; else STORE_EDIT_[key] = true;
  delete ASK[storeFormOf_(el.dataset.kind) + '@' + el.dataset.id];
  if (typeof lateCame_ === 'function') lateCame_(); });
/* ONE TAP: the tick's field flipped, the rest of the row untouched (itemWrite_ writes only the fields sent). */
on('store-tick', el => { const k = el.dataset.kind, id = el.dataset.id, t = ITEM_KINDS.kinds[k].card.tick, key = [].concat(ITEM_KINDS.kinds[k].sheet.id)[0];
  storeWrite_(k, { [key]: id, [t.f]: String(storeRow_(k, id)[t.f]) === String(t.on) ? t.off : t.on }); });
