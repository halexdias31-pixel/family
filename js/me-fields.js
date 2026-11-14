/* ---------- THE SETTINGS FORM'S FIELDS: photos, the profile picture, availability and fieldsHtml (cut from me-settings.js; read with the other me-*.js by tools/piece-src.js). */
/* ---------- AND A GROUP OF `photos_N` NAMES IS A SHELF OF PHOTOGRAPHS § */
const isPhotoField_ = f => /^photos_\d+$/.test(String(f));
const isPhotos_ = list => (list || []).some(isPhotoField_);
/* `o.draft` IS PASSED THROUGH TO THE BOXES — the card editor keeps its own draft (`fieldHtml`'s note). § */
function photoShelf_(list, value, o) {
  const nums = (list || []).filter(isPhotoField_).map(f => String(f).match(/^photos_(\d+)$/)[1]);
  return cardBlock_({ type: 'group', look: 'lib-shelf ph-shelf', attrs: { 'data-noun': 'photo' }, inner: shelfSlots_(nums,
    i => shelfFilled_(value, ['photos_' + i]),
    (i, hide) => {
      const v = String(value('photos_' + i) || '').trim();
      return cardBlock_({ type: 'group', look: 'lib-card ph-slot', attrs: { hidden: !!hide },
        inner: cardBlock_({ type: 'group', tag: 'span', look: 'ph-thumb', blocks: [v ? phThumb_(v) : null] })
        + fieldHtml('photos_' + i, v, { placeholder: 'Photo', draft: (o || {}).draft, extra: 'type="hidden"' })
        + cardBlock_({ type: 'group', look: 'tile-row', inner: tile_({ icon: 'plus', label: v ? 'Change photo' : 'Choose photo', act: 'ph-pick' }) + shelfDrop_('photo') })
        + cardBlock_({ type: 'group', tag: 'p', look: 'note ph-said' }) + formFile_('ph-in', 'image/*') });
    }, 'photo') });
}
/* A SLOT'S THUMBNAIL: the photo as a `media` picture block. */
const phThumb_ = v => ({ type: 'media', kind: 'image', src: pic(v), title: '', async: true });
/* THE PREVIEW FOLLOWS THE BOX as it is typed into, so the check above does not wait for a Save. One
   listener for the document, which is how every other input here is heard. */
document.addEventListener('input', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.ph-slot input')) return;
  const thumb = t.closest('.ph-slot').querySelector('.ph-thumb');
  const v = String(t.value || '').trim();
  if (thumb) thumb.innerHTML = /^https?:\/\/\S+$/i.test(v) ? cardBlock_(phThumb_(v)) : '';
});
/* ---------- AN EXTRA PHOTO IS UPLOADED, NOT LINKED (owner, 8 Nov): redrawn here at 1200px JPEG, kept in Drive by
   `photoFile`, and its link put in the slot's box so Save keeps it with the rest of the card. */
