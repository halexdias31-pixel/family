
/* ---------- WHO HAS A PUBLIC CARD, AND WHAT SETTINGS STOPS DRAWING FOR THEM § */
function cardMine_() {
  if (typeof USER === 'undefined' || !USER || typeof mineIs_ !== 'function') return null;
  return ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || []).find(t => t && t.personId && mineIs_(t)) || null;
}
const cardHolds_ = () => !!USER && cardSent_().length > 0 && !!cardMine_();
/* THE GROUPS WITH EVERY FIELD THE CARD EDITS TAKEN OUT, AND A GROUP LEFT EMPTY DROPPED — so for a tutor with a card About you, Photos, the rate, Qualifications § */
function cardSettingsGroups_(groups, on) {
  on = new Set(on || cardFields_());
  const out = {};
  Object.keys(groups || {}).forEach(g => {
    const left = (groups[g] || []).filter(f => !on.has(f));
    if (left.length) out[g] = left;
  });
  return out;
}

/* ---------- WHICH CARD IS OPEN FOR EDITING § */
let CARD_EDIT = null;
/* WHOSE `familyCardEdit` WAS LAST READ — a person id, not a yes/no. It was a yes/no, read once a visit, so a tutor who signed out in the middle of editing § */
let CARD_EDIT_READ = '';
const CARD_EDIT_KEY = 'familyCardEdit';
function cardEditFresh_(pid) {
  const me = String((USER && USER.personId) || '');
  const own = !!me && String(pid) === me;
  return { who: me, pid: String(pid), own, col: own ? 'settings' : undefined, base: null, asking: false, err: '' };
}
function cardEditNow_() {
  if (typeof USER === 'undefined' || !USER) { CARD_EDIT = null; CARD_EDIT_READ = ''; return null; }
  const me = String(USER.personId || '');
  if (CARD_EDIT && CARD_EDIT.who !== me) CARD_EDIT = null;
  if (!CARD_EDIT && CARD_EDIT_READ !== me) {
    CARD_EDIT_READ = me;
    try {
      const k = JSON.parse(localStorage.getItem(CARD_EDIT_KEY) || 'null');
      if (k && k.pid && k.who && k.who === me) {
        CARD_EDIT = cardEditFresh_(k.pid);
        if (!CARD_EDIT.own && PEOPLE_COLS_.indexOf(k.col) !== -1) CARD_EDIT.col = k.col;
        if (typeof k.pic === 'string') CARD_EDIT.pic0 = k.pic;
        if (typeof k.fig === 'string') CARD_EDIT.fig0 = k.fig;
        if (typeof k.hd === 'string') CARD_EDIT.h0 = k.hd;
        if (typeof k.cr === 'number') CARD_EDIT.cr0 = k.cr;
      }
    } catch (e) { /* a bad stored edit reads as none */ }
  }
  return CARD_EDIT;
}
/* `pic` IS THE PICTURE THE CARD WAS OPENED WITH, remembered beside which card is open so a Cancel after a reload can still put it back (`card-cancel`, below) § */
function cardRemember_(e) {
  const k = { who: e.who, pid: e.pid, col: e.col || cardColOf_(e) };
  if (typeof e.pic0 === 'string') k.pic = e.pic0;
  if (typeof e.fig0 === 'string') k.fig = e.fig0;
  /* NOT THE HANDLE (383): nothing about who signed in is kept beside it — it cannot change while the card is open, so the live one is the same. */
  if (typeof e.cr0 === 'number') k.cr = e.cr0;
  try { localStorage.setItem(CARD_EDIT_KEY, JSON.stringify(k)); } catch (x) { /* storage can be blocked; the app runs without it */ }
}
function cardForget_() { try { localStorage.removeItem(CARD_EDIT_KEY); } catch (x) { /* storage can be blocked; the app runs without it */ } }

/* WHO MAY EDIT THIS CARD: § */
function cardMayEdit_(t) {
  if (typeof USER === 'undefined' || !USER || !t || !t.personId) return false;
  /* YOUR OWN CARD ONLY, for every rank (467) — the owner: "Profile cards are uneditable by anyone, including admin." */
  return String(t.personId) === String(USER.personId || '');
}
/* `col` IS WHICH PEOPLE COLUMN ASKS (453): your own card's face there (`ownCardSections_`); anybody else's tutor card on Tutors. */
const PEOPLE_COLS_ = ['tutors', 'students', 'parents'];
/* YOUR OWN CARD IS EDITED ON ITS ROLE'S SETTINGS COLUMN (464), never on the profile: the owner, "they have to go to the appropriate role's account settings". */
const SET_OF_FACE_ = { tutors: 'staff', students: 'account', parents: 'family' };
const FACE_OF_SET_ = { staff: 'tutors', account: 'students', family: 'parents' };
const faceOfCol_ = c => FACE_OF_SET_[c] || c;
const cardColOf_ = e => (e && e.own ? '' : 'tutors');
/* WHICH COLUMN AN ELEMENT IS ON — the section's id without its `s-`. */
const colOfEl_ = el => String(((el && el.closest && el.closest('#screen > .screen')) || {}).id || '').replace(/^s-/, '');
function cardEditing_(t, col) {
  const e = cardEditNow_();
  return !!(e && t && t.personId && String(t.personId) === e.pid && cardMayEdit_(t) && (!col || (e.col || cardColOf_(e)) === col));
}
/* ---------- THE EDIT TILE — `x.account` IS THE YOU COLUMN, the one place the editor is drawn § */
function cardEditTile_(x) {
  const t = (x && x.row) || {};
  if (!x || !x.account || !cardMayEdit_(t)) return '';
  /* NOT ON THE CARD BEING EDITED. § */
  const own = String(t.personId) === String(USER.personId || '');
  const col = x.col || (own ? homeCol_() : 'tutors');
  if (cardEditing_(t, col)) return '';
  /* YOUR OWN CARD'S EDIT IS ON YOUR SETTINGS COLUMN ALONE (464, `ownCardSetPage_`); nobody edits somebody else's (467). */
  if (own && !x.settings) return '';
  if (own ? !ownCardSections_(col).length : !isTutorsCol_(col)) return '';
  return tile_({ icon: 'edit', label: 'Edit', note: own ? (isTutorsCol_(col) && rankAtLeast_('staff') ? 'your tutor card' : 'your card') : 'their card', act: 'card-edit',
                 tone: own ? '' : 'admin', data: { pid: t.personId, col } });
}

/* ---------- WHAT A BOX HOLDS, COMPARED THE WAY THE SERVER WILL READ IT § */
const CARD_BOOL_ = /^(m|tu|w|th|f|sa|su)\d\d$|^qual_\d+_(teach|spec)$/;
function cardSame_(f, a, b) {
  if (CARD_BOOL_.test(f)) return TRUEish_(a) === TRUEish_(b);
  return String(a == null ? '' : a).trim() === String(b == null ? '' : b).trim();
}
/* EVERY BOX OF THE CARD'S FORM, as `meSave_` gathers a Settings card: a tick is TRUE or FALSE, and
   `Something else…` not yet typed is no answer. */
function cardFormVals_(form) {
  const out = {};
  form.querySelectorAll('[data-me]').forEach(b => {
    if (b.disabled) return;
    const v = isCheckbox_(b) ? (b.checked ? 'TRUE' : 'FALSE') : String(b.value || '').trim();
    out[b.dataset.me] = v === QUAL_OTHER ? '' : v;
  });
  return out;
}
/* ---------- WHAT CHANGED — AND THE THREE PACKED CELLS GO WHOLE § */
const CARD_HOUR_ = /^(m|tu|w|th|f|sa|su)\d\d$/;
const CARD_WHOLE_ = [CARD_HOUR_, /^photos_\d+$/, /^qual_\d+(_\w+)?$/];
function cardChanged_(base, now) {
  const out = {};
  const moved = Object.keys(now).filter(f => !cardSame_(f, now[f], base[f]));
  moved.forEach(f => { out[f] = now[f]; });
  CARD_WHOLE_.forEach(re => {
    if (moved.some(f => re.test(f))) Object.keys(now).forEach(f => { if (re.test(f)) out[f] = now[f]; });
  });
  return out;
}

