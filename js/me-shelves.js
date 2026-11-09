
/* A ROUND TRIP THAT CANNOT FAIL SILENTLY. § */
function send_(body, o) {
  o = o || {};
  const btn = o.button;
  /* AN ID OR THE ELEMENT ITSELF. A settings card's status line is a CLASS, one per card — there are
     a dozen on one column, so it cannot be an id — and the caller already holds the element. */
  const say = msg => {
    const el = o.where && (typeof o.where === 'string' ? $(o.where) : o.where);
    if (el) el.textContent = msg; else toast(msg);
  };

  /* `is-busy` IS THE SPINNER, and it goes on whether or not there is a `busy` label -- a
     button with no relabel still has to show that it is waiting. See `.btn.is-busy`. */
  /* `data-unlocked` — SEE BELOW: a control that queues its own press behind the save is left live. */
  if (btn) { btn.disabled = !btn.hasAttribute('data-unlocked'); btn.classList.add('is-busy');
             /* A TILE HAS NO WORD TO SWAP — its face is a mark, and writing text over it would lose
                the mark for good. The ring is the whole of its busy state. */
             if (o.busy && !btn.classList.contains('tile')) { btn.dataset.was = btn.textContent; btn.textContent = o.busy; } }
  if (o.saying) say(o.saying);

  /* ---------- AND THE FIELDS, WHICH IS THE HALF THAT WAS MISSING § */
  const box = o.lock
    ? (typeof o.lock === 'string' ? $(o.lock) : o.lock)
    : btn && btn.closest('.me-form, .msg-form, .rc, #sheet-body, .card');
  const had = document.activeElement;
  const locked = [];
  if (box) {
    [].forEach.call(box.querySelectorAll('input, select, textarea, button'), el => {
      if (el === btn || el.disabled || el.hasAttribute('data-unlocked')) return;
      el.disabled = true;
      locked.push(el);
    });
    box.classList.add('is-sending');
  }

  const done = () => {
    locked.forEach(el => { el.disabled = false; });
    locked.length = 0;
    if (box) box.classList.remove('is-sending');
    /* ONLY IF THE PAGE STILL HOLDS IT. A reply that repaints the card replaces the element that
       had the caret, and focusing a detached node moves focus to the body -- which is worse than
       leaving it where the repaint put it. */
    if (had && had.focus && document.contains(had)) { try { had.focus(); } catch (e) { /* focus and scrolling are niceties */ } }
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove('is-busy');
    if (btn.dataset.was) { btn.textContent = btn.dataset.was; delete btn.dataset.was; }
  };

  return api(body)
    .then(d => {
      /* A REPLY CARRYING AN ERROR IS A FAILURE, and was being treated as success by anything that
         only checked whether the request went through. */
      /* AND IT IS MARKED `refused` — THE SERVER ANSWERED, AND THE ANSWER WAS NO. A caller can then tell that from a reply that never came: § */
      if (!d || d.error) {
        const refusal = new Error((d && d.error) || 'That did not work.');
        refusal.refused = !!(d && d.error);
        /* AND THE WHOLE REPLY RIDES ON IT, as on `send`'s — a refusal is sometimes a fact for the code as well as a sentence: § */
        refusal.reply = d || null;
        throw refusal;
      }
      done();
      return d;
    })
    .catch(err => {
      done();
      /* THE MESSAGE, NOT THE STACK. And a network failure has none worth reading — `Failed to
         fetch` tells somebody on a train nothing they can act on. */
      /* THROUGH `why_`, so the same sentence appears here and in the banner — the line under the button is where somebody looks, the banner is where text can be § */
      say(typeof why_ === 'function' ? why_(err) : String(err && err.message || err));
      /* Rethrown so a caller can still react, and marked so a caller that does not care can tell
         a handled failure from a bug. */
      err.handled = true;
      throw err;
    });
}

/* ONE FIELD RENDERER. There were two, and they had different powers. § */

/* Names that hold a yes or a no. Matched rather than listed, because the sheet grows columns and a
   list has to be remembered — `dbs_checked` and `is_listed` are booleans by their names. */
const FIELD_IS_BOOL = /^(dbs|active|listed|is_|has_|allow|paid|trackable|stealable)/;

/* Names whose keyboard should be a number pad, and which kind. */
const FIELD_IS_DECIMAL = /rate|price|cost|hours|km|fraction/;
const FIELD_IS_NUMERIC = /pages|year|students|days|weeks|count|level_required/;

/* ---------- AND A NAME ENDING `_date` IS A DAY ON A CALENDAR § */
const FIELD_IS_DATE = /_date$/;

/* ---------- TWO LISTS THE BACKEND HAS NEVER BEEN TOLD ABOUT § */
const FIELD_LISTS_ = {
  favourite_colour: ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Navy', 'Purple', 'Pink',
                     'Brown', 'Black', 'White', 'Grey', 'Gold', 'Silver'],
};
/* ---------- WHAT A QUALIFICATION CAN BE IN, AS A LIST THAT IS SPELT RIGHT § */
const QUAL_SUBJECTS = [
  'Accounting', 'Ancient History', 'Arabic', 'Archaeology', 'Art and Design', 'Biology',
  'Business Studies', 'Chemistry', 'Chinese', 'Citizenship', 'Classical Civilisation', 'Combined Science',
  'Computer Science', 'Dance', 'Design and Technology', 'Drama', 'Economics', 'Education',
  'Electronics', 'Engineering', 'English Language', 'English Literature', 'Film Studies',
  'Food Preparation and Nutrition', 'French', 'Further Maths', 'Geography', 'Geology', 'German',
  'Greek', 'History', 'Italian', 'Latin', 'Law', 'Maths', 'Media Studies', 'Medicine', 'Music',
  'Philosophy', 'Physical Education', 'Physics', 'Politics', 'Portuguese', 'Psychology',
  'Religious Studies', 'Russian', 'Sociology', 'Spanish', 'Statistics', 'Theology',
  'PGCE', 'QTS', 'DBS', 'First Aid', 'DofE Gold',
];
/* ---------- AND THE LEVELS, WHICH STOPPED AT A-LEVEL § */
const QUAL_LEVELS = [
  'Entry Level', 'SATs', '11+', 'GCSE', 'IGCSE', 'AS', 'A-Level', 'BTEC', 'T Level',
  'International Baccalaureate', 'Access to HE', 'Foundation Degree', 'HNC', 'HND',
  "Bachelor's degree", "Master's degree", 'PGCE', 'Doctorate', 'Diploma', 'Certificate',
  'Basic', 'Standard', 'Enhanced',
];
/* AND THE GRADES, spelt right ("Distinciton" was on the sheet's list), numbered and lettered, then
   the ones a BTEC and a degree give. */
