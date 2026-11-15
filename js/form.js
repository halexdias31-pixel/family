/* @family. — form.js ONE FORM MAKER (84a): every Settings card is drawn here from a spec, so spacing, buttons and labels cannot drift card to card. */

/* THE SPECS ARE data/settings/forms.json; this is its copy, which check-forms.js holds equal to the file. */
const FORM_SPECS = {
  "kinds": ["text", "number", "money", "choice", "toggle", "date", "time", "picture", "list", "pin", "slider", "phone", "file", "tick", "hidden"],
  "rules": [
    { "kind": "list", "match": "^(qual_\\d+|job_\\d+|lib\\d+_|photo_\\d+)|^video$|^venues_ok$" },
    { "kind": "picture", "match": "^photo$" },
    { "kind": "toggle", "match": "^(dbs|active|listed|is_|has_|allow|paid|trackable|stealable)" },
    { "kind": "date", "match": "_date$|^date_of_birth$|^dob_[dmy]$" },
    { "kind": "time", "match": "^(m|tu|w|th|f|sa|su)\\d\\d$" },
    { "kind": "money", "match": "rate|price|cost|fee" },
    { "kind": "number", "match": "hours|km|fraction|pages|year|students|days|weeks|count|level_required|age_|_cut$" },
    { "kind": "choice", "match": "^(borough|city|town|focus|favourite_colour)$" },
    { "kind": "text", "match": "" }
  ],
  "cards": {
    "signing-in": {
      "title": "Signing in",
      "boxes": [
        { "id": "pin-now", "kind": "pin", "label": "current PIN", "ph": "current PIN" },
        { "id": "pin-new", "kind": "pin", "label": "new PIN, 4 numbers, not 1234", "ph": "new PIN, 4 numbers" },
        { "id": "pin-again", "kind": "pin", "label": "new PIN again", "ph": "new PIN again" }
      ],
      "save": { "icon": "save", "label": "Save", "note": "your new PIN", "act": "pin-save" },
      "said": "pin-said"
    }
  },
  "forms": {
   "say": "FORMS FROM THE ITEM SHAPE (foundation 2): a form is an item kind (item-shape.json) plus this field list: which fields, their order, type (a FORM kind), caption or placeholder, and `may` (a may_() word) for who sees it; money fields also need may_('prices'). Drawn by formOf_ (js/form.js) through renderCard's field/control blocks.",
   "person-add": {
    "item": "person",
    "attr": "data-pa",
    "fields": [
     {
      "f": "first",
      "type": "text",
      "ph": "First name"
     },
     {
      "f": "last",
      "type": "text",
      "ph": "Last name"
     },
     {
      "f": "role",
      "type": "choice",
      "label": "Role"
     },
     {
      "f": "email",
      "type": "text",
      "input": "email",
      "ph": "Email",
      "phKid": "Email (optional)"
     },
     {
      "f": "dob",
      "type": "date",
      "label": "Date of birth (optional)"
     }
    ]
   },
   "person-form": {
    "item": "person",
    "attr": "data-pf",
    "fields": [
     {
      "f": "first",
      "type": "text",
      "ph": "First name",
      "row": "names"
     },
     {
      "f": "last",
      "type": "text",
      "ph": "Last name",
      "row": "names"
     },
     {
      "f": "email",
      "type": "text",
      "input": "email",
      "ph": "Email (optional)"
     },
     {
      "f": "dob",
      "type": "date",
      "label": "Date of birth (optional)"
     }
    ]
   },
   "person-edit": {
    "item": "person",
    "attr": "data-pe",
    "fields": [
     {
      "f": "first_name",
      "type": "text"
     },
     {
      "f": "last_name",
      "type": "text"
     },
     {
      "f": "handle",
      "type": "text",
      "label": "handle (theirs to change)",
      "readonly": true
     },
     {
      "f": "dob",
      "type": "date",
      "label": "date of birth"
     },
     {
      "f": "email",
      "type": "text",
      "input": "email"
     },
     {
      "f": "phone",
      "type": "phone",
      "input": "tel"
     },
     {
      "f": "address",
      "type": "text"
     },
     {
      "f": "postcode",
      "type": "text"
     }
    ]
   }
  }
};

/* WHICH OF THE KINDS A FIELD IS, by the first rule its name matches; the last rule catches everything as text. */
const FORM_RULES_ = FORM_SPECS.rules.map(r => ({ kind: r.kind, re: new RegExp(r.match) }));
const formKind_ = f => (FORM_RULES_.find(r => r.re.test(String(f || ''))) || { kind: 'text' }).kind;

