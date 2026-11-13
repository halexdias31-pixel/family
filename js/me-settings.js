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
  if (!slot) toast('That is the most this card holds — 10 qualifications in all.');
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
  const cc = String(value('phone_cc') || '') || '+44';
  /* THE NUMBER IS A DRAFT UNTIL SAVED, as every box of your own row is (`fieldHtml`; 317). */
  const phoneNo = String(value('phone_no') || (value('phone_cc') ? '' : value('phone')) || '');
  const codes = (Array.isArray(DATA && DATA.phoneCodes) && DATA.phoneCodes.length) ? DATA.phoneCodes.slice() : ['+44'];
  if (codes.indexOf(cc) === -1) codes.unshift(cc);
  return fieldCap_('phone', formPhone_('phone_cc', 'phone_no', codes.map(x => `<option value="${esc(x)}"${x === cc ? ' selected' : ''}>${esc(x)}</option>`).join(''),
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
  const quiet = 'spellcheck="false"';
  const has = i => shelfFilled_(value, ['lib' + i + '_name', 'lib' + i + '_no', 'lib' + i + '_pin']);
  /* ONE CARD ONLY (489, the owner on Library cards: "change this to be only 1 card allowed") — the one already filled, else the first; no Add § */
  /* A RULE (496): `library-one-card` — Universal, every slot with Add another, like any shelf. */
  const nums = !(typeof ruleOn_ !== 'function' || ruleOn_('library-one-card')) ? all : all.length ? [all.find(has) || all[0]] : [];
  return `<div class="lib-shelf" data-noun="library card">${shelfSlots_(nums,
    has,
    (i, hide) => `
    <div class="lib-card"${hide ? ' hidden' : ''}>
      <div class="lib-face" role="group" aria-label="Library card ${esc(i)}">
        <span class="lib-cap" aria-hidden="true">Library card</span>
        <div class="lib-name">${fieldHtml('lib' + i + '_name', value('lib' + i + '_name'),
          { placeholder: 'Library name', extra: quiet + ' aria-label="Library name"' })}</div>
        <div class="lib-pin">${fieldHtml('lib' + i + '_pin', value('lib' + i + '_pin'),
          { label: 'PIN', extra: quiet + ' autocomplete="off" placeholder=" "' })}</div>
        ${libBars_(value('lib' + i + '_no'))}
        <div class="lib-no">${fieldHtml('lib' + i + '_no', value('lib' + i + '_no'),
          { placeholder: 'Card number', extra: quiet + ' autocomplete="off" aria-label="Card number"' })}</div>
      </div>
    </div>`, 'library card')}</div>`;
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
function libBars_(no) {
  const w = libBarsOf_(no);
  let x = 0, d = '';
  w.forEach((n, i) => { if (i % 2 === 0) d += 'M' + x + ' 0h' + n + 'v1h-' + n + 'z'; x += n; });
  const blank = !String(no ?? '').trim();
  return `<svg class="lib-bars${blank ? ' is-blank' : ''}" viewBox="0 0 ${x} 1" preserveAspectRatio="none"
    shape-rendering="crispEdges" aria-hidden="true" focusable="false"><path fill="currentColor" d="${d}"/></svg>`;
}
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

/* YOUR LIBRARY CARDS, A TOOL (docs/history/339) § */
function libCardsDraw_(into) {
  if (!into) return;
  const held = into.querySelector('.me-form[data-dirty], .me-form.is-sending');
  if (held) return;
  if (!whose_()) { into.innerHTML = `<p class="note">Sign in and your library cards are kept here.</p>`; return; }
  const list = libFieldsOf_(myGroups_());
  if (!list.length && typeof awaiting_ === 'function' && awaiting_()) { into.innerHTML = loading_(); return; }
  /* AN OLDER SERVER, SAID AS ONE — `OLD_SERVER_SAY_`, the card editor's sentence for the same case. § */
  if (!list.length) {
    into.innerHTML = `<p class="note">${esc(OLD_SERVER_SAY_)}</p>`;
    return;
  }
  const p = whose_().profile || {};
  into.innerHTML = `<div class="me-form">${libraryShelf_(list, f => p[f] ?? '')}
    <p class="note me-said"></p></div>`;
}
function initLibCards_() { libCardsDraw_($('lib-box')); }
/* EVERY COPY ON THE PAGE — Tools' and, starred, Saved's — for `myProfile` landing (`profileRefresh_`): § */
function libCardsRedraw_() {
  /* NOT A COPY SOMEBODY IS IN — a box focused and not yet typed into is not dirty, and redrawing it would take the caret away § */
  document.querySelectorAll('[id="lib-box"]').forEach(into => {
    if (!into.contains(document.activeElement)) libCardsDraw_(into);
  });
}

/* ---------- EVERY SETTINGS FIELD SAVES AS YOU TYPE (owner, 8 Nov) § */
const AUTOSAVE_MS = 800;
const AUTOSAVE_T = new WeakMap();
const AUTOSAVE_FORMS_ = '.set-shape .me-form, #lib-box .me-form';
function autosaveLater_(form) {
  clearTimeout(AUTOSAVE_T.get(form));
  AUTOSAVE_T.set(form, setTimeout(() => autosaveNow_(form), AUTOSAVE_MS));
}
function autosaveHear_(e) {
  const box = e.target;
  if (!box || !box.closest || !box.matches('input, select, textarea') || isFileBox_(box)) return;
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
  if (said) said.textContent = '\u2713 ' + (word || 'Saved');
  form.classList.add('is-saved');
  if (!form.contains(document.activeElement)) delete form.dataset.dirty;
}
function autosaveFailed_(err) {
  toast(typeof why_ === 'function' ? why_(err) : 'Not saved — try again.');
}
document.addEventListener('input', autosaveHear_, true);
document.addEventListener('change', autosaveHear_, true);
/* ---------- THE SAVE ITSELF, LIFTED OUT SO THE QUALIFICATION EDITORS CAN CALL IT § */
function meSave_(el, auto) {
  return new Promise(resolve => {
  /* A PRESS OR A SAVE IN HAND MAKES THE WAITING ONE MOOT. */
  { const f0 = el && el.closest && el.closest('.me-form'); if (f0) clearTimeout(AUTOSAVE_T.get(f0)); }
  /* SIGNED OUT (the session ended under an open card): nothing to save to, and `USER.name` would throw. */
  if (!USER) { toast('Sign in first.'); return resolve(false); }
  /* AND A THIRD SURFACE, WHICH IS THE SETTINGS COLUMN. § */
  const box = el.closest('.me-form') || el.closest('#sheet-body') || el.closest('.widget-slot') || document.body;
  const said = box.querySelector('.me-said');
  /* GATHERED BEFORE `send_` LOCKS THE CARD. § */
  const fields = {};
  box.querySelectorAll('[data-me]').forEach(box => {
    if (box.disabled) return;
    fields[box.dataset.me] = isCheckbox_(box) ? (box.checked ? 'TRUE' : 'FALSE')
                                                     : String(box.value || '').trim();
  });
  /* A QUALIFICATION WITH NO SUBJECT. § */
  /* ASKED OF EACH SLOT: its `qual_N` box (the subject's select) is the name that is saved, and any visible box with an answer in it is a qualification. § */
  if (qualNameless_(box)) { if (auto) { if (said) said.textContent = QUAL_NAMELESS_SAY_; } else toast(QUAL_NAMELESS_SAY_); return resolve(false); }
  /* ---------- NOT FROM A COPY OF YOUR SETTINGS THAT CANNOT BE TRUE § */
  /* ---------- AND WHEN THE SERVER IS OLDER THAN THIS SITE § */
  if (!profileShapeOk_()) {
    const packed = Object.keys(fields).some(k => PACKED_FIELD_.test(k));
    const blocked = () => { if (said) said.textContent = OLD_SERVER_SAY_
      + ' Until then this card is not sent, because its boxes may be empty and saving would wipe what the sheet holds.'; };
    if (PROFILE_SERVER_OLD) { if (packed) { blocked(); return resolve(false); } return saveNow(); }
    if (said) said.textContent = 'Your saved details are still loading from the sheet, so nothing was sent. Try again in a moment.';
    profileRefresh_(true, () => (packed ? (blocked(), resolve(false)) : saveNow()));
    /* NOT SENT YET, AND THE CALLER IS TOLD SO — a refresh that ends in `saveNow` saves the card, but an editor waiting on this would otherwise wait for § */
    resolve(false);
    return;
  }
  saveNow();
  function saveNow() {
  /* `send_`, NOT `api()`. § */
  /* YOU ASK; `whose_()` IS WHOSE ROW — yours, or the person an admin's lens is on (the backend lets only an admin name another). */
  const W = whose_();
  send_({ action: 'updateProfile', name: USER.name, personId: USER.personId || '',
          target: W.name, targetId: W.personId || '', fields },
        auto ? { where: said } : { button: el, busy: 'Saving…', where: said })
    .then(d => {
      /* THE SERVER'S OWN READING OF THE ROW, NOT WHAT WAS TYPED. § */
      W.profile = (d && d.profile) ? d.profile : Object.assign({}, W.profile || {}, fields);
      /* AND THE PROGRESS COLUMN, whose journey card counts down to the two exam dates on About you (`progressRedraw_`, js/arcade.js) — not left to the § */
      if (typeof progressRedraw_ === 'function') progressRedraw_();
      /* ON THE SHEET NOW, SO EACH FIELD SENT IS NO LONGER A DRAFT (`fieldHtml`; 317). */
      Object.keys(fields).forEach(f => { try { draftDrop_('set', f); } catch (e) { oops_(e, 'me:meSave_') } });
      if (d && d.name) W.name = d.name;
      /* A CORRECTED PENDING ADDRESS IS STILL PENDING, at the new address — the held cards say which. */
      if (d && d.pendingEmail !== undefined) { accountChanged_(); W.pendingEmail = String(d.pendingEmail || ''); }
      /* ---------- "SAVED" IS NOT THE WHOLE STORY WHEN AN ADDRESS WAS TYPED § */
      const word = (d && d.said) || 'Saved';
      if (W === USER) keepUser_();
      if (box.closest('#sheet-body') && !auto) closeSheet();
      /* THIS CARD IS CLEAN NOW, so a repaint may redraw it — see `settingsKeep_` — unless the caret is still in it. */
      const form = el.closest('.me-form');
      if (form && !(auto && form.contains(document.activeElement))) delete form.dataset.dirty;
      /* NOT ON THE QUALIFICATIONS CARD, WHICH SAVES ON EVERY ANSWER. § */
      const quiet = !!box.querySelector('.q-shelf');
      if (said) said.textContent = quiet ? '' : word;
      toast(word);
      if (auto && form && !quiet) autosaveTick_(form, word);
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
      resolve(true);
    })
    .catch(err => { /* `send_` has already written the refusal under the card. */ if (auto) autosaveFailed_(err); resolve(false); });
  }
  });
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
const KEEP_FORMS_ = '#s-account .me-form, #s-staff .me-form, #s-family .me-form, #s-biz .me-form, #s-stuff .widget-slot .me-form, #s-saved .widget-slot .me-form';
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
  if (['account', 'tutors', 'students', 'parents'].indexOf(id) !== -1 && USER) {
    const acc = $('s-' + id);
    /* AND STUDENT SETTINGS' CARDS, and the card editors and person forms on the people columns (453). */
    return !!(acc && acc.querySelector('.card-ed .me-form[data-dirty], .is-sending .card-ed, .me-form[data-dirty], .me-form.is-sending'));
  }
  /* AND SAVED, WHILE THE LIBRARY CARDS ON THEM HOLD TYPING (docs/history/339) — the one form a widget slot holds. § */
  if (['saved', 'stuff'].indexOf(id) !== -1 && USER) {   /* Find's too: the library cards are a Find card (790) */
    const col = $('s-' + id);
    return !!(col && col.querySelector('.widget-slot .me-form[data-dirty], .widget-slot .me-form.is-sending'));
  }
  if (['staff', 'family', 'biz'].indexOf(id) === -1 || !USER) return false;
  const el = $('s-' + id);
  return !!(el && el.querySelector('.me-form[data-dirty], .me-form.is-sending, .is-sending .card-ed'));
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
  return api({ action: 'myProfile', name: USER.name, personId: USER.personId || '' })
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
      const roleWas = JSON.stringify([USER.rank, USER.role, USER.roles, !!USER.tutorPending, String(USER.pendingEmail || ''),
        String(USER.name || ''), USER.children, USER.kids, String(USER.handle || '')]);
      if (d.role) USER.role = d.role;
      if (Array.isArray(d.roles) && d.roles.length) USER.roles = d.roles;
      if (d.tutorPending !== undefined) USER.tutorPending = !!d.tutorPending;
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
      const roleMoved = JSON.stringify([USER.rank, USER.role, USER.roles, !!USER.tutorPending, String(USER.pendingEmail || ''),
        String(USER.name || ''), USER.children, USER.kids, String(USER.handle || '')]) !== roleWas;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch { /* storage blocked: the sign-in still holds for this visit */ }
      /* BOTH THROUGH `landRepaint_` (shell.js), because this is a reply landing like the payload is: § */
      const land = typeof landRepaint_ === 'function' ? landRepaint_ : (f => (f || repaint)());
      if (roleMoved) { try { land(); } catch (e) { oops_(e, 'me:profileRefresh_') } return; }
      /* AND YOUR CARD, WHEN IT IS OPEN FOR EDITING — it is drawn from this copy (`cardEditHtml_`), and one still waiting for a copy it can trust § */
      if (CARD_EDIT && CARD_EDIT.own) { try { land(() => paint(SET_OF_FACE_[CARD_EDIT.col] || 'account')); } catch (e) { oops_(e, 'me:profileRefresh_') } }
      /* REDRAWN IF IT IS DRAWN — and `paint` itself declines while a card has typing in it. */
      ['account', 'staff', 'family'].concat(PEOPLE_COLS_).forEach(c => {
        if (typeof screenHasMarkup_ === 'function' && screenHasMarkup_(c))
          try { land(() => { paint(c); placeCells('y', true, 0, c); }); } catch (e) { /* a screen gone before it lands is painted on its next draw */ }
      });
      /* AND THE PROGRESS COLUMN, the same rule: § */
      if (typeof progressRedraw_ === 'function') { try { land(() => progressRedraw_()); } catch (e) { oops_(e, 'me:profileRefresh_') } }
      /* AND THE LIBRARY CARDS ON TOOLS, which are drawn from this copy and are a widget now, not a page this column repaints (docs/history/339). § */
      try { land(() => libCardsRedraw_()); } catch (e) { oops_(e, 'me:profileRefresh_') }
    })
    .catch(() => { PROFILE_ASKING = false; });
}
/* `change-pin` opened a sheet of its own. § */
on('pin-save', el => {
  const v = id => ($(id) || {}).value || '';
  const said = $('pin-said');
  /* SIGNED OUT, OR A BLANK NEW PIN, SENDS NOTHING — a blank pair "matches" and would post an empty PIN. */
  if (!USER) { if (said) said.textContent = 'Sign in first.'; return; }
  if (!v('pin-now') || !v('pin-new')) { if (said) said.textContent = 'Type your PIN now and the new one.'; return; }
  /* Typed twice, checked here before the server sees it — a PIN you cannot see and typed once is
     a PIN you get locked out by. */
  if (v('pin-new') !== v('pin-again')) { if (said) said.textContent = 'The 2 new PINs do not match.'; return; }
  /* ---------- THE ONE WHERE A NAME COLLISION LOCKS SOMEBODY OUT § */
  /* `send_`, SO A SECOND TAP CANNOT POST A SECOND CHANGE. § */
  const lock = $('pin-now') && $('pin-now').closest('.pin-row');
  send_({ action: 'changePin', name: USER.name, personId: (USER && USER.personId) || '',
          currentPin: v('pin-now'), newPin: v('pin-new') },
        { button: el, busy: 'Changing…', where: 'pin-said', lock: lock })
    .then(d => {
      /* ---------- A NEW PIN ENDS EVERY SESSION, SO THIS PHONE IS HANDED A NEW ONE § */
      if (d && d.token) {
        USER.token = d.token;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch { /* storage blocked: the sign-in still holds for this visit */ }
      }
      ['pin-now', 'pin-new', 'pin-again'].forEach(id => { const b = $(id); if (b) b.value = ''; });
      if (said) said.textContent = 'Changed.';
      toast('PIN changed');
      /* ASKED OF THE DOM, LIKE `me-save` AND `msg-send`. */
      if (el.closest('#sheet-body')) closeSheet();
    })
    .catch(() => {});
});

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
  photos: 'Photographs', words: '3 words', glance: 'At a glance', quals: 'Qualifications', jobs: 'Jobs', where: 'Where you teach', week: 'Available' };