const QUAL_GRADES = [
  '9', '8', '7', '6', '5', '4', '3', '2', '1', 'A*', 'A', 'B', 'C', 'D', 'E', 'U',
  'Distinction*', 'Distinction', 'Merit', 'Pass',
  'First', '2:1', '2:2', 'Third',
];
/* FIELDS WHOSE ANSWER IS SEVERAL OF THE LIST, stored as one comma-separated cell. */
/* `venues_ok` IS NOT A COLUMN of `people` — it is the venues tab's own `tutors_happy_here`, read and
   written through this one box. See `venuesWrites_` in core.gs for why there is no second copy. */
const FIELD_MULTI = { venues_ok: true };
/* ---------- AND ONE SHELF SLOT'S LIST OFF THE FIRST SLOT'S § */
function fieldOptions_(f) {
  const v = (typeof DATA !== 'undefined' && DATA && DATA.validations) || {};
  const dd = (typeof DATA !== 'undefined' && DATA && DATA.dropdowns) || {};
  const got = x => (x && x.length ? x : null);
  const first = String(f).replace(/^qual_\d+/, 'qual_1');
  if (/^qual_\d+$/.test(String(f))) return QUAL_SUBJECTS;
  if (/^qual_\d+_level$/.test(String(f))) return QUAL_LEVELS;
  if (/^qual_\d+_grade$/.test(String(f))) return QUAL_GRADES;
  return got(v[f]) || FIELD_LISTS_[f] || got(v[first])
    /* THE VENUES ON OFFER ARE THE VENUES THE SITE HAS, by the name the booking form uses for them. */
    || (f === 'venues_ok' ? got((typeof DATA !== 'undefined' && DATA && DATA.venues || [])
                                  .map(x => x && x.title).filter(Boolean)) : null)
    || null;
}

/* ONE FIELD, drawn from what is known about it. § */
/* WHICH OF YOUR OWN FIELDS KEEP A DRAFT — see the note in `fieldHtml`. A SEVERAL-OF-A-LIST DOES NOW
   (`FIELD_MULTI` was refused here while its ticks lived in `#drop`; 315 put them in the card). */
const setDraftOk_ = name => typeof draftAttr_ === 'function'
  && !/pin/i.test(String(name)) && !/^(lib\d+_|qual_)/.test(String(name));
/* ---------- AND A CARD DRAWN HOLDING ONE SAYS SO § */
const SET_HELD_SAY = 'Not saved yet — what you typed here before is still in its box. Save keeps it.';
function setHeldSay_(html) {
  return /\sdata-draft-held\b/.test(html)
    ? html.replace('<p class="faint me-said"></p>', '<p class="faint me-said">' + esc(SET_HELD_SAY) + '</p>') : html;
}
function fieldHtml(name, value, o) {
  o = o || {};
  /* THE EXTRA-SEAT FIGURE IS A SHARE OF THE RATE, NOT POUNDS, and nothing on the box said so: § */
  if (name === 'extra_seat_rate' && !o.label && !o.placeholder) {
    o = Object.assign({}, o, { label: 'extra seat: share of your rate, 0–' + STAFF_SEAT_MAX + ' (0.5 = half)',
      extra: (o.extra || '') + ' type="number" min="0" max="' + STAFF_SEAT_MAX + '" step="0.05"' });
  }
  /* AND THE BUSINESS'S CUT OF IT, PER TUTOR SINCE docs/history/345 — the same kind of figure, so the same caption and the same bounds (`seatCutRefusal_`), and it § */
  if (name === 'extra_seat_cut' && !o.label && !o.placeholder) {
    o = Object.assign({}, o, { label: o.readonly ? "@family.'s share of an extra seat — set by @family. (blank = the usual)"
      : "@family.'s share of an extra seat, 0–2 (blank = the usual)",
      extra: (o.extra || '') + ' type="number" min="0" max="2" step="0.01" inputmode="decimal"' });
  }
  const attr = o.attr || 'data-me';
  const label = o.label || fieldLabel(name);
  const ro = !!o.readonly;
  const v0 = value ?? '';
  /* ---------- AN UNSAVED EDIT IS A DRAFT (data.js; docs/history/317) § */
  const keep = attr === 'data-me' && !ro && o.draft !== false && setDraftOk_(name);
  const saved = FIELD_IS_BOOL.test(name) ? (TRUEish_(v0) ? '1' : '0') : String(v0);
  const da = keep ? draftAttr_('set', name, saved) : '';
  const dv = keep ? draftVal_('set', name, saved) : saved;
  const v = keep && !FIELD_IS_BOOL.test(name) ? dv : v0;

  if (FIELD_IS_BOOL.test(name)) {
    return `<label class="check">
      <input type="checkbox" ${attr}="${esc(name)}" ${(keep ? dv === '1' : TRUEish_(v)) ? 'checked' : ''}
             ${ro ? 'disabled' : ''}${da}>
      <span class="box"></span><span>${esc(label)}</span></label>`;
  }

  /* ---------- SEVERAL OF A LIST IS A LIST OF CHECKBOXES, OPENED UNDER ITS FIELD § */
  if (FIELD_MULTI[name] && (o.options || []).length) {
    const got = profList_(v);
    const on = x => got.some(g => norm(g) === norm(x));
    const opts = (o.options || []).slice();
    got.forEach(g => { if (!opts.some(x => norm(x) === norm(g))) opts.push(g); });
    const said = got.join(', ');
    const key = attr + ':' + name;
    return `<div class="field many"><span class="many-cap">${esc(label)}</span>
      <input type="hidden" ${attr}="${esc(name)}" value="${esc(said)}"${da}>
      <details class="many-d" data-many="${esc(key)}"${MANY_OPEN_ === key ? ' open' : ''}><summary class="many-sum${said ? '' : ' is-unset'}"
        aria-label="${esc(label + ': ' + (said || 'nothing chosen'))}">${esc(said || 'Tap to choose')}</summary>
        <div class="many-list" role="group" aria-label="${esc(label)}">${opts.map(x => `<label class="check many-opt">
          <input type="checkbox" data-many-of="${esc(name)}" value="${esc(x)}"${on(x) ? ' checked' : ''}${
          ro ? ' disabled' : ''}><span class="box"></span><span>${esc(x)}</span></label>`).join('')}</div>
      </details></div>`;
  }

  /* A FIXED LIST IS A SELECT. § */
  const opts = o.options || [];
  if (opts.length) {
    /* A PLACEHOLDER ON A SELECT IS ITS EMPTY OPTION, and the caption goes exactly as it does for a box below: § */
    const ph = o.placeholder || '';
    return `<label class="field">${ph ? '' : `<span>${esc(label)}</span>`}
      <select ${attr}="${esc(name)}" ${ro ? 'disabled' : ''}${ph ? ` aria-label="${esc(ph)}"` : ''}${da}>
        <option value="">${ph ? esc(ph) : NONE_LABEL}</option>
        ${(v !== '' && v != null && !opts.some(x => String(x) === String(v)) ? [String(v)] : [])
          .concat(opts).map(x => `<option value="${esc(x)}"${
          String(v) === String(x) ? ' selected' : ''}>${esc(x)}</option>`).join('')}
      </select></label>`;
  }

  /* ---------- A DAY ON A CALENDAR IS A DATE INPUT § */
  if (FIELD_IS_DATE.test(name)) {
    return `<label class="field"><span>${esc(label)}</span>
      <input type="date" ${attr}="${esc(name)}" value="${esc(String(v))}"
             ${ro ? 'disabled' : ''} ${o.extra || ''}${da}></label>`;
  }

  /* A WHOLE-NUMBER FIELD (years teaching, pages, students…) takes digits only (owner, 8 Nov): a number box, never letters. */
  /* NO SUGGESTION LIST (383): the owner wants no field offering past entries, so `o.suggest` is ignored. */
  const pad = FIELD_IS_DECIMAL.test(name) ? 'decimal'
            : FIELD_IS_NUMERIC.test(name) ? 'numeric' : '';

  /* ---------- A CAPTION OR A PLACEHOLDER, NEVER BOTH § */
  const hint = o.placeholder || '';

  /* EXTRA ATTRIBUTES, FOR THE CALLERS THAT NEED ONE THE NAME CANNOT IMPLY. § */
  return `<label class="field">${hint ? '' : `<span>${esc(label)}</span>`}
    <input ${attr}="${esc(name)}" value="${esc(String(v))}" ${ro ? 'disabled' : ''}
           ${hint ? `placeholder="${esc(hint)}"` : ''} ${o.extra || ''}
           ${pad ? `inputmode="${pad}"` : ''}${pad === 'numeric' && !/\btype=/.test(o.extra || '') ? ' type="number" min="0" step="1"' : ''}${da}>
    </label>`;
}