/* ---------- THE CARD'S DRAFT: ONE, FOR THE WHOLE CARD, KEYED BY WHOSE CARD IT IS § */
function cardDraft_(pid) {
  try { const s = draftRead_('card', pid); return s ? JSON.parse(s) : null; } catch (x) { return null; }
}
function cardValues_(e, base, sec) {
  const vals = Object.assign({}, base);
  let held = 0;
  const d = cardDraft_(e.pid + (sec ? ':' + sec : ''));
  if (d && d.v) {
    Object.keys(d.v).forEach(f => {
      if (d.from && Object.prototype.hasOwnProperty.call(d.from, f) && !cardSame_(f, d.from[f], base[f])) return;
      vals[f] = d.v[f]; held++;
    });
  }
  return { vals, held };
}
/* THE COPY EACH DRAWN FORM WAS DRAWN FROM, by a number on the form. § */
const CARD_DRAWN = new Map();
let CARD_DRAW_N = 0;
function cardDrawn_(base) {
  const n = String(++CARD_DRAW_N);
  CARD_DRAWN.set(n, base);
  /* A DRAW IS UP TO TWELVE FORMS NOT YET IN THE PAGE (468), so the newest 32 are never dropped. */
  if (CARD_DRAWN.size > 64) {
    const live = new Set([...document.querySelectorAll('.card-ed .me-form[data-draw]')].map(f => f.dataset.draw));
    [...CARD_DRAWN.keys()].forEach(k => { if (Number(k) <= CARD_DRAW_N - 32 && !live.has(k)) CARD_DRAWN.delete(k); });
  }
  return n;
}
function cardKeep_(form) {
  const e = CARD_EDIT;
  const card = form && form.closest('.card-ed');
  const base = form && CARD_DRAWN.get(form.dataset.draw || '');
  if (!e || !USER || !card || !base || card.dataset.pid !== e.pid) return;
  const key = e.pid + (card.dataset.sec ? ':' + card.dataset.sec : '');
  const now = cardFormVals_(form), v = {}, from = {};
  Object.keys(now).forEach(f => {
    if (cardSame_(f, now[f], base[f])) return;
    v[f] = now[f];
    from[f] = base[f] == null ? '' : String(base[f]);
  });
  try {
    if (Object.keys(v).length) draftKeep_('card', key, JSON.stringify({ v, from }));
    else draftDrop_('card', key);
  } catch (x) { /* storage blocked: the draft is not kept */ }
}

/* ---------- THE COPY OF THE ROW THE FORM IS FILLED FROM § */
function cardBaseNow_(e) {
  if (!e) return null;
  if (e.own) return profileShapeOk_() ? USER.profile : null;
  return e.base;
}
function cardFetch_(e) {
  if (!e || CARD_EDIT !== e || e.asking || e.err || cardBaseNow_(e)) return;
  if (e.own) {
    if (PROFILE_SERVER_OLD) { e.err = OLD_SERVER_SAY_; cardRepaint_(); return; }
    const p = profileRefresh_(false, () => { e.err = OLD_SERVER_SAY_; });
    if (!p) return;   /* one already on its way — its landing repaints this column */
    e.asking = true;
    p.then(() => {
      e.asking = false;
      if (CARD_EDIT !== e) return;
      if (!cardBaseNow_(e) && !e.err) e.err = 'Your details did not arrive from the server, so there is nothing to edit yet. Cancel, and try again in a moment.';
      cardRepaint_();
    });
    return;
  }
  e.asking = true;
  api({ action: 'getProfile', name: USER.name, personId: USER.personId || '', target: e.pid })
    .then(d => {
      e.asking = false;
      if (CARD_EDIT !== e) return;
      /* `phone_cc` IS `profileShapeOk_`'s test, asked of their copy: an older `profileOf_` without the
         expanded boxes is the same blank-shelf danger as an old copy of your own. */
      if (d && d.success && d.profile && Object.prototype.hasOwnProperty.call(d.profile, 'phone_cc')) e.base = d.profile;
      else e.err = (d && d.error) || OLD_SERVER_SAY_;
      cardRepaint_();
    }, () => {
      e.asking = false;
      if (CARD_EDIT !== e) return;
      e.err = 'The server did not answer, so their details are not here to edit. Cancel, and try again in a moment.';
      cardRepaint_();
    });
}
function cardRepaint_() { PEOPLE_COLS_.concat(Object.keys(FACE_OF_SET_)).forEach(c => { try { paint(c); } catch (x) { oops_(x, 'me:cardRepaint_') } }); }

/* ---------- THE CARD, AS ITS OWN FORM § */
function cardEditHtml_(t) {
  const e = cardEditNow_();
  const pid = String(t.personId);
  const head = `<h3>${esc([t.role || 'Tutor'].concat(profList_(t.titles)).join(' · '))} <span class="ce-what">· editing</span></h3>`;
  const base = cardBaseNow_(e);
  if (!base) {
    if (!e.err) setTimeout(() => cardFetch_(e), 0);
    return `<div class="card is-widget is-prof card-ed" data-pid="${esc(pid)}">${head}${
      e.err ? `<p class="note me-said">${esc(e.err)}</p>` : loading_()}</div>${cardEditTiles_(pid, true)}`;
  }
  const { vals, held } = cardValues_(e, base);
  return `<div class="card is-widget is-prof card-ed" data-pid="${esc(pid)}">${head}
    <div class="me-form" data-draw="${cardDrawn_(base)}">${cardEditForm_(t, e, vals)}
      <p class="note me-said">${held ? esc(SET_HELD_SAY) : ''}</p></div>
  </div>${cardEditTiles_(pid, false)}`;
}
/* YOUR OWN CARD'S EDIT, ONE CARD PER SECTION (468): each its own form, draft, Save and layout id — the owner, "settings is purely editing". */
function cardEditCards_(t, e, secs, setCol) {
  const pid = String(t.personId);
  const base = cardBaseNow_(e);
  if (!base && !e.err) setTimeout(() => cardFetch_(e), 0);
  return secs.map(s => {
    /* EVERY CARD TITLED, ONE SHAPE (8 Nov): title and one line per field, saved as typed (`autosaveHear_`) — `setCard_`. */
    const title = OWN_SEC_TITLE_[s.id] || s.cap || s.id;
    const card = { title, cls: 'is-prof card-ed own-sec',
      attrs: ` data-pid="${esc(pid)}" data-sec="${esc(s.id)}" data-lay-card="own:${esc(setCol)}:${esc(s.id)}" aria-label="${esc(title)}"` };
    if (!base) return setCard_(Object.assign(card, { body: e.err ? `<p class="note me-said">${esc(e.err)}</p>` : loading_(), save: cardCancelTile_(pid) }));
    const { vals, held } = cardValues_(e, base, s.id);
    return setCard_(Object.assign(card, { form: cardEditForm_(t, e, vals, [s]), formAttrs: ` data-draw="${cardDrawn_(base)}"`,
      save: cardCancelTile_(pid), foot: `<p class="note me-said">${held ? esc(SET_HELD_SAY) : ''}</p>` }));
  });
}
function cardEditTiles_(pid, saveOff) {
  return `<div class="tile-row ce-tiles">${tile_({ icon: 'save', label: 'Save', note: 'every change', act: 'card-save',
    off: !!saveOff, data: { pid } }) + cardCancelTile_(pid)}</div>`;
}
/* A SETTINGS SECTION KEEPS ITS CANCEL (what it puts back is the last save) and has no Save: it saves as typed (owner, 8 Nov). */
const cardCancelTile_ = pid => tile_({ icon: 'close', label: 'Cancel', note: 'put it back', act: 'card-cancel', data: { pid } });
/* ---------- ONE LINE A THING, OPENING IN PLACE (docs/history/425) § */
/* WHICH FOLDS ARE OPEN, as state and not in the DOM, so a repaint (a save, a figure pick) draws them as they were. */
const CE_OPEN = new Set();
document.addEventListener('toggle', e => {
  const d = e.target;
  if (!d || !d.matches || !d.matches('details.ce-fold')) return;
  const k = d.dataset.fold || '';
  if (d.open) CE_OPEN.add(k); else if (d.isConnected) CE_OPEN.delete(k);
}, true);
document.addEventListener('click', e => {
  const s = e.target && e.target.closest && e.target.closest('details.ce-fold > summary');
  if (s) e.preventDefault();
}, true);
/* `val` IS MARKUP (a face, a live line); the label is text. */
/* ALWAYS OPEN (487): "it's literally just a widget of one thing so does not need to be opened" -- the line is a heading, and a tap on it does nothing. */
const ceFold_ = (key, label, val, body) => `<details class="ce-fold" data-fold="${esc(key)}" open>
  <summary class="ce-line"><span class="ce-k">${esc(label)}</span><span class="ce-v">${val}</span></summary>
  <div class="ce-body">${body}</div></details>`;