const PHOTO_EDGE_ = 1200;
function photoShrink_(file) {
  return new Promise(done => {
    try {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 1, h = img.naturalHeight || 1, k = Math.min(1, PHOTO_EDGE_ / Math.max(w, h));
        const cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k));
        try { cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); done(cv.toDataURL('image/jpeg', 0.82)); } catch (e) { done(null); }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => { URL.revokeObjectURL(url); done(null); };
      img.src = url;
    } catch (e) { done(null); }
  });
}
on('ph-pick', el => { const slot = el.closest('.ph-slot'), inp = slot && slot.querySelector('.ph-in'); if (inp) inp.click(); });
document.addEventListener('change', e => {
  const inp = e.target;
  if (!inp || !inp.matches || !inp.matches('.ph-in')) return;
  const file = (inp.files || [])[0], slot = inp.closest('.ph-slot');
  inp.value = '';
  if (!file || !slot || !whose_()) return;
  const said = slot.querySelector('.ph-said'), say = m => { if (said) said.textContent = m; };
  if (!/^image\//.test(file.type || '')) { say('That is not a picture. Choose a photo from your phone.'); return; }
  say('Getting the photo ready…');
  photoShrink_(file).then(data => {
    if (!data || !/^data:image\/jpeg/.test(data)) { say('The phone could not read that photo. Try another.'); return; }
    return send_({ action: 'photoFile', name: USER.name, personId: USER.personId, data },
      { button: slot.querySelector('[data-do="ph-pick"]'), where: said, saying: 'Uploading…', lock: slot }).then(d => {
      const url = String((d && d.url) || ''), box = slot.querySelector('input[data-me]');
      if (!url || !box) { say('The photo went but no link came back. Try again.'); return; }
      box.value = url;
      box.dispatchEvent(new Event('input', { bubbles: true }));
      say('Uploaded. Press Save to keep it on your card.');
    });
  }).catch(() => { /* `send_` has said why on the line */ });
});
/* ---------- YOUR PICTURE, CHOSEN RATHER THAN LINKED § */
/* `o.fold`: ON YOUR CARD'S EDIT THE PICKER IS ONE LINE, the face beside "Picture", opening in place (docs/history/425). */
function photoPicker_(value, said, o) {
  const v = String(value('photo') || '').trim();
  const K = picKindRow_(v);
  const chosen = K ? K.chosen(v) : '';
  const opt = n => {
    const label = PFP_ART[n].name;
    return tile_({ label: label, act: 'pfp-choose', data: { pic: n }, on: chosen === n, pressed: chosen === n, cls: 'pfp-opt',
      face: pfpArt_(n, 40) });
  };
  const face = { type: 'group', tag: 'span', look: 'pfp-face', inner: pfpFace_(v) };
  const fold = !!(o && o.fold);
  /* A CHILD CHOOSES FROM THE GRID, NEVER A FILE (413) — `savePhoto` refuses one too. */
  const rest = [{ type: 'group', look: 'pfp-side', blocks: [{ type: 'group', look: 'tile-row', tiles: [
      uiMay_('upload-photo') ? { icon: 'photo', label: 'Choose photo', act: 'pfp-pick' } : null,
      { icon: 'bin', label: 'Remove', act: 'pfp-remove', off: !v }].filter(Boolean) }] },
    { type: 'group', tag: 'p', look: 'note pfp-said', text: said || pfpSaid_(v) }];
  const file = uiMay_('upload-photo') ? formFile_('pfp-in', 'image/*') : '';
  return fold
    ? cardBlock_({ type: 'group', tag: 'details', look: 'pfp ce-fold', attrs: { 'data-fold': 'picture', open: true }, blocks: [
      { type: 'group', tag: 'summary', look: 'ce-line', blocks: [{ type: 'group', tag: 'span', look: 'ce-k', text: 'Picture' }, face] }].concat(rest), inner: file })
    : cardBlock_({ type: 'group', look: 'pfp', blocks: [face].concat(rest), inner: file });
}
/* WHAT THE PICTURE IS, IN A SENTENCE — the line's words at rest and after a save. */
function pfpSaid_(v) {
  const K = picKindRow_(v);
  if (K) return K.said(v);
  return 'No picture yet, so your card shows your initial. Choose one, or a photo.';
}
/* THE PREVIEW IS `personFace_` LIKE EVERY OTHER FACE, so what you see here is what everybody else's card draws — so a picker and a card never disagree. § */
function pfpFace_(v) {
  const me = whose_() || {};
  return personFace_({ pic: v, personId: me.personId, handle: me.handle,
                       name: (me.profile && me.profile.first_name) || me.name || '?' },
                     { cls: 'pfp-pic', none: 'pfp-none', size: 88, alt: 'Your profile picture', eager: true });
}
/* THE RING FOLLOWS A TAP AT ONCE, and goes back where it was if the server says no. */
function pfpRing_(box, name) {
  if (!box) return;
  box.querySelectorAll('.pfp-opt').forEach(b => {
    const on = !!name && b.dataset.pic === name;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
/* ---------- A REFUSAL KEEPS THE OLD PICTURE AND SAYS SO § */
const PFP_SINCE = '2026-10-10-h-pictures';
function pfpKept_(chose) {
  const v = String((typeof DATA !== 'undefined' && DATA && DATA.version) || '');
  const old = !!chose && /^\d{4}-\d\d-\d\d/.test(v) && v < PFP_SINCE;
  return 'Your picture is unchanged.' + (old
    ? ' The server has not been updated for the pictures yet; until it is, a photo still works.' : '');
}
/* ---------- SQUARE, AND SMALL ENOUGH TO POST § */
const PFP_SIZE = 600;
function pfpPrepare_(file) {
  if (typeof camItemOf_ !== 'function') return Promise.resolve(null);
  return camItemOf_(file).then(it => {
    if (!it || it.kind !== 'image' || !it.data) return null;
    return new Promise(done => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 1, h = img.naturalHeight || 1, s = Math.min(w, h);
        const out = Math.max(1, Math.min(PFP_SIZE, s));
        const cv = document.createElement('canvas');
        cv.width = cv.height = out;
        try {
          cv.getContext('2d').drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, out, out);
          done(cv.toDataURL('image/jpeg', 0.85));
        } catch (e) { done(null); }
      };
      img.onerror = () => done(null);
      img.src = it.data;
    });
  }).catch(() => null);
}
/* WHAT THE SERVER SAID THE PICTURE NOW IS, written everywhere this phone keeps it: § */
function pfpTake_(box, url, said) {
  if (!USER) return;
  USER.profile = Object.assign({}, USER.profile || {}, { photo: url });
  USER.photo = url;
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) { /* storage can be blocked; the app runs without it */ }
  ['tutors', 'people', 'students', 'clients', 'family', 'everyone'].forEach(k => ((DATA && DATA[k]) || []).forEach(r => {
    if (r && USER.personId && (r.personId === USER.personId || r.person_id === USER.personId || r.id === USER.personId)) {
      if ('image' in r) r.image = url;
      if ('photo' in r) r.photo = url;
    }
  }));
  const onCard = !!(box && box.closest && box.closest('.card-ed'));
  if (box && box.parentNode) box.outerHTML = photoPicker_(f => (f === 'photo' ? url : ''), said, { fold: onCard });
  /* NOT WHILE THE PICKER IS ON YOUR OWN CARD'S EDIT (docs/history/339) — which is where it is now, for everybody. § */
  try { if (typeof window.postFacesMine_ === 'function') window.postFacesMine_(); } catch (e) { oops_(e, 'me:pfpTake_') }
  if (onCard) return;
  try { if (typeof paint === 'function') paint('account'); } catch (e) { oops_(e, 'me:pfpTake_') }
}
on('pfp-pick', el => {
  const inp = el.closest('.pfp') && el.closest('.pfp').querySelector('.pfp-in');
  if (inp) inp.click();
});
on('pfp-remove', el => {
  const box = el.closest('.pfp');
  if (!USER || !box || !sure_(el, 'Remove?')) return;
  send_({ action: 'savePhoto', name: USER.name, personId: USER.personId, remove: true },
        { button: el, where: box.querySelector('.pfp-said'), saying: 'Removing…', lock: box })
    .then(d => { const got = (d && d.photo) || ''; pfpTake_(box, got, 'Removed. ' + pfpSaid_(got)); toast('Picture removed'); })
    .catch(() => { const said = box.querySelector('.pfp-said'); if (said) said.textContent += ' ' + pfpKept_(); });
});
/* ---------- ONE OF THE ELEVEN, TAPPED § */
on('pfp-choose', el => {
  const box = el.closest('.pfp');
  const name = String(el.dataset.pic || '');
  if (!USER || !box || !pfpChoice_(PFP_PREFIX + name)) return;
  const choice = PFP_PREFIX + name;
  const said = box.querySelector('.pfp-said');
  const was = String((USER.profile && USER.profile.photo) || '').trim();
  if (pfpChoice_(was) === name) { if (said) said.textContent = 'Already chosen. ' + pfpSaid_(was); return; }
  const face = box.querySelector('.pfp-face');
  if (face) face.innerHTML = pfpFace_(choice);
  pfpRing_(box, name);
  send_({ action: 'savePhoto', name: USER.name, personId: USER.personId, choice },
        { button: el, where: said, saying: 'Saving…', lock: box })
    .then(d => {
      const got = String((d && d.photo) || '');
      pfpTake_(box, got, (pfpChoice_(got) === name ? 'Saved. ' : 'The server kept something else. ') + pfpSaid_(got));
      toast('Picture saved');
    })
    .catch(() => {
      if (face) face.innerHTML = pfpFace_(was);
      pfpRing_(box, pfpChoice_(was));
      if (said) said.textContent = String(said.textContent || '').trim() + ' ' + pfpKept_(true);
    });
});
/* `change`, NOT A `data-do` CLICK — a file input reports its choice by changing, the camera's
   `cam-pick` argument. The value is cleared so choosing the same picture again still fires. */
