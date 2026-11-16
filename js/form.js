/* @family. — form.js ONE FORM MAKER (84a): every Settings card is drawn here from a spec, so spacing, buttons and labels cannot drift card to card. */

/* THE SPECS ARE data/settings/forms.json; this is its copy, which check-forms.js holds equal to the file. */
const FORM_SPECS = {
  "kinds": ["text","number","money","choice","toggle","date","time","picture","list","pin","slider","phone","file","tick","hidden","long","ticks","toggles","search","timetable","many","doc","head","subjects","shelf","dob"],
  "rules": [
    {"kind":"list","match":"^(qual_\\d+|job_\\d+|lib\\d+_|photo_\\d+)|^video$|^venues_ok$"},
    {"kind":"picture","match":"^photo$"},
    {"kind":"toggle","match":"^(dbs|active|listed|is_|has_|allow|paid|trackable|stealable)"},
    {"kind":"date","match":"_date$|^date_of_birth$|^dob_[dmy]$"},
    {"kind":"time","match":"^(m|tu|w|th|f|sa|su)\\d\\d$"},
    {"kind":"money","match":"rate|price|cost|fee|seat_cut"},
    {"kind":"choice","match":"^(borough|city|town|focus|favourite_colour|school_year)$"},
    {"kind":"number","match":"hours|km|fraction|pages|year|students|days|weeks|count|level_required|age_|_cut$"},
    {"kind":"text","match":""}
  ],
  "cards": {
    "signing-in": {
      "title": "Signing in",
      "boxes": [
        {
          "id": "pin-now",
          "kind": "pin",
          "label": "current PIN",
          "ph": "current PIN"
        },
        {
          "id": "pin-new",
          "kind": "pin",
          "label": "new PIN, 4 numbers, not 1234",
          "ph": "new PIN, 4 numbers"
        },
        {
          "id": "pin-again",
          "kind": "pin",
          "label": "new PIN again",
          "ph": "new PIN again"
        }
      ],
      "save": {
        "icon": "save",
        "label": "Save",
        "note": "your new PIN",
        "act": "pin-save"
      },
      "said": "pin-said"
    }
  },
  "forms": {
    "say": "FORMS FROM THE ITEM SHAPE (foundation 2): a form is an item kind (item-shape.json) plus this field list: which fields, their order, type (a FORM kind), caption or placeholder, and `may` (a may_() word) for who sees it; money fields also need may_('prices'), so a child never sees a price. `draft`: \"form\" keeps each box a draft until saved (the handler drops it on success), \"set\" is Settings' own (fieldHtml), false none. `fields`: a list, or \"groups\"/\"list\" for names the backend sends, typed by `rules`. `{x}` in a name is o.vars.x. Drawn by formOf_ (js/form.js) through renderCard's field/control blocks.",
    "person-add": {"item": "person", "attr": "data-pa", "fields": [
      {"f":"first","type":"text","ph":"First name"},
      {"f":"last","type":"text","ph":"Last name"},
      {"f":"role","type":"choice","label":"Role","draft":false},
      {"f":"email","type":"text","input":"email","ph":"Email","phKid":"Email (optional)"},
      {"f":"dob","type":"date","label":"Date of birth (optional)"}
    ], "draft": "form"},
    "person-form": {"item": "person", "attr": "data-pf", "fields": [
      {"f":"first","type":"text","ph":"First name","row":"names"},
      {"f":"last","type":"text","ph":"Last name","row":"names"},
      {"f":"roles","type":"ticks","attr":"data-pf-role","label":"Role","look":"pf-roles","tickLook":""},
      {"f":"email","type":"text","input":"email","ph":"Email (optional)"},
      {"f":"dob","type":"date","label":"Date of birth (optional)"},
      {"f":"parents","type":"ticks","attr":"data-pf-parent","label":"Parents","draft":false,"look":"pf-ticks","tickLook":""},
      {"f":"parent","type":"choice","label":"Their parent (optional)","draft":false}
    ], "draft": "form"},
    "person-edit": {"item": "person", "attr": "data-pe", "fields": [
      {"f":"first_name","type":"text"},
      {"f":"last_name","type":"text"},
      {"f":"handle","type":"text","label":"handle (theirs to change)","readonly":true},
      {"f":"dob","type":"date","label":"date of birth"},
      {"f":"email","type":"text","input":"email"},
      {"f":"phone","type":"phone","input":"tel"},
      {"f":"address","type":"text"},
      {"f":"postcode","type":"text"}
    ], "draft": "form"},
    "settings": {"item": "person", "attr": "data-me", "draft": "set", "fields": "groups", "say": "Settings cards: the backend's field groups; a timetable group is the week grid, lib/qual/job/photo names their shelves, dob_* the three boxes, phone the code and number, photo the picture."},
    "card-edit": {"item": "tutor", "attr": "data-me", "draft": false, "fields": "list", "say": "the tutor card's edit form (cardEditForm_): its sections' names, typed by rules; a price only for may_('prices')."},
    "card-seat": {"item": "tutor", "attr": "data-pound", "draft": false, "say": "the extra seat in pounds, kept as the share in the hidden twin; @family.'s share only for an admin.", "fields": [
      {"f":"extra_seat_rate","type":"money"},
      {"f":"extra_seat_rate","type":"hidden","attr":"data-me"},
      {"f":"extra_seat_cut","type":"money","may":"admin"},
      {"f":"extra_seat_cut","type":"hidden","attr":"data-me","may":"admin"}
    ]},
    "card-where": {"item": "tutor", "attr": "data-me", "draft": false, "say": "Where you teach: an area a tick, rewriting the hidden venues_ok, saved by the card's Save.", "fields": [
      {"f":"venues_ok","type":"hidden"},
      {"f":"areas","type":"ticks","attr":"data-where-area","label":"Areas you teach in","look":"many-list where-areas"}
    ]},
    "library-card": {"item": "person", "attr": "data-me", "draft": "set", "say": "one library card on the shelf; a library PIN is not a sign-in PIN and keeps no draft (setDraftOk_).", "fields": [
      {"f":"lib{n}_name","type":"text","ph":"Library name","look":"lib-name","quiet":true},
      {"f":"lib{n}_pin","type":"text","label":"PIN","look":"lib-pin","quiet":true,"blank":true},
      {"f":"lib{n}_no","type":"text","ph":"Card number","look":"lib-no","quiet":true}
    ]},
    "job": {"item": "person", "attr": "data-me", "draft": "set", "say": "one job on the shelf: role, where, from–to.", "fields": [
      {"f":"job_{n}_role","type":"text","ph":"role","max":80},
      {"f":"job_{n}_where","type":"text","ph":"where","max":80},
      {"f":"job_{n}_from","type":"text","ph":"from","max":80},
      {"f":"job_{n}_to","type":"text","ph":"to, or now","max":80}
    ]},
    "dob": {"item": "person", "attr": "data-me", "draft": "set", "say": "a date of birth as three boxes.", "fields": [
      {"f":"dob_d","type":"text","ph":"DD","max":2,"pad":"numeric"},
      {"f":"dob_m","type":"text","ph":"MM","max":2,"pad":"numeric"},
      {"f":"dob_y","type":"text","ph":"YYYY","max":4,"pad":"numeric"}
    ]},
    "family-pick": {"item": "person", "attr": "data-fam-q", "draft": false, "say": "a family picker: a name looked up, not work, retyped in a second.", "fields": [
      {"f":"{scope}","type":"search","ph":"name or @handle","want":"{want}"}
    ]},
    "notify": {"item": "person", "attr": "data-do", "draft": false, "say": "Notifications: each tick a setNotify the moment it is ticked (formToggle_).", "fields": [
      {"f":"kinds","type":"toggles"}
    ]},
    "apply-teach": {"item": "person", "attr": "data-app", "draft": "form", "say": "Apply to teach (400): one sheet, kept as drafts until it is sent.", "fields": [
      {"f":"","type":"head","label":"You"},
      {"f":"fullName","type":"text","label":"full name"},
      {"f":"phone","type":"text","input":"tel","label":"phone","row":"r1"},
      {"f":"email","type":"text","input":"email","label":"email","row":"r1"},
      {"f":"address","type":"long","label":"home address"},
      {"f":"postcode","type":"text","label":"postcode","caps":true,"row":"r2"},
      {"f":"dob","type":"date","label":"date of birth","row":"r2"},
      {"f":"","type":"head","label":"Documents"},
      {"f":"idDoc","type":"doc","label":"photo ID — passport or driving licence"},
      {"f":"rightToWork","type":"choice","label":"right to work in the UK","options":[["","Choose"],["yes","Yes"],["no","No"]]},
      {"f":"rtwDoc","type":"doc","label":"right-to-work document — passport, share code or visa"},
      {"f":"","type":"head","label":"What you teach"},
      {"f":"subjects","type":"subjects"},
      {"f":"qualifications","type":"long","label":"qualifications — degrees, teaching qualifications, anything relevant"},
      {"f":"qual0","type":"doc","label":"a qualification certificate"},
      {"f":"qual1","type":"doc","label":"another qualification certificate (optional)"},
      {"f":"qual2","type":"doc","label":"another qualification certificate (optional)"},
      {"f":"rate","type":"money","input":"number","label":"hourly rate (£)","min":"1","step":"0.5"},
      {"f":"","type":"head","label":"Checks"},
      {"f":"dbsNumber","type":"text","label":"enhanced DBS certificate number","row":"r3"},
      {"f":"dbsIssued","type":"date","label":"issued on","row":"r3"},
      {"f":"dbsUpdate","type":"tick","label":"I consent to you checking it on the DBS Update Service"},
      {"f":"dbsNeeded","type":"tick","label":"I need a DBS check"},
      {"f":"","type":"head","label":"When and where"},
      {"f":"availability","type":"timetable","label":"when you can teach"},
      {"f":"area","type":"text","label":"area and venues you can reach"},
      {"f":"experience","type":"long","label":"experience"},
      {"f":"","type":"head","label":"2 references"},
      {"f":"ref1Name","type":"text","label":"name","row":"a1"},
      {"f":"ref1Relationship","type":"text","label":"relationship to you","row":"a1"},
      {"f":"ref1Email","type":"text","input":"email","label":"email","row":"b1"},
      {"f":"ref1Phone","type":"text","input":"tel","label":"phone","row":"b1"},
      {"f":"ref2Name","type":"text","label":"name","row":"a2"},
      {"f":"ref2Relationship","type":"text","label":"relationship to you","row":"a2"},
      {"f":"ref2Email","type":"text","input":"email","label":"email","row":"b2"},
      {"f":"ref2Phone","type":"text","input":"tel","label":"phone","row":"b2"},
      {"f":"statement","type":"long","label":"a short statement — why you want to teach"},
      {"f":"cvLink","type":"text","input":"url","label":"CV link (optional)","ph":"https://…"},
      {"f":"consent","type":"tick","label":"I agree to @family. keeping these details and documents privately to consider my application, contacting my referees and checking my DBS."}
    ]},
    "sign-join": {"item":"person","attr":"data-sj","draft":false,"say":"Find's Make an account card (owner, 15 Nov): who it is for, the names, the email and a PIN; sent as `register`. No draft, so the PIN is never kept.","fields":[{"f":"who","type":"choice","label":"who is the account for?"},{"f":"first","type":"text","ph":"First name","row":"names"},{"f":"last","type":"text","ph":"Last name","row":"names"},{"f":"email","type":"text","input":"email","ph":"Email"},{"f":"pin","type":"text","input":"password","label":"PIN — 4 digits"}]}
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

/* THE CARD: a title, then `groups` (backend field lists, forms.json's `settings` form), `boxes` or `toggles`; `spec.id` fills it from FORM_SPECS.cards. */
/* Saving as you type is `autosaveHear_`, which hears every `.set-shape .me-form` this draws. */
function formCard_(spec) {
  const s = Object.assign({}, (spec && spec.id && FORM_SPECS.cards[spec.id]) || {}, spec || {});
  const fields = s.groups ? formOf_('settings', null, Object.assign({ head: false, attr: 'data-me', groups: s.groups }, s.fieldOpts || {})) : '';
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
      + fieldRows_(rest, (f, extra) => f === 'phone' && wantsPhone ? phoneField_(value) : plain(f, extra))
      + (photos ? videoPicker_(value) + photoShelf_(list, value) : '');
    return (head ? cardBlock_({ type: 'group', tag: head, look: null, blocks: [{ type: 'group', tag: 'span', look: null, text: g }] }) : '') + body;
  }).join('');
}