/* ---------- WHICH SEVERAL-OF-A-LIST FIELD IS OPEN, KEPT AS STATE RATHER THAN IN THE DOM § */
let MANY_OPEN_ = '';
document.addEventListener('toggle', e => {
  const d = e.target;
  if (!d || !d.matches || !d.matches('details.many-d')) return;
  const k = d.dataset.many || '';
  /* A PERSON OPENING IT, as against a repaint drawing it open: § */
  if (d.open && MANY_OPEN_ !== k && typeof tickListShow_ === 'function') {
    tickListShow_(() => ({ list: d.querySelector('.many-list'), head: d.querySelector('summary') }),
                  () => d.isConnected && d.open);
  }
  if (d.open) MANY_OPEN_ = k;
  else if (MANY_OPEN_ === k && d.isConnected) MANY_OPEN_ = '';
}, true);

/* ---------- A TICK UNDER A SEVERAL-OF-A-LIST FIELD § */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('input[type="checkbox"][data-many-of]')) return;
  const field = t.closest('.many');
  const box = field && field.querySelector(':scope > input[type="hidden"]');
  if (!box) return;
  const got = [...field.querySelectorAll('input[type="checkbox"][data-many-of]')]
    .filter(c => c.checked).map(c => c.value);
  box.value = got.join(', ');
  /* AND KEPT AS A DRAFT, as every other box on your own card is -- `draftFrom_` (data.js) skips a hidden
     input on purpose, so the ticks hand theirs over here. The saved list is the value that takes it away. */
  const spec = box.getAttribute('data-draft');
  if (spec && typeof draftKeep_ === 'function') {
    try {
      const at = spec.indexOf(':'), surface = spec.slice(0, at), id = spec.slice(at + 1);
      const was = box.getAttribute('data-draft-was') || '';
      if (typeof draftSame_ === 'function' && draftSame_(box.value, was)) draftDrop_(surface, id);
      else draftKeep_(surface, id, box.value, false, was);
    } catch (err) { /* storage blocked: the draft is not kept */ }
  }
  const sum = field.querySelector('summary');
  const cap = field.querySelector('.many-cap');
  if (sum) {
    sum.textContent = box.value || 'Tap to choose';
    sum.classList.toggle('is-unset', !got.length);
    sum.setAttribute('aria-label', ((cap && cap.textContent) || '') + ': ' + (box.value || 'nothing chosen'));
  }
});

/* ---------- A TICKED HOUR SAYS SO WITH `.on` AS WELL AS WITH `:checked` § */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.hr > input[type="checkbox"]')) return;
  t.parentNode.classList.toggle('on', t.checked);
});