/* HOW MANY, for a fold's line — photographs filled, venues ticked, qualifications held. */
const ceCount_ = (n, one, many) => n ? n + ' ' + (n === 1 ? one : many) : 'none';
function ceSums_(form) {
  const sec = id => form.querySelector('.ce-sec[data-sec="' + id + '"]');
  const ph = sec('photos'), v = ph && ph.querySelector('details[data-fold="photos"] > summary .ce-v');
  if (v) v.textContent = cePhotoSay_([...ph.querySelectorAll('.ph-slot input')].filter(i => String(i.value).trim()).length,
    String((ph.querySelector('.vid-pick') || { dataset: {} }).dataset.file || '').trim());
  const jb = sec('jobs'), jv = jb && jb.querySelector('details[data-fold="jobs"] > summary .ce-v');
  if (jv) jv.textContent = ceCount_(jobCount_(f => (jb.querySelector('[data-me="' + f + '"]') || {}).value), 'job', 'jobs');
  const q = sec('quals'), qv = q && q.querySelector('details[data-fold="quals"] > summary .ce-v');
  const gl = sec('glance'), gv = gl && gl.querySelector('details[data-fold="glance"] > summary .ce-v');
  if (gv) gv.textContent = ceGlanceSay_(f => (gl.querySelector('[data-me="' + f + '"]') || {}).value);
  const wh = sec('where'), wv = wh && wh.querySelector('details[data-fold="where"] > summary .ce-v');
  if (wv) wv.textContent = ceCount_(profList_((wh.querySelector('[data-me="venues_ok"]') || {}).value).length, 'venue', 'venues');
  if (qv) qv.textContent = ceCount_(q.querySelectorAll('.q-list .q-slot:not([data-new])').length, 'held', 'held');
}
/* AT A GLANCE IN ONE LINE: every answer in it, short, so nothing has to be opened to be read. */
function ceGlanceSay_(get) {
  const g = f => String(get(f) == null ? '' : get(f)).trim();
  const range = (a, b, unit) => (g(a) || g(b)) ? (g(a) || '?') + '–' + (g(b) || '?') + unit : '';
  return [g('years_experience') ? g('years_experience') + ' yrs' : '', g('favourite_colour'),
    range('age_min', 'age_max', ''), range('min_hours', 'max_hours', ' h')].filter(Boolean).join(' · ') || 'none';
}
/* BY AREA, NOT BY LIBRARY (owner, 8 Nov: "the operation will grow"): a tick an area; every venue stays in the data, and a tick adds or drops all of its area's. */
const ceAreaOf_ = v => String((v && (v.borough || v.city)) || '').trim() || 'Elsewhere';
function ceAreas_() {
  const by = {};
  ((typeof DATA !== 'undefined' && DATA && DATA.venues) || []).forEach(v => { if (v && v.title) (by[ceAreaOf_(v)] = by[ceAreaOf_(v)] || []).push(v.title); });
  return by;
}
function ceWhere_(L, val, box) {
  const got = profList_(val('venues_ok')), by = ceAreas_(), has = t => got.some(g => norm(g) === norm(t));
  const ro = (((typeof DATA !== 'undefined' && DATA && DATA.profileReadonly) || []).indexOf('venues_ok') !== -1);
  const ticks = L.indexOf('venues_ok') === -1 ? '' : formHidden_('data-me="venues_ok"', got.join(', ')) + `
    <div class="many-list where-areas" role="group" aria-label="Areas you teach in">${Object.keys(by).sort().map(a => formTick_(`data-where-area="${esc(a)}"${by[a].some(has) ? ' checked' : ''}${ro ? ' disabled' : ''}`, `<span>${esc(a)}</span>
      <span class="qtag">${esc(ceCount_(by[a].length, 'venue', 'venues'))}</span>`, 'many-opt')).join('') || empty_(brand('where_none', 'No venues yet.'))}</div>`;
  return ceFold_('where', 'Areas', esc(ceCount_(got.length, 'venue', 'venues')), ticks)
    + fieldRows_(L.filter(f => f !== 'venues_ok'), box);
}
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('input[data-where-area]')) return;
  const sec = t.closest('.ce-sec'), hid = sec && sec.querySelector('input[data-me="venues_ok"]');
  if (!hid) return;
  const mine = ceAreas_()[t.getAttribute('data-where-area')] || [];
  const keep = profList_(hid.value).filter(g => !mine.some(m => norm(m) === norm(g)));
  hid.value = (t.checked ? keep.concat(mine) : keep).join(', ');
  const v = sec.querySelector('details[data-fold="where"] > summary .ce-v');
  if (v) v.textContent = ceCount_(profList_(hid.value).length, 'venue', 'venues');
});
const cePhotoSay_ = (n, video) => ceCount_(n, 'photo', 'photos') + (video ? ' · video' : '');
/* ONE TABLE OF SECTIONS, id → body; an id not here is its fields' rows. `c` is the form's own: t, e, val, vals, ro, box, filled. */
const CARD_SECTION = {
  picture: (L, c) => c.e.own ? photoPicker_(c.val, '', { fold: true }) : cardFaceOnly_(c.t),
  handle: () => cardHandleHtml_(),
  photos: (L, c) => ceFold_('photos', 'Photos', esc(cePhotoSay_(c.filled(/^photos_\d+$/), String(c.val('video_file')).trim())),
    (c.e.own ? videoPicker_(c.val) : '') + fieldRows_(L.filter(f => !isPhotoField_(f) && !(c.e.own && f === 'video')), c.box) + (isPhotos_(L) ? photoShelf_(L, c.val, { draft: false }) : '')),
  jobs: (L, c) => ceFold_('jobs', 'Jobs', esc(ceCount_(jobCount_(c.val), 'job', 'jobs')), jobShelf_(L, c.val, { draft: false })),
  quals: (L, c) => ceFold_('quals', 'Qualifications', esc(ceCount_(c.filled(/^qual_\d+$/), 'held', 'held')), qualShelf_(L, c.val)),
  week: (L, c) => availGrid_(L, c.vals, c.ro, false), seat: (L, c) => cardRateHtml_(L, c.val, c.box, c.e),
  cut: (L, c) => cardCutHtml_(L, c.val, c.box), size: (L, c) => cardSizeHtml_(L, c.val, c.box),
  glance: (L, c) => ceFold_('glance', 'At a glance', esc(ceGlanceSay_(c.val)), fieldRows_(L, c.box)), where: (L, c) => ceWhere_(L, c.val, c.box),
};
/* THE MONEY SECTIONS, redrawn as the rate is typed (`cardSeatSync_`): the line each one says, and how. */
const CARD_RATE_SECTION = { seat: { line: '.ce-seat', say: (rate, seat) => cardSeatSay_(rate, seat) },
  cut: { line: '.ce-cut', say: (rate, seat, cut) => cardCutSay_(rate, cut) }, size: { sizeLine: true } };
