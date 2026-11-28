/* THE PICKER'S ANSWER, written the same way the mark's cycle is. */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.q-shelf select.q-teach')) return;
  let slot = t.closest('.q-slot');
  const shelf = t.closest('.q-shelf'), v = t.value;
  if (slot && !slot.classList.contains('is-open')) slot = qualReopen_(shelf, slot);
  if (!slot || qualIsCert_(qualRead_(slot))) return;
  qualTeachTo_(slot, t, false, v);
});
function qualTeachTo_(slot, el, face, v) {
  const i = slot.dataset.slot;
  qualSet_(slot, { ['qual_' + i + '_spec']: v === 'spec' ? 'TRUE' : 'FALSE',
                   ['qual_' + i + '_teach']: v === 'no' ? 'FALSE' : 'TRUE' });
  qualFaceNow_(slot);
  slot.querySelectorAll('select.q-teach').forEach(sel => { sel.value = v; });
  if (face && !slot.classList.contains('is-open')) { qualSave_(slot).then(ok => { if (ok && slot.isConnected) slot.dataset.was = JSON.stringify(qualValues_(slot)); }); return; }
  qualDirty_(el);
  qualCommit_(slot);
}
/* THE NEXT UNUSED SLOT. § */
function qualTake_(shelf) {
  const slot = shelf && shelf.querySelector('.q-pool > .q-slot');
  if (!slot) toast(text_('that-is-the-most-this-card'));
  return slot || null;
}
/* ---------- `+`: A NEW LINE AT THE FOOT, ITS SUBJECT BOX READY § */
on('qual-add', el => {
  if (qualWhenSaved_(el)) return;
  const shelf = el.closest('.q-shelf');
  if (!shelf) return;
  const next = qualRedraw_(shelf, qualOver_(shelf));
  const slot = qualTake_(next);
  if (slot) qualStart_(next, slot);
});
/* AN EMPTY SLOT, MOVED OUT OF THE POOL AS A NEW LINE AT THE FOOT OF THE LIST, open, emptied and marked new — so a Done or a bin before it has a § */
function qualStart_(next, slot) {
  qualSet_(slot, qualBlank_(slot));
  slot.dataset.new = '1';
  const group = document.createElement('div');
  group.className = 'q-subj is-new';
  group.appendChild(slot);
  next.querySelector('.q-list').appendChild(group);
  qualFaceNow_(slot);
  qualOpen_(slot);
  try { slot.scrollIntoView({ block: 'nearest' }); } catch (e) { /* an element no longer on the page is not scrolled */ }
  qualNext_(slot.querySelector('select.q-name'));
}
/* ---------- REMOVING SAVES AT ONCE § */
function qualRemove_(el, slots, said) {
  const shelf = el.closest('.q-shelf');
  if (!shelf || !slots.length) return;
  const was = slots.map(qualValues_);
  slots.forEach(s => qualSet_(s, qualBlank_(s)));
  qualSave_(el).then(ok => {
    /* ON A CARD THE REMOVAL WAITS FOR ITS SAVE, so "Removed" would say what has not happened. */
    if (ok) { if (!el.closest('.card-ed')) toast(said); qualRedraw_(shelf); }
    else slots.forEach((s, n) => qualSet_(s, was[n]));
  });
}
on('qual-drop', el => {
  if (qualWhenSaved_(el)) return;
  const slot = el.closest('.q-slot'), shelf = el.closest('.q-shelf');
  if (!slot || !shelf || !sure_(el, 'Remove?')) return;
  if (slot.dataset.new) { qualClean_(shelf); qualRedraw_(shelf, qualBlank_(slot)); return; }
  const q = qualRead_(slot);
  let was = {};
  try { was = JSON.parse(slot.dataset.was || '{}'); } catch (e) { /* a bad stored value reads as none */ }
  const i = slot.dataset.slot;
  /* NAMED BY WHAT WAS SAVED, which is what is being removed — not by a half-changed box. */
  const name = [was['qual_' + i] || q.subject, was['qual_' + i + '_level'] || q.level].filter(Boolean).join(' ');
  qualRemove_(el, [slot], 'Removed ' + (name || 'that qualification') + '.');
});
/* ---------- WHEN IT WAS RECEIVED, AND WHETHER YOU TEACH IT § */
/* ---------- *"phone: have field for country code, then number."* § */
function phoneField_(value) {
  const cc = String(value('phone_cc') || '') || phoneCodes_()[0];
  /* THE NUMBER IS A DRAFT UNTIL SAVED, as every box of your own row is (`fieldHtml`; 317). */
  const phoneNo = String(value('phone_no') || (value('phone_cc') ? '' : value('phone')) || '');
  const codes = phoneCodes_().slice();
  if (codes.indexOf(cc) === -1) codes.unshift(cc);
  return fieldCap_('phone', formPhone_('phone_cc', 'phone_no', kcfOpts_(codes.map(x => ({ value: x, on: x === cc }))),
    `placeholder="Number" value="${esc(draftVal_('set', 'phone_no', phoneNo))}"${draftAttr_('set', 'phone_no', phoneNo)}`), ' is-phone', 2);
}
function qualYears_(current) {
  const now = new Date().getFullYear(), out = ['Present'];
  for (let y = now; y >= now - 60; y--) out.push(String(y));
  if (current && out.indexOf(String(current)) === -1) out.splice(1, 0, String(current));
  return out;
}
/* ---------- ONE SHELF, ONE CARD PER LIBRARY § */
function libraryShelf_(list, value) {
  const all = [...new Set((list || []).filter(isLibraryCard_)
    .map(f => String(f).match(/^lib(\d+)_/)[1]))];
  const has = i => shelfFilled_(value, ['lib' + i + '_name', 'lib' + i + '_no', 'lib' + i + '_pin']);
  /* ONE CARD ONLY (489, the owner on Library cards: "change this to be only 1 card allowed") — the one already filled, else the first; no Add § */
  /* A RULE (496): `library-one-card` — Universal, every slot with Add another, like any shelf. */
  const nums = !(typeof ruleOn_ !== 'function' || ruleOn_('library-one-card')) ? all : all.length ? [all.find(has) || all[0]] : [];
  /* EACH CARD IS ONE SPEC (owner, 14 Nov: one card maker); its boxes are forms.json's `library-card` form. */
  const slot = (i, hide) => cardBlock_({ type: 'group', look: 'lib-card', attrs: { hidden: !!hide }, blocks: [
    { type: 'group', look: 'lib-face', attrs: { role: 'group', 'aria-label': 'Library card ' + i }, inner:
      cardBlock_({ type: 'group', tag: 'span', look: 'lib-cap', attrs: { 'aria-hidden': 'true' }, text: 'Library card' })
      + formOf_('library-card', value, { vars: { n: i }, skip: ['lib{n}_no'] }) + cardBlock_(libBarsSpec_(value('lib' + i + '_no')))
      + formOf_('library-card', value, { vars: { n: i }, only: ['lib{n}_no'] }) }] });
  return cardBlock_({ type: 'group', look: 'lib-shelf', attrs: { 'data-noun': 'library card' }, inner: shelfSlots_(nums, has, slot, 'library card') });
}