/* ---------- BOXES THAT ARE ONE QUESTION SIT ON ONE LINE § */
const FIELD_ROWS = [
  { fields: ['first_name', 'last_name'] },
  { fields: ['adjective_1', 'adjective_2', 'adjective_3'], cap: 'you, in 3 words',
    ph: ['word 1', 'word 2', 'word 3'] },
  /* ONE LINE PER THING IN A FORM (owner): two different answers (city and town, the two exams) each get their own line. */
  /* "max and min number of students could more efficiently be written as '[] - []'."* One row, one caption, a dash between — and MIN FIRST although the backend § */
  { fields: ['min_students', 'max_students'], cap: 'students', ph: ['min', 'max'], dash: true },
  /* THE AGES A TUTOR TEACHES, THE SAME `[ ] – [ ]` SHAPE AS THE STUDENTS ABOVE, so the two ranges a tutor states read alike although they live on different pages. § */
  { fields: ['age_min', 'age_max'], cap: 'ages you teach', ph: ['youngest', 'oldest'], dash: true },
  /* AND HOW LONG A SESSION IS, THE THIRD RANGE — two selects off `SESSION_OPTIONS` (constants.gs), whole hours, the same `[ ] – [ ]`. § */
  { fields: ['min_hours', 'max_hours'], cap: 'session, in hours', ph: ['shortest', 'longest'], dash: true },
];
const ROW_LABEL = {
  years_experience: 'years teaching',
  /* `photo` HAS NO LABEL because it has no box any more on your own settings — see `photoPicker_`. */
  video: 'video link',
  travel_km: 'will travel (km)', favourite_colour: 'favourite colour',
  venues_ok: 'venues you teach at',
};
function fieldRows_(list, one) {
  const out = [], done = new Set();
  list.forEach(f => {
    if (done.has(f)) return;
    /* ANY field of a row places it, not only its first: a row can now read in a different order
       from the backend's list (the students range is min–max over a list that says max, min). */
    const row = FIELD_ROWS.find(r => r.fields.indexOf(f) !== -1 && r.fields.every(x => list.indexOf(x) !== -1));
    if (!row) { out.push(one(f, {})); return; }
    row.fields.forEach(x => done.add(x));
    const boxes = row.fields.map((x, i) => one(x, row.cap ? { placeholder: row.ph[i] } : {}))
      .join(row.dash ? '<span class="f-dash" aria-hidden="true">–</span>' : '');
    out.push(row.cap
      ? `<div class="f-rowwrap"><span class="dob-cap">${esc(row.cap)}</span>
           <div class="f-row${row.dash ? ' is-range' : ''}" style="--n:${row.fields.length}">${boxes}</div></div>`
      : `<div class="f-row" style="--n:${row.fields.length}">${boxes}</div>`);
  });
  return out.join('');
}

/* A WHOLE FORM, from a group table. § */
/* A GROUP OF HOUR CODES IS A TIMETABLE. § */
const isTimetable_ = list => (list || []).length > 12
  && (list || []).every(f => /^(m|tu|w|th|f|sa|su)\d\d$/.test(f));

/* ---------- AND A GROUP OF `libN_*` NAMES IS A SHELF OF LIBRARY CARDS § */
const isLibraryCard_ = f => /^lib\d+_(name|no|pin)$/.test(String(f || ''));

/* ---------- AND `library_note` IS NOT DRAWN, WHATEVER THE BACKEND SENDS § */
const RETIRED_FIELDS_ = ['library_note'];

/* ---------- AND A DATE OF BIRTH IS THREE BOXES, NOT ONE § */
const isDobBox_ = f => /^dob_[dmy]$/.test(String(f || ''));
const isDob_ = list => (list || []).some(isDobBox_);

function dobBoxes_(value) {
  /* NO SAVED BIRTHDAY OFFERED (383) — no field suggests; `maxlength` stops a third digit in a two-digit box. */
  const box = (f, hint, len) => fieldHtml(f, value(f), {
    placeholder: hint,
    extra: `inputmode="numeric" maxlength="${len}" autocomplete="off" size="${len}"`,
  });
  return `<div class="dob-row" role="group" aria-label="Date of birth">
    <span class="dob-cap">date of birth</span>
    <div class="dob-boxes">
      ${box('dob_d', 'DD', 2)}
      ${box('dob_m', 'MM', 2)}
      ${box('dob_y', 'YYYY', 4)}
    </div>
  </div>`;
}
const isLibrary_ = list => (list || []).some(isLibraryCard_);

/* ---------- A SHELF SHOWS WHAT IS FILLED IN, ONE EMPTY SLOT, AND A WAY TO ASK FOR ANOTHER § */
function shelfSlots_(nums, filled, draw, noun) {
  let last = 0;
  nums.forEach((n, i) => { if (filled(n)) last = i + 1; });
  /* NO SPARE EMPTY SLOT ONCE ONE IS FILLED — `Add a …` IS the empty slot, one tap away. § */
  const show = Math.min(nums.length, Math.max(1, last));
  return nums.map((n, i) => draw(n, i >= show)).join('') + (show < nums.length ? shelfAdd_(noun || 'another') : '');
}
/* ONE SETTINGS-CARD SHAPE (8 Nov): every list's "Add a …" tile and every line's bin are these two, whatever the list. */
const shelfAdd_ = (noun, act, o, row) => `<div class="tile-row set-adds${row ? ' ' + row : ''}">${tile_(Object.assign({ icon: 'plus', label: 'Add ' + (/^an? |^another$/.test(noun) ? noun : 'a ' + noun),
  act: act || 'shelf-more', cls: act ? '' : 'shelf-more' }, o || {}))}</div>`;
const shelfDrop_ = (noun, act) => tile_({ icon: 'bin', label: 'Remove ' + noun, act: act || 'shelf-drop', cls: 'set-drop' });
/* A CARD: its title and one line per field, saving as you type (owner, 8 Nov: no Save button, `autosaveHear_`). `o.save` is any other tile for the foot. */
function setCard_(o) {
  const save = o.save ? `<div class="tile-row set-save">${o.save}</div>` : '';
  const body = o.form == null ? (o.body || '') + save
    : `<div class="me-form"${o.formAttrs || ''}>${o.form}${save}${o.foot == null ? '<p class="faint me-said"></p>' : o.foot}</div>`;
  return `<div class="card${o.cls ? ' ' + o.cls : ''} set-shape"${o.attrs || ''}><h3 class="set-title">${esc(o.title || '')}</h3>${o.lead || ''}${body}${o.after || ''}</div>`;
}
const shelfFilled_ = (value, names) => names.some(f => String(value(f) ?? '').trim() !== '');

