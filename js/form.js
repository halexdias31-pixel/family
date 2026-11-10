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
const FORM_BOX_ATTRS_ = { pin: ' type="password" inputmode="numeric" autocomplete="one-time-code"' };
function formBox_(b) {
  return `<label class="field"><input id="${esc(b.id)}" aria-label="${esc(b.label || b.ph || '')}"${
    b.ph ? ` placeholder="${esc(b.ph)}"` : ''}${FORM_BOX_ATTRS_[b.kind] || ''}></label>`;
}
/* A TICK THAT SAVES THE MOMENT IT IS TICKED, with a bold name and a faint note: `t.act` is its handler, `t.data` its data- attributes. */
function formToggle_(t) {
  const data = Object.keys(t.data || {}).map(k => ` data-${k}="${esc(t.data[k])}"`).join('');
  return `<label class="check role-pick${t.cls ? ' ' + t.cls : ''}">
        <input type="checkbox" data-do="${esc(t.act)}"${data}${t.on ? ' checked' : ''}>
        <span class="box"></span><span class="role-pick-say"><b>${esc(t.label)}</b>
          <span class="qtag">${esc(t.note || '')}</span></span></label>`;
}

/* THE CARD: a title, then `groups` (backend field lists via `fieldsHtml`), `boxes` or `toggles`; `spec.id` fills it from FORM_SPECS.cards. */
/* Saving as you type is `autosaveHear_`, which hears every `.set-shape .me-form` this draws. */
function formCard_(spec) {
  const s = Object.assign({}, (spec && spec.id && FORM_SPECS.cards[spec.id]) || {}, spec || {});
  const fields = s.groups ? fieldsHtml(s.groups, Object.assign({ head: false, attr: 'data-me' }, s.fieldOpts || {})) : '';
  const boxes = (s.boxes || []).map(formBox_).join('');
  const ticks = (s.toggles || []).map(formToggle_).join('');
  const save = s.save && s.save.act ? tile_(s.save) : s.save;
  const after = (s.said ? `<p class="note" id="${esc(s.said)}"></p>` : '') + (s.after || '');
  const card = { title: s.title, cls: s.cls, attrs: s.attrs, lead: s.lead, save: save, after: after };
  if (s.groups) return setCard_(Object.assign(card, { form: fields, formAttrs: s.formAttrs, foot: s.foot }));
  return setCard_(Object.assign(card, { body: (s.body || '') + boxes + ticks + (s.tail || '') }));
}

/* THE RAW BOXES: every input, menu and text area on a Settings screen is written by these, so a box has one shape everywhere. `a` is its attribute text. */
const formInput_ = a => `<input ${a}>`;
const formSelect_ = (a, opts) => `<select ${a}>${opts}</select>`;
const formArea_ = (a, text) => `<textarea ${a}>${esc(text == null ? '' : String(text))}</textarea>`;
const formHidden_ = (a, v, more) => formInput_(`type="hidden" ${a} value="${esc(v == null ? '' : String(v))}"${more || ''}`);
const formFile_ = (cls, accept) => formInput_(`type="file" class="${cls}" accept="${accept}" hidden`);
/* A LABELLED LINE: a faint name over its box; `cls` adds to class="field". */
const formLine_ = (label, box, cls) => `<label class="field${cls ? ' ' + cls : ''}">${label != null && label !== '' ? `<span>${esc(label)}</span>` : ''}${box}</label>`;
/* A TICK: `a` is the checkbox's attributes, `say` the html beside the box. */
const formTick_ = (a, say, cls, la) => `<label class="check${cls ? ' ' + cls : ''}"${la ? ' ' + la : ''}>${formInput_('type="checkbox" ' + a)}<span class="box"></span>${say}</label>`;
/* A SLIDER WITH ITS TYPED TWIN: both carry `a` (their data- key), so dragging and typing write the same value. */
function formSlider_(a, o) {
  return formInput_(`type="range" ${a} data-noswipe min="${o.min}" max="${o.max}" step="${o.step}" value="${o.value}" aria-label="${esc(o.label)}"${o.id ? ` id="${o.id}"` : ''}`)
    + formInput_(`type="number" class="pf-num" ${a} min="0"${o.numMax != null ? ` max="${o.numMax}"` : ''} step="${o.step}" value="${o.value}" inputmode="decimal" aria-label="${esc(o.label + ', typed')}"`);
}
/* A PHONE: the country-code menu and the number, side by side, saved as you type under `cc` and `no`. */
function formPhone_(cc, no, ccOpts, noAttrs) {
  return `<label class="field">${formSelect_(`data-me="${cc}" aria-label="Country code"`, ccOpts)}</label>
      <label class="field">${formInput_(`type="tel" data-me="${no}" inputmode="tel" autocomplete="off" ${noAttrs || ''}`)}</label>`;
}