/* ---------- THE BARCODE IS A PICTURE OF ONE, AND NOT ONE § */
function libBarsOf_(no) {
  const s = String(no ?? '').trim();
  const w = [];
  if (!s) { for (let i = 0; i < 24; i++) w.push(2, 2); w.pop(); return w; }
  let h = hashOf(s) || 0x9e3779b9;
  const next = n => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return 1 + (h % n); };
  w.push(1, 1, 1, 2);
  let at = 5;
  while (at < 84) { const bar = next(4), gap = next(3); w.push(bar, gap); at += bar + gap; }
  w.push(1, 1, 1);
  return w;
}
function libBarsSpec_(no) {
  const w = libBarsOf_(no);
  let x = 0, d = '';
  w.forEach((n, i) => { if (i % 2 === 0) d += 'M' + x + ' 0h' + n + 'v1h-' + n + 'z'; x += n; });
  const blank = !String(no ?? '').trim();
  return { type: 'drawing', node: { el: 'svg', a: { class: 'lib-bars' + (blank ? ' is-blank' : ''), viewBox: '0 0 ' + x + ' 1', preserveAspectRatio: 'none',
    'shape-rendering': 'crispEdges', 'aria-hidden': 'true', focusable: 'false' }, kids: [{ el: 'path', a: { fill: 'currentColor', d } }] } };
}
const libBars_ = no => cardBlock_(libBarsSpec_(no));
/* THE BARS FOLLOW THE NUMBER as it is typed, the photograph shelf's thumbnail one rule down: § */
document.addEventListener('input', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.lib-no input')) return;
  const bars = t.closest('.lib-face') && t.closest('.lib-face').querySelector('.lib-bars');
  if (bars) bars.outerHTML = libBars_(t.value);
});

/* ---------- AND A CARD GIVES UP ITS BLANK BAND BEFORE THE PAGE IS DRAWN SMALLER § */
function libFit_(pane) {
  try {
    const first = pane.querySelector('.lib-face');
    const shelf = first && first.closest('.lib-shelf');
    if (!shelf) return;
    shelf.style.removeProperty('--lib-w');
    const faces = [...shelf.querySelectorAll('.lib-card:not([hidden]) > .lib-face')];
    if (!faces.length || !(pane.clientHeight > 0)) return;
    for (let pass = 0; pass < 3; pass++) {
      const over = pane.scrollHeight - pane.clientHeight;
      if (!(over > 2)) return;
      const h = faces[0].getBoundingClientRect().height;
      /* THE BLANK BAND IS THE FACE'S THIRD ROW, `minmax(0, 1fr)`; the computed track list is in px. */
      const band = parseFloat(String(getComputedStyle(faces[0]).gridTemplateRows).split(/\s+/)[2]) || 0;
      const give = Math.min(band, over / faces.length + 0.5);
      if (!(h > 0) || !(give > 0.5)) return;
      shelf.style.setProperty('--lib-w', ((h - give) * 85.6 / 54).toFixed(2) + 'px');
    }
  } catch (e) { /* the column's width stands */ }
}

/* ---------- EVERY SETTINGS FIELD SAVES AS YOU TYPE (owner, 8 Nov) § */
const AUTOSAVE_MS = 800;
const AUTOSAVE_T = new WeakMap();
const AUTOSAVE_FORMS_ = '.set-typed .me-form';
function autosaveLater_(form) {
  clearTimeout(AUTOSAVE_T.get(form));
  AUTOSAVE_T.set(form, setTimeout(() => autosaveNow_(form), AUTOSAVE_MS));
}
function autosaveHear_(e) {
  const box = e.target;
  /* AN ASKED FIELD'S BLANK TAG SAVES ON ITS ANSWER (askSetGroup_), never as you type. */
  if (!box || !box.closest || !box.matches('input, select, textarea') || isFileBox_(box) || box.classList.contains('ask-box')) return;
  const form = box.closest(AUTOSAVE_FORMS_);
  if (!form || !USER) return;
  form.dataset.dirty = '1';
  autosaveLater_(form);
}
function autosaveNow_(form) {
  if (!form.isConnected) return;
  if (form.classList.contains('is-sending')) { autosaveLater_(form); return; }
  try { if (form.closest('.card-ed')) cardSave_(form, true); else meSave_(form, true); } catch (x) { oops_(x, 'me:autosaveNow_'); }
}
/* THE SMALL TICK: under the card, beside the fading toast that already says Saved. */
function autosaveTick_(form, word) {
  const said = form.querySelector('.me-said');
  if (said) tell_(said, 'saved', '\u2713 ' + (word || text_('saved')));
  form.classList.add('is-saved');
  if (!form.contains(document.activeElement)) delete form.dataset.dirty;
}
function autosaveFailed_(err) {
  toast(typeof why_ === 'function' ? why_(err) : text_('not-saved-try-again'));
}
document.addEventListener('input', autosaveHear_, true);
document.addEventListener('change', autosaveHear_, true);
/* ---------- ONE PROFILE SAVE (unify batch 9): the one place `item: 'profile'` is sent (tools/one-profile-save.js).
   `form` holds the boxes. o.base: only what moved from it is sent (the card editor); without it every box is (Settings — the
   live backend is old, and its "would wipe" guard below was written against a card that sends all of them). o.fields: sent as
   given, the box checks skipped (Cancel's picture, the people editor). o.gate(fields, go, stop): may hold the send back.
   Resolves null when nothing was sent, `{ nothing: true }` when nothing had moved, else `{ d, fields, word, seatNo }`. */