/* EACH SECTION THROUGH THE WIDGET SETTINGS DREW IT WITH: § */
function cardEditForm_(t, e, vals, only) {
  const val = f => (vals[f] == null ? '' : vals[f]);
  const ro = (DATA && DATA.profileReadonly) || [];
  const box = (f, extra) => fieldHtml(f, val(f), Object.assign({ attr: 'data-me', label: ROW_LABEL[f],
    options: fieldOptions_(f), readonly: ro.indexOf(f) !== -1 || (f === 'extra_seat_cut' && !isAdmin()), draft: false }, extra));
  /* YOUR OWN CARD'S SECTIONS ARE YOUR ROLE'S (`ownCardSections_`), with the figure and the handle;
     somebody else's are the tutor's card, as an admin has always edited it. */
  return (only || (e.own ? ownCardSections_() : cardSections_())).map(s => {
    const L = s.list;
    const filled = re => L.filter(f => re.test(f) && String(val(f)).trim() !== '').length;
    const draw = Object.prototype.hasOwnProperty.call(CARD_SECTION, s.id) ? CARD_SECTION[s.id] : null;
    const body = draw ? draw(L, { t, e, val, vals, ro, box, filled }) : fieldRows_(L, box);
    /* NO CAPTION OVER A SECTION: every line names itself, and the week's days and hours name it (425). */
    return `<div class="ce-sec" data-sec="${esc(s.id)}">${body}</div>`;
  }).join('');
}
/* ---------- THE RATE, AND WHAT AN EXTRA SEAT ADDS IN POUNDS BESIDE IT (docs/history/345) § */
const pounds2_ = x => Math.round(x * 100) / 100;
/* WHAT A BLANK MEANS IN POUNDS AT THIS RATE — the config's `c` and `B` through the one reader, `seatShare_`. */
function cardSeatUsual_(rate) {
  const u = typeof seatShare_ === 'function' ? seatShare_(null) : { cUsed: 0, bUsed: 0 };
  return { extra_seat_rate: pounds2_(rate * u.cUsed), extra_seat_cut: pounds2_(rate * u.bUsed) };
}
/* A BLANK BOX SAYS "usual" AND NO MORE — "usual £3.00" was cut off in a box half a 390px card wide (measured);
   the amounts are in the line under the boxes, which has the room. Nothing without a rate: the line says why. */
const cardSeatPh_ = rate => rate > 0 ? 'usual' : '';
/* ---------- A PART IS DRAWN ONLY WHERE THE PRICE USES IT AS THE TUTOR'S OWN, AND ASKED OF `seatShare_` § */
function cardSeatShown_(f, rate, frac) {
  if (!(rate > 0) || typeof seatShare_ !== 'function') return '';
  const s = seatShare_({ extraSeat: frac, extraSeatCut: frac });
  if (f === 'extra_seat_cut') return s.cutOwn ? pounds2_(s.bRaw * rate).toFixed(2) : '';
  return s.seatOwn ? pounds2_(s.cRaw * rate).toFixed(2) : '';
}
/* POUNDS TYPED INTO A PART → THE SHARE THE HIDDEN BOX HOLDS. § */
function cardSeatShare_(f, typed, rate, was) {
  const s = String(typed == null ? '' : typed).trim(), P = num(s);
  const cell = String(was == null ? '' : was).trim();
  const usual = s === '' || isNaN(P) || (f === 'extra_seat_rate' && P === 0);
  if (cardSeatShown_(f, rate, cell) === (usual ? '' : pounds2_(P).toFixed(2))) return cell;
  return usual ? '' : String(Math.round(P / rate * 1e6) / 1e6);
}
/* A PART PAST WHAT THE SERVER TAKES, read as the typed share: the tutor's 0 to `STAFF_SEAT_MAX` (620), @family.'s 0 to 2. */
const cardSeatTop_ = f => f === 'extra_seat_cut' ? 2 : STAFF_SEAT_MAX;
const cardSeatOff_ = (f, v) => { const x = num(v); return !isNaN(x) && (x < 0 || x > cardSeatTop_(f)); };
const cardSeatOffSay_ = (rate, f) => f === 'extra_seat_cut'
  ? "@family.'s part is £0 to " + money_(pounds2_(rate * 2)) + '/h — twice the rate.'
  : 'An extra seat adds £0 to ' + money_(pounds2_(rate * STAFF_SEAT_MAX)) + '/h — at most what the first student pays.';