on('shelf-more', el => {
  const shelf = el.closest('.lib-shelf');
  const next = shelf && shelf.querySelector('.lib-card[hidden]');
  if (next) {
    next.hidden = false;
    const box = next.querySelector('input, select');
    try { if (box) box.focus({ preventScroll: true }); } catch { /* an element that cannot take focus is left as it is */ }
  }
  if (!shelf || !shelf.querySelector('.lib-card[hidden]')) (el.closest('.set-adds') || el).remove();
});
/* A LINE'S BIN EMPTIES ITS BOXES AND TUCKS IT AWAY; the card's Save sends the empties, so a reload agrees. */
on('shelf-drop', el => {
  const line = el.closest('.lib-card'), shelf = el.closest('.lib-shelf');
  if (!line || !shelf || !sure_(el, 'Remove?')) return;
  line.querySelectorAll('input, select').forEach(i => { i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
  line.hidden = true;
  shelf.appendChild(line);
  const add = shelf.querySelector('.shelf-more');
  if (add) { const row = add.closest('.set-adds'); if (row) shelf.appendChild(row); }
  else shelf.insertAdjacentHTML('beforeend', shelfAdd_(shelf.dataset.noun || 'another'));
});

/* ---------- AND A GROUP OF `qual_N*` NAMES IS A SHELF OF QUALIFICATIONS -------------------------
   RECOGNISED BY THE NAMES, NEVER BY THE GROUP'S TITLE, exactly as the library shelf is. */
const isQualField_ = f => /^qual_\d+(_level|_board|_grade|_received|_teach|_spec)?$/.test(String(f || ''));
const isQuals_ = list => (list || []).some(isQualField_);
/* THE SEVEN BOXES OF ONE SLOT, in the order they are read, compared and put back. */
const QUAL_KEYS = ['', '_level', '_grade', '_board', '_received', '_spec', '_teach'];
/* ---------- ONE LINE A QUALIFICATION, AND THE LINE IS THE DOOR § */
/* THE CERTIFICATES ARE THE TAILS OF THE TWO LISTS — the same tails `QUAL_CERTS` in core.gs copies, and `check-people.js` holds that copy to these. § */
const QUAL_CERT_SUBJECTS_ = QUAL_SUBJECTS.slice(QUAL_SUBJECTS.indexOf('PGCE'));
const QUAL_CERT_LEVELS_ = QUAL_LEVELS.slice(QUAL_LEVELS.indexOf('Basic'));
function qualShelf_(list, value) {
  const nums = [...new Set((list || []).filter(isQualField_)
    .map(f => String(f).match(/^qual_(\d+)/)[1]))];
  const v = (i, k) => String(value('qual_' + i + (k || '')) ?? '').trim();
  const filled = i => ['', '_level', '_board', '_grade', '_received'].some(k => v(i, k) !== '');
  const groups = [];
  const byKey = {};
  nums.filter(filled).forEach(i => {
    const key = norm(v(i)) || ('#' + i);
    if (!byKey[key]) { byKey[key] = { subject: v(i), slots: [] }; groups.push(byKey[key]); }
    byKey[key].slots.push(i);
  });
  const pool = nums.filter(i => !filled(i));
  /* YOUR SUBJECTS, for the top of every subject list — see `qualPick_`. */
  const mine = groups.map(g => g.subject).filter(Boolean);
  /* A SUBJECT'S COLUMN IS AS WIDE AS ITS OWN NAME, in `ch` because the face is monospaced — so its notation sits right after it, as on the profile chip, and its § */
  const wide = g => Math.min(18, Math.max(3, String(g.subject || '').length)) + 1;
  const empty = !groups.length;
  return `<div class="q-shelf${empty ? ' is-empty' : ''}">
    ${empty ? `<p class="q-hint">Add what you studied and the certificates you hold — the subject, then the level.</p>` : ''}
    <div class="q-list">${groups.map(g => `<div class="q-subj" style="--q-w:${wide(g)}ch">${
      g.slots.map((i, n) => qualSlot_(i, value, { first: n === 0, mine })).join('')}</div>`).join('')}</div>
    <div class="q-pool" hidden>${pool.map(i => qualSlot_(i, value, { mine })).join('')}</div>
    ${shelfAdd_('qualification', 'qual-add', { off: !pool.length, data: { unlocked: '' },
      note: pool.length ? pool.length + ' more fit' : '10 is the most' }, 'q-adds')}
    ${pool.length ? '' : `<p class="faint q-full">10 is the most this card holds — remove one to add another.</p>`}
  </div>`;
}
/* ---------- ONE QUALIFICATION: ITS LINE, AND ITS EDITOR UNDER IT § */
function qualSlot_(i, value, o) {
  o = o || {};
  const f = k => 'qual_' + i + k;
  const val = k => String(value(f(k)) ?? '').trim();
  const q = { subject: val(''), level: val('_level'), grade: val('_grade'), board: val('_board'),
              received: val('_received'), spec: TRUEish_(val('_spec')) };
  q.teach = q.spec || TRUEish_(val('_teach'));
  q.first = !!o.first;
  /* ONE CONTROL THAT CYCLES (440): each tap moves Not teaching → Can teach → Teaches → Not teaching. */
  /* TEACHING IS ONE ROW WITH THE PHONE'S OWN PICKER; the line's mark (`q-mark-b`) still cycles without opening it. */
  const tv = qualTeachKey_(q);
  const cyc = `<label class="field q-f q-cyc"><span>Teaching</span><select class="q-teach" data-unlocked aria-label="Teaching">${
      QUAL_TEACH_OPTS_.map(([k, say]) => `<option value="${k}"${k === tv ? ' selected' : ''}>${say}</option>`).join('')}</select></label>`;
  const said = qualSay_(q);
  /* EACH CAPTION IN TWO WORDINGS, a subject's and a certificate's, and the slot's `is-cert` says which
     is shown — so a line that becomes a DBS by a pick changes its captions with no redraw. */
  const cap = (std, cert) => `<span class="q-cap-std">${esc(std)}</span><span class="q-cap-cert">${esc(cert)}</span>`;
  return `<div class="q-slot${qualIsCert_(q) ? ' is-cert' : ''}" data-slot="${esc(i)}"${q.first ? ' data-first="1"' : ''}>
    <input type="hidden" data-me="${esc(f('_spec'))}" value="${q.spec ? 'TRUE' : 'FALSE'}">
    <input type="hidden" data-me="${esc(f('_teach'))}" value="${q.teach ? 'TRUE' : 'FALSE'}">
    <button type="button" class="q-line" data-do="qual-open" data-at="${esc(i)}" data-unlocked aria-expanded="false"
      aria-label="${esc(said)}" title="${esc(said)}">${qualFace_(q)}</button>
    <button type="button" class="q-mark-b" data-do="qual-teach" data-face="1" data-at="${esc(i)}" data-unlocked
      aria-label="Teaching: ${esc(qualTeachWord_(q))}, tap to change">${qualTeachVal_(q)}</button>
    <div class="q-ed">
      <div class="q-row">
        ${qualPick_(`data-me="${esc(f(''))}" class="q-name"`, q.subject, QUAL_SUBJECTS, 'Subject', 'Choose', o.mine)}
        ${qualPick_(`data-me="${esc(f('_level'))}"`, q.level, QUAL_LEVELS, 'Level', 'Choose')}
      </div>
      <div class="q-row">
        ${qualPick_(`data-me="${esc(f('_grade'))}"`, q.grade, QUAL_GRADES, 'Grade', 'None yet').replace('class="field q-f"', 'class="field q-f q-grade"')}
        <label class="field q-f">${cap('Finished', 'Year')}
          <select data-me="${esc(f('_received'))}">${qualYears_(q.received).map(y => `<option value="${esc(y)}"${
            y === q.received ? ' selected' : ''}>${esc(y === 'Present' ? 'Still studying' : y)}</option>`).join('')}
            <option value=""${q.received ? '' : ' selected'}>Not sure</option></select></label>
        <label class="field q-f q-school">${cap('School, college or uni', 'Issued by')}
          <input type="text" data-me="${esc(f('_board'))}" value="${esc(q.board)}" autocomplete="off"></label>
      </div>
      ${cyc}
      <div class="tile-row q-tiles">${tile_({ icon: 'save', label: 'Done', act: 'qual-done', data: { unlocked: '', at: i } })}${
        tile_({ icon: 'bin', label: 'Remove', note: [q.subject, q.level].filter(Boolean).join(' ') || 'this one', act: 'qual-drop',
                data: { unlocked: '', at: i } })}</div>
    </div>
  </div>`;
}
/* THE FACE OF A LINE: the subject (on a subject's first line only), the notation, the teaching mark —
   none on a certificate, which is held and not taught (see `qualIsCert_`). */
function qualFace_(q) {
  const who = q.first || q.fresh ? (q.subject || (q.fresh ? 'New qualification' : '')) : '';
  const cert = qualIsCert_(q);
  return `<span class="q-who${q.subject ? '' : ' is-none'}">${esc(who)}</span>`
    + `<span class="q-note">${qualIso_(q)}</span>`
    + `<span class="q-mark">${cert ? '' : q.spec ? '<span class="q-chip">Teach</span>'
      : q.teach ? '<span class="q-can">Can teach</span>' : ''}</span>`;
}
/* THE TEACHING STATE IN WORDS, and drawn: gold for Teaches, plain for Can teach, faint for Not teaching. */
const qualTeachKey_ = q => q.spec ? 'spec' : q.teach ? 'teach' : 'no';
const QUAL_TEACH_OPTS_ = [['teach', 'Can teach'], ['spec', 'Teaches'], ['no', 'Not teaching']];
function qualTeachWord_(q) { return q.spec ? 'Teaches' : q.teach ? 'Can teach' : 'Not teaching'; }
function qualTeachVal_(q) {
  return `<span class="q-cyc-v is-${q.spec ? 'spec' : q.teach ? 'teach' : 'no'}">${qualTeachWord_(q)}</span>`;
}
/* ---------- A CERTIFICATE IS HELD, NOT STUDIED AND NOT TAUGHT § */
function qualIsCert_(q) {
  const isIn = (list, x) => !!x && list.some(y => norm(y) === norm(x));
  return isIn(QUAL_CERT_SUBJECTS_, q.subject) || isIn(QUAL_CERT_LEVELS_, q.level);
}
/* ---------- THE NOTATION, BY THE PROFILE CHIP'S RULES § */
function qualIso_(q) {
  const level = norm(q.level) === norm(q.subject) ? '' : (q.level || '');
  const low = q.grade ? esc(q.grade) : /^present$/i.test(q.received || '') ? '<i>studying</i>' : '';
  if (qualIsCert_(q) || !(level || low)) {
    return `<span class="q-plain">${esc([level, q.grade].filter(Boolean).join(' '))}</span>`;
  }
  return `<span class="prof-iso">${level ? `<sup>${esc(level)}</sup>` : ''}${low ? `<sub>${low}</sub>` : ''}</span>`;
}
/* THE LINE'S NAME: the profile chip's own sentence (`profQualSay_`) and the teaching word — so a screen
   reader and a pointer get the place and the year the face leaves off. */
function qualSay_(q) {
  const base = typeof profQualSay_ === 'function' ? profQualSay_(q)
    : [q.subject, q.level, q.grade && 'grade ' + q.grade, q.board && 'at ' + q.board, q.received].filter(Boolean).join(', ');
  return (base || 'New qualification') + (q.spec ? ', teach' : q.teach ? ', can teach' : '');
}
/* ---------- A DROP-DOWN WITH A CAPTION, AND `Something else…` AT THE FOOT § */
const QUAL_OTHER = '__other';
function qualPick_(attrs, v, list, cap, none, mine) {
  v = String(v ?? '');
  const has = x => !!v && norm(x) === norm(v);
  const yours = [...new Set((mine || []).filter(Boolean))];
  const opts = (v && !list.some(has) && !yours.some(has) ? [v] : []).concat(list);
  let chosen = false;
  const opt = x => {
    const on = !chosen && has(x);
    if (on) chosen = true;
    return `<option value="${esc(x)}"${on ? ' selected' : ''}>${esc(x)}</option>`;
  };
  const body = yours.length
    ? `<optgroup label="Your subjects">${yours.map(opt).join('')}</optgroup><optgroup label="Every subject">${opts.map(opt).join('')}</optgroup>`
    : opts.map(opt).join('');
  return `<label class="field q-f"><span>${esc(cap)}</span><select ${attrs}>
      <option value="">${esc(none)}</option>
      ${body}
      <option value="${QUAL_OTHER}">Something else…</option>
    </select></label>`;
}
/* `Something else…` swaps the select for a box carrying the same attributes, so a save reads it exactly
   as it read the select — and it saves on the box's own `change`, when the typing is finished. */
document.addEventListener('change', e => {
  const sel = e.target;
  if (!sel || sel.tagName !== 'SELECT' || sel.value !== QUAL_OTHER || !sel.closest('.q-shelf')) return;
  const box = document.createElement('input');
  box.type = 'text'; box.autocomplete = 'off'; box.placeholder = 'Type it here';
  [...sel.attributes].forEach(a => box.setAttribute(a.name, a.value));
  sel.replaceWith(box);
  qualDirty_(box);
  try { box.focus({ preventScroll: true }); } catch { /* an element that cannot take focus is left as it is */ }
}, true);
/* THE SLOT'S ANSWERS, READ OFF ITS BOXES — `Something else…` not yet typed counts as no answer. */
function qualRead_(slot) {
  const i = slot.dataset.slot;
  const get = k => {
    const b = slot.querySelector('[data-me="qual_' + i + k + '"]');
    const x = String(b ? b.value : '').trim();
    return x === QUAL_OTHER ? '' : x;
  };
  const q = { subject: get(''), level: get('_level'), grade: get('_grade'), board: get('_board'),
              received: get('_received'), spec: TRUEish_(get('_spec')) };
  q.teach = q.spec || TRUEish_(get('_teach'));
  q.first = !!slot.dataset.first;
  q.fresh = !!slot.dataset.new;
  return q;
}
/* THE LINE FOLLOWS THE BOXES, so an open line is the preview of what is being saved. */
function qualFaceNow_(slot) {
  const line = slot && slot.querySelector(':scope > .q-line');
  if (!line) return;
  const q = qualRead_(slot);
  slot.classList.toggle('is-cert', qualIsCert_(q));
  line.innerHTML = qualFace_(q);
  const said = qualSay_(q);
  line.setAttribute('aria-label', said);
  line.setAttribute('title', said);
  const lab = 'Teaching: ' + qualTeachWord_(q) + ', tap to change';
  slot.querySelectorAll('[data-do="qual-teach"]').forEach(b => {
    b.setAttribute('aria-label', lab);
    const v = b.querySelector('.q-cyc-v');
    if (v) v.outerHTML = qualTeachVal_(q);
  });
}
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  const t = e.target;
  const slot = t && t.closest && t.closest('.q-shelf .q-slot');
  if (slot) qualFaceNow_(slot);
}));
/* ---------- THE NEXT BOX THE PERSON NEEDS, GIVEN THE FOCUS — NOT OPENED § */
function qualNext_(sel) {
  setTimeout(() => {
    if (sel && sel.isConnected && !sel.disabled) { try { sel.focus({ preventScroll: true }); } catch (e) { /* an element that cannot take focus is left as it is */ } }
  }, 0);
}
/* ---------- AN ANSWER CHOSEN IS AN ANSWER SAVED § */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('[data-me]') || t.value === QUAL_OTHER) return;
  const slot = t.closest('.q-shelf .q-slot.is-open');
  if (!slot) return;
  const q = qualRead_(slot);
  if (slot.dataset.new && q.subject && !q.level && t.matches('.q-name')) {
    qualNext_(slot.querySelector('select[data-me$="_level"]'));
    return;
  }
  qualCommit_(slot);
});
/* PROGRAMMATIC CHANGES DO NOT FIRE `input`, so a card changed by a button marks itself dirty — see `settingsKeep_`: § */
const qualDirty_ = el => { const f = el && el.closest('.me-form'); if (f) f.dataset.dirty = '1'; };
/* NOT ON A CARD BEING EDITED: there the line is one answer among the card's, and the card stays held
   until its own Save or Cancel — a shut line is not a saved card. */