/* EACH SECTION ON ONE COLUMN FOR EVERYONE, the lowest rank it applies to (469): the owner, "the lowest common denominator". */
const OWN_SEC_OF_SET_ = { account: OWN_CARD_SECTIONS_, family: [],
  staff: ['seat', 'size', 'manager', 'headline', 'photos', 'words', 'glance', 'quals', 'jobs', 'where', 'week'] };
const OWN_SET_OF_SEC_ = sec => Object.keys(OWN_SEC_OF_SET_).find(c => OWN_SEC_OF_SET_[c].indexOf(sec) !== -1) || '';
/* THE RATE, THE SEAT AND THE CLASS SIZE HAVE ONE HOME, the Rate and class size card (620); the hub's Pricing only tries figures and points here. */
const ownCardFields_ = () => [].concat(...ownCardSections_().map(s => s.list));

/* ---------- JOBS, CURRENT AND PAST (8 Nov): one line a job — role, where, from–to or "now" — added with "Add a job" like a qualification. */
const isJobField_ = f => /^job_\d+_(role|where|from|to)$/.test(String(f || ''));
const isJobs_ = list => (list || []).some(isJobField_);
const JOB_PH_ = { role: 'role', where: 'where', from: 'from', to: 'to, or now' };
function jobShelf_(list, value, o) {
  const nums = [...new Set((list || []).filter(isJobField_).map(f => String(f).match(/^job_(\d+)_/)[1]))];
  let last = 0;
  nums.forEach((n, i) => { if (shelfFilled_(value, ['job_' + n + '_role', 'job_' + n + '_where'])) last = i + 1; });
  const box = (n, k) => fieldHtml('job_' + n + '_' + k, String(value('job_' + n + '_' + k) || ''), { label: ' ', placeholder: JOB_PH_[k],
    draft: (o || {}).draft, extra: 'autocomplete="off" maxlength="80"' });
  return `<div class="lib-shelf job-shelf" data-noun="job">${nums.map((n, i) => `<div class="lib-card job-slot"${i >= last ? ' hidden' : ''}>
      ${box(n, 'role')}${box(n, 'where')}<span class="job-when">${box(n, 'from')}<span class="job-dash">–</span>${box(n, 'to')}</span>${shelfDrop_('job')}
    </div>`).join('')}${last < nums.length ? shelfAdd_('job') : ''}</div>`;
}
/* HOW MANY JOBS, for the fold's line. */
const jobCount_ = val => [1, 2, 3, 4, 5, 6].filter(n => String(val('job_' + n + '_role') || val('job_' + n + '_where') || '').trim()).length;