function profileSave_(form, o) {
  o = o || {};
  return new Promise(resolve => {
  /* A PRESS OR A SAVE IN HAND MAKES THE WAITING ONE MOOT. */
  [form, o.el].forEach(x => { const f0 = x && x.closest && x.closest('.me-form'); if (f0) clearTimeout(AUTOSAVE_T.get(f0)); });
  /* SIGNED OUT (the session ended under an open card): nothing to save to, and `USER.name` would throw. */
  if (!USER) { toast(text_('err-sign-in-first')); return resolve(null); }
  const said = Object.prototype.hasOwnProperty.call(o, 'said') ? o.said : (form && form.querySelector('.me-said'));
  const say = (cls, msg) => { if (!o.auto) toast(msg); if (said) tell_(said, cls, msg); };
  let fields = o.fields, seatNo = '';
  if (!fields) {
    /* ---------- THE ONE CHECK LIST, the same for Settings and the card editor ---------- */
    /* NOT WHILE A PART THAT SAVES ITSELF IS ON THE WIRE (the review of docs/history/339) § */
    const busy = form === document.body ? '' : form.querySelector('.pfp.is-sending') ? 'Your picture is still saving'
      : form.querySelector('.is-sending') || form.classList.contains('is-sending') ? 'Part of your card is still saving' : '';
    if (busy) { if (o.auto) autosaveLater_(form); else say('info', busy + ' — Save once it has.'); return resolve(null); }
    /* A QUALIFICATION WITH NO SUBJECT, OR NO LEVEL. § */
    if (qualNameless_(form)) { say('info', QUAL_NAMELESS_SAY_); return resolve(null); }
    if (cardQualHole_(form, o.base || (whose_() || {}).profile || {})) { say('info', CARD_LEVELLESS_SAY_); return resolve(null); }
    /* GATHERED BEFORE `send_` LOCKS THE CARD. The card editor reads `Something else…` not yet typed as no answer; Settings sends
       its boxes as they stand, as it always has. § */
    const now = cardFormVals_(form, !o.base);
    fields = o.base ? cardChanged_(o.base, now) : now;
    seatNo = cardSeatRefusal_(form, fields);
    if (seatNo && !Object.keys(fields).length) { say('error', seatNo + ' Nothing was saved.'); return resolve(null); }
    if (o.base && !Object.keys(fields).length) return resolve({ nothing: true });
  }
  /* YOU ASK; `whose_()` IS WHOSE ROW — yours, or the person an admin's lens is on (the backend lets only an admin name another). */
  const W = whose_();
  const go = () => {
    /* `send_`, NOT `api()`. § */
    send_({ action: 'item', door: 'save', item: 'profile', name: USER.name, personId: USER.personId || '',
            target: o.target.name, targetId: o.target.id, fields },
          o.how || (o.auto ? { where: said } : Object.assign({ button: o.el || form, busy: 'Saving…', where: said }, o.lock ? { lock: o.lock } : {})))
      .then(d => {
        /* THE SERVER'S OWN READING OF THE ROW, NOT WHAT WAS TYPED. § */
        if (o.own) { W.profile = (d && d.profile) ? d.profile : Object.assign({}, W.profile || {}, fields); if (d && d.name) W.name = d.name; }
        /* A PART LEFT OUT, HERE OR BY THE SERVER, IS SAID BESIDE WHAT WAS SAVED (620). */
        const word = ((d && d.said) || text_('saved')) + (seatNo ? (d && d.refused ? ' ' : ' — the rest. Not saved: ') + seatNo : '');
        const r = { d, fields, word, seatNo };
        if (o.done) o.done(r);
        if (o.own && W === USER) saveUser_();
        if (o.toast !== false) toast(word);
        const tick = Object.prototype.hasOwnProperty.call(o, 'tick') ? o.tick : form;
        if (o.auto && tick) autosaveTick_(tick, word);
        if (o.after) o.after(r);
        resolve(r);
      })
      .catch(err => { /* `send_` has already written the refusal under the card. */ if (o.auto) autosaveFailed_(err); if (o.failed) o.failed(err); resolve(null); });
  };
  if (o.gate) o.gate(fields, go, () => resolve(null), said); else go();
  });
}
/* A BOX NOBODY HERE MAY CHANGE: the sheet's read-only list, and @family.'s cut of an extra seat to all but an admin
   (`seatCutRefusal_`). The one rule — Settings (me-roles.js) and the card editor both ask it. */