/* ---------- THREE CARDS, ONE PRICE (620): n students pay x + k·x·(n−1) + g·x·(n−1) an hour — x the rate, k the tutor's share, g @family.'s ---------- */
/* THE PARTS AS PRICED, through `seatShare_` (the booking's own reader): a blank is the config's usual. */
function cardSeatParts_(rate, seat, cut) {
  const s = typeof seatShare_ === 'function' ? seatShare_({ extraSeat: seat, extraSeatCut: cut }) : { cUsed: 0, bUsed: 0, seatOwn: false, cutOwn: false };
  return { k: s.cUsed, g: s.bUsed, kOwn: s.seatOwn, gOwn: s.cutOwn, kx: pounds2_(rate * s.cUsed), gx: pounds2_(rate * s.bUsed) };
}
/* WHAT n STUDENTS PAY AN HOUR, the formula above — what the booking charges before subjects, level, day and time multiply it. */
const cardGroupTotal_ = (rate, seat, cut, n) => { const p = cardSeatParts_(rate, seat, cut); return pounds2_(rate * (1 + (p.k + p.g) * Math.max(0, n - 1))); };
/* THE EXTRA SEAT CARD'S LINE: the tutor's part of each extra student, in pounds. */
function cardSeatSay_(rate, seat) {
  if (!(rate > 0)) return 'An extra seat is priced from the rate — set it first.';
  if (cardSeatOff_('extra_seat_rate', seat)) return esc(cardSeatOffSay_(rate, 'extra_seat_rate'));
  const p = cardSeatParts_(rate, seat, '');
  return `<span class="prof-seat">+${esc(money_(p.kx))}/h</span> a seat${p.kOwn ? '' : ', usual'}`;
}
/* THE @FAMILY SHARE BAR (8 Nov): first seat + the tutor's extra seat + @family's block, from `cardSeatParts_`, the formula's own numbers. */
function cardShareBar_(rate, seat, cut) {
  if (!(rate > 0)) return '';
  const p = cardSeatParts_(rate, seat, cut), blocks = [['shb-first', rate, 'first seat'], ['shb-seat', p.kx, 'another seat'], ['shb-fam', p.gx, '@family.']];
  const all = blocks.reduce((t, b) => t + b[1], 0) || 1;
  return blocks.map(([k, v, say], i) => `${i ? '<span class="shb-plus" aria-hidden="true">+</span>' : ''}<span class="shb-blk ${k}" style="flex-grow:${(v / all).toFixed(4)}"><b>${esc(money_(v))}</b><small>${esc(say)}</small></span>`).join('');
}
/* @FAMILY.'S CARD'S LINE: its part of each extra student, in pounds. */
function cardCutSay_(rate, cut) {
  if (!(rate > 0)) return "@family.'s part is priced from the rate — set it first.";
  if (cardSeatOff_('extra_seat_cut', cut)) return esc(cardSeatOffSay_(rate, 'extra_seat_cut'));
  const p = cardSeatParts_(rate, '', cut);
  return `<span class="prof-seat">+${esc(perHour_(p.gx))}</span> a seat${p.gOwn ? '' : ', usual'}`;
}
/* THE CLASS SIZE CARD'S LINE: one student and a full class, by the formula. */
function cardSizeSay_(rate, seat, cut, lo, hi) {
  if (!(rate > 0)) return 'Set a rate and the class prices show here.';
  const top = Math.max(1, Math.round(num(hi)) || 1), bottom = Math.max(1, Math.round(num(lo)) || 1);
  const at = n => n + ': ' + money_(cardGroupTotal_(rate, seat, cut, n));
  return esc([...new Set([bottom, top])].sort((x, y) => x - y).map(at).join(' · ') + '/h');
}
/* ---------- THE RATE AND THE TUTOR'S EXTRA SEAT, ONE CARD (620): the seat in pounds beside the rate, kept as the share k ---------- */
function cardRateHtml_(L, val, box, e) {
  const has = f => L.indexOf(f) !== -1;
  if (!has('rate_per_hour') || !has('extra_seat_rate')) return fieldRows_(L, box);
  const rate = num(val('rate_per_hour'));
  const live = rate > 0;
  const own = !!(e && e.own);
  const u = live ? cardSeatUsual_(rate) : null;
  const pound = fieldHtml('extra_seat_rate', cardSeatShown_('extra_seat_rate', rate, val('extra_seat_rate')), { attr: 'data-pound',
    label: own ? 'yours, £/h' : 'theirs, £/h', readonly: !live, draft: false,
    extra: `type="number" min="0" max="${live ? pounds2_(rate * STAFF_SEAT_MAX) : 0}" step="0.01" placeholder="${esc(cardSeatPh_(rate))}"` });
  const bar = own || (typeof isAdmin === 'function' && isAdmin())
    ? `<div class="share-bar" role="img" aria-label="Who gets what for a second student" aria-live="polite" data-cut="${esc(String(val('extra_seat_cut') || ''))}">${cardShareBar_(rate, val('extra_seat_rate'), val('extra_seat_cut'))}</div>` : '';
  return box('rate_per_hour', {}) + bar
    + ceFold_('seat', 'Extra seat', `<span class="ce-seat" aria-live="polite">${cardSeatSay_(rate, val('extra_seat_rate'))}</span>`,
      `${pound}${formHidden_('data-me="extra_seat_rate"', val('extra_seat_rate'))}
       <p class="note ce-note ce-seat-note">${esc('Blank or £0 is the usual' + (u ? ' ' + money_(u.extra_seat_rate) : '')
         + '; at most ' + (live ? money_(pounds2_(rate * STAFF_SEAT_MAX)) : 'the rate') + ' — a seat never costs more than the first student.')}</p>`)
    + fieldRows_(L.filter(f => f !== 'rate_per_hour' && f !== 'extra_seat_rate'), box);
}
/* ---------- @FAMILY.'S SHARE OF AN EXTRA SEAT, ITS OWN CARD (620): a box for an admin (`seatCutRefusal_`'s rule), words for anybody else ---------- */
function cardCutHtml_(L, val, box) {
  if (L.indexOf('extra_seat_cut') === -1) return '';
  const rate = num(val('rate_per_hour'));
  const live = rate > 0, mayCut = isAdmin();
  const u = live ? cardSeatUsual_(rate) : null;
  const p = cardSeatParts_(rate, '', val('extra_seat_cut'));
  const body = mayCut
    ? fieldHtml('extra_seat_cut', cardSeatShown_('extra_seat_cut', rate, val('extra_seat_cut')), { attr: 'data-pound', label: "@family.'s, £/h",
        readonly: !live, draft: false, extra: `type="number" min="0" max="${live ? pounds2_(rate * 2) : 0}" step="0.01" inputmode="decimal" placeholder="${esc(cardSeatPh_(rate))}"` })
      + formHidden_('data-me="extra_seat_cut"', val('extra_seat_cut'))
      + `<p class="note ce-note ce-cut-note">${esc('Blank is the usual' + (u ? ' ' + money_(u.extra_seat_cut) : '') + ', £0 is no cut.')}</p>`
    : `<p class="note ce-note ce-cut-note">${esc((live ? money_(p.gx) + '/h of each extra student is @family.\'s' + (p.gOwn ? '' : ', the usual') : "@family.'s part is set by @family.")
        + ' — only @family. sets that.')}</p>`;
  return `<span class="ce-rate" hidden data-rate="${esc(String(rate || 0))}"></span>`
    + ceFold_('cut', "@family.'s share", `<span class="ce-cut" aria-live="polite">${cardCutSay_(rate, val('extra_seat_cut'))}</span>`, body)
    + fieldRows_(L.filter(f => f !== 'extra_seat_cut'), box);
}
/* ---------- THE CLASS SIZE, ITS OWN CARD (620), with what one student and a full class pay an hour ---------- */
function cardSizeHtml_(L, val, box) {
  const rate = num(val('rate_per_hour'));
  return `<span class="ce-rate" hidden data-rate="${esc(String(rate || 0))}" data-seat="${esc(String(val('extra_seat_rate')))}" data-cut="${esc(String(val('extra_seat_cut')))}"></span>`
    + ceFold_('size', 'Class size', `<span class="ce-size" aria-live="polite">${cardSizeSay_(rate, val('extra_seat_rate'), val('extra_seat_cut'), val('min_students'), val('max_students'))}</span>`,
      fieldRows_(L, box) + '<p class="note ce-note">What the fewest and the most students pay an hour together: the rate, and each extra seat on top.</p>');
}
/* ---------- AND AS IT IS TYPED: POUNDS INTO THE HIDDEN SHARE, EACH CARD'S LINE REDRAWN § */
function cardSeatSync_(form, t, ev) {
  const sec = t && t.closest && t.closest(Object.keys(CARD_RATE_SECTION).map(k => '.ce-sec[data-sec="' + k + '"]').join(', '));
  if (!sec || !form.contains(sec)) return;
  const id = sec.dataset.sec;
  const rateBox = sec.querySelector('[data-me="rate_per_hour"]');
  const mark = sec.querySelector('.ce-rate');
  const rate = num(rateBox ? rateBox.value : (mark ? mark.dataset.rate : ''));
  if (CARD_RATE_SECTION[id] && CARD_RATE_SECTION[id].sizeLine) {
    const v = f => (sec.querySelector('[data-me="' + f + '"]') || {}).value;
    const line = sec.querySelector('.ce-size');
    if (line && mark) line.innerHTML = cardSizeSay_(rate, mark.dataset.seat, mark.dataset.cut, v('min_students'), v('max_students'));
    return;
  }
  const hid = f => sec.querySelector('input[type="hidden"][data-me="' + f + '"]');
  const base = CARD_DRAWN.get(form.dataset.draw || '') || {};
  const share = b => {
    const f = b.dataset.pound, h = hid(f);
    if (h && !h.disabled && rate > 0) h.value = cardSeatShare_(f, b.value, rate, base[f]);
  };
  if (t.dataset && t.dataset.pound) {
    t.dataset.typed = '1';
    share(t);
    if (ev === 'change' && t.dataset.pound === 'extra_seat_rate' && String(t.value).trim() !== '' && num(t.value) === 0) t.value = '';
  }
  if (t === rateBox) {
    sec.querySelectorAll('[data-pound]').forEach(b => {
      b.disabled = !(rate > 0);
      b.max = String(rate > 0 ? pounds2_(rate * cardSeatTop_(b.dataset.pound)) : 0);
      b.placeholder = cardSeatPh_(rate);
      if (b.dataset.typed) { share(b); return; }
      const h = hid(b.dataset.pound);
      b.value = cardSeatShown_(b.dataset.pound, rate, h ? h.value : '');
    });
  }
  const seat = hid('extra_seat_rate'), cut = hid('extra_seat_cut');
  const bar = sec.querySelector('.share-bar');
  if (bar) bar.innerHTML = cardShareBar_(rate, seat ? seat.value : '', cut ? cut.value : bar.dataset.cut);
  const how = CARD_RATE_SECTION[id] || {}, line = how.line && sec.querySelector(how.line);
  if (line) line.innerHTML = how.say(rate, seat ? seat.value : '', cut ? cut.value : '');
}
/* ---------- AND SAVE LEAVES OUT A PART PAST ITS TOP, IN POUNDS, AND SAYS SO — the rest of the card is still saved (620) § */
function cardSeatRefusal_(form, fields) {
  const off = [];
  [['seat', 'extra_seat_rate'], ['cut', 'extra_seat_cut']].forEach(([id, f]) => {
    const sec = form.querySelector('.ce-sec[data-sec="' + id + '"]');
    if (!sec || !Object.prototype.hasOwnProperty.call(fields, f) || !cardSeatOff_(f, fields[f])) return;
    const rb = sec.querySelector('[data-me="rate_per_hour"]'), mark = sec.querySelector('.ce-rate');
    const rate = num(rb ? rb.value : (mark ? mark.dataset.rate : ''));
    if (!(rate > 0)) return;
    delete fields[f];
    off.push(cardSeatOffSay_(rate, f));
  });
  return off.join(' ');
}
/* ---------- YOUR HANDLE, ON YOUR CARD, UNDER YOUR NAME (docs/history/339) § */
function cardHandleHtml_() {
  /* NO PRESS ANY MORE (364, 367): the handle is a template, said here so nobody has to be told it. */
  const said = (HANDLE_SAID.pid && HANDLE_SAID.pid === String(USER.personId || '') && HANDLE_SAID.text)
    || 'Your handle is the first and last letter of your first name and the year you joined. If somebody '
     + 'had it already, more letters of your first name were added, and then a number.';
  /* ONE LINE, AND THE RULE ONE TAP UNDER IT (425) — the handle is read here, never typed. */
  return ceFold_('handle', 'Handle', `<span class="handle-now" aria-live="polite"><b aria-hidden="true">@</b><span class="handle-shown">${
      esc((USER && USER.handle) || '')}</span></span>`, `<p class="note handle-said">${esc(said)}</p>`);
}
/* SOMEBODY ELSE'S PICTURE, SHOWN AND NOT OFFERED — `savePhoto` writes the asker's own row. § */
function cardFaceOnly_(t) {
  const first = String(t.title || '').trim().split(/\s+/)[0] || 'They';
  return `<div class="ce-pic">${personFace_({ pic: t.image, avatar: t.avatar, handle: t.handle, name: t.title,
    personId: t.personId }, { cls: 'prof-pic', none: 'prof-none', size: 52, eager: true })}
    <p class="note ce-note">Only ${esc(first)} can change this picture, from their own card.</p></div>`;
}
/* ---------- WHAT IS ON THE CARD THE MOMENT IT IS SAVED § */
function cardPatchRow_(pid, all, sent) {
  const row = ((DATA && DATA.tutors) || []).find(r => r && String(r.personId) === String(pid));
  if (!row) return;
  const has = k => Object.prototype.hasOwnProperty.call(sent, k);
  const txt = v => String(v == null ? '' : v).trim();
  const age = v => (/^\d+$/.test(txt(v)) ? Number(txt(v)) : txt(v));
  if (has('first_name') || has('last_name')) row.title = (txt(all.first_name) + ' ' + txt(all.last_name)).trim() || row.title;
  if (has('headline')) row.description = txt(all.headline) ? '"' + txt(all.headline) + '"' : '';
  if (has('rate_per_hour')) row.rate = Number(all.rate_per_hour) || 0;
  if (has('extra_seat_rate')) row.extraSeat = Number(all.extra_seat_rate) || 0;
  /* `doGet`'s shape (`seatCutOut_`): '' is the usual cut and nought is none, so not `Number(...) || 0` — read by
     `seatCutOf_`, the phone's copy of that one reading, so this guess and the payload that replaces it agree. */
  if (has('extra_seat_cut')) { const x = seatCutOf_(all.extra_seat_cut); row.extraSeatCut = isNaN(x) ? '' : x; }
  if (has('min_students')) row.minStudents = Number(all.min_students) || 1;
  if (has('max_students')) row.maxStudents = Number(all.max_students) || 0;
  if (has('years_experience')) row.yrsExp = txt(all.years_experience);
  if (has('age_min')) row.ageMin = age(all.age_min);
  if (has('age_max')) row.ageMax = age(all.age_max);
  /* `doGet`'s shapes: a blank shortest is one, a blank longest is no limit (0). */
  if (has('min_hours')) row.minHours = Number(all.min_hours) || 1;
  if (has('max_hours')) row.maxHours = Number(all.max_hours) || 0;
  if (has('video')) row.mediaUrl = txt(all.video);
  /* THE JOBS, AS `jobsList_` SENDS THEM, so the card shows the new pills before the payload comes back. */
  if (Object.keys(sent).some(isJobField_)) {
    row.jobs = [1, 2, 3, 4, 5, 6].map(n => ({ role: txt(all['job_' + n + '_role']), where: txt(all['job_' + n + '_where']),
      from: txt(all['job_' + n + '_from']), to: txt(all['job_' + n + '_to']) })).filter(j => j.role || j.where);
  }
  if (['adjective_1', 'adjective_2', 'adjective_3'].some(has)) {
    row.tags = [all.adjective_1, all.adjective_2, all.adjective_3].map(txt).filter(Boolean);
  }
  if (Object.keys(sent).some(isPhotoField_)) {
    row.photos = Object.keys(all).filter(isPhotoField_)
      .sort((a, b) => Number(a.slice(7)) - Number(b.slice(7))).map(f => txt(all[f])).filter(Boolean);
  }
  if (has('venues_ok')) row.venues = profList_(all.venues_ok);
  const hours = Object.keys(sent).filter(f => CARD_HOUR_.test(f));
  if (hours.length) {
    const a = Object.assign({}, row.avail || {});
    hours.forEach(f => { a[f] = TRUEish_(sent[f]) ? 'TRUE' : ''; });
    row.avail = a;
  }
}

