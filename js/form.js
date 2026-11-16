/* @family. — form.js ONE FORM MAKER (84a): every Settings card is drawn here from a spec, so spacing, buttons and labels cannot drift card to card. */

/* THE SPECS ARE data/settings/forms.json (field kinds, rules, Settings cards); this is its copy. An item's forms are its kind's, in kinds.json (ITEM_KINDS). */
const FORM_SPECS = {
  "kinds": ["text","number","money","choice","toggle","date","time","picture","list","pin","slider","phone","file","tick","hidden","long","ticks","toggles","search","timetable","many","doc","head","subjects","shelf","dob"],
  "rules": [
    {"kind":"list","match":"^(qual_\\d+|job_\\d+|lib\\d+_|photo_\\d+)|^video$|^venues_ok$"},
    {"kind":"picture","match":"^photo$"},
    {"kind":"toggle","match":"^(dbs|active|listed|is_|has_|allow|paid|trackable|stealable)"},
    {"kind":"date","match":"_date$|^date_of_birth$|^dob_[dmy]$"},
    {"kind":"time","match":"^(m|tu|w|th|f|sa|su)\\d\\d$"},
    {"kind":"money","match":"rate|price|cost|fee|seat_cut"},
    {"kind":"number","match":"hours|km|fraction|pages|year|students|days|weeks|count|level_required|age_|_cut$"},
    {"kind":"choice","match":"^(borough|city|town|focus|favourite_colour)$"},
    {"kind":"text","match":""}
  ],
  "cards": {
    "signing-in": {
      "title": "Signing in",
      "ask": "pin-change",
      "said": "pin-said"
    }
  }
};

/* WHICH OF THE KINDS A FIELD IS, by the first rule its name matches; the last rule catches everything as text. */
/* EVERY FORM IS ITS KIND'S (data/settings/kinds.json `forms`): read from KINDS, each told the kind it fills. */
FORM_SPECS.forms = Object.assign({}, ...Object.keys(ITEM_KINDS.kinds).map(k => Object.fromEntries(Object.entries(ITEM_KINDS.kinds[k].forms || {}).map(([id, f]) => [id, Object.assign({ item: k }, f)]))));
/* A FORM ASKED IN FIND, ONE FIELD A STEP (`ask: "find"`): its fields in order, and one field's spec (many, need, given, ask). */
const formAsks_ = id => ((FORM_SPECS.forms[id] || {}).fields || []).map(x => x.f);
const formAsk_ = (id, f) => ((FORM_SPECS.forms[id] || {}).fields || []).find(x => x.f === f) || {};
const FORM_RULES_ =FORM_SPECS.rules.map(r => ({ kind: r.kind, re: new RegExp(r.match) }));
const formKind_ = f => (FORM_RULES_.find(r => r.re.test(String(f || ''))) || { kind: 'text' }).kind;

/* ONE FIELD, ONE LINE: every kind but a box with no column behind it goes through `fieldHtml`, the one line-drawer. */
function formField_(f, value, o) {
  return fieldHtml(f, value, o);
}
/* A TICK THAT SAVES THE MOMENT IT IS TICKED, with a bold name and a faint note: `t.act` is its handler, `t.data` its data- attributes. */
function formToggle_(t) {
  const attrs = { type: 'checkbox', 'data-do': t.act == null ? '' : String(t.act) };
  Object.keys(t.data || {}).forEach(k => { attrs['data-' + k] = String(t.data[k] == null ? '' : t.data[k]); });
  attrs.checked = !!t.on;
  return cardBlock_({ type: 'group', tag: 'label', look: 'check role-pick' + (t.cls ? ' ' + t.cls : ''), blocks: [{ type: 'control', attrs },
    { type: 'group', tag: 'span', look: 'box' },
    { type: 'group', tag: 'span', look: 'role-pick-say', text: [{ b: t.label }, ' ', { span: 'qtag', text: t.note || '' }] }] });
}