function fieldReadonly_(f) {
  return (((typeof DATA !== 'undefined' && DATA && DATA.profileReadonly) || []).indexOf(f) !== -1) || (f === 'extra_seat_cut' && !may_('admin'));
}
/* ---------- THE SAVE ITSELF, LIFTED OUT SO THE QUALIFICATION EDITORS CAN CALL IT § */
function meSave_(el, auto) {
  /* AND A THIRD SURFACE, WHICH IS THE SETTINGS COLUMN. § */
  const box = el.closest('.me-form') || el.closest('#sheet-body') || el.closest('.widget-slot') || document.body;
  const form = el.closest('.me-form');
  /* NOT ON THE QUALIFICATIONS CARD, WHICH SAVES ON EVERY ANSWER. § */
  const quiet = !!box.querySelector('.q-shelf');
  const W = whose_() || {};
  return profileSave_(box, { el, auto, own: true, target: { name: W.name, id: W.personId || '' }, tick: !quiet && form,
    /* ---------- NOT FROM A COPY OF YOUR SETTINGS THAT CANNOT BE TRUE § */
    /* ---------- AND WHEN THE SERVER IS OLDER THAN THIS SITE § */
    gate: (fields, go, stop, said) => {
      if (profileShapeOk_()) return go();
      const packed = Object.keys(fields).some(k => PACKED_FIELD_.test(k));
      const blocked = () => { if (said) said.textContent = OLD_SERVER_SAY_
        + ' Until then this card is not sent, because its boxes may be empty and saving would wipe what the sheet holds.'; };
      if (PROFILE_SERVER_OLD) { if (packed) { blocked(); return stop(); } return go(); }
      if (said) tell_(said, 'error', 'Your saved details are still loading from the sheet, so nothing was sent. Try again in a moment.');
      profileRefresh_(true, () => (packed ? blocked() : go()));
      /* NOT SENT YET, AND THE CALLER IS TOLD SO — a refresh that ends in `go` saves the card, but an editor waiting on this would otherwise wait for § */
      stop();
    },
    done: ({ d, fields, word }) => {
      const W = whose_();
      /* ON THE SHEET NOW, SO EACH FIELD SENT IS NO LONGER A DRAFT (`fieldHtml`; 317). */
      Object.keys(fields).forEach(f => { try { draftDrop_('set', f); } catch (e) { oops_(e, 'me:meSave_') } });
      /* A CORRECTED PENDING ADDRESS IS STILL PENDING, at the new address — the held cards say which. */
      if (d && d.pendingEmail !== undefined) { accountChanged_(); W.pendingEmail = String(d.pendingEmail || ''); }
      /* ---------- "SAVED" IS NOT THE WHOLE STORY WHEN AN ADDRESS WAS TYPED § */
      if (box.closest('#sheet-body') && !auto) closeStep_();
      /* THIS CARD IS CLEAN NOW, so a repaint may redraw it — see `settingsKeep_` — unless the caret is still in it. */
      if (form && !(auto && form.contains(document.activeElement))) delete form.dataset.dirty;
      const said = box.querySelector('.me-said');
      if (said) tell_(said, 'info', quiet ? '' : word);
    },
    after: ({ d, word }) => {
      /* WHICH COLUMN THE CARD IS ON (453): a settings column, or a people column's card editor. */
      const col = colOfEl_(form) || 'account';
      const at = [...document.querySelectorAll('#s-' + col + ' .me-form')].indexOf(form);
      const lineAt = () => at < 0 ? null
        : (document.querySelectorAll('#s-' + col + ' .me-form')[at] || {}).querySelector?.('.me-said');
      /* THE CARD IS REDRAWN WHEN AN ADDRESS WAS TYPED — the line under the box and the tile beside Save come and go with a waiting address, and nothing § */
      if (d && d.said && !(auto && form && form.dataset.dirty)) {
        try { paint(col); placeCells('y', true, 0, col); } catch (e) { oops_(e, 'me:meSave_') }
        const el2 = lineAt(); if (el2) el2.textContent = word;
      }
      /* THE PUBLIC CARD IS BUILT BY `doGet`, so it only moves when the payload does — but only when something was written. § */
      if (!d || d.changed === undefined || d.changed > 0) sayAfterLoad_(lineAt, quiet ? '' : word);
    } }).then(r => !!r);
}

/* A QUALIFICATION WITH NO SUBJECT, ASKED OF A FORM — lifted out of `meSave_` so the card's own Save (`card-save`) refuses exactly what a Settings § */
const QUAL_NAMELESS_SAY_ = 'Choose a subject for each qualification first — nothing was saved.';
function qualNameless_(box) {
  return [...box.querySelectorAll('.q-shelf .q-slot')].some(slot => {
    const n = slot.querySelector('[data-me="qual_' + slot.dataset.slot + '"]');
    return !(n && String(n.value || '').trim())
      && [...slot.querySelectorAll('[data-me]')].some(b => !isHiddenBox_(b) && String(b.value || '').trim());
  });
}

/* ---------- "SAVED" SURVIVES THE REPAINT IT CAUSES § */
function sayAfterLoad_(find, text) {
  Promise.resolve(load()).then(() => setTimeout(() => {
    const el = find(); if (el) el.textContent = text;
  }, 0), () => {});
}

/* THE FIELD NAMES THAT ARE HALVES OF ONE CELL — see the old-server note in `me-save`. § */
const PACKED_FIELD_ = /^(phone_(cc|no)|dob_[dmy]|qual_\d+(_|$)|lib\d+_|photos_\d+|(m|tu|w|th|f|sa|su)\d{1,2})$|^(qual_\d+_\w+|lib\d+_\w+)$/;
let PROFILE_SERVER_OLD = false;
const OLD_SERVER_SAY_ = 'The server in Apps Script is older than this site. Update the backend (pull from GitHub, then Deploy \u2192 Manage deployments \u2192 New version).';