/* ---------- A QUALIFICATION WITH NO LEVEL IS NOT SENT EITHER § */
const CARD_LEVELLESS_SAY_ = 'Choose a level for each qualification first — nothing was saved.';
function cardQualHole_(form, base) {
  return [...form.querySelectorAll('.q-shelf .q-list .q-slot')].some(slot => {
    const q = qualRead_(slot);
    return !!q.subject && !q.level
      && (!!slot.dataset.new || !!String(base['qual_' + slot.dataset.slot + '_level'] || '').trim());
  });
}

/* ---------- AND THE CARD IS A CARD AGAIN -------------------------------------------------------------------- */
function cardClose_(e, pane, sec) {
  try { draftDrop_('card', e.pid + (sec ? ':' + sec : '')); } catch (x) { oops_(x, 'me:cardClose_') }
  /* YOUR OWN STAYS OPEN (468) — the column is its editor — and what it would put back is what is there now. */
  if (CARD_EDIT === e && e.own && USER) {
    Object.assign(e, { pic0: cardPicNow_(), h0: String(USER.handle || USER.name || '') });
    cardRemember_(e);
  } else { if (CARD_EDIT === e) CARD_EDIT = null; cardForget_(); }
  /* CLEAN FIRST, or `settingsKeep_` holds the column and the repaint that ends the edit never happens. */
  (pane || document).querySelectorAll('.card-ed' + (sec ? '[data-sec="' + sec + '"]' : '') + ' .me-form[data-dirty]').forEach(f => { delete f.dataset.dirty; });
  if (sec) cardSecRedraw_(pane, sec);
  cardRepaint_();
}
/* ONE SECTION'S FORM DRAWN AGAIN IN PLACE (468) — the column's repaint waits while another card has typing, and this card's must not. */
function cardSecRedraw_(pane, sec) {
  const el = (pane || document).querySelector('.card-ed[data-sec="' + sec + '"]'), form = el && el.querySelector('.me-form');
  if (!form) return;
  try {
    const box = document.createElement('div');
    box.innerHTML = ownCardSetPage_(colOfEl_(el)).find(h => h.indexOf('data-sec="' + sec + '"') !== -1) || '';
    const fresh = box.querySelector('.me-form');
    if (fresh) form.replaceWith(fresh);
  } catch (x) { /* a section that cannot redraw keeps its old form */ }
}