const qualClean_ = el => { const f = el && el.closest('.me-form'); if (f && !f.closest('.card-ed')) delete f.dataset.dirty; };
/* THE SLOT'S SEVEN VALUES, as they were last saved (`data-was`) and as the boxes hold them now. */
function qualValues_(slot) {
  const out = {};
  const i = slot.dataset.slot;
  QUAL_KEYS.forEach(k => { const b = slot.querySelector('[data-me="qual_' + i + k + '"]'); out['qual_' + i + k] = b ? b.value : ''; });
  return out;
}
const qualBlank_ = slot => {
  const out = {};
  QUAL_KEYS.forEach(k => { out['qual_' + slot.dataset.slot + k] = /_spec$|_teach$/.test(k) ? 'FALSE' : ''; });
  return out;
};
function qualSet_(slot, vals) {
  Object.keys(vals).forEach(f => { const b = slot.querySelector('[data-me="' + f + '"]'); if (b) b.value = vals[f]; });
}
/* ---------- REDRAWN FROM WHAT THE BOXES HOLD § */
function qualRedraw_(shelf, over, open) {
  if (!shelf || !shelf.isConnected) return null;
  /* A KEYBOARD STAYS WHERE IT WAS. The line that was pressed is replaced, and focus on a removed
     element falls to the page — so a line opened from the keyboard hands focus to its new self. */
  const had = shelf.contains(document.activeElement);
  const vals = {}, list = [];
  shelf.querySelectorAll('[data-me]').forEach(b => { list.push(b.dataset.me); vals[b.dataset.me] = b.value; });
  Object.assign(vals, over || {});
  const hold = document.createElement('div');
  hold.innerHTML = qualShelf_(list, f => vals[f] ?? '');
  const next = hold.firstElementChild;
  shelf.replaceWith(next);
  const again = open != null && next.querySelector('.q-list .q-slot[data-slot="' + open + '"]');
  if (again) {
    qualOpen_(again);
    if (had) { try { again.querySelector('.q-line').focus({ preventScroll: true }); } catch (e) { /* an element that cannot take focus is left as it is */ } }
  } else if (typeof placeCells === 'function') { try { placeCells('y', true, 0, qualColumn_(next)); } catch (e) { oops_(e, 'me:qualRedraw_') } }
  /* ON A CARD BEING EDITED THE SHELF IS PART OF THE CARD'S ONE DRAFT, and a redraw is a change no
     `input` reports — a line put back to the pool, a removal — so the draft is written again here. */
  const ed = next.closest('.card-ed .me-form');
  if (ed && typeof cardKeep_ === 'function') cardKeep_(ed);
  return next;
}
/* WHICH COLUMN THE SHELF IS ON — Tutor settings, or Tutors when it is a card's (`cardEditHtml_`). */
const qualColumn_ = el => colOfEl_(el) || 'staff';
/* WHAT SHUTTING THE OPEN LINE PUTS BACK: § */
function qualOver_(shelf) {
  const over = {};
  shelf.querySelectorAll('.q-slot.is-open').forEach(s => {
    if (s.dataset.new) return Object.assign(over, qualBlank_(s));
    try { Object.assign(over, JSON.parse(s.dataset.was || '{}')); } catch (e) { /* a bad stored value reads as none */ }
  });
  return over;
}
function qualOpen_(slot) {
  const shelf = slot && slot.closest('.q-shelf');
  if (!shelf) return;
  slot.classList.add('is-open');
  const line = slot.querySelector(':scope > .q-line');
  if (line) line.setAttribute('aria-expanded', 'true');
  if (!slot.dataset.was) slot.dataset.was = JSON.stringify(slot.dataset.new ? qualBlank_(slot) : qualValues_(slot));
  qualDirty_(slot);
  if (typeof placeCells === 'function') { try { placeCells('y', true, 0, qualColumn_(slot)); } catch (e) { oops_(e, 'me:qualOpen_') } }
}
/* THE LINE OPENS — and whatever else was open shuts first, as it was last saved. § */
on('qual-open', el => {
  if (qualWhenSaved_(el)) return;
  const slot = el.closest('.q-slot'), shelf = el.closest('.q-shelf');
  if (!slot || !shelf) return;
  if (slot.classList.contains('is-open')) return qualDone_(slot);
  qualReopen_(shelf, slot);
});
/* THE SLOT OPEN IN A FRESH SHELF — a saved line in its place, an empty one as a new line at the foot —
   with whatever was open before shut as it was last saved. Answers the slot as it is in the new shelf. */