/* ONE FIELD, ONE LINE: every kind but a box with no column behind it goes through `fieldHtml`, the one line-drawer. */
function formField_(f, value, o) {
  return fieldHtml(f, value, o);
}
/* A BOX WITH NO COLUMN BEHIND IT (a PIN): its id is what its handler reads, and it is never saved as you type. */
const FORM_BOX_ATTRS_ = { pin: { type: 'password', inputmode: 'numeric', autocomplete: 'one-time-code' } };
function formBox_(b) {
  return cardBlock_({ type: 'field', blocks: [{ type: 'control', attrs: Object.assign({ id: b.id, 'aria-label': b.label || b.ph || '',
    placeholder: b.ph || null }, FORM_BOX_ATTRS_[b.kind] || {}) }] });
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

/* THE CARD: a title, then `groups` (backend field lists via `fieldsHtml`), `boxes` or `toggles`; `spec.id` fills it from FORM_SPECS.cards. */
/* Saving as you type is `autosaveHear_`, which hears every `.set-shape .me-form` this draws. */
function formCard_(spec) {
  const s = Object.assign({}, (spec && spec.id && FORM_SPECS.cards[spec.id]) || {}, spec || {});
  const fields = s.groups ? fieldsHtml(s.groups, Object.assign({ head: false, attr: 'data-me' }, s.fieldOpts || {})) : '';
  const boxes = (s.boxes || []).map(formBox_).join('');
  const ticks = (s.toggles || []).map(formToggle_).join('');
  const save = s.save && s.save.act ? tile_(s.save) : s.save;
  const after = (s.said ? cardBlock_({ type: 'group', tag: 'p', look: 'note', id: s.said }) : '') + (s.after || '');
  const card = { title: s.title, cls: s.cls, attrs: s.attrs, lead: s.lead, save: save, after: after };
  if (s.groups) return setCard_(Object.assign(card, { form: fields, formAttrs: s.formAttrs, foot: s.foot }));
  /* boxes with their own Save (the PIN card) are one form: the Save sits with its boxes, never as a stray tile; a div, not <form>, so Enter never submits a PIN into the URL. */
  if (boxes && save) return setCard_(Object.assign(card, { save: '', body: (s.body || '') + cardBlock_({ type: 'group', look: 'kc-form', inner: boxes + ticks + (s.tail || '') + cardBlock_({ type: 'group', look: 'tile-row set-save', inner: save }) }) }));
  return setCard_(Object.assign(card, { body: (s.body || '') + boxes + ticks + (s.tail || '') }));
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
/* A SLIDER WITH ITS TYPED TWIN: both carry `a` (their data- key), so dragging and typing write the same value. */
function formSlider_(a, o) {
  return formInput_(`type="range" ${a} data-noswipe min="${o.min}" max="${o.max}" step="${o.step}" value="${o.value}" aria-label="${esc(o.label)}"${o.id ? ` id="${o.id}"` : ''}`)
    + formInput_(`type="number" class="pf-num" ${a} min="0"${o.numMax != null ? ` max="${o.numMax}"` : ''} step="${o.step}" value="${o.value}" inputmode="decimal" aria-label="${esc(o.label + ', typed')}"`);
}
/* A PHONE: the country-code menu and the number, side by side, saved as you type under `cc` and `no`. */
function formPhone_(cc, no, ccOpts, noAttrs) {
  return formLine_('', formSelect_(`data-me="${cc}" aria-label="Country code"`, ccOpts))
    + formLine_('', formInput_(`type="tel" data-me="${no}" inputmode="tel" autocomplete="off" ${noAttrs || ''}`));
}

/* ---------- A FORM FROM THE ITEM SHAPE (foundation 2): `formOf_(id, values, o)` draws forms.json's `forms[id]` — an item kind and its field list, in order. */
/* A field with `may` shows only if may_(may); a money field also needs may_('prices'), so a child never sees a price. o: options, kid, skip, only. */
const formMay_ = x => (!x.may || (typeof may_ === 'function' && may_(x.may))) && (x.type !== 'money' || typeof may_ !== 'function' || may_('prices'));
function formFieldOf_(spec, x, v, o) {
  const a = spec.attr, val = v == null ? '' : String(v), ro = x.readonly ? ' disabled' : '';
  if (x.type === 'choice') return formLine_(x.label || '', cardBlock_({ type: 'control', tag: 'select', attrs: { [a]: x.f },
    options: ((o.options || {})[x.f] || []).map(c => Array.isArray(c) ? { value: c[0], text: c[1], on: c[0] === val } : c) }));
  if (x.type === 'date') return formLine_(x.label || '', formInput_(`type="date" ${a}="${x.f}" value="${esc(val)}"${ro}`));
  const ph = (o.kid && x.phKid) || x.ph;
  if (ph) return formLine_('', formInput_(`${a}="${x.f}" placeholder="${esc(ph)}" autocomplete="off"${x.input ? ` type="${x.input}"` : ''} value="${esc(val)}"${ro}`));
  return formField_(x.f, val, { attr: a, draft: false, readonly: !!x.readonly, label: x.label,
    extra: (x.input ? `type="${x.input}" ` : '') + 'autocomplete="off"' });
}
function formOf_(id, values, o) {
  o = o || {};
  const spec = FORM_SPECS.forms[id];
  if (!spec) return '';
  const get = typeof values === 'function' ? values : f => (values || {})[f];
  const list = spec.fields.filter(x => formMay_(x) && (o.skip || []).indexOf(x.f) === -1 && (!o.only || o.only.indexOf(x.f) !== -1));
  const out = [];
  list.forEach((x, i) => {
    if (x.row && list[i - 1] && list[i - 1].row === x.row) return;
    const row = x.row ? list.filter(y => y.row === x.row) : null;
    out.push(row ? cardBlock_({ type: 'group', look: 'f-row', attrs: { style: '--n:' + row.length }, inner: row.map(y => formFieldOf_(spec, y, get(y.f), o)).join('') })
      : formFieldOf_(spec, x, get(x.f), o));
  });
  return out.join('');
}