/* ---------- WHICH SETTINGS CARDS HAVE SOMETHING TYPED INTO THEM § */
/* AND THE BUSINESS COLUMN BY THE SAME RULE. § */
/* AND THE LIBRARY CARDS ON TOOLS (docs/history/339), and their starred copy on Saved — a `.me-form` in a widget's slot, kept by the same two lines § */
/* AND EVERY SETTINGS FORM IN FIND: Tutor, Kids and Biz settings are Find › Settings branches since 16 Nov, held as their columns were. */
const KEEP_FORMS_ = '#s-stuff .me-form, #s-saved .widget-slot .me-form';
document.addEventListener('input', e => {
  const f = e.target && e.target.closest && e.target.closest(KEEP_FORMS_);
  if (f) f.dataset.dirty = '1';
});
document.addEventListener('change', e => {
  const f = e.target && e.target.closest && e.target.closest(KEEP_FORMS_);
  if (f) f.dataset.dirty = '1';
});
function settingsKeep_(id) {
  /* AND THE YOU COLUMN, WHILE A CARD ON IT IS BEING EDITED (`cardEditHtml_`) — the same rule for the same reason: § */
  if (['tutors', 'students', 'parents'].indexOf(id) !== -1 && USER) {
    const acc = $('s-' + id);
    /* AND STUDENT SETTINGS' CARDS, and the card editors and person forms on the people columns (453). */
    return !!(acc && acc.querySelector('.card-ed .me-form[data-dirty], .is-sending .card-ed, .me-form[data-dirty], .me-form.is-sending'));
  }
  /* AND SAVED, WHILE THE LIBRARY CARDS ON THEM HOLD TYPING (docs/history/339) — the one form a widget slot holds. § */
  if (['saved', 'stuff'].indexOf(id) !== -1 && USER) {   /* Find's too: the library cards are a Find card (790) */
    const col = $('s-' + id);
    return !!(col && col.querySelector(id === 'stuff' ? '.me-form[data-dirty], .me-form.is-sending, .is-sending .card-ed' : '.widget-slot .me-form[data-dirty], .widget-slot .me-form.is-sending'));
  }
  return false;
}