function qualReopen_(shelf, slot) {
  const i = slot.dataset.slot, pooled = !!slot.closest('.q-pool');
  const next = qualRedraw_(shelf, qualOver_(shelf), pooled ? null : i);
  const again = next && next.querySelector('.q-slot[data-slot="' + i + '"]');
  if (again && pooled) qualStart_(next, again);
  return again;
}
/* ---------- THE TICK: ANYTHING NOT YET SAVED IS SAVED, AND THE LINE SHUTS § */
on('qual-done', el => { if (qualWhenSaved_(el)) return; const slot = el.closest('.q-slot'); if (slot) qualDone_(slot); });
function qualDone_(slot) {
  const shelf = slot.closest('.q-shelf');
  if (!shelf) return;
  const q = qualRead_(slot);
  if (slot.dataset.new && !(q.subject && q.level)) {
    qualClean_(shelf);
    qualRedraw_(shelf, qualBlank_(slot));
    if (q.subject || q.level) toast('Nothing was added — a qualification needs a subject and a level.');
    return;
  }
  qualCommit_(slot, () => { qualClean_(shelf); qualRedraw_(shelf); });
}
/* ---------- A PRESS THAT LANDS WHILE A SAVE IS OUT WAITS FOR IT § */
let QUAL_SAVING = null, QUAL_NEXT = null;
function qualSave_(el) {
  /* ---------- ON A CARD BEING EDITED, AN ANSWER IS KEPT, NOT SENT § */
  const ed = el && el.closest && el.closest('.card-ed .me-form');
  if (ed && typeof cardKeep_ === 'function') { ed.dataset.dirty = '1'; cardKeep_(ed); return Promise.resolve(true); }
  const p = meSave_(el);
  QUAL_SAVING = p;
  const clear = () => { if (QUAL_SAVING === p) QUAL_SAVING = null; };
  p.then(clear, clear);
  return p;
}
function qualWhenSaved_(el) {
  if (!QUAL_SAVING || !el) return false;
  const act = el.dataset.do, v = el.dataset.v || '';
  const slot = el.closest('.q-slot'), i = slot ? slot.dataset.slot : '';
  const form = el.closest('.me-form');
  const mine = QUAL_NEXT = {};
  QUAL_SAVING.then(ok => {
    if (QUAL_NEXT !== mine) return;
    QUAL_NEXT = null;
    if (!ok) return;
    const shelf = (form && form.isConnected && form.querySelector('.q-shelf')) || document.querySelector('#s-staff .q-shelf, #s-account .q-shelf');
    if (!shelf) return;
    const again = act === 'qual-add' ? shelf.querySelector('[data-do="qual-add"]')
      : shelf.querySelector('.q-slot[data-slot="' + i + '"] [data-do="' + act + '"]' + (v ? '[data-v="' + v + '"]' : ''));
    if (again && !again.disabled && ACTIONS[act]) ACTIONS[act](again);
  }, () => {});
  return true;
}
/* ---------- ONE SAVE: THE CARD'S OWN § */
function qualCommit_(slot, after) {
  const shelf = slot.closest('.q-shelf');
  if (!shelf) return;
  const i = slot.dataset.slot;
  const q = qualRead_(slot);
  if (!q.subject || !q.level) {
    if (!slot.dataset.new) toast(q.subject ? 'Choose a level — nothing was saved.' : 'Choose a subject — nothing was saved.');
    return;
  }
  /* A CERTIFICATE KEEPS NO GRADE AND NO TEACHING TICK — its editor has neither box to show, and an answer nobody can see is one nobody can take back. § */
  if (qualIsCert_(q)) {
    qualSet_(slot, { ['qual_' + i + '_grade']: '', ['qual_' + i + '_spec']: 'FALSE', ['qual_' + i + '_teach']: 'FALSE' });
    qualFaceNow_(slot);
  }
  if (JSON.stringify(qualValues_(slot)) === slot.dataset.was) { if (after) after(); return; }
  let was = {};
  try { was = JSON.parse(slot.dataset.was || '{}'); } catch (e) { /* a bad stored value reads as none */ }
  const moved = !!slot.dataset.new || norm(was['qual_' + i] || '') !== norm(q.subject);
  qualSave_(slot.querySelector('[data-do="qual-done"]') || slot).then(ok => {
    if (!ok || !slot.isConnected) return;
    slot.dataset.was = JSON.stringify(qualValues_(slot));
    delete slot.dataset.new;
    if (after) return after();
    qualDirty_(slot);
    if (moved) qualRedraw_(shelf, null, i);
  });
}
/* THE CYCLE, written into the two hidden boxes and saved. The line's own mark cycles without opening the line. § */
const QUAL_CYCLE_ = { no: 'teach', teach: 'spec', spec: 'no' };
on('qual-teach', el => {
  if (qualWhenSaved_(el)) return;
  let slot = el.closest('.q-slot');
  const shelf = el.closest('.q-shelf'), face = !!el.dataset.face;
  if (!slot || !shelf) return;
  if (!face && !slot.classList.contains('is-open')) {
    slot = qualReopen_(shelf, slot);
    if (!slot) return;
  }
  const q = qualRead_(slot);
  if (qualIsCert_(q)) return;
  qualTeachTo_(slot, el, face, QUAL_CYCLE_[qualTeachKey_(q)]);
});