/* THE CARD: a title, then `groups` (backend field lists, forms.json's `settings` form), `ask` (a kinds.json form asked a field a step) or `toggles`; `spec.id` fills it from FORM_SPECS.cards. */
/* Saving as you type is `autosaveHear_`, which hears every `.set-shape .me-form` this draws. */
function formCard_(spec) {
  const s = Object.assign({}, (spec && spec.id && FORM_SPECS.cards[spec.id]) || {}, spec || {});
  const fields = s.groups ? formOf_('settings', null, Object.assign({ head: false, attr: 'data-me', groups: s.groups }, s.fieldOpts || {})) : '';
  /* A CARD THAT IS A FORM ASKED A FIELD A STEP (`ask`, kinds.json): the same chips and menu as Find's, its send the last step. */
  const asked = s.ask ? askArea_(s.ask) : '';
  const ticks = (s.toggles || []).map(formToggle_).join('');
  const save = s.save && s.save.act ? tile_(s.save) : s.save;
  const after = (s.said ? cardBlock_({ type: 'group', tag: 'p', look: 'note', id: s.said }) : '') + (s.after || '');
  const card = { title: s.title, cls: s.cls, attrs: s.attrs, lead: s.lead, save: save, after: after };
  if (s.groups) return setCard_(Object.assign(card, { form: fields, formAttrs: s.formAttrs, foot: s.foot }));
  return setCard_(Object.assign(card, { body: (s.body || '') + asked + ticks + (s.tail || '') }));
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
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(pre) === 0) keys.push(k); }
    keys.forEach(k => draftDrop_('form', k.slice(draftKey_('form', '').length)));
  } catch (e) { /* storage blocked: nothing was kept */ }
}
const formName_ = (f, o) => String(f || '').replace(/\{(\w+)\}/g, (m, k) => String(((o && o.vars) || {})[k] == null ? '' : o.vars[k]));
/* ONE BOX OF A FORM, by its type. `v` is what is saved; a "form" draft is kept against `o.was`, and drawn back here. */
function formFieldOf_(spec, x, v, o, id) {
  const a = x.attr || spec.attr, f = formName_(x.f, o), val = v == null ? '' : String(v), ro = x.readonly ? ' disabled' : '';
  const more = (o.with && o.with(f, x)) || {};
  if (more.label) x = Object.assign({}, x, { label: more.label });
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
    { type: 'group', look: 'btn-row', tiles: [{ form: true, kind: 'quiet', label: (o.docs || {})[f] ? 'Change photo' : 'Choose photo', act: x.act || 'apply-pick' }] },
    { type: 'group', tag: 'p', look: 'note apply-doc-said', text: (o.docs || {})[f] ? 'Photo ready.' : '' },
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
      + (own ? askSetRest_(g, rest, o, value, wantsPhone, plain) : fieldRows_(rest, (f, extra) => f === 'phone' && wantsPhone ? phoneField_(value) : plain(f, extra)))
      + (photos ? videoPicker_(value) + photoShelf_(list, value) : '');
    return (head ? cardBlock_({ type: 'group', tag: head, look: null, blocks: [{ type: 'group', tag: 'span', look: null, text: g }] }) : '') + body;
  }).join('');
}