/* ---------- YOUR SETTINGS, AS THE SHEET HOLDS THEM § */
let PROFILE_ASKING = false;
function profileShapeOk_() {
  const p = whose_() && whose_().profile;
  return !!p && Object.prototype.hasOwnProperty.call(p, 'phone_cc');
}
function profileRefresh_(loud, onOld) {
  if (!USER || !USER.token || PROFILE_ASKING) return;
  PROFILE_ASKING = true;
  const askedAt = Date.now();
  /* RETURNED, so a caller waiting on a copy it can trust (the card editor, `cardFetch_`) knows when the question has been answered either way — every § */
  return api({ action: 'item', door: 'get', kind: 'profile', name: USER.name, personId: USER.personId || '' })
    .then(d => {
      PROFILE_ASKING = false;
      /* ---------- AN ANSWER OLDER THAN WHAT THE PHONE NOW KNOWS IS NOT PAINTED § */
      if (askedAt < ACCOUNT_AT_) { if (d && d.success) profileRefresh_(loud, onOld); return; }
      /* AN OLD SERVER, NOT A FAULT. § */
      if (d && d.error && /unknown action|not recognis/i.test(String(d.error))) {
        PROFILE_SERVER_OLD = true;
        if (typeof onOld === 'function') return onOld();
        if (loud) toast(OLD_SERVER_SAY_);
        return;
      }
      if (!d || !d.success || !d.profile || !USER) {
        if (loud && d && d.error) toast(d.error);
        return;
      }
      /* ONLY FOR THE PERSON STILL SIGNED IN. A reply that lands after somebody else has signed in on
         this phone is about the previous person. */
      if (USER.personId && String(d.personId) !== String(USER.personId)) return;
      if (!USER.personId) USER.personId = d.personId;
      USER.profile = d.profile;
      if (d.agreementSignedAt !== undefined) {
        USER.agreementSignedAt = d.agreementSignedAt; USER.agreementVersion = d.agreementVersion;
      }
      /* ---------- AND THE ROLE, WHICH WENT STALE THE SAME WAY § */
      /* `pendingEmail` RIDES WITH THE ROLE, for the role's reason: § */
      /* ---------- AND THE NAMES, WHICH WENT STALE THE SAME WAY § */
      const roleWas = JSON.stringify([!!USER.owner, USER.rank, USER.role, USER.roles, !!USER.tutorPending, String(USER.pendingEmail || ''),
        String(USER.name || ''), USER.children, USER.kids, String(USER.handle || '')]);
      if (d.role) USER.role = d.role;
      if (Array.isArray(d.roles) && d.roles.length) USER.roles = d.roles;
      if (d.tutorPending !== undefined) USER.tutorPending = !!d.tutorPending;
      /* THE OWNER FLAG (18 Nov): may_('owner'), for kinds.json `who: "owner"`. */
      if (d.owner !== undefined) USER.owner = !!d.owner;
      if (d.rank) USER.rank = String(d.rank);
      if (d.application !== undefined) USER.application = d.application;
      if (d.pendingEmail !== undefined) USER.pendingEmail = String(d.pendingEmail || '');
      if (d.name) USER.name = String(d.name);
      ['children', 'kids', 'parents', 'siblings'].forEach(k => { if (Array.isArray(d[k])) USER[k] = d[k]; });
      /* ---------- AND THE HANDLE, WHICH THE BUSINESS MAY HAVE MOVED UNDER THIS PHONE (342) § */
      if (d.handle && USER.handle && String(d.handle) !== String(USER.handle)) {
        HANDLE_SAID = { pid: String(USER.personId || ''), text: 'You were @' + USER.handle + '.' };
        try { toast('Your handle is @' + d.handle + ' now'); } catch (e) { oops_(e, 'me:profileRefresh_') }
      }
      if (d.handle) USER.handle = String(d.handle);
      const roleMoved = JSON.stringify([!!USER.owner, USER.rank, USER.role, USER.roles, !!USER.tutorPending, String(USER.pendingEmail || ''),
        String(USER.name || ''), USER.children, USER.kids, String(USER.handle || '')]) !== roleWas;
      saveUser_();
      /* BOTH THROUGH `landRepaint_` (shell.js), because this is a reply landing like the payload is: § */
      const land = typeof landRepaint_ === 'function' ? landRepaint_ : (f => (f || repaint)());
      if (roleMoved) { try { land(); } catch (e) { oops_(e, 'me:profileRefresh_') } return; }
      /* AND YOUR CARD, WHEN IT IS OPEN FOR EDITING — it is drawn from this copy (`cardEditHtml_`), and one still waiting for a copy it can trust § */
      if (CARD_EDIT && CARD_EDIT.own) { try { land(() => paint(SET_OF_FACE_[CARD_EDIT.col] || 'account')); } catch (e) { oops_(e, 'me:profileRefresh_') } }
      /* REDRAWN IF IT IS DRAWN — and `paint` itself declines while a card has typing in it. */
      PEOPLE_COLS_.forEach(c => {
        if (typeof screenHasMarkup_ === 'function' && screenHasMarkup_(c))
          try { land(() => { paint(c); placeCells('y', true, 0, c); }); } catch (e) { /* a screen gone before it lands is painted on its next draw */ }
      });
      /* AND THE PROGRESS COLUMN, the same rule: § */
    })
    .catch(() => { PROFILE_ASKING = false; });
}
/* `change-pin` opened a sheet of its own. § */
/* CHANGING YOUR PIN IS kinds.json's person form `pin-change`, asked a digit a tag on the Signing in card (askArea_); its send is the existing `changePin`. */
FORM_SEND_['pin-change'] = (v, el) => {
  const said = $('pin-said');
  /* SIGNED OUT, OR A BLANK NEW PIN, SENDS NOTHING — a blank pair "matches" and would post an empty PIN. */
  if (!USER) { if (said) tell_(said, 'error', text_('err-sign-in-first')); return; }
  if (!v.now || !v.new) { if (said) tell_(said, 'info', 'Type your PIN now and the new one.'); return; }
  /* Typed twice, checked here before the server sees it — a PIN you cannot see and typed once is
     a PIN you get locked out by. */
  if (v.new !== v.again) { if (said) tell_(said, 'info', 'The 2 new PINs do not match.'); askBack_('pin-change', 'new'); askBack_('pin-change', 'again'); return; }
  /* `send_`, SO A SECOND TAP CANNOT POST A SECOND CHANGE. § */
  const lock = el && el.closest && el.closest('.ask-set');
  send_({ action: 'changePin', name: USER.name, personId: (USER && USER.personId) || '', currentPin: v.now, newPin: v.new },
        { button: el, busy: 'Changing…', where: 'pin-said', lock: lock })
    .then(d => {
      /* ---------- A NEW PIN ENDS EVERY SESSION, SO THIS PHONE IS HANDED A NEW ONE § */
      if (d && d.token) {
        USER.token = d.token;
        saveUser_();
      }
      /* THE DIGITS GO THE MOMENT THEY ARE SENT. */
      askDone_('pin-change'); askPaint_('pin-change');
      if (said) tell_(said, 'saved', 'Changed.');
      toast('PIN changed');
      if (el && el.closest && el.closest('#sheet-body')) closeStep_();
    })
    .catch(() => {});
};

/* `LOADED` and `LOAD_FAILED` were declared here and are now in data.js, with the rest of the state. § */

/* YOUR CARD IS WHERE YOU EDIT IT (docs/history/330) § */

/* ---------- THE CARD'S SECTIONS, IN THE CARD'S ORDER, AND THE FIELDS EACH ONE EDITS § */
/* ---------- AND TWO SECTIONS THAT ARE YOURS ALONE, AND TWO THAT EVERY CARD HAS (docs/history/339) § */
const CARD_SECTIONS = [
  { id: 'picture', bare: true, fields: ['photo'] },
  { id: 'name', bare: true, fields: ['first_name', 'last_name'] },
  { id: 'handle', own: true, cap: 'Handle' },
  /* THREE CARDS, EACH ONE HOME (620): the rate and the tutor's seat k; @family.'s share g, an admin's; the class size. */
  { id: 'seat', cap: 'Rate and extra seat', fields: ['rate_per_hour', 'extra_seat_rate'] },
  { id: 'size', cap: 'Class size', fields: ['min_students', 'max_students'] },
  /* WHO MANAGES YOU (13 Nov): a tutor you choose, and the extra-seat split it makes (`chainShares_`). */
  { id: 'manager', cap: 'Your manager', fields: ['manager'] },
  { id: 'headline', fields: ['headline'] },
  /* NO `video` BOX: the clip is uploaded (videoPicker_); updateProfile writes no `video` cell since 8 Nov. */
  { id: 'photos', cap: 'Photographs', fields: [], match: /^photos_\d+$/ },
  { id: 'words', fields: ADJECTIVE_FIELDS },
  { id: 'glance', cap: 'At a glance', fields: ['years_experience', 'favourite_colour', 'age_min', 'age_max', 'min_hours', 'max_hours'] },
  { id: 'quals', cap: 'Qualifications', match: /^qual_\d+(_level|_board|_grade|_received|_teach|_spec)?$/ },
  { id: 'jobs', cap: 'Jobs', match: /^job_\d+_(role|where|from|to)$/ },
  { id: 'where', fields: ['venues_ok', 'travel_km'] },
  { id: 'week', cap: 'Available', match: /^(m|tu|w|th|f|sa|su)\d\d$/ },
];