/* ---------- THE INTRO VIDEO, UPLOADED (8 Nov): a file, not a link — about a minute, 100 MB at most, checked here before § */
const VIDEO_MAX_MB_ = 100, VIDEO_MAX_S_ = 75, VIDEO_PART_ = 4 * 1024 * 1024;
const introSrc_ = id => 'https://drive.google.com/file/d/' + encodeURIComponent(String(id || '')) + '/preview';
function videoPicker_(value, said) {
  const id = String(value('video_file') || '').trim();
  return `<div class="vid-pick" data-file="${esc(id)}">
    <div class="ce-line"><span class="ce-k">Intro video</span><span class="ce-v">${id ? 'uploaded' : 'none'}</span></div>
    ${id ? `<div class="vid-frame"><iframe src="${esc(introSrc_(id))}" title="Your intro video" loading="lazy" allow="autoplay; fullscreen" allowfullscreen></iframe></div>` : ''}
    <div class="tile-row">${tile_({ icon: 'plus', label: id ? 'Change video' : 'Upload video', note: 'about a minute', act: 'vid-pick' })}${
      tile_({ icon: 'bin', label: 'Remove', act: 'vid-remove', off: !id })}</div>
    <p class="note vid-said">${esc(said || (id ? 'Parents can watch this on your card.' : 'A short clip saying hello: about a minute, 100 MB at most.'))}</p>
    ${formFile_('vid-in', 'video/*')}
  </div>`;
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
    .then(() => { vidTake_(box, '', 'Removed.'); toast('Video removed'); }).catch(() => { /* the line says why */ });
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
      toast('Video saved');
    });
  }).catch(() => { /* `send_` has said why on the line */ });
});