/* ---------- EDIT § */
on('card-edit', el => {
  if (!USER) return;
  const pid = String(el.dataset.pid || '');
  /* YOUR OWN CARD MAY HAVE NO TUTOR ROW — a parent's, a student's, an unlisted admin's — and is then the row
     `accountPages_` built from the sign-in reply (`myCardRow_`, find.js), the card the tile was under. */
  const t = ((DATA && DATA.tutors) || []).find(r => r && String(r.personId) === pid)
    || (pid && pid === String(USER.personId || '') && typeof myCardRow_ === 'function' ? myCardRow_() : null);
  if (!t || !cardMayEdit_(t)) return;
  const col = PEOPLE_COLS_.indexOf(el.dataset.col) !== -1 ? el.dataset.col : (faceOfCol_(colOfEl_(el)) || 'tutors');
  const open = document.querySelector('.card-ed .me-form[data-dirty]');
  const openAt = open && (open.closest('.card-ed').dataset.pid + '|' + faceOfCol_(colOfEl_(open)));
  if (openAt && openAt !== pid + '|' + col) { toast('Save or cancel the card you are editing first.'); return; }
  if (CARD_EDIT && CARD_EDIT.pid === pid && (CARD_EDIT.col || cardColOf_(CARD_EDIT)) === col) return;
  CARD_EDIT = cardEditFresh_(pid);
  CARD_EDIT.col = col;
  /* THE PICTURE IT OPENED WITH, so Cancel can put it back — see `card-cancel`. Your own card only: on
     somebody else's the picture is shown and not offered (`cardFaceOnly_`). */
  if (CARD_EDIT.own) CARD_EDIT.pic0 = cardPicNow_(t);
  /* AND THE HANDLE IT OPENED WITH, so a handle the server moved while it was open is said (`cardSelfSaved_`). */
  if (CARD_EDIT.own) CARD_EDIT.h0 = String(USER.handle || USER.name || '');
  cardRemember_(CARD_EDIT);
  cardRepaint_();
});
/* YOUR PICTURE AS THIS PHONE LAST KEPT IT — `USER.profile.photo`, which `pfpTake_` writes on every save,
   else the sign-in reply's `USER.photo`, else your row's face. */
function cardPicNow_(t) {
  const p = (USER && USER.profile) || {};
  const v = Object.prototype.hasOwnProperty.call(p, 'photo') ? p.photo
    : (USER && USER.photo != null ? USER.photo : (t && t.image));
  return String(v == null ? '' : v).trim();
}

/* ---------- WHAT SAVED ITSELF WHILE THE CARD WAS OPEN (the review of docs/history/339) § */
function cardSelfSaved_(e) {
  if (!e || !e.own || !USER) return [];
  const h0 = typeof e.h0 === 'string' ? e.h0 : String(USER.handle || USER.name || '');
  const out = [];
  if (typeof e.pic0 === 'string' && cardPicNow_() !== e.pic0) out.push('picture');
  if (typeof e.h0 === 'string' && String(USER.handle || USER.name || '') !== e.h0) out.push('handle');
  return out;
}
function cardSelfSay_(e) {
  const l = cardSelfSaved_(e);
  if (!l.length) return '';
  const list = l.length === 1 ? l[0] : l.slice(0, -1).join(', ') + ' and ' + l[l.length - 1];
  return 'Your ' + list + (l.length === 1 ? ' was saved as you chose it.' : ' were saved as you chose them.');
}

/* ---------- SAVE: EVERY CHANGE, ONE REQUEST, THE EXISTING `updateProfile` § */
on('card-save', el => { cardSave_(el, false); });
/* `auto`: a Settings section saving as typed (`autosaveHear_`) — nothing locks, closes or says "Nothing had changed". */
function cardSave_(el, auto) {
  const e = cardEditNow_();
  { const f0 = el.closest('.card-ed'), f1 = f0 && f0.querySelector('.me-form'); if (f1) clearTimeout(AUTOSAVE_T.get(f1)); }
  const pane = el.closest('.pane');
  /* THE CARD THE SAVE IS ON — your own card is a card per section (468). */
  const card = (el.closest('.card-ed')) || (pane && pane.querySelector('.card-ed'));
  const form = card && card.querySelector('.me-form');
  const sec = (card && card.dataset.sec) || '';
  if (!e || !USER || !form || card.dataset.pid !== e.pid || String(el.dataset.pid || card.dataset.pid || '') !== e.pid) return;
  const said = form.querySelector('.me-said');
  const base = CARD_DRAWN.get(form.dataset.draw || '');
  if (!base) { cardRepaint_(); return; }
  /* ---------- NOT WHILE A SECTION THAT SAVES ITSELF IS ON THE WIRE (the review of docs/history/339) § */
  const busy = form.querySelector('.pfp.is-sending') ? 'Your picture is still saving'
    : form.querySelector('.is-sending') || form.classList.contains('is-sending') ? 'Part of your card is still saving' : '';
  if (busy) { if (auto) { autosaveLater_(form); return; } toast(busy + ' — Save once it has.'); if (said) said.textContent = busy + ' — Save once it has.'; return; }
  if (qualNameless_(form)) { toast(QUAL_NAMELESS_SAY_); if (said) said.textContent = QUAL_NAMELESS_SAY_; return; }
  if (cardQualHole_(form, base)) { toast(CARD_LEVELLESS_SAY_); if (said) said.textContent = CARD_LEVELLESS_SAY_; return; }
  const fields = cardChanged_(base, cardFormVals_(form));
  const seatNo = cardSeatRefusal_(form, fields);
  if (seatNo && !Object.keys(fields).length) { toast(seatNo + ' Nothing was saved.'); if (said) said.textContent = seatNo + ' Nothing was saved.'; return; }
  /* NOTHING TYPED — BUT A SECTION THAT SAVES ITSELF MAY HAVE BEEN (`cardSelfSaved_`): § */
  if (!Object.keys(fields).length) { if (auto) return; toast(cardSelfSay_(e) || 'Nothing had changed'); cardClose_(e, pane, sec); return; }
  const t = ((DATA && DATA.tutors) || []).find(r => r && String(r.personId) === e.pid) || {};
  send_({ action: 'updateProfile', name: USER.name, personId: USER.personId || '',
          target: e.own ? USER.name : (t.title || ''), targetId: e.pid, fields },
        auto ? { where: said } : { button: el, busy: 'Saving…', where: said, lock: pane })
    .then(d => {
      if (e.own) {
        USER.profile = (d && d.profile) ? d.profile : Object.assign({}, USER.profile || {}, fields);
        if (d && d.name) USER.name = d.name;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (x) { /* storage can be blocked; the app runs without it */ }
        /* YOUR OWN COPY CHANGED, and the Progress column's journey card is drawn from it — see `meSave_`. */
        if (typeof progressRedraw_ === 'function') progressRedraw_();
      }
      cardPatchRow_(e.pid, Object.assign({}, base, fields), fields);
      /* A PART LEFT OUT, HERE OR BY THE SERVER, IS SAID BESIDE WHAT WAS SAVED (620). */
      const word = ((d && d.said) || 'Saved') + (seatNo ? (d && d.refused ? ' ' : ' — the rest. Not saved: ') + seatNo : '');
      toast(word);
      if (auto) { CARD_DRAWN.set(form.dataset.draw || '', Object.assign({}, base, fields)); autosaveTick_(form, word); return; }
      cardClose_(e, pane, sec);
      /* A SAVE THAT WROTE NOTHING LEAVES THE STORED PAYLOAD ALONE — see `meSave_`; a part left out stays said under the card. */
      const part = (d && d.refused) || seatNo;
      if (!d || d.changed === undefined || d.changed > 0) {
        if (part) sayAfterLoad_(() => document.querySelector('.card-ed[data-pid="' + e.pid + '"][data-sec="' + sec + '"] .me-said'), word);
        else { try { load(); } catch (x) { oops_(x, 'me:cardSelfSay_') } }
      }
    })
    .catch(err => { /* `send_` has written the refusal under the form, which is still open. */ if (auto) autosaveFailed_(err); });
}