/* EVERY FIELD THE BACKEND SAYS A TUTOR EDITS, in its order — the one list `cardSections_` filters. */
function cardSent_() {
  const g = (typeof DATA !== 'undefined' && DATA && DATA.profileFields) || {};
  return [].concat(...Object.keys(g).map(k => g[k] || [])).filter(f => RETIRED_FIELDS_.indexOf(f) === -1);
}
/* `o.sent` IS WHICH FIELDS MAY BE OFFERED (a tutor's, by default); `o.own` adds your own two sections; `o.bare` keeps only the sections every card prints. § */
function cardSections_(o) {
  o = o || {};
  const sent = o.sent || cardSent_();
  return CARD_SECTIONS.filter(s => (s.own ? !!o.own : (!o.bare || !!s.bare))).map(s => Object.assign({}, s, {
    list: (s.fields || []).filter(f => sent.indexOf(f) !== -1).concat(s.match ? sent.filter(f => s.match.test(f)) : []),
  })).filter(s => s.own || s.list.length);
}
const cardFields_ = () => [].concat(...cardSections_().map(s => s.list));
/* ---------- YOUR OWN CARD'S SECTIONS — FROM YOUR ROLE'S FIELDS, AND ONLY WHAT YOUR CARD PRINTS § */
function ownCardSections_(col) {
  const g = myGroups_();
  const sent = [].concat(...Object.keys(g).map(k => g[k] || [])).filter(f => RETIRED_FIELDS_.indexOf(f) === -1);
  /* `col` (469): the Students face edits every account's four, whatever your rank; Tutors the rest, less what the Staff hub edits. None: both. */
  const all = cardSections_({ own: true, sent, bare: !cardMine_() });
  const you = all.filter(s => OWN_CARD_SECTIONS_.indexOf(s.id) !== -1);
  const staff = all.filter(s => OWN_CARD_SECTIONS_.indexOf(s.id) === -1 && s.list.length);
  if (!col) return you.concat(staff);
  /* WHAT YOU TEACH ONLY ON A PUBLIC TUTOR CARD, as on 444's Tutor column. */
  return (isStudentsCol_(col) ? you : []).concat(isTutorsCol_(col) && cardMine_() ? staff : []);
}
const OWN_CARD_SECTIONS_ = ['picture', 'name', 'handle'];
/* EACH SECTION'S CARD TITLE, and which a locked settings column shows (468). */
const OWN_SEC_TITLE_ = { picture: 'Picture', name: 'Name', handle: 'Handle', seat: 'Rate and extra seat', cut: "@family.'s share", size: 'Class size', manager: 'Your manager', headline: 'Headline',
  photos: 'Photographs', words: '3 words', glance: 'At a glance', quals: 'Qualifications', jobs: 'Jobs', where: text_('where-you-teach'), week: 'Available' };
/* EACH SECTION ON ONE COLUMN FOR EVERYONE, the lowest rank it applies to (469): the owner, "the lowest common denominator". */
const OWN_SEC_OF_SET_ = { account: OWN_CARD_SECTIONS_, family: [],
  staff: ['seat', 'size', 'manager', 'headline', 'photos', 'words', 'glance', 'quals', 'jobs', 'where', 'week'] };
/* THE RATE, THE SEAT AND THE CLASS SIZE HAVE ONE HOME, the Rate and class size card (620); the hub's Pricing only tries figures and points here. */
const ownCardFields_ = () => [].concat(...ownCardSections_().map(s => s.list));

/* ---------- JOBS, CURRENT AND PAST (8 Nov): one line a job — role, where, from–to or "now" — added with "Add a job" like a qualification. */
const isJobField_ = f => /^job_\d+_(role|where|from|to)$/.test(String(f || ''));
const isJobs_ = list => (list || []).some(isJobField_);
function jobShelf_(list, value, o) {
  const nums = [...new Set((list || []).filter(isJobField_).map(f => String(f).match(/^job_(\d+)_/)[1]))];
  let last = 0;
  nums.forEach((n, i) => { if (shelfFilled_(value, ['job_' + n + '_role', 'job_' + n + '_where'])) last = i + 1; });
  /* EACH BOX forms.json's `job` form; the card editor keeps its own draft (`o.draft`). */
  const box = (n, k) => formOf_('job', f => String(value(f) || ''), { vars: { n }, only: ['job_{n}_' + k], with: () => ((o || {}).draft === false ? { draft: false } : {}) });
  const slot = (n, i) => ({ type: 'group', look: 'lib-card job-slot', attrs: { hidden: i >= last }, inner: box(n, 'role') + box(n, 'where')
    + cardBlock_({ type: 'group', tag: 'span', look: 'job-when', inner: box(n, 'from') + cardBlock_({ type: 'group', tag: 'span', look: 'job-dash', text: '–' }) + box(n, 'to') })
    + shelfDrop_('job') });
  return cardBlock_({ type: 'group', look: 'lib-shelf job-shelf', attrs: { 'data-noun': 'job' }, inner: cardBlocks_(nums.map(slot)) + (last < nums.length ? shelfAdd_('job') : '') });
}
/* HOW MANY JOBS, for the fold's line. */
const jobCount_ = val => [1, 2, 3, 4, 5, 6].filter(n => String(val('job_' + n + '_role') || val('job_' + n + '_where') || '').trim()).length;