/* YOUR OWN SETTINGS' PLAIN FIELDS ARE ASKED (askSetGroup_); a locked field and the phone keep their own boxes. */
function askSetRest_(g, rest, o, value, wantsPhone, plain) {
  const ro = o.readonly || [], kept = f => (f === 'phone' && wantsPhone) || ro.indexOf(f) !== -1;
  const asked = rest.filter(f => !kept(f) && formMay_({ f, type: formKind_(f) }));
  /* IN THE GROUP'S ORDER, so the card posts its fields in the order it always did. */
  const area = asked.length ? askSetGroup_(g, asked, o, value) : '';
  /* A ROW'S FIELDS TOGETHER, as `fieldRows_` placed them (FIELD_ROWS). */
  const order = [];
  rest.forEach(f => { const row = FIELD_ROWS.find(r => r.fields.indexOf(f) !== -1 && r.fields.every(x => rest.indexOf(x) !== -1));
    (row ? row.fields : [f]).forEach(x => { if (order.indexOf(x) === -1) order.push(x); }); });
  return order.map(f => kept(f) ? fieldRows_([f], (x, extra) => x === 'phone' && wantsPhone ? phoneField_(value) : plain(x, extra))
    : asked.indexOf(f) !== -1 ? formHidden_(`data-me="${esc(f)}"`, askSetSaved_(f, value(f))) : '').join('') + area;
}
/* ---------- A SETTINGS CARD'S FIELDS ARE ASKED TOO (owner, 16 Nov: one form for any item): the card's group is a form `set:<group>`, a field a step ---------- */
/* Every field with a value is a chip (tap to change just it); an empty one is asked, with Skip. A yes/no is two tags, a fixed list its tags, */
/* several of a list ticks then "."; anything else the blank tag typed on. A money field still needs may_('prices') (formMay_), so a child sees none. */
/* SAVED THROUGH THE SAME CALL: each field keeps its hidden `data-me` box in the card, so `meSave_` posts the card exactly as it did. */
const askYesNo_ = [{ v: 'TRUE', t: 'Yes' }, { v: 'FALSE', t: 'No' }];
function askSetField_(f, o) {
  const label = ROW_LABEL[f] || fieldLabel(f);
  if (FIELD_IS_BOOL.test(f)) return { f, type: 'choice', label, options: askYesNo_ };
  const opts = f === 'manager' ? managerOptions_(String((o.raw && o.raw.person_id) || (whose_() || {}).personId || '')) : ((o.options ? o.options(f) : null) || []);
  const ov = x => String(x && typeof x === 'object' ? x.v : x), ot = x => String(x && typeof x === 'object' ? x.t : x);
  if (FIELD_MULTI[f] && opts.length) return { f, type: 'choice', many: true, label, options: opts.map(x => ({ v: ov(x), t: ot(x) })) };
  if (opts.length) return { f, type: 'choice', label, options: [{ v: '', t: f === 'manager' ? MANAGER_NONE : NONE_LABEL }].concat(opts.map(x => ({ v: ov(x), t: ot(x) }))) };
  return { f, type: 'text', label, ph: label, pad: FIELD_IS_DECIMAL.test(f) ? 'decimal' : FIELD_IS_NUMERIC.test(f) ? 'numeric' : '' };
}
/* WHAT THE HIDDEN BOX HOLDS: what `meSave_` read off the old box — TRUE/FALSE for a tick, a list joined, else the words. */
const askSetSaved_ = (f, v) => (FIELD_IS_BOOL.test(f) ? (TRUEish_(v) ? 'TRUE' : 'FALSE') : FIELD_MULTI[f] ? profList_(v).join(', ') : String(v == null ? '' : v));
function askSetGroup_(g, list, o, value) {
  const id = 'set:' + g;
  FORM_SPECS.forms[id] = { ask: 'find', look: 'ask-pick', skip: true, back: 'one', fields: list.map(f => askSetField_(f, o)) };
  const was = ASK[id], s = ASK[id] = { v: {}, done: {}, pin: [], more: (was && was.more) || '' };
  list.forEach(f => {
    const saved = askSetSaved_(f, value(f));
    s.v[f] = FIELD_MULTI[f] ? profList_(saved) : saved;
    /* ANSWERED IS WHAT HAS A VALUE, or what this card was already past (skipped or answered); the one being asked again stays asked. */
    s.done[f] = was ? !!was.done[f] : String(value(f) == null ? '' : value(f)).trim() !== '';
  });
  const box = f => askEls_(id).map(el => (el.closest('.me-form') || el.parentNode).querySelector('[data-me="' + f + '"]')).find(Boolean);
  const save = (f, v) => { const b = box(f); if (!b) return; b.value = v; meSave_(b, true); };
  FORM_ASK_[id] = {
    state: () => ASK[id],
    said: x => {
      const v = ASK[id].v[x.f], c = (x.options || []).find(k => String(k.v) === String(v));
      return x.label + ': ' + ((x.many ? (v || []).join(', ') : c ? c.t : String(v == null ? '' : v)) || NONE_LABEL);
    },
    set: (x, v) => save(x.f, v),
    next: x => save(x.f, (ASK[id].v[x.f] || []).join(', ')),
    /* WHAT IS TYPED IS A "set" DRAFT, as the old box's was, until it is saved (meSave_ drops it). */
    keep: (x, v) => { if (setDraftOk_(x.f)) draftKeep_('set', x.f, v); },
    boxValue: (x, v) => (setDraftOk_(x.f) ? draftVal_('set', x.f, String(v == null ? '' : v)) : v),
  };
  return askArea_(id);
}