/* ---------- CANCEL: WHAT WAS THERE COMES BACK — THE PICTURE TOO § */
on('card-cancel', el => {
  const e = cardEditNow_();
  const pane = el.closest('.pane');
  const card = el.closest('.card-ed'), sec = (card && card.dataset.sec) || '';
  if (!e || (pane && pane.classList.contains('is-sending'))) return;
  if (pane && pane.querySelector('.card-ed .pfp.is-sending')) { toast('Your picture is still saving — Cancel once it has.'); return; }
  const was = typeof e.pic0 === 'string' ? e.pic0 : null;
  const picBack = !!((!sec || sec === 'picture') && e.own && was != null && USER && cardPicNow_() !== was);
  if (!picBack) { cardClose_(e, pane, sec); return; }
  const form = (card || pane) && (card || pane).querySelector((card ? '' : '.card-ed ') + '.me-form');
  const said = form && form.querySelector('.me-said');
  send_({ action: 'updateProfile', name: USER.name, personId: USER.personId || '', target: USER.name,
          targetId: e.pid, fields: { photo: was } },
        { button: el, where: said, lock: pane })
    .then(d => {
      const got = (d && d.profile && d.profile.photo != null) ? String(d.profile.photo) : was;
      if (d && d.profile) USER.profile = Object.assign({}, USER.profile || {}, d.profile);
      pfpTake_(null, got);
      cardClose_(e, pane, sec);
      toast('Put back as it was — your picture too');
    })
    .catch(() => {
      const why = String((said && said.textContent) || '').trim();
      cardClose_(e, pane, sec);
      toast('Everything else is put back, but not your picture' + (why ? ': ' + why : '.'));
    });
});

/* ---------- EVERY BOX ON THE CARD: HELD, KEPT, AND THE MAP FOLLOWS THE TICKS § */
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  const t = e.target;
  const form = t && t.closest && t.closest('.card-ed .me-form');
  if (!form) return;
  form.dataset.dirty = '1';
  cardSeatSync_(form, t, ev);
  cardKeep_(form);
  ceSums_(form);
}));

/* ---------- PEOPLE, MADE, CHANGED AND REMOVED BY AN ADMIN, ON THE PEOPLE COLUMN (373) ---------- */
/* THE ONE FORM OPEN: `{ id }` ('' for a new person), `data` once `personGet` answers, `made` for the slip. */
let PEOPLE_FORM_ = null;
/* THE ROLES CARD'S OWN WORDS (`ROLE_PICKS`), student first, and Admin, which only an admin gives. */
const peopleRolePicks_ = () => 'student client tutor'.split(' ').map(r => (ROLE_PICKS.find(x => x[0] === r) || [r, r]).slice(0, 2))
  .concat([['admin', 'Admin']]);
const peopleMay_ = () => typeof isAdmin === 'function' && isAdmin() && !!USER;
const peopleSelf_ = p => !!(USER && p && p.personId && String(p.personId) === String(USER.personId || ''));

/* DELETE, SHOW PIN AND THE DIGEST UNDER SOMEBODY ELSE'S CARD, for an admin; '' for anybody else and on your own. */
function peopleTiles_(p) {
  if (!peopleMay_() || !p || !p.personId || peopleSelf_(p)) return '';
  const first = String(nameBesideHandle_(p.title, p.handle) || p.title || '').trim().split(' ')[0] || 'them';
  /* NO EDIT (467): somebody's details are theirs to change, on their own settings; Delete, PIN and the digest stay the admin's. */
  return tile_({ icon: 'bin', label: 'Delete', note: 'their account', act: 'person-del', tone: 'danger',
              data: { id: p.personId, name: first } })
    /* "SHOW PIN" (452): fetched on the tap by `pinShow`, admin only on the server too; never in the payload. */
    + tile_({ icon: 'key', label: 'Show PIN', note: 'tap again to hide', act: 'pin-show', tone: 'admin',
              data: { id: p.personId } })
    /* AND ON A PARENT'S CARD, LAST MONDAY–SUNDAY'S WORK EMAILED NOW (378) — `digestSendNow`, admin only on the server too. */
    + (/^Client\b/.test(String(p.role || '')) ? tile_({ icon: 'send', label: 'Send last week', note: 'their child’s work, Mon–Sun',
              act: 'digest-send-now', tone: 'admin', data: { id: p.personId } }) : '');
}

/* THE TOP OF THE LIST: the "+", or the new person's form, or the slip once they are made. */
/* `col` (453): the people column it is drawn on — "Add a tutor" on Tutors, the form's role ticked to match, drawn where it was opened. */
const PEOPLE_ADD_ = { tutors: { role: 'tutor', say: 'Add a tutor' }, students: { role: 'student', say: 'Add a student' },
                      parents: { role: 'client', say: 'Add a parent' } };
/* THE SHARE BAR ON THE SETTINGS RATE CARD TOO (8 Nov): drawn where the rate and the extra-seat share are boxes, redrawn as either is typed. */
function shareBarFor_(list, p) {
  const has = f => (list || []).indexOf(f) !== -1;
  if (!has('rate_per_hour') || !has('extra_seat_rate')) return '';
  p = p || {};
  return `<div class="share-bar" role="img" aria-label="Who gets what for a second student" aria-live="polite" data-cut="${esc(String(p.extra_seat_cut || ''))}">${
    cardShareBar_(num(p.rate_per_hour), p.extra_seat_rate, p.extra_seat_cut)}</div>`;
}
document.addEventListener('input', e => {
  const form = e.target && e.target.closest && e.target.closest('.set-shape');
  const bar = form && form.querySelector(':scope > .share-bar');
  if (!bar) return;
  const v = f => { const b = form.querySelector('[data-me="' + f + '"]'); return b ? b.value : ''; };
  const cut = form.querySelector('[data-me="extra_seat_cut"]') ? v('extra_seat_cut') : bar.dataset.cut;
  bar.innerHTML = cardShareBar_(num(v('rate_per_hour')), v('extra_seat_rate'), cut);
});