/* ---------- THE INTRO VIDEO, UPLOADED (8 Nov): a file, not a link — about a minute, 100 MB at most, checked here before § */
const VIDEO_MAX_MB_ = 100, VIDEO_MAX_S_ = 75, VIDEO_PART_ = 4 * 1024 * 1024;
const introSrc_ = id => 'https://drive.google.com/file/d/' + encodeURIComponent(String(id || '')) + '/preview';
function videoPicker_(value, said) {
  const id = String(value('video_file') || '').trim();
  return cardBlock_({ type: 'group', look: 'vid-pick', attrs: { 'data-file': id }, blocks: [
    { type: 'group', look: 'ce-line', blocks: [{ type: 'group', tag: 'span', look: 'ce-k', text: 'Intro video' }, { type: 'group', tag: 'span', look: 'ce-v', text: id ? 'uploaded' : 'none' }] },
    id ? { type: 'group', look: 'vid-frame', blocks: [{ type: 'media', src: introSrc_(id), title: 'Your intro video', allow: 'autoplay; fullscreen', full: true }] } : null,
    { type: 'group', look: 'tile-row', tiles: [{ icon: 'plus', label: id ? 'Change video' : 'Upload video', note: 'about a minute', act: 'vid-pick' },
      { icon: 'bin', label: 'Remove', act: 'vid-remove', off: !id }] },
    { type: 'group', tag: 'p', look: 'note vid-said', text: said || (id ? 'Parents can watch this on your card.' : 'A short clip saying hello: about a minute, 100 MB at most.') },
    { type: 'control', attrs: { type: 'file', class: 'vid-in', accept: 'video/*', hidden: true } }] });
}
const vidSay_ = (box, msg) => { const p = box && box.querySelector('.vid-said'); if (p) p.textContent = msg; };
function vidTake_(box, id, msg) {
  if (USER) USER.profile = Object.assign({}, USER.profile || {}, { video_file: id });
  const row = USER && ((DATA && DATA.tutors) || []).find(t => t && t.personId === USER.personId);
  if (row) row.videoFile = id;
  if (box) box.outerHTML = videoPicker_(f => (f === 'video_file' ? id : ''), msg);
}
on('vid-pick', el => { const inp = el.closest('.vid-pick') && el.closest('.vid-pick').querySelector('.vid-in'); if (inp) inp.click(); });
on('vid-remove', el => {
  const box = el.closest('.vid-pick');
  if (!USER || !box || !sure_(el, 'Remove?')) return;
  send_({ action: 'videoPart', name: USER.name, personId: USER.personId, remove: true }, { button: el, where: box.querySelector('.vid-said'), saying: 'Removing…', lock: box })
    .then(() => { vidTake_(box, '', 'Removed.'); toast(text_('video-removed')); }).catch(() => { /* the line says why */ });
});
/* HOW LONG THE CLIP RUNS, read by the browser before sending; 0 when it cannot tell, and then only the size is asked. */
function vidLength_(file) {
  return new Promise(ok => {
    try {
      const v = document.createElement('video'), url = URL.createObjectURL(file);
      const end = s => { URL.revokeObjectURL(url); ok(s); };
      const k = setTimeout(() => end(0), 4000);
      v.preload = 'metadata';
      v.onloadedmetadata = () => { clearTimeout(k); const s = Number(v.duration); end(isFinite(s) ? s : 0); };
      v.onerror = () => { clearTimeout(k); end(0); };
      v.src = url;
    } catch (e) { ok(0); }
  });
}
const vidB64_ = blob => new Promise((ok, no) => {
  const r = new FileReader();
  r.onload = () => ok(String(r.result).split(',')[1] || '');
  r.onerror = () => no(new Error('the phone could not read the video'));
  r.readAsDataURL(blob);
});
/* THE REFUSAL BEFORE SENDING, in words; '' when the clip may go. */
function vidRefusal_(file, secs) {
  if (!file || !/^video\//.test(file.type || '') && !/\.(mov|mp4|m4v|webm)$/i.test(file.name || '')) return 'That is not a video. Choose a video from your phone.';
  if (file.size > VIDEO_MAX_MB_ * 1024 * 1024) return 'That video is ' + Math.ceil(file.size / 1048576) + ' MB — 100 MB at most. Trim it to about a minute.';
  if (secs > VIDEO_MAX_S_) return 'That video runs ' + Math.round(secs) + ' seconds — about a minute at most. Trim it and choose it again.';
  return '';
}
async function vidUpload_(box, file) {
  const parts = Math.max(1, Math.ceil(file.size / VIDEO_PART_)), upload = 'u' + Date.now().toString(36);
  const btn = box.querySelector('[data-do="vid-pick"]');
  let d = null;
  for (let i = 0; i < parts; i++) {
    const data = await vidB64_(file.slice(i * VIDEO_PART_, Math.min(file.size, (i + 1) * VIDEO_PART_)));
    d = await send_({ action: 'videoPart', name: USER.name, personId: USER.personId, upload, part: i, parts, size: file.size,
      mime: file.type || 'video/mp4', data }, { button: btn, where: box.querySelector('.vid-said'), saying: 'Uploading… ' + Math.round(i / parts * 100) + '%', lock: box });
  }
  return d;
}
document.addEventListener('change', e => {
  const inp = e.target;
  if (!inp || !inp.matches || !inp.matches('.vid-in')) return;
  const file = (inp.files || [])[0];
  inp.value = '';
  const box = inp.closest('.vid-pick');
  if (!file || !box || !USER) return;
  vidSay_(box, 'Checking the video…');
  vidLength_(file).then(secs => {
    const no = vidRefusal_(file, secs);
    if (no) { vidSay_(box, no); return; }
    return vidUpload_(box, file).then(d => {
      const id = String((d && d.videoFile) || '');
      if (!id) { vidSay_(box, 'The video went but no file came back. Try again.'); return; }
      vidTake_(box, id, 'Saved. Parents can watch this on your card.');
      toast(text_('video-saved'));
    });
  }).catch(() => { /* `send_` has said why on the line */ });
});