/* ---------- A FORM ASKED IN FIND, ONE FIELD A STEP (`ask: "find"` in kinds.json; owner, 16 Nov: one form for any item) ---------- */
/* A choice is its tags, a text field the blank tag typed on, a PIN the ten digit tags; each answer is a chip whose tap asks it (and every field after it) again. */
/* A `many` field ticks on a tap, then asks "and" (another) or "." (done); `need` is how many before "." moves on; `given` is answered by the site, still a chip. */
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
  if (x.type === 'text') return { look: 'sign-type', box: { id: o.id != null ? o.id : 'ask-' + id + '-' + x.f, cls: o.cls || 'ask-box',
    value: (h.boxValue ? h.boxValue(x, val) : val) || '', label: x.label || x.ph || '', placeholder: x.ph || '', inputmode: x.pad || (x.input === 'email' ? 'email' : 'text') } };
  const list = h.options ? h.options(x) : (x.options || []).map(c => ({ v: c.v, text: askSay_(c), on: String(val) === String(c.v) }));
  return { look: askLook_(id) + (x.grid ? ' is-grid' : ''), options: list.map(c => ({
    text: (x.many && c.on ? '✓ ' : '') + c.text + (c.off ? ' · ' + c.off : c.note ? ' · ' + c.note : ''), act: o.act || 'ask-pick',
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
  if (askOf_(id).more === x.f) return [{ type: 'choices', ask: askSaid_(id, x) || '', rows: [{ look: askLook_(id) + ' book-more', options: [
    { text: 'and', act: 'ask-and', data: { form: id, f: x.f }, label: 'And another' }, { text: '.', act: 'ask-next', data: { form: id, f: x.f }, label: 'Done, move on' }] }] }];
  const pin = x.type === 'pin' ? askOf_(id).pin.length : 0, tags = askTags_(id, x);
  /* A FORM WHOSE FIELDS MAY STAY EMPTY (`skip`) offers Skip beside each. */
  const skip = spec.skip ? [{ text: 'Skip', act: 'ask-skip', data: { form: id, f: x.f }, label: 'Leave this empty for now' }] : [];
  return [{ type: 'choices', ask: [x.ask || (h.label && h.label(x)) || x.label || x.ph, pin ? '*'.repeat(pin) : '', x.note].filter(Boolean).join(' '),
    rows: [tags.box ? { look: 'sign-who', options: [tags].concat(skip) } : Object.assign({}, tags, { options: tags.options.concat(skip) })] }];
}
/* THE ANSWERS AS CHIPS: a PIN is a * per digit, never the digits. */
function askChips_(id, look) {
  return askFields_(id).filter(x => askPassed_(id, x)).map(x => {
    const text = askSaid_(id, x) || 'None', label = 'Change ' + text;
    return { base: 'chip', look: look || 'sm ask-chip', text: text, act: 'ask-back', data: { form: id, f: x.f }, label: label, x: { label: label }, colour: false };
  });
}
/* A FIELD ANSWERED, and on to the next. */
function askSet_(id, f, v) {
  const s = askOf_(id), x = formAsk_(id, f), h = askHook_(id);
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
  const h = askHook_(id), x = formAsk_(id, f);
  if (h.keep) h.keep(x, t.value); else if (askKeeps_(id, x)) draftKeep_('ask', id + ':' + f, t.value);
});
/* ENTER IN A TEXT FIELD'S BLANK TAG (the keypad's ✓ is its Enter) ANSWERS IT, as a tap answers a tag. */
document.addEventListener('keydown', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('ask-box') || !/^Enter$/.test(e.key)) return;
  e.preventDefault();
  const rest = String(t.id || '').slice(4), cut = rest.lastIndexOf('-'), v = String(t.value || '').trim();
  if (!v) { toast(text_('type-your-name-username-or-email')); return; }
  askSet_(rest.slice(0, cut), rest.slice(cut + 1), v);
});