document.addEventListener('change', e => {
  const inp = e.target;
  if (!inp || !inp.matches || !inp.matches('.pfp-in')) return;
  const file = (inp.files || [])[0];
  inp.value = '';
  const box = inp.closest('.pfp');
  if (!file || !box || !USER) return;
  const said = box.querySelector('.pfp-said');
  const btn = box.querySelector('[data-do="pfp-pick"]');
  if (said) said.textContent = 'Getting it ready…';
  pfpPrepare_(file).then(data => {
    if (!data) { if (said) said.textContent = 'That file is not a picture this phone can read. Try another.'; return; }
    /* THE PREVIEW CHANGES BEFORE THE UPLOAD, so the crop is seen while it travels; if the server refuses, the line says why and the old picture comes back. § */
    const face = box.querySelector('.pfp-face');
    if (face) face.innerHTML = cardBlock_({ type: 'media', kind: 'image', look: 'pfp-pic', src: data, title: 'Your profile picture', async: true });
    pfpRing_(box, '');
    return send_({ action: 'savePhoto', name: USER.name, personId: USER.personId, data },
                 { button: btn, where: said, saying: 'Saving…', lock: box })
      .then(d => { const got = (d && d.photo) || ''; pfpTake_(box, got, 'Saved. ' + pfpSaid_(got)); toast('Picture saved'); })
      .catch(() => {
        const was = (USER.profile && USER.profile.photo) || '';
        if (face) face.innerHTML = pfpFace_(was);
        pfpRing_(box, pfpChoice_(was));
        if (said) said.textContent = String(said.textContent || '').trim() + ' ' + pfpKept_();
      });
  });
});
/* THE HOUR CODES, WHEREVER THE BACKEND PUT THEM. § */
function availCodes_() {
  const groups = (DATA && DATA.profileFields) || {};
  const hit = Object.keys(groups).find(g => isTimetable_(groups[g]));
  return hit ? groups[hit] : [];
}
/* ---------- AND WHAT A GROUP HEADING IS DEPENDS ON THE SURFACE, SO THE SURFACE SAYS § */
function fieldsHtml(groups, o) {
  o = o || {};
  const head = o.head === false ? '' : o.head || 'h2';
  const value = o.value || (() => '');
  const plain = (f, extra) => formField_(f, value(f), Object.assign({
    attr: o.attr,
    label: ROW_LABEL[f],
    options: o.options ? o.options(f) : null,
    suggest: o.suggest ? o.suggest(f) : null,
    readonly: (o.readonly || []).indexOf(f) !== -1,
  }, extra));
  return Object.keys(groups).map(g => {
    const list = (groups[g] || []).filter(f => RETIRED_FIELDS_.indexOf(f) === -1);
    const timetable = isTimetable_(list);
    /* THE SHELF, THEN WHATEVER ELSE IS IN THE GROUP. § */
    const library = !timetable && isLibrary_(list);
    const quals = !timetable && isQuals_(list);
    const jobs = !timetable && isJobs_(list);
    /* ---------- AND THE THREE DATE BOXES, WHICH REPLACE ONE FIELD RATHER THAN JOINING IT § */
    /* EITHER SHAPE. The backend's group list names COLUMNS, so today it says `date_of_birth` — and `isDob_` is asked as well so a deployment that ever sends the § */
    const wantsDob = !timetable && (list.indexOf('date_of_birth') !== -1 || isDob_(list));
    /* THE PHONE, AS A CODE AND A NUMBER — the birthday's arrangement: § */
    const wantsPhone = !timetable && list.indexOf('phone') !== -1;
    /* THE PHOTOGRAPH SHELF GOES UNDER THE REST, not over it as the library one does: the page
       reads profile photo, video, then the others, which is the order somebody thinks of them in. */
    const photos = !timetable && isPhotos_(list);
    /* ---------- AND `photo` IS A PICTURE YOU CHOOSE, NOT A LINK YOU PASTE § */
    const picture = !timetable && o.attr === 'data-me' && list.indexOf('photo') !== -1;
    const rest = list.filter(f => !(library && isLibraryCard_(f)) && !(quals && isQualField_(f)) && !(jobs && isJobField_(f))
                              && !(photos && (isPhotoField_(f) || f === 'video')) && !(picture && f === 'photo')
                              && !(wantsDob && (f === 'date_of_birth' || isDobBox_(f))));
    const body = timetable
      ? availGrid_(list, o.raw || {}, o.readonly || [], o.attr === 'data-me')
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
/* The sheet writes TRUE/FALSE as text and the payload sends real booleans; rows written by older
   versions send neither consistently. One reader for all three. */
const TRUEish_ = v => v === true || /^(true|yes|1|✓)$/i.test(String(v ?? '').trim());
